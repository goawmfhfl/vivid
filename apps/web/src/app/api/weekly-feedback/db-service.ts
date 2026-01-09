import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  WeeklyFeedback,
  WeeklyFeedbackListItem,
} from "@/types/weekly-feedback";
import type { DailyFeedbackRow } from "@/types/daily-feedback";
import { API_ENDPOINTS } from "@/constants";
import {
  encryptWeeklyFeedback,
  decryptWeeklyFeedback,
} from "@/lib/jsonb-encryption";

/**
 * DailyFeedbackRow에서 vivid_report만 추출
 */
function extractVividReport(
  feedback: DailyFeedbackRow
): Pick<DailyFeedbackRow, "report_date" | "day_of_week" | "vivid_report"> {
  return {
    report_date: feedback.report_date,
    day_of_week: feedback.day_of_week,
    vivid_report: feedback.vivid_report,
  };
}

/**
 * 날짜 범위로 daily-feedback 조회 (vivid_report만 포함)
 */
export async function fetchDailyFeedbacksByRange(
  supabase: SupabaseClient,
  userId: string,
  start: string,
  end: string
): Promise<Pick<DailyFeedbackRow, "report_date" | "day_of_week" | "vivid_report">[]> {
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

  // 복호화 처리
  const { decryptDailyFeedback } = await import("@/lib/jsonb-encryption");
  const decryptedFeedbacks = (data || []).map(
    (item) =>
      decryptDailyFeedback(
        item as unknown as { [key: string]: unknown }
      ) as unknown as DailyFeedbackRow
  );

  // vivid_report만 추출
  return decryptedFeedbacks.map(extractVividReport);
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
      "id, week_start, week_end, title, is_ai_generated, created_at"
    )
    .eq("user_id", userId)
    .order("week_start", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch weekly feedback list: ${error.message}`);
  }

  return (data || []).map((row) => {
    // title이 있으면 사용, 없으면 날짜 범위를 title로 사용 (하위 호환성)
    const title = row.title || `${row.week_start} ~ ${row.week_end}`;

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
  const rawFeedback = {
    id: String(data.id),
    week_range: {
      start: data.week_start,
      end: data.week_end,
      timezone: data.timezone || "Asia/Seoul",
    },
    vivid_report: data.vivid_report as WeeklyFeedback["vivid_report"],
    title: data.title || undefined,
    trend: data.trend || undefined,
    is_ai_generated: data.is_ai_generated ?? undefined,
    created_at: data.created_at ?? undefined,
  };

  // 복호화 처리
  return decryptWeeklyFeedback(
    rawFeedback as unknown as { [key: string]: unknown }
  ) as unknown as WeeklyFeedback;
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
  const rawFeedback = {
    id: String(data.id),
    week_range: {
      start: data.week_start,
      end: data.week_end,
      timezone: data.timezone || "Asia/Seoul",
    },
    vivid_report: data.vivid_report as WeeklyFeedback["vivid_report"],
    title: data.title || undefined,
    trend: data.trend || undefined,
    is_ai_generated: data.is_ai_generated ?? undefined,
    created_at: data.created_at ?? undefined,
  };

  // 복호화 처리
  return decryptWeeklyFeedback(
    rawFeedback as unknown as { [key: string]: unknown }
  ) as unknown as WeeklyFeedback;
}

export async function saveWeeklyFeedback(
  supabase: SupabaseClient,
  userId: string,
  feedback: WeeklyFeedback
): Promise<string> {
  // 암호화 처리
  const encryptedFeedback = encryptWeeklyFeedback(
    feedback
  ) as unknown as WeeklyFeedback;

  // trend는 encryptWeeklyFeedback에서 이미 암호화됨

  // DB 스키마가 요구하는 필수 필드들에 대한 기본값 설정
  // (WeeklyFeedback 타입에는 없지만 DB 스키마가 NOT NULL로 요구하는 경우)
  const defaultSummaryReport = {
    title: `${encryptedFeedback.week_range.start} ~ ${encryptedFeedback.week_range.end} 주간 피드백`,
    summary: "이번 주 피드백이 생성되었습니다.",
    key_points: [],
    trend_analysis: null,
  };

  const defaultEmotionReport = null;
  const defaultDailyLifeReport = { summary: "" };
  const defaultInsightReport = { core_insights: [] };
  const defaultExecutionReport = {
    feedback_patterns: {
      positives_categories: [],
      improvements_categories: [],
    },
    ai_feedback_summary: "",
  };

  const { data, error } = await supabase
    .from(API_ENDPOINTS.WEEKLY_FEEDBACKS)
    .upsert(
      {
        user_id: userId,
        week_start: encryptedFeedback.week_range.start,
        week_end: encryptedFeedback.week_range.end,
        timezone: encryptedFeedback.week_range.timezone || "Asia/Seoul",
        title: encryptedFeedback.title || null,
        summary_report: defaultSummaryReport,
        emotion_report: defaultEmotionReport,
        daily_life_report: defaultDailyLifeReport,
        insight_report: defaultInsightReport,
        execution_report: defaultExecutionReport,
        vivid_report: encryptedFeedback.vivid_report,
        closing_report: null,
        trend: encryptedFeedback.trend || null, // trend 필드 추가
        is_ai_generated: encryptedFeedback.is_ai_generated ?? true,
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
