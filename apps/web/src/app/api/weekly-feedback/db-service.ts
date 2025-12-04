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
  decryptJsonbFields,
} from "@/lib/jsonb-encryption";

/**
 * 날짜 범위로 daily-feedback 조회
 */
export async function fetchDailyFeedbacksByRange(
  supabase: SupabaseClient,
  userId: string,
  start: string,
  end: string
): Promise<DailyFeedbackRow[]> {
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
  return (data || []).map(
    (item) =>
      decryptDailyFeedback(
        item as unknown as { [key: string]: unknown }
      ) as unknown as DailyFeedbackRow
  );
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
      "id, week_start, week_end, summary_report, is_ai_generated, created_at"
    )
    .eq("user_id", userId)
    .order("week_start", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch weekly feedback list: ${error.message}`);
  }

  return (data || []).map((row) => {
    // summary_report 복호화
    const decryptedSummaryReport = decryptJsonbFields(
      row.summary_report as { summary?: string; key_points?: string[] } | null
    ) as { summary?: string; key_points?: string[] } | null;

    // summary의 앞부분을 사용하거나 날짜 범위 사용
    const title = decryptedSummaryReport?.summary
      ? decryptedSummaryReport.summary.substring(0, 50) +
        (decryptedSummaryReport.summary.length > 50 ? "..." : "")
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
  const rawFeedback = {
    id: String(data.id),
    week_range: {
      start: data.week_start,
      end: data.week_end,
      timezone: data.timezone || "Asia/Seoul",
    },
    summary_report: data.summary_report as WeeklyFeedback["summary_report"],
    daily_life_report:
      data.daily_life_report as WeeklyFeedback["daily_life_report"],
    emotion_report:
      (data.emotion_report as WeeklyFeedback["emotion_report"]) ?? null,
    vision_report: data.vision_report as WeeklyFeedback["vision_report"],
    insight_report: data.insight_report as WeeklyFeedback["insight_report"],
    execution_report:
      data.execution_report as WeeklyFeedback["execution_report"],
    closing_report: data.closing_report as WeeklyFeedback["closing_report"],
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
    summary_report: data.summary_report as WeeklyFeedback["summary_report"],
    daily_life_report:
      data.daily_life_report as WeeklyFeedback["daily_life_report"],
    emotion_report:
      (data.emotion_report as WeeklyFeedback["emotion_report"]) ?? null,
    vision_report: data.vision_report as WeeklyFeedback["vision_report"],
    insight_report: data.insight_report as WeeklyFeedback["insight_report"],
    execution_report:
      data.execution_report as WeeklyFeedback["execution_report"],
    closing_report: data.closing_report as WeeklyFeedback["closing_report"],
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

  const { data, error } = await supabase
    .from(API_ENDPOINTS.WEEKLY_FEEDBACKS)
    .upsert(
      {
        user_id: userId,
        week_start: encryptedFeedback.week_range.start,
        week_end: encryptedFeedback.week_range.end,
        timezone: encryptedFeedback.week_range.timezone || "Asia/Seoul",
        summary_report: encryptedFeedback.summary_report,
        daily_life_report: encryptedFeedback.daily_life_report,
        emotion_report: encryptedFeedback.emotion_report ?? null,
        vision_report: encryptedFeedback.vision_report,
        insight_report: encryptedFeedback.insight_report,
        execution_report: encryptedFeedback.execution_report,
        closing_report: encryptedFeedback.closing_report,
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
