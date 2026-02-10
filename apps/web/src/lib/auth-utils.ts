/**
 * Supabase AuthApiError: Invalid Refresh Token / Refresh Token Not Found
 * 오류인지 판별합니다. (오래된 세션, 서버에서 토큰 삭제 등)
 */
export function isInvalidRefreshTokenError(error: unknown): boolean {
  if (error == null) return false;
  const err = error as { message?: string; name?: string };
  const msg = typeof err.message === "string" ? err.message : "";
  const isMessageMatch =
    msg.includes("Invalid Refresh Token") || msg.includes("Refresh Token Not Found");
  const isAuthApiError = err.name === "AuthApiError";
  return isMessageMatch || (isAuthApiError && msg.length > 0 && msg.toLowerCase().includes("refresh"));
}
