import { QueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";

/**
 * React Query 캐시를 모두 클리어하는 함수
 * 로그아웃 시 이전 사용자의 데이터가 남지 않도록 사용
 */
export function clearAllCache(queryClient: QueryClient): void {
  queryClient.clear();
}

/**
 * 특정 쿼리 키와 관련된 캐시만 클리어하는 함수
 */
export function clearCacheByQueryKey(
  queryClient: QueryClient,
  queryKey: string[]
): void {
  queryClient.removeQueries({ queryKey });
}

/**
 * 인증 관련 캐시를 제외한 모든 캐시를 클리어하는 함수
 * 로그인 시 이전 사용자의 데이터만 제거하고 인증 정보는 유지
 */
export function clearUserDataCache(queryClient: QueryClient): void {
  // 인증 관련 쿼리 키를 제외한 모든 쿼리 제거
  const allQueries = queryClient.getQueryCache().getAll();
  
  allQueries.forEach((query) => {
    const queryKey = query.queryKey;
    // CURRENT_USER 쿼리는 유지
    if (
      Array.isArray(queryKey) &&
      queryKey[0] === QUERY_KEYS.CURRENT_USER
    ) {
      return;
    }
    queryClient.removeQueries({ queryKey });
  });
}

