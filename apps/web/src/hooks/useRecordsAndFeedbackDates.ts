import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { QUERY_KEYS, API_ENDPOINTS } from "@/constants";
import { getCurrentUserId } from "./useCurrentUser";
import { getKSTDateString } from "@/lib/date-utils";

/**
 * 모든 기록 날짜와 AI 피드백 날짜 조회
 */
const fetchRecordsAndFeedbackDates = async (): Promise<{
  recordDates: string[];
  aiFeedbackDates: string[];
}> => {
  const userId = await getCurrentUserId();

  // 최근 1년 범위로 조회
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const startDate = getKSTDateString(oneYearAgo);

  // Records 날짜 조회
  const { data: records, error: recordsError } = await supabase
    .from(API_ENDPOINTS.RECORDS)
    .select("kst_date")
    .eq("user_id", userId)
    .gte("kst_date", startDate);

  if (recordsError) {
    throw new Error(`Failed to fetch records dates: ${recordsError.message}`);
  }

  // AI 피드백 날짜 조회 (is_ai_generated = true만)
  const { data: feedbacks, error: feedbackError } = await supabase
    .from(API_ENDPOINTS.DAILY_VIVID)
    .select("report_date")
    .eq("user_id", userId)
    .eq("is_ai_generated", true)
    .gte("report_date", startDate);

  if (feedbackError) {
    throw new Error(`Failed to fetch feedback dates: ${feedbackError.message}`);
  }

  // 중복 제거 및 정렬
  const recordDates = Array.from(
    new Set((records || []).map((r) => r.kst_date as string))
  ).sort();

  const aiFeedbackDates = Array.from(
    new Set((feedbacks || []).map((f) => f.report_date as string))
  ).sort();

  return {
    recordDates,
    aiFeedbackDates,
  };
};

/**
 * 모든 기록 날짜와 AI 피드백 날짜 조회 훅
 */
export function useRecordsAndFeedbackDates() {
  return useQuery({
    queryKey: [QUERY_KEYS.RECORDS, "dates", "all"],
    queryFn: fetchRecordsAndFeedbackDates,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
}
