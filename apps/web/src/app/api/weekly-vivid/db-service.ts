import type { SupabaseClient } from "@supabase/supabase-js";
import type { WeeklyVivid, WeeklyVividListItem } from "@/types/weekly-vivid";
import type { DailyVividRow } from "@/types/daily-vivid";
import { API_ENDPOINTS } from "@/constants";
import { encryptWeeklyVivid, decryptWeeklyVivid } from "@/lib/jsonb-encryption";
import { decrypt } from "@/lib/encryption";
import type { Record } from "../daily-vivid/types";

/**
 * DailyVividRow에서 report만 추출
 */
function extractReport(
  feedback: DailyVividRow
): Pick<DailyVividRow, "report_date" | "day_of_week" | "report"> {
  return {
    report_date: feedback.report_date,
    day_of_week: feedback.day_of_week,
    report: feedback.report,
  };
}

/**
 * 날짜 범위로 daily-vivid 조회 (report만 포함)
 * @deprecated 기록 기반 생성으로 변경됨. fetchRecordsByDateRange 사용 권장
 */
export async function fetchDailyVividByRange(
  supabase: SupabaseClient,
  userId: string,
  start: string,
  end: string
): Promise<Pick<DailyVividRow, "report_date" | "day_of_week" | "report">[]> {
  const { data, error } = await supabase
    .from(API_ENDPOINTS.DAILY_VIVID)
    .select("*")
    .eq("user_id", userId)
    .gte("report_date", start)
    .lte("report_date", end)
    .order("report_date", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch daily vivid: ${error.message}`);
  }

  // 복호화 처리
  const { decryptDailyVivid } = await import("@/lib/jsonb-encryption");
  const decryptedFeedbacks = (data || []).map(
    (item) =>
      decryptDailyVivid(
        item as unknown as { [key: string]: unknown }
      ) as unknown as DailyVividRow
  );

  // report만 추출
  return decryptedFeedbacks.map(extractReport);
}

/**
 * 날짜 범위로 vivid-records 조회 (주간 피드백 생성용)
 * 해당 주의 모든 VIVID 기록을 가져옴
 */
export async function fetchRecordsByDateRange(
  supabase: SupabaseClient,
  userId: string,
  start: string,
  end: string
): Promise<Record[]> {
  const { data: records, error } = await supabase
    .from("vivid_records")
    .select("*")
    .eq("user_id", userId)
    .in("type", ["vivid", "dream"]) // VIVID 타입만 조회
    .gte("kst_date", start)
    .lte("kst_date", end)
    .order("kst_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch records: ${error.message}`);
  }

  if (!records || records.length === 0) {
    return [];
  }

  // 복호화 처리
  return records.map((record) => ({
    ...record,
    content: decrypt(record.content),
  })) as Record[];
}

/**
 * Weekly Vivid 리스트 조회 (가벼운 데이터만)
 */
export async function fetchWeeklyVividList(
  supabase: SupabaseClient,
  userId: string
): Promise<WeeklyVividListItem[]> {
  const { data, error } = await supabase
    .from(API_ENDPOINTS.WEEKLY_VIVID)
    .select(
      "id, week_start, week_end, title, is_ai_generated, created_at"
    )
    .eq("user_id", userId)
    .order("week_start", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch weekly vivid list: ${error.message}`);
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
 * Weekly Vivid 상세 조회 (date 기반)
 */
export async function fetchWeeklyVividByDate(
  supabase: SupabaseClient,
  userId: string,
  date: string
): Promise<WeeklyVivid | null> {
  const { data, error } = await supabase
    .from(API_ENDPOINTS.WEEKLY_VIVID)
    .select("*")
    .eq("user_id", userId)
    .eq("week_start", date)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch weekly vivid: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  // 각 JSONB 컬럼에서 데이터를 읽어서 WeeklyVivid 타입으로 변환
  const rawFeedback = {
    id: String(data.id),
    week_range: {
      start: data.week_start,
      end: data.week_end,
      timezone: data.timezone || "Asia/Seoul",
    },
    report: data.report as WeeklyVivid["report"],
    title: data.title || undefined,
    trend: data.trend || undefined,
    is_ai_generated: data.is_ai_generated ?? undefined,
    created_at: data.created_at ?? undefined,
  };

  // 복호화 처리
  return decryptWeeklyVivid(
    rawFeedback as unknown as { [key: string]: unknown }
  ) as unknown as WeeklyVivid;
}

/**
 * Weekly Vivid 상세 조회 (id 기반)
 */
export async function fetchWeeklyVividDetail(
  supabase: SupabaseClient,
  userId: string,
  id: string
): Promise<WeeklyVivid | null> {
  const { data, error } = await supabase
    .from(API_ENDPOINTS.WEEKLY_VIVID)
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch weekly vivid: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  // 각 JSONB 컬럼에서 데이터를 읽어서 WeeklyVivid 타입으로 변환
  const rawFeedback = {
    id: String(data.id),
    week_range: {
      start: data.week_start,
      end: data.week_end,
      timezone: data.timezone || "Asia/Seoul",
    },
    report: data.report as WeeklyVivid["report"],
    title: data.title || undefined,
    trend: data.trend || undefined,
    is_ai_generated: data.is_ai_generated ?? undefined,
    created_at: data.created_at ?? undefined,
  };

  // 복호화 처리
  return decryptWeeklyVivid(
    rawFeedback as unknown as { [key: string]: unknown }
  ) as unknown as WeeklyVivid;
}

export async function saveWeeklyVivid(
  supabase: SupabaseClient,
  userId: string,
  feedback: WeeklyVivid,
  generationDurationSeconds?: number
): Promise<string> {
  // 암호화 처리
  const encryptedFeedback = encryptWeeklyVivid(
    feedback
  ) as unknown as WeeklyVivid;

  const { data, error } = await supabase
    .from(API_ENDPOINTS.WEEKLY_VIVID)
    .upsert(
      {
        user_id: userId,
        week_start: encryptedFeedback.week_range.start,
        week_end: encryptedFeedback.week_range.end,
        timezone: encryptedFeedback.week_range.timezone || "Asia/Seoul",
        title: encryptedFeedback.title || null,
        report: encryptedFeedback.report || null,
        trend: encryptedFeedback.trend || null, // trend 필드 추가
        is_ai_generated: encryptedFeedback.is_ai_generated ?? true,
        generation_duration_seconds: generationDurationSeconds ?? null,
      },
      { onConflict: "user_id,week_start" }
    )
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to save weekly vivid: ${error.message}`);
  }

  if (!data || !data.id) {
    throw new Error("Failed to save weekly vivid: no ID returned");
  }

  return String(data.id);
}
