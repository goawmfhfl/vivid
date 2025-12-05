import type { SupabaseClient } from "@supabase/supabase-js";
import type { DailyFeedbackRow } from "@/types/daily-feedback";
import { API_ENDPOINTS } from "@/constants";
import { decryptDailyFeedback } from "@/lib/jsonb-encryption";

/**
 * 날짜 범위로 daily-feedback 조회 (월간용)
 */
export async function fetchDailyFeedbacksByMonth(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailyFeedbackRow[]> {
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
  return (data || []).map(
    (item) =>
      decryptDailyFeedback(
        item as unknown as { [key: string]: unknown }
      ) as unknown as DailyFeedbackRow
  );
}
