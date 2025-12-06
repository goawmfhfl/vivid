/**
 * AI 요청 추적 유틸리티
 * 테스트 환경에서만 작동하며, AI 요청의 비용과 시간을 추적합니다.
 */

// 서버 사이드에서만 사용 가능한 환경 변수
const isDevelopment =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_NODE_ENV === "development";

/**
 * OpenAI completion 응답에서 사용량 정보 추출
 */
export function extractUsageInfo(completion: any) {
  const usage = completion.usage;
  if (!usage) return null;

  // OpenAI API 응답에서 캐시된 토큰 정보 추출
  // prompt_tokens_details는 선택적 필드이며, cached_tokens를 포함할 수 있음
  const cachedTokens =
    (usage as any)?.prompt_tokens_details?.cached_tokens || 0;

  return {
    prompt_tokens: usage.prompt_tokens || 0,
    completion_tokens: usage.completion_tokens || 0,
    total_tokens: usage.total_tokens || 0,
    cached_tokens: cachedTokens,
  };
}

/**
 * AI 요청 추적을 위한 헬퍼 함수
 * 테스트 환경에서만 작동합니다.
 */
export async function trackAIRequest<T>(
  name: string,
  model: string,
  requestFn: () => Promise<T>
): Promise<T> {
  if (!isDevelopment) {
    // 프로덕션 환경에서는 추적하지 않음
    return requestFn();
  }

  // 동적 import로 클라이언트 사이드 코드와 분리
  // 서버 사이드에서는 직접 호출하지 않음

  try {
    // 요청 시작 추적 (서버 사이드에서는 스토어를 직접 사용할 수 없으므로
    // 클라이언트에서 호출하는 경우에만 추적)
    // 실제 추적은 각 AI 서비스 함수에서 직접 수행
    const result = await requestFn();
    return result;
  } catch (error) {
    throw error;
  }
}
