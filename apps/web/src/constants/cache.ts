/**
 * ISR(Incremental Static Regeneration) 캐시 revalidate 시간 상수
 * 
 * Next.js App Router에서 API 라우트의 캐시 유지 시간을 설정합니다.
 * 각 리소스 타입별로 적절한 revalidate 시간을 정의합니다.
 */

// 피드백 데이터는 생성 후 무효화가 보장되므로 1일 캐시
export const FEEDBACK_REVALIDATE = 86400; // 1일 (초 단위)

// Records는 자주 업데이트되므로 1시간으로 설정
export const RECORDS_REVALIDATE = 3600; // 1시간 (초 단위)

// 최근 동향 데이터는 생성 후 무효화가 보장되므로 1일 캐시
export const RECENT_TRENDS_REVALIDATE = 86400; // 1일 (초 단위)

// 후보 데이터는 생성 후 무효화가 보장되므로 1일 캐시
export const CANDIDATES_REVALIDATE = 86400; // 1일 (초 단위)

/**
 * Cache-Control 헤더 생성 헬퍼 함수
 * 
 * @param revalidateSeconds - revalidate 시간 (초)
 * @param staleWhileRevalidate - stale-while-revalidate 시간 (초, 선택사항)
 * @returns Cache-Control 헤더 값
 */
export function getCacheControlHeader(
  revalidateSeconds: number,
  staleWhileRevalidate?: number
): string {
  const parts = [
    "public",
    `s-maxage=${revalidateSeconds}`,
  ];

  if (staleWhileRevalidate) {
    parts.push(`stale-while-revalidate=${staleWhileRevalidate}`);
  }

  return parts.join(", ");
}
