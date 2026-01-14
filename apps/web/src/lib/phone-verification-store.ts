/**
 * 핸드폰 인증번호 저장소
 * 
 * 개발 환경: 메모리 기반 저장소 사용
 * 프로덕션: Redis 등 영구 저장소로 확장 가능
 */

interface VerificationCode {
  code: string;
  phone: string;
  expiresAt: number; // Unix timestamp (밀리초)
  attempts: number; // 시도 횟수
  createdAt: number; // 생성 시간
}

// 메모리 기반 저장소 (개발용)
const verificationStore = new Map<string, VerificationCode>();

// 인증번호 만료 시간 (5분)
const CODE_EXPIRY_MS = 5 * 60 * 1000;

// 최대 시도 횟수
const MAX_ATTEMPTS = 5;

/**
 * 인증번호 생성 및 저장
 */
export function storeVerificationCode(
  phone: string,
  code: string
): void {
  const key = normalizePhone(phone);
  const now = Date.now();

  verificationStore.set(key, {
    code,
    phone,
    expiresAt: now + CODE_EXPIRY_MS,
    attempts: 0,
    createdAt: now,
  });

  // 만료된 코드 정리 (메모리 관리)
  cleanupExpiredCodes();
}

/**
 * 인증번호 검증
 */
export function verifyCode(
  phone: string,
  inputCode: string
): { success: boolean; message: string } {
  const key = normalizePhone(phone);
  const stored = verificationStore.get(key);

  if (!stored) {
    return {
      success: false,
      message: "인증번호가 만료되었거나 존재하지 않습니다.",
    };
  }

  // 만료 확인
  if (Date.now() > stored.expiresAt) {
    verificationStore.delete(key);
    return {
      success: false,
      message: "인증번호가 만료되었습니다. 다시 요청해주세요.",
    };
  }

  // 시도 횟수 확인
  if (stored.attempts >= MAX_ATTEMPTS) {
    verificationStore.delete(key);
    return {
      success: false,
      message: "인증 시도 횟수를 초과했습니다. 다시 요청해주세요.",
    };
  }

  // 코드 검증
  if (stored.code !== inputCode) {
    stored.attempts += 1;
    verificationStore.set(key, stored);
    return {
      success: false,
      message: `인증번호가 일치하지 않습니다. (${MAX_ATTEMPTS - stored.attempts}회 남음)`,
    };
  }

  // 인증 성공 - 저장소에서 삭제
  verificationStore.delete(key);
  return {
    success: true,
    message: "인증이 완료되었습니다.",
  };
}

/**
 * 인증번호 재전송 가능 여부 확인
 * (같은 번호로 너무 자주 요청하는 것 방지)
 */
export function canResendCode(phone: string): {
  canResend: boolean;
  remainingSeconds?: number;
} {
  const key = normalizePhone(phone);
  const stored = verificationStore.get(key);

  if (!stored) {
    return { canResend: true };
  }

  // 최소 재전송 간격: 1분
  const MIN_RESEND_INTERVAL_MS = 60 * 1000;
  const timeSinceCreation = Date.now() - stored.createdAt;

  if (timeSinceCreation < MIN_RESEND_INTERVAL_MS) {
    const remainingSeconds = Math.ceil(
      (MIN_RESEND_INTERVAL_MS - timeSinceCreation) / 1000
    );
    return {
      canResend: false,
      remainingSeconds,
    };
  }

  return { canResend: true };
}

/**
 * 전화번호 정규화 (하이픈 제거, 공백 제거)
 */
function normalizePhone(phone: string): string {
  return phone.replace(/[\s-]/g, "");
}

/**
 * 만료된 코드 정리
 */
function cleanupExpiredCodes(): void {
  const now = Date.now();
  for (const [key, code] of verificationStore.entries()) {
    if (now > code.expiresAt) {
      verificationStore.delete(key);
    }
  }
}

/**
 * 인증번호 생성 (6자리 랜덤 숫자)
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 저장소 초기화 (테스트용)
 */
export function clearVerificationStore(): void {
  verificationStore.clear();
}
