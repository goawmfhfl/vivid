import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { getCurrentUserId } from "./useCurrentUser";

export interface RecentTrendsResponse {
  emotionData: Array<{
    date: string;
    valence: number | null;
    arousal: number | null;
    quadrant: string | null;
  }>;
  aspired_self: string[];
  interests: string[];
  personalityStrengths: string[];
  immersionSituations: string[];
  reliefSituations: string[];
}

const fetchRecentTrends = async (): Promise<RecentTrendsResponse> => {
  try {
    const userId = await getCurrentUserId();

    const response = await fetch(
      `/api/daily-feedback/recent-trends?userId=${userId}`
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
    queryKey: [QUERY_KEYS.DAILY_FEEDBACK, "recent-trends"],
    queryFn: fetchRecentTrends,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
    gcTime: 1000 * 60 * 10, // 10분간 가비지 컬렉션 방지 (이전 cacheTime)
  });
};
