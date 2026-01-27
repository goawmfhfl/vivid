import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { getCurrentUserId } from "./useCurrentUser";

export interface RecentTrendsResponse {
  aspired_self: string[]; // 내가 지향하는 모습 (최근 5개)
  interests: string[]; // 나의 관심사 (최근 5개)
  immersion_moments: string[]; // 몰입 희망 순간 (최근 5개)
  personality_traits: string[]; // 나라는 사람의 성향 (최근 5개)
}

type FetchOptions = { force?: boolean };

export const fetchRecentTrends = async (
  options?: FetchOptions
): Promise<RecentTrendsResponse> => {
  try {
    const userId = await getCurrentUserId();

    const response = await fetch(
      `/api/daily-vivid/recent-trends?userId=${userId}`,
      {
        cache: options?.force ? "no-store" : "default",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch recent trends");
    }

    const result = await response.json();
    return result as RecentTrendsResponse;
  } catch (error) {
    console.error("최근 동향 조회 중 오류:", error);
    throw error;
  }
};

export const useRecentTrends = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.DAILY_VIVID, "recent-trends"],
    queryFn: () => fetchRecentTrends(),
    staleTime: 1000 * 60 * 60 * 24, // 1일 캐시 유지
    gcTime: 1000 * 60 * 60 * 24, // 1일 가비지 컬렉션 방지
  });
};
