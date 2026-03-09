import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { getCurrentUserCacheContext } from "./useCurrentUser";
import type { TimeInvestmentWeekItem } from "@/app/api/weekly-vivid/recent-time-investment/route";

export interface RecentTimeInvestmentResponse {
  data: TimeInvestmentWeekItem[];
}

type FetchOptions = { force?: boolean };

export const fetchRecentTimeInvestment = async (
  options?: FetchOptions
): Promise<RecentTimeInvestmentResponse> => {
  const { userId, cacheBust } = await getCurrentUserCacheContext();
  const forceParam = options?.force ? "&force=1" : "";
  const cacheParam = cacheBust ? `&v=${encodeURIComponent(cacheBust)}` : "";

  const response = await fetch(
    `/api/weekly-vivid/recent-time-investment?userId=${userId}${forceParam}${cacheParam}`,
    {
      cache: options?.force ? "no-store" : "default",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || "Failed to fetch recent time investment"
    );
  }

  return response.json() as Promise<RecentTimeInvestmentResponse>;
};

export const useRecentTimeInvestment = (enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.WEEKLY_VIVID, "recent-time-investment"],
    queryFn: () => fetchRecentTimeInvestment(),
    enabled,
    staleTime: 1000 * 60 * 60 * 24, // 1일 캐시 유지
    gcTime: 1000 * 60 * 60 * 24, // 1일 가비지 컬렉션 방지
  });
};
