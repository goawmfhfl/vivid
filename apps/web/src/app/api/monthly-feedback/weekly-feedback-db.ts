import type { SupabaseClient } from "@supabase/supabase-js";
import type { WeeklyFeedback } from "@/types/weekly-feedback";
import { API_ENDPOINTS } from "@/constants";
import { decryptWeeklyFeedback } from "@/lib/jsonb-encryption";

/**
 * 날짜 범위로 weekly-feedback 조회 (월간용)
 */
export async function fetchWeeklyFeedbacksByMonth(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<WeeklyFeedback[]> {
  // 주간 피드백이 해당 월과 겹치는 경우 모두 포함
  // 조건: week_start <= endDate AND week_end >= startDate
  // 예: 11월 조회 시 (startDate="2025-11-01", endDate="2025-11-30")
  //   - 10월 28일(월) ~ 11월 3일(일): week_start="2025-10-28" <= "2025-11-30" ✅ AND week_end="2025-11-03" >= "2025-11-01" ✅ → 포함
  //   - 11월 4일(월) ~ 11월 10일(일): week_start="2025-11-04" <= "2025-11-30" ✅ AND week_end="2025-11-10" >= "2025-11-01" ✅ → 포함
  const { data, error } = await supabase
    .from(API_ENDPOINTS.WEEKLY_FEEDBACKS)
    .select("*")
    .eq("user_id", userId)
    .lte("week_start", endDate) // week_start가 월의 마지막 날보다 작거나 같아야 함
    .gte("week_end", startDate) // week_end가 월의 첫 날보다 크거나 같아야 함
    .order("week_start", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch weekly feedbacks: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // 각 JSONB 컬럼에서 데이터를 읽어서 WeeklyFeedback 타입으로 변환
  return data.map((row) => {
    const rawFeedback = {
      id: String(row.id),
      week_range: {
        start: row.week_start,
        end: row.week_end,
        timezone: row.timezone || "Asia/Seoul",
      },
      summary_report: row.summary_report as WeeklyFeedback["summary_report"],
      daily_life_report:
        row.daily_life_report as WeeklyFeedback["daily_life_report"],
      emotion_report:
        (row.emotion_report as WeeklyFeedback["emotion_report"]) ?? null,
      vision_report: row.vision_report as WeeklyFeedback["vision_report"],
      insight_report: row.insight_report as WeeklyFeedback["insight_report"],
      execution_report:
        row.execution_report as WeeklyFeedback["execution_report"],
      closing_report: row.closing_report as WeeklyFeedback["closing_report"],
      is_ai_generated: row.is_ai_generated ?? undefined,
      created_at: row.created_at ?? undefined,
    };

    // 복호화 처리
    return decryptWeeklyFeedback(
      rawFeedback as unknown as { [key: string]: unknown }
    ) as unknown as WeeklyFeedback;
  });
}
