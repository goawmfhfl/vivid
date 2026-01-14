import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { QUERY_KEYS, API_ENDPOINTS } from "@/constants";
import { getCurrentUserId } from "./useCurrentUser";
import type { WeeklyCandidateWithFeedback } from "@/types/weekly-candidate";

/**
 * Weekly Candidates 조회 함수
 */
const fetchWeeklyCandidates = async (): Promise<
  WeeklyCandidateWithFeedback[]
> => {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from(API_ENDPOINTS.WEEKLY_CANDIDATES)
    .select("*")
    .eq("user_id", userId)
    .order("week_start", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch weekly candidates: ${error.message}`);
  }

  return (data || []) as WeeklyCandidateWithFeedback[];
};

/**
 * Weekly Candidates 조회 훅
 */
export const useWeeklyCandidates = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.WEEKLY_CANDIDATES],
    queryFn: fetchWeeklyCandidates,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
    placeholderData: keepPreviousData, // 이전 데이터 유지
    refetchOnWindowFocus: true, // 윈도우 포커스 시 refetch
    refetchOnMount: true, // 컴포넌트 마운트 시 refetch
  });
};
