import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { getCurrentUserCacheContext } from "./useCurrentUser";

export interface WeeklyTrendsResponse {
  direction: string[]; // 어떤 방향으로 가고 있는 사람인가 (최근 4주)
  core_value: string[]; // 내가 진짜 중요하게 여기는 가치 (최근 4주)
  driving_force: string[]; // 나를 움직이는 실제 원동력 (최근 4주)
  current_self: string[]; // 요즘의 나라는 사람 (최근 4주)
}

type FetchOptions = { force?: boolean };

export const fetchWeeklyTrends = async (
  options?: FetchOptions
): Promise<WeeklyTrendsResponse> => {
  try {
    const { userId, cacheBust } = await getCurrentUserCacheContext();
    const forceParam = options?.force ? "&force=1" : "";
    const cacheParam = cacheBust ? `&v=${encodeURIComponent(cacheBust)}` : "";

    const response = await fetch(
      `/api/weekly-vivid/recent-trends?userId=${userId}${forceParam}${cacheParam}`,
      {
        cache: options?.force ? "no-store" : "default",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch weekly trends");
    }

    const result = await response.json();
    return result as WeeklyTrendsResponse;
  } catch (error) {
    console.error("주간 동향 조회 중 오류:", error);
    throw error;
  }
};

export const useWeeklyTrends = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.WEEKLY_VIVID, "recent-trends"],
    queryFn: () => fetchWeeklyTrends(),
    staleTime: 1000 * 60 * 60 * 24, // 1일 캐시 유지
    gcTime: 1000 * 60 * 60 * 24, // 1일 가비지 컬렉션 방지
  });
};
