import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const KEY_LENGTH = 32; // 256비트

/**
 * 암호화 키를 가져오는 함수
 * 환경 변수에서 키를 읽어옵니다.
 */
function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is required");
  }

  // hex 문자열을 Buffer로 변환
  const keyBuffer = Buffer.from(key, "hex");
  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error(
      `ENCRYPTION_KEY must be ${KEY_LENGTH * 2} hex characters (64 characters)`
    );
  }

  return keyBuffer;
}

/**
 * 데이터 암호화
 * @param text - 암호화할 평문 텍스트
 * @returns 암호화된 문자열 (형식: "iv:encrypted")
 */
export function encrypt(text: string): string {
  if (!text || text.trim() === "") {
    return text;
  }

  // 이미 암호화된 데이터인지 확인 (형식: "hex:hex")
  if (text.includes(":") && text.split(":").length === 2) {
    const [ivHex, encrypted] = text.split(":");
    // hex 형식인지 확인
    if (
      /^[0-9a-f]+$/i.test(ivHex) &&
      /^[0-9a-f]+$/i.test(encrypted) &&
      ivHex.length === 32
    ) {
      // 이미 암호화된 것으로 보임
      return text;
    }
  }

  try {
    const key = getKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    // IV와 암호화된 데이터를 함께 저장
    return `${iv.toString("hex")}:${encrypted}`;
  } catch {
    // 에러 로깅 제거 - 조용히 처리
    throw new Error("Failed to encrypt data");
  }
}

/**
 * 데이터 복호화
 * @param encryptedText - 복호화할 암호화된 텍스트 (형식: "iv:encrypted")
 * @returns 복호화된 평문 텍스트
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText || encryptedText.trim() === "") {
    return encryptedText;
  }

  // 암호화 형식이 아닌 경우 (기존 평문 데이터)
  if (!encryptedText.includes(":")) {
    return encryptedText;
  }

  const parts = encryptedText.split(":");
  if (parts.length !== 2) {
    // 형식이 맞지 않으면 평문으로 간주
    return encryptedText;
  }

  const [ivHex, encrypted] = parts;

  // hex 형식 검증
  if (!/^[0-9a-f]+$/i.test(ivHex) || !/^[0-9a-f]+$/i.test(encrypted)) {
    // hex 형식이 아니면 평문으로 간주
    return encryptedText;
  }

  // IV 길이 검증 (16바이트 = 32 hex 문자)
  if (ivHex.length !== 32) {
    return encryptedText;
  }

  try {
    const key = getKey();
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch {
    // 복호화 실패 시 원본 반환 (기존 평문 데이터일 수 있음)
    // 에러 로깅 제거 - 클라이언트 사이드에서는 ENCRYPTION_KEY에 접근할 수 없으므로 조용히 처리
    return encryptedText;
  }
}

/**
 * 암호화된 데이터인지 확인
 * @param text - 확인할 텍스트
 * @returns 암호화된 데이터 여부
 */
export function isEncrypted(text: string): boolean {
  if (!text || !text.includes(":")) {
    return false;
  }

  const parts = text.split(":");
  if (parts.length !== 2) {
    return false;
  }

  const [ivHex, encrypted] = parts;
  return (
    /^[0-9a-f]+$/i.test(ivHex) &&
    /^[0-9a-f]+$/i.test(encrypted) &&
    ivHex.length === 32
  );
}
