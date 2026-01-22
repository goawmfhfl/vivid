/**
 * 핸드폰 인증번호 저장소
 * 
 * HTTP-only 쿠키를 사용하여 인증번호를 저장합니다.
 * 서버에서만 접근 가능하므로 보안이 유지되며, 데이터베이스 없이도 작동합니다.
 */

import { NextResponse } from "next/server";

interface VerificationCode {
  code: string;
  phone: string;
  expiresAt: number; // Unix timestamp (밀리초)
  attempts: number; // 시도 횟수
  createdAt: number; // 생성 시간
}

// 인증번호 만료 시간 (5분)
const CODE_EXPIRY_MS = 5 * 60 * 1000;

// 최대 시도 횟수
const MAX_ATTEMPTS = 5;

/**
 * 인증번호 생성 및 저장
 * 쿠키에 저장 (서버에서만 접근 가능)
 */
export function storeVerificationCode(
  phone: string,
  code: string,
  response: NextResponse
): void {
  const normalizedPhone = normalizePhone(phone);
  const now = Date.now();
  const expiresAt = now + CODE_EXPIRY_MS;


  // 쿠키에 인증번호 정보 저장 (서버에서만 읽을 수 있음)
  const cookieValue = JSON.stringify({
    phone: normalizedPhone,
    code,
    attempts: 0,
    expiresAt,
    createdAt: now,
  });

  // HTTP-only 쿠키로 저장 (클라이언트에서 접근 불가)
  // 모바일 WebView 호환성을 위해 sameSite: "lax" 사용
  // 프로덕션에서는 HTTPS를 사용하므로 secure: true
  const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production";
  response.cookies.set("phone_verification", cookieValue, {
    httpOnly: true,
    secure: isProduction, // HTTPS에서만 secure 쿠키 사용
    sameSite: "lax", // WebView에서도 작동하는 lax 사용 (none은 secure 필수)
    maxAge: Math.floor(CODE_EXPIRY_MS / 1000), // 초 단위
    path: "/",
  });

  // 디버깅: 저장 후 로그 출력
  console.log("[PhoneVerificationStore Store After]", {
    normalizedPhone,
    code,
    expiresAt: new Date(expiresAt).toISOString(),
  });
}

/**
 * 인증번호 검증
 * 쿠키에서 읽어서 검증
 */
export function verifyCode(
  phone: string,
  inputCode: string,
  cookieStore: { get: (name: string) => { value: string } | undefined },
  response: NextResponse
): { success: boolean; message: string } {
  const normalizedPhone = normalizePhone(phone);

  // 디버깅: 검증 시도 로그 출력
  console.log("[PhoneVerificationStore Verify]", {
    phone,
    normalizedPhone,
    inputCode,
  });

  // 쿠키에서 인증번호 정보 읽기
  const cookie = cookieStore.get("phone_verification");
  
  if (!cookie || !cookie.value) {
    console.log("[PhoneVerificationStore Verify]", {
      stored: null,
    });
    return {
      success: false,
      message: "인증번호가 만료되었거나 존재하지 않습니다.",
    };
  }

  let stored: VerificationCode;
  try {
    stored = JSON.parse(cookie.value);
  } catch (error) {
    console.error("[PhoneVerificationStore Verify Parse Error]", error);
    return {
      success: false,
      message: "인증번호가 만료되었거나 존재하지 않습니다.",
    };
  }

  // 전화번호 일치 확인
  if (stored.phone !== normalizedPhone) {
    return {
      success: false,
      message: "인증번호가 만료되었거나 존재하지 않습니다.",
    };
  }

  // 디버깅: 저장된 데이터 로그 출력
  console.log("[PhoneVerificationStore Verify]", {
    stored: {
      code: stored.code,
      attempts: stored.attempts,
      expiresAt: new Date(stored.expiresAt).toISOString(),
      createdAt: new Date(stored.createdAt).toISOString(),
    },
  });

  // 만료 확인
  if (Date.now() > stored.expiresAt) {
    // 만료된 코드 삭제
    response.cookies.delete("phone_verification");
    return {
      success: false,
      message: "인증번호가 만료되었습니다. 다시 요청해주세요.",
    };
  }

  // 시도 횟수 확인
  if (stored.attempts >= MAX_ATTEMPTS) {
    // 시도 횟수 초과 - 코드 삭제
    response.cookies.delete("phone_verification");
    return {
      success: false,
      message: "인증 시도 횟수를 초과했습니다. 다시 요청해주세요.",
    };
  }

  // 코드 검증
  if (stored.code !== inputCode) {
    // 시도 횟수 증가
    stored.attempts += 1;
    const updatedCookieValue = JSON.stringify(stored);
    
    const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production";
    response.cookies.set("phone_verification", updatedCookieValue, {
      httpOnly: true,
      secure: isProduction, // HTTPS에서만 secure 쿠키 사용
      sameSite: "lax", // WebView에서도 작동하는 lax 사용
      maxAge: Math.floor((stored.expiresAt - Date.now()) / 1000),
      path: "/",
    });

    const remainingAttempts = MAX_ATTEMPTS - stored.attempts;
    return {
      success: false,
      message: `인증번호가 일치하지 않습니다. (${remainingAttempts}회 남음)`,
    };
  }

  // 인증 성공 - 쿠키 삭제
  response.cookies.delete("phone_verification");

  return {
    success: true,
    message: "인증이 완료되었습니다.",
  };
}

/**
 * 인증번호 재전송 가능 여부 확인
 * (같은 번호로 너무 자주 요청하는 것 방지)
 */
export function canResendCode(
  phone: string,
  cookieStore: { get: (name: string) => { value: string } | undefined }
): {
  canResend: boolean;
  remainingSeconds?: number;
} {
  const normalizedPhone = normalizePhone(phone);

  // 쿠키에서 인증번호 정보 읽기
  const cookie = cookieStore.get("phone_verification");
  
  if (!cookie || !cookie.value) {
    return { canResend: true };
  }

  let stored: VerificationCode;
  try {
    stored = JSON.parse(cookie.value);
  } catch {
    return { canResend: true };
  }

  // 전화번호 일치 확인
  if (stored.phone !== normalizedPhone) {
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
 * 인증번호 생성 (6자리 랜덤 숫자)
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 저장소 초기화 (테스트용)
 */
export function clearVerificationStore(response: NextResponse): void {
  response.cookies.delete("phone_verification");
}
