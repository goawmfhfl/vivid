import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { getCurrentUserId } from "./useCurrentUser";
import type { MonthlyTrendsResponse } from "@/types/monthly-feedback-new";

const fetchMonthlyTrends = async (): Promise<MonthlyTrendsResponse> => {
  try {
    const userId = await getCurrentUserId();

    const response = await fetch(
      `/api/monthly-feedback/recent-trends?userId=${userId}`
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
    queryKey: [QUERY_KEYS.MONTHLY_FEEDBACK, "recent-trends"],
    queryFn: fetchMonthlyTrends,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
    gcTime: 1000 * 60 * 10, // 10분간 가비지 컬렉션 방지
  });
};
