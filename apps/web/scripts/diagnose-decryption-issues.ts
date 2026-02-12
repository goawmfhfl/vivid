/**
 * Daily Vivid 복호화 문제 진단 스크립트
 *
 * 사용법:
 *   tsx scripts/diagnose-decryption-issues.ts
 *
 * 이 스크립트는 daily_vivid 테이블의 데이터 복호화 상태를 확인합니다.
 */

import { getServiceSupabase } from "../src/lib/supabase-service";
import { decryptDailyVivid, decryptJsonbFields } from "../src/lib/jsonb-encryption";
import { isEncrypted } from "../src/lib/encryption";
import { API_ENDPOINTS } from "../src/constants";

interface DecryptionDiagnosis {
  total: number;
  encrypted: number;
  decrypted: number;
  failed: number;
  plaintext: number;
  errors: Array<{
    id: string;
    field: string;
    error: string;
  }>;
}

function isJsonbEncrypted(obj: unknown): boolean {
  if (obj === null || obj === undefined) {
    return false;
  }

  if (typeof obj === "string") {
    return isEncrypted(obj);
  }

  if (Array.isArray(obj)) {
    return obj.some((item) => isJsonbEncrypted(item));
  }

  if (typeof obj === "object") {
    return Object.values(obj).some((value) => isJsonbEncrypted(value));
  }

  return false;
}

async function diagnoseDecryption(): Promise<DecryptionDiagnosis> {
  const supabase = getServiceSupabase();
  const diagnosis: DecryptionDiagnosis = {
    total: 0,
    encrypted: 0,
    decrypted: 0,
    failed: 0,
    plaintext: 0,
    errors: [],
  };

  console.log("🔍 Daily Vivid 복호화 상태 진단 시작...\n");

  // ENCRYPTION_KEY 확인
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    console.error("❌ ENCRYPTION_KEY 환경 변수가 설정되지 않았습니다!");
    process.exit(1);
  }
  console.log(
    `✅ ENCRYPTION_KEY: ${encryptionKey.substring(
      0,
      8
    )}...${encryptionKey.substring(encryptionKey.length - 8)} (${
      encryptionKey.length
    }자)\n`
  );

  let offset = 0;
  const batchSize = 100;
  let hasMore = true;

  while (hasMore) {
    const { data: feedbacks, error } = await supabase
      .from(API_ENDPOINTS.DAILY_VIVID)
      .select("id, report, trend")
      .range(offset, offset + batchSize - 1)
      .order("id", { ascending: true });

    if (error) {
      console.error("❌ 데이터 조회 실패:", error.message);
      break;
    }

    if (!feedbacks || feedbacks.length === 0) {
      hasMore = false;
      break;
    }

    for (const feedback of feedbacks) {
      diagnosis.total++;

      // 각 JSONB 필드 확인
      const fields = [
        { name: "report", value: feedback.report },
        { name: "trend", value: feedback.trend },
      ];

      let _hasEncryptedField = false;
      let hasDecryptionFailure = false;

      for (const field of fields) {
        if (!field.value) continue;

        const isFieldEncrypted = isJsonbEncrypted(field.value);

        if (isFieldEncrypted) {
          _hasEncryptedField = true;
          diagnosis.encrypted++;

          try {
            // 복호화 시도
            const decrypted = decryptJsonbFields(field.value);

            // 복호화 실패 감지: 암호화된 형식이었는데 복호화 후에도 동일한 객체면 실패
            const originalStr = JSON.stringify(field.value);
            const decryptedStr = JSON.stringify(decrypted);

            // 간단한 검사: 암호화된 문자열이 그대로 남아있는지 확인
            if (originalStr === decryptedStr && originalStr.includes(":")) {
              hasDecryptionFailure = true;
              diagnosis.failed++;
              diagnosis.errors.push({
                id: String(feedback.id),
                field: field.name,
                error: "복호화 실패: 암호화된 데이터를 복호화할 수 없습니다.",
              });
            } else {
              diagnosis.decrypted++;
            }
          } catch (error) {
            hasDecryptionFailure = true;
            diagnosis.failed++;
            diagnosis.errors.push({
              id: String(feedback.id),
              field: field.name,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        } else {
          diagnosis.plaintext++;
        }
      }

      // 전체 복호화 시도
      try {
        const _decryptedFeedback = decryptDailyVivid(feedback);
        if (!hasDecryptionFailure) {
          // 복호화 성공
        }
      } catch (error) {
        if (!hasDecryptionFailure) {
          diagnosis.failed++;
          diagnosis.errors.push({
            id: String(feedback.id),
            field: "전체",
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    offset += batchSize;
    hasMore = feedbacks.length === batchSize;

    // 진행 상황 출력
    if (diagnosis.total % (batchSize * 5) === 0) {
      console.log(`⏳ 진행 중... 총 ${diagnosis.total}개 확인`);
    }
  }

  return diagnosis;
}

// 스크립트 실행
if (require.main === module) {
  diagnoseDecryption()
    .then((diagnosis) => {
      console.log("\n📊 진단 결과:");
      console.log(`   - 총 레코드: ${diagnosis.total}`);
      console.log(`   - 암호화된 필드: ${diagnosis.encrypted}`);
      console.log(`   - 복호화 성공: ${diagnosis.decrypted}`);
      console.log(`   - 복호화 실패: ${diagnosis.failed}`);
      console.log(`   - 평문 데이터: ${diagnosis.plaintext}`);

      if (diagnosis.failed > 0) {
        console.log(`\n❌ 복호화 실패한 항목 (최대 10개):`);
        diagnosis.errors.slice(0, 10).forEach((err) => {
          console.log(
            `   - ID: ${err.id}, 필드: ${err.field}, 오류: ${err.error}`
          );
        });
        if (diagnosis.errors.length > 10) {
          console.log(`   ... 외 ${diagnosis.errors.length - 10}개 오류`);
        }
        console.log("\n⚠️  해결 방법:");
        console.log("   1. ENCRYPTION_KEY가 올바른지 확인하세요.");
        console.log("   2. 기존 데이터가 다른 키로 암호화되었을 수 있습니다.");
        console.log("   3. 데이터를 다시 암호화하거나, 기존 키를 복원하세요.");
        process.exit(1);
      } else {
        console.log("\n✅ 모든 데이터가 정상적으로 복호화됩니다!");
        process.exit(0);
      }
    })
    .catch((error) => {
      console.error("❌ 진단 실패:", error);
      process.exit(1);
    });
}

export { diagnoseDecryption };
