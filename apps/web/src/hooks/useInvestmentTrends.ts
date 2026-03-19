import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { getCurrentUserCacheContext } from "./useCurrentUser";
import type { InvestmentTrendsResponse } from "@/app/api/weekly-vivid/investment-trends/route";

type FetchOptions = { force?: boolean };

export const fetchInvestmentTrends = async (
  options?: FetchOptions
): Promise<InvestmentTrendsResponse> => {
  const { userId, cacheBust } = await getCurrentUserCacheContext();
  const forceParam = options?.force ? "&force=1" : "";
  const cacheParam = cacheBust ? `&v=${encodeURIComponent(cacheBust)}` : "";

  const response = await fetch(
    `/api/weekly-vivid/investment-trends?userId=${userId}${forceParam}${cacheParam}`,
    {
      cache: options?.force ? "no-store" : "default",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch investment trends");
  }

  return response.json() as Promise<InvestmentTrendsResponse>;
};

export const useInvestmentTrends = (enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.WEEKLY_VIVID, "investment-trends"],
    queryFn: () => fetchInvestmentTrends(),
    enabled,
    staleTime: 1000 * 60 * 60 * 24, // 1일 캐시 유지
    gcTime: 1000 * 60 * 60 * 24,
  });
};
