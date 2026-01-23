import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { encrypt, isEncrypted } from "@/lib/encryption";

/**
 * POST 핸들러: 기존 Records 데이터 암호화 마이그레이션
 *
 * 개발/테스트 환경에서만 사용 가능
 */
export async function POST(request: NextRequest) {
  // 개발 환경 체크
  const isDevelopment =
    process.env.NEXT_PUBLIC_NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_NODE_ENV === "development";

  if (!isDevelopment) {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const {
      userId,
      batchSize = 100,
      dryRun = false,
    }: {
      userId?: string;
      batchSize?: number;
      dryRun?: boolean;
    } = body;

    const supabase = getServiceSupabase();

    // 통계 정보
    let totalProcessed = 0;
    let totalEncrypted = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    const errors: Array<{ id: number; error: string }> = [];

    // userId가 제공된 경우 해당 사용자만, 아니면 모든 사용자
    let query = supabase.from("vivid_records").select("id, content, user_id");

    if (userId) {
      query = query.eq("user_id", userId);
    }

    // 배치 처리
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const { data: records, error: fetchError } = await query
        .range(offset, offset + batchSize - 1)
        .order("id", { ascending: true });

      if (fetchError) {
        throw new Error(`Failed to fetch records: ${fetchError.message}`);
      }

      if (!records || records.length === 0) {
        hasMore = false;
        break;
      }

      // 각 레코드 처리
      for (const record of records) {
        totalProcessed++;

        try {
          // 이미 암호화된 데이터인지 확인
          if (isEncrypted(record.content)) {
            totalSkipped++;
            continue;
          }

          // Dry run 모드면 실제 업데이트하지 않음
          if (dryRun) {
            totalEncrypted++;
            continue;
          }

          // 암호화
          const encryptedContent = encrypt(record.content);

          // 업데이트
          const { error: updateError } = await supabase
            .from("vivid_records")
            .update({ content: encryptedContent })
            .eq("id", record.id);

          if (updateError) {
            throw new Error(updateError.message);
          }

          totalEncrypted++;
        } catch (error) {
          totalErrors++;
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          errors.push({
            id: record.id,
            error: errorMessage,
          });
          console.error(`Error encrypting record ${record.id}:`, error);
        }
      }

      // 다음 배치로 이동
      offset += batchSize;
      hasMore = records.length === batchSize;
    }

    return NextResponse.json(
      {
        message: dryRun
          ? "Dry run completed (no data was modified)"
          : "Migration completed",
        stats: {
          totalProcessed,
          totalEncrypted,
          totalSkipped,
          totalErrors,
        },
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Migration error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Migration failed", details: errorMessage },
      { status: 500 }
    );
  }
}
