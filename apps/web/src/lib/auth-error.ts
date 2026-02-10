import { supabase } from "@/lib/supabase";
import { ERROR_MESSAGES } from "@/constants";

/** Supabase 리프레시 토큰 관련 에러 메시지 패턴 */
const REFRESH_TOKEN_PATTERNS = [
  "Invalid Refresh Token",
  "Refresh Token Not Found",
  "refresh_token_not_found",
  "invalid_refresh_token",
] as const;

/**
 * 에러가 리프레시 토큰 만료/없음으로 인한 인증 실패인지 판별
 */
export function isRefreshTokenError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const lower = message.toLowerCase();
  return REFRESH_TOKEN_PATTERNS.some(
    (p) => lower.includes(p.toLowerCase())
  );
}

/**
 * 리프레시 토큰 에러 시 로컬 세션만 정리 (로그아웃).
 * 쿼리 무효화는 호출 측에서 queryClient를 사용해 처리해야 함.
 */
export async function clearSessionOnRefreshTokenError(): Promise<void> {
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch (e) {
    console.error("[auth-error] signOut 실패:", e);
  }
}

/**
 * 사용자에게 보여줄 메시지: 리프레시 토큰 에러면 "로그인이 필요합니다.", 아니면 원본 메시지
 */
export function getAuthErrorMessage(error: unknown): string {
  if (isRefreshTokenError(error)) {
    return ERROR_MESSAGES.LOGIN_REQUIRED;
  }
  return error instanceof Error ? error.message : String(error);
}

/**
 * 인증 실패(리프레시 토큰 등)로 재시도하면 안 되는 에러인지
 * React Query retry 등에서 사용
 */
export function isAuthFailureNoRetry(error: unknown): boolean {
  if (isRefreshTokenError(error)) return true;
  const code = error && typeof error === "object" && "code" in error
    ? (error as { code?: string }).code
    : undefined;
  return code === "INVALID_REFRESH_TOKEN";
}
