import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  WeeklyFeedback,
  WeeklyFeedbackListItem,
} from "@/types/weekly-feedback";
import { API_ENDPOINTS } from "@/constants";

/**
 * 날짜 범위로 daily-feedback 조회
 */
export async function fetchDailyFeedbacksByRange(
  supabase: SupabaseClient,
  userId: string,
  start: string,
  end: string
) {
  const { data, error } = await supabase
    .from(API_ENDPOINTS.DAILY_FEEDBACK)
    .select("*")
    .eq("user_id", userId)
    .gte("report_date", start)
    .lte("report_date", end)
    .order("report_date", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch daily feedbacks: ${error.message}`);
  }

  return data || [];
}

/**
 * Weekly Feedback 리스트 조회 (가벼운 데이터만)
 */
export async function fetchWeeklyFeedbackList(
  supabase: SupabaseClient,
  userId: string
): Promise<WeeklyFeedbackListItem[]> {
  const { data, error } = await supabase
    .from(API_ENDPOINTS.WEEKLY_FEEDBACKS)
    .select(
      "id, title, week_start, week_end, integrity_avg, is_ai_generated, created_at"
    )
    .eq("user_id", userId)
    .order("week_start", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch weekly feedback list: ${error.message}`);
  }

  return (data || []).map((row) => ({
    id: row.id,
    title: row.title,
    week_range: {
      start: row.week_start,
      end: row.week_end,
    },
    integrity_avg: row.integrity_avg ?? undefined,
    is_ai_generated: row.is_ai_generated ?? undefined,
    created_at: row.created_at ?? undefined,
  }));
}

/**
 * Weekly Feedback 상세 조회 (전체 payload)
 */
export async function fetchWeeklyFeedbackDetail(
  supabase: SupabaseClient,
  userId: string,
  id: string
): Promise<WeeklyFeedback | null> {
  const { data, error } = await supabase
    .from(API_ENDPOINTS.WEEKLY_FEEDBACKS)
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch weekly feedback: ${error.message}`);
  }

  if (!data || !data.payload) {
    return null;
  }

  const payload = data.payload as WeeklyFeedback;
  return {
    ...payload,
    id: data.id,
    is_ai_generated: data.is_ai_generated ?? undefined,
    created_at: data.created_at ?? undefined,
  };
}

/**
 * Weekly Feedback 저장
 */
export async function saveWeeklyFeedback(
  supabase: SupabaseClient,
  userId: string,
  feedback: WeeklyFeedback
): Promise<string> {
  const { data, error } = await supabase
    .from(API_ENDPOINTS.WEEKLY_FEEDBACKS)
    .insert({
      user_id: userId,
      week_start: feedback.week_range.start,
      week_end: feedback.week_range.end,
      title: feedback.title,
      integrity_avg: feedback.weekly_overview.integrity.average,
      is_ai_generated: feedback.is_ai_generated ?? true,
      payload: feedback,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to save weekly feedback: ${error.message}`);
  }

  if (!data || !data.id) {
    throw new Error("Failed to save weekly feedback: no ID returned");
  }

  return data.id;
}
