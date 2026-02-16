/**
 * Gemini API 429 (Rate Limit) 재시도 유틸리티
 * - 분당 25회 제한 등 quota 초과 시 자동 재시도
 * - 에러 메시지의 "Please retry in X.XXs" 파싱하여 대기
 */

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_DELAY_MS = 20_000; // 20초 (에러 메시지 권장값)

function parseRetryDelayFromError(error: unknown): number | null {
  const message =
    error instanceof Error ? error.message : String(error ?? "");
  // "Please retry in 19.373518142s" 형식 파싱
  const match = message.match(/retry in (\d+(?:\.\d+)?)s/i);
  if (match) {
    const seconds = parseFloat(match[1]);
    return Math.ceil(seconds * 1000);
  }
  return null;
}

function isRateLimitError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message : String(error ?? "");
  return (
    message.includes("429") ||
    message.includes("Too Many Requests") ||
    message.includes("quota") ||
    message.includes("exceeded your current quota")
  );
}

/**
 * 429/quota 에러 시 자동 재시도
 * @param fn API 호출 함수
 * @param options maxRetries: 최대 재시도 횟수, baseDelayMs: 기본 대기 시간(ms)
 */
export async function withGeminiRetry<T>(
  fn: () => Promise<T>,
  options?: { maxRetries?: number; baseDelayMs?: number }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
  const baseDelayMs = options?.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries && isRateLimitError(error)) {
        const delayMs =
          parseRetryDelayFromError(error) ?? baseDelayMs;
        console.warn(
          `[Gemini] Rate limit (429), retrying in ${delayMs / 1000}s (attempt ${attempt + 1}/${maxRetries})`,
          { error: error instanceof Error ? error.message : String(error) }
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        throw error;
      }
    }
  }

  throw lastError;
}
