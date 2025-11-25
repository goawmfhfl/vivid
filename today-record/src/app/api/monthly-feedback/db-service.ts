import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  MonthlyFeedback,
  MonthlyFeedbackListItem,
} from "@/types/monthly-feedback";
import { API_ENDPOINTS } from "@/constants";

/**
 * 날짜 범위로 daily-feedback 조회 (월간용)
 */
export async function fetchDailyFeedbacksByMonth(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
) {
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

  return data || [];
}

/**
 * Monthly Feedback 리스트 조회 (가벼운 데이터만)
 */
export async function fetchMonthlyFeedbackList(
  supabase: SupabaseClient,
  userId: string
): Promise<MonthlyFeedbackListItem[]> {
  const { data, error } = await supabase
    .from(API_ENDPOINTS.MONTHLY_FEEDBACK)
    .select(
      "id, month, month_label, date_range, recorded_days, summary_overview, is_ai_generated, created_at"
    )
    .eq("user_id", userId)
    .order("month", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch monthly feedback list: ${error.message}`);
  }

  return (data || []).map((row) => {
    const summaryOverview = row.summary_overview as {
      summary_title?: string;
      monthly_score?: number;
    } | null;
    const title = summaryOverview?.summary_title || row.month_label;
    const monthlyScore = summaryOverview?.monthly_score || 0;
    const dateRange = row.date_range as {
      start_date: string;
      end_date: string;
    } | null;

    return {
      id: String(row.id),
      title,
      month: row.month,
      month_label: row.month_label,
      date_range: dateRange || {
        start_date: "",
        end_date: "",
      },
      monthly_score: monthlyScore,
      recorded_days: row.recorded_days || 0,
      is_ai_generated: row.is_ai_generated ?? undefined,
      created_at: row.created_at ?? undefined,
    };
  });
}

/**
 * Monthly Feedback 상세 조회 (month 기반)
 */
export async function fetchMonthlyFeedbackByMonth(
  supabase: SupabaseClient,
  userId: string,
  month: string // "YYYY-MM"
): Promise<MonthlyFeedback | null> {
  const { data, error } = await supabase
    .from(API_ENDPOINTS.MONTHLY_FEEDBACK)
    .select("*")
    .eq("user_id", userId)
    .eq("month", month)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch monthly feedback: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  // 각 JSONB 컬럼에서 데이터를 읽어서 MonthlyFeedback 타입으로 변환
  return {
    id: String(data.id),
    month: data.month,
    month_label: data.month_label,
    date_range: data.date_range as MonthlyFeedback["date_range"],
    total_days: data.total_days,
    recorded_days: data.recorded_days,
    record_coverage_rate: data.record_coverage_rate,
    integrity_average: data.integrity_average,
    summary_overview:
      data.summary_overview as MonthlyFeedback["summary_overview"],
    weekly_overview: data.weekly_overview as MonthlyFeedback["weekly_overview"],
    emotion_overview:
      data.emotion_overview as MonthlyFeedback["emotion_overview"],
    insight_overview:
      data.insight_overview as MonthlyFeedback["insight_overview"],
    feedback_overview:
      data.feedback_overview as MonthlyFeedback["feedback_overview"],
    vision_overview: data.vision_overview as MonthlyFeedback["vision_overview"],
    conclusion_overview:
      data.conclusion_overview as MonthlyFeedback["conclusion_overview"],
    is_ai_generated: data.is_ai_generated ?? undefined,
    created_at: data.created_at ?? undefined,
  };
}

/**
 * Monthly Feedback 상세 조회 (id 기반)
 */
export async function fetchMonthlyFeedbackDetail(
  supabase: SupabaseClient,
  userId: string,
  id: string
): Promise<MonthlyFeedback | null> {
  const { data, error } = await supabase
    .from(API_ENDPOINTS.MONTHLY_FEEDBACK)
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch monthly feedback: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  // 각 JSONB 컬럼에서 데이터를 읽어서 MonthlyFeedback 타입으로 변환
  return {
    id: String(data.id),
    month: data.month,
    month_label: data.month_label,
    date_range: data.date_range as MonthlyFeedback["date_range"],
    total_days: data.total_days,
    recorded_days: data.recorded_days,
    record_coverage_rate: data.record_coverage_rate,
    integrity_average: data.integrity_average,
    summary_overview:
      data.summary_overview as MonthlyFeedback["summary_overview"],
    weekly_overview: data.weekly_overview as MonthlyFeedback["weekly_overview"],
    emotion_overview:
      data.emotion_overview as MonthlyFeedback["emotion_overview"],
    insight_overview:
      data.insight_overview as MonthlyFeedback["insight_overview"],
    feedback_overview:
      data.feedback_overview as MonthlyFeedback["feedback_overview"],
    vision_overview: data.vision_overview as MonthlyFeedback["vision_overview"],
    conclusion_overview:
      data.conclusion_overview as MonthlyFeedback["conclusion_overview"],
    is_ai_generated: data.is_ai_generated ?? undefined,
    created_at: data.created_at ?? undefined,
  };
}

/**
 * Monthly Feedback 저장
 */
export async function saveMonthlyFeedback(
  supabase: SupabaseClient,
  userId: string,
  feedback: MonthlyFeedback
): Promise<string> {
  const { data, error } = await supabase
    .from(API_ENDPOINTS.MONTHLY_FEEDBACK)
    .upsert(
      {
        user_id: userId,
        month: feedback.month,
        month_label: feedback.month_label,
        date_range: feedback.date_range,
        total_days: feedback.total_days,
        recorded_days: feedback.recorded_days,
        record_coverage_rate: feedback.record_coverage_rate,
        integrity_average: feedback.integrity_average,
        summary_overview: feedback.summary_overview,
        weekly_overview: feedback.weekly_overview,
        emotion_overview: feedback.emotion_overview,
        insight_overview: feedback.insight_overview,
        feedback_overview: feedback.feedback_overview,
        vision_overview: feedback.vision_overview,
        conclusion_overview: feedback.conclusion_overview,
        is_ai_generated: feedback.is_ai_generated ?? true,
      },
      { onConflict: "user_id,month" }
    )
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to save monthly feedback: ${error.message}`);
  }

  if (!data || !data.id) {
    throw new Error("Failed to save monthly feedback: no ID returned");
  }

  return String(data.id);
}
