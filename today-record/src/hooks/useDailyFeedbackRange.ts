import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { QUERY_KEYS, API_ENDPOINTS } from "@/constants";
import { getCurrentUserId } from "./useCurrentUser";
import type { DailyFeedbackRow } from "@/types/daily-feedback";
import { decryptDailyFeedback } from "@/lib/jsonb-encryption";

type UseDailyFeedbackRangeParams = {
  start: string; // "YYYY-MM-DD"
  end: string; // "YYYY-MM-DD"
};

/**
 * 날짜 범위로 daily-feedback 조회
 */
const fetchDailyFeedbackRange = async (
  params: UseDailyFeedbackRangeParams
): Promise<DailyFeedbackRow[]> => {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from(API_ENDPOINTS.DAILY_FEEDBACK)
    .select("*")
    .eq("user_id", userId)
    .gte("report_date", params.start)
    .lte("report_date", params.end)
    .order("report_date", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch daily feedback range: ${error.message}`);
  }

  // 복호화 처리
  return (data || []).map((item) =>
    decryptDailyFeedback(item)
  ) as DailyFeedbackRow[];
};

/**
 * 날짜 범위로 daily-feedback 조회 훅
 */
export function useDailyFeedbackRange(params: UseDailyFeedbackRangeParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.DAILY_FEEDBACK, "range", params.start, params.end],
    queryFn: () => fetchDailyFeedbackRange(params),
    enabled: !!params.start && !!params.end,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
}
