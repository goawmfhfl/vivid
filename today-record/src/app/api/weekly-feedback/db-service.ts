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
      "id, week_start, week_end, weekly_overview, is_ai_generated, created_at"
    )
    .eq("user_id", userId)
    .order("week_start", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch weekly feedback list: ${error.message}`);
  }

  return (data || []).map((row) => {
    // weekly_overview에서 narrative의 일부를 title로 사용하거나, 날짜 범위를 title로 사용
    const weeklyOverview = row.weekly_overview as { narrative?: string } | null;
    const title = weeklyOverview?.narrative
      ? weeklyOverview.narrative.substring(0, 50) +
        (weeklyOverview.narrative.length > 50 ? "..." : "")
      : `${row.week_start} ~ ${row.week_end}`;

    return {
      id: String(row.id),
      title,
      week_range: {
        start: row.week_start,
        end: row.week_end,
      },
      is_ai_generated: row.is_ai_generated ?? undefined,
      created_at: row.created_at ?? undefined,
    };
  });
}

/**
 * Weekly Feedback 상세 조회 (date 기반)
 */
export async function fetchWeeklyFeedbackByDate(
  supabase: SupabaseClient,
  userId: string,
  date: string
): Promise<WeeklyFeedback | null> {
  const { data, error } = await supabase
    .from(API_ENDPOINTS.WEEKLY_FEEDBACKS)
    .select("*")
    .eq("user_id", userId)
    .eq("week_start", date)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch weekly feedback: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  // 각 JSONB 컬럼에서 데이터를 읽어서 WeeklyFeedback 타입으로 변환
  const weeklyOverview =
    data.weekly_overview as WeeklyFeedback["weekly_overview"];

  return {
    id: String(data.id),
    week_range: {
      start: data.week_start,
      end: data.week_end,
      timezone: data.timezone || "Asia/Seoul",
    },
    by_day: (data.by_day as WeeklyFeedback["by_day"]) || [],
    weekly_overview: weeklyOverview,
    growth_trends: data.growth_trends as WeeklyFeedback["growth_trends"],
    insight_replay: data.insight_replay as WeeklyFeedback["insight_replay"],
    vision_visualization_report:
      data.vision_visualization_report as WeeklyFeedback["vision_visualization_report"],
    execution_reflection:
      data.execution_reflection as WeeklyFeedback["execution_reflection"],
    closing_section: data.closing_section as WeeklyFeedback["closing_section"],
    is_ai_generated: data.is_ai_generated ?? undefined,
    created_at: data.created_at ?? undefined,
  };
}

/**
 * Weekly Feedback 상세 조회 (id 기반 - 하위 호환성 유지)
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

  if (!data) {
    return null;
  }

  // 각 JSONB 컬럼에서 데이터를 읽어서 WeeklyFeedback 타입으로 변환
  const weeklyOverview =
    data.weekly_overview as WeeklyFeedback["weekly_overview"];

  return {
    id: String(data.id),
    week_range: {
      start: data.week_start,
      end: data.week_end,
      timezone: data.timezone || "Asia/Seoul",
    },
    by_day: (data.by_day as WeeklyFeedback["by_day"]) || [],
    weekly_overview: weeklyOverview,
    growth_trends: data.growth_trends as WeeklyFeedback["growth_trends"],
    insight_replay: data.insight_replay as WeeklyFeedback["insight_replay"],
    vision_visualization_report:
      data.vision_visualization_report as WeeklyFeedback["vision_visualization_report"],
    execution_reflection:
      data.execution_reflection as WeeklyFeedback["execution_reflection"],
    closing_section: data.closing_section as WeeklyFeedback["closing_section"],
    is_ai_generated: data.is_ai_generated ?? undefined,
    created_at: data.created_at ?? undefined,
  };
}

export async function saveWeeklyFeedback(
  supabase: SupabaseClient,
  userId: string,
  feedback: WeeklyFeedback
): Promise<string> {
  const { data, error } = await supabase
    .from(API_ENDPOINTS.WEEKLY_FEEDBACKS)
    .upsert(
      {
        user_id: userId,
        week_start: feedback.week_range.start,
        week_end: feedback.week_range.end,
        timezone: feedback.week_range.timezone || "Asia/Seoul",
        by_day: feedback.by_day,
        weekly_overview: feedback.weekly_overview,
        growth_trends: feedback.growth_trends,
        insight_replay: feedback.insight_replay,
        vision_visualization_report: feedback.vision_visualization_report,
        execution_reflection: feedback.execution_reflection,
        closing_section: feedback.closing_section,
        is_ai_generated: feedback.is_ai_generated ?? true,
      },
      { onConflict: "user_id,week_start" }
    )
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to save weekly feedback: ${error.message}`);
  }

  if (!data || !data.id) {
    throw new Error("Failed to save weekly feedback: no ID returned");
  }

  return String(data.id);
}
