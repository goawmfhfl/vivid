import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  MonthlyFeedback,
  MonthlyFeedbackListItem,
} from "@/types/monthly-feedback";
import { API_ENDPOINTS } from "@/constants";
import {
  encryptMonthlyFeedback,
  decryptMonthlyFeedback,
  decryptJsonbFields,
} from "@/lib/jsonb-encryption";

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

  // 복호화 처리
  const { decryptDailyFeedback } = await import("@/lib/jsonb-encryption");
  return (data || []).map((item) => decryptDailyFeedback(item));
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
    // summary_overview 복호화
    const decryptedOverview = decryptJsonbFields(row.summary_overview) as {
      summary_title?: string;
      monthly_score?: number;
    } | null;
    const title = decryptedOverview?.summary_title || row.month_label;
    const monthlyScore = decryptedOverview?.monthly_score || 0;
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
  const rawFeedback = {
    id: String(data.id),
    month: data.month,
    month_label: data.month_label,
    date_range: data.date_range as MonthlyFeedback["date_range"],
    total_days: data.total_days,
    recorded_days: data.recorded_days,
    summary_overview:
      data.summary_overview as MonthlyFeedback["summary_overview"],
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

  // 복호화 처리
  return decryptMonthlyFeedback(rawFeedback);
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
  const rawFeedback = {
    id: String(data.id),
    month: data.month,
    month_label: data.month_label,
    date_range: data.date_range as MonthlyFeedback["date_range"],
    total_days: data.total_days,
    recorded_days: data.recorded_days,
    summary_overview:
      data.summary_overview as MonthlyFeedback["summary_overview"],
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

  // 복호화 처리
  return decryptMonthlyFeedback(rawFeedback);
}

/**
 * Monthly Feedback 저장
 */
export async function saveMonthlyFeedback(
  supabase: SupabaseClient,
  userId: string,
  feedback: MonthlyFeedback
): Promise<string> {
  // 암호화 처리
  const encryptedFeedback = encryptMonthlyFeedback(feedback);

  const { data, error } = await supabase
    .from(API_ENDPOINTS.MONTHLY_FEEDBACK)
    .upsert(
      {
        user_id: userId,
        month: encryptedFeedback.month,
        month_label: encryptedFeedback.month_label,
        date_range: encryptedFeedback.date_range,
        total_days: encryptedFeedback.total_days,
        recorded_days: encryptedFeedback.recorded_days,
        summary_overview: encryptedFeedback.summary_overview,
        emotion_overview: encryptedFeedback.emotion_overview,
        insight_overview: encryptedFeedback.insight_overview,
        feedback_overview: encryptedFeedback.feedback_overview,
        vision_overview: encryptedFeedback.vision_overview,
        conclusion_overview: encryptedFeedback.conclusion_overview,
        is_ai_generated: encryptedFeedback.is_ai_generated ?? true,
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
