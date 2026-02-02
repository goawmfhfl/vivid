import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { getCurrentUserCacheContext } from "./useCurrentUser";
import type { MonthlyTrendsResponse } from "@/types/monthly-vivid";

type FetchOptions = { force?: boolean };

export const fetchMonthlyTrends = async (
  options?: FetchOptions
): Promise<MonthlyTrendsResponse> => {
  try {
    const { userId, cacheBust } = await getCurrentUserCacheContext();
    const forceParam = options?.force ? "&force=1" : "";
    const cacheParam = cacheBust ? `&v=${encodeURIComponent(cacheBust)}` : "";

    const response = await fetch(
      `/api/monthly-vivid/recent-trends?userId=${userId}${forceParam}${cacheParam}`,
      {
        cache: options?.force ? "no-store" : "default",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch monthly trends");
    }

    const result = await response.json();
    return result as MonthlyTrendsResponse;
  } catch (error) {
    console.error("월간 동향 조회 중 오류:", error);
    throw error;
  }
};

export const useMonthlyTrends = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.MONTHLY_VIVID, "recent-trends"],
    queryFn: () => fetchMonthlyTrends(),
    staleTime: 1000 * 60 * 5, // 5분 캐시 유지 (월간 VIVID 생성 후 빠른 반영을 위해)
    gcTime: 1000 * 60 * 60 * 24, // 1일 가비지 컬렉션 방지
    refetchOnMount: "always", // 페이지 마운트 시 항상 최신 데이터 확인
  });
};
