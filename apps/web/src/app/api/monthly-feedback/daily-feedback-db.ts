import type { SupabaseClient } from "@supabase/supabase-js";
import type { DailyFeedbackRow } from "@/types/daily-feedback";
import type { DailyFeedbackForMonthly } from "./types";
import { API_ENDPOINTS } from "@/constants";
import { decryptDailyFeedback } from "@/lib/jsonb-encryption";

/**
 * DailyFeedbackRow에서 월간 피드백 생성에 필요한 필드만 추출
 */
function extractMonthlyFeedbackFields(
  feedback: DailyFeedbackRow
): DailyFeedbackForMonthly {
  return {
    report_date: feedback.report_date,
    day_of_week: feedback.day_of_week,
    vivid_report: feedback.vivid_report,
    emotion_report: feedback.emotion_report,
    // 현재 DailyFeedbackRow에는 emotion_report와 vivid_report만 존재
    daily_report: null,
    summary_report: null,
    insight_report: null,
    feedback_report: null,
    final_report: null,
  };
}

/**
 * 날짜 범위로 daily-feedback 조회 (월간용, 필요한 리포트 필드만 포함)
 */
export async function fetchDailyFeedbacksByMonth(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailyFeedbackForMonthly[]> {
  const { data, error } = await supabase
    .from(API_ENDPOINTS.DAILY_FEEDBACK)
    .select("*")
    .eq("user_id", userId)
    .gte("report_date", startDate)
    .lte("report_date", endDate)
    .order("report_date", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch daily feedbacks: ${error.message}`);
  }

  // 복호화 처리
  const decryptedFeedbacks = (data || []).map(
    (item) =>
      decryptDailyFeedback(
        item as unknown as { [key: string]: unknown }
      ) as unknown as DailyFeedbackRow
  );

  // 월간 피드백 생성에 필요한 필드만 추출
  return decryptedFeedbacks.map(extractMonthlyFeedbackFields);
}
