import type { SupabaseClient } from "@supabase/supabase-js";
import type { MonthlyVivid, MonthlyVividListItem } from "@/types/monthly-vivid";
import { API_ENDPOINTS } from "@/constants";
import {
  encryptMonthlyVivid,
  decryptMonthlyVivid,
  decryptJsonbFields,
} from "@/lib/jsonb-encryption";

/**
 * Monthly Vivid 리스트 조회 (가벼운 데이터만)
 */
export async function fetchMonthlyVividList(
  supabase: SupabaseClient,
  userId: string
): Promise<MonthlyVividListItem[]> {
  // title 컬럼이 없을 수 있으므로 먼저 기본 필드만 조회
  const { data, error } = await supabase
    .from(API_ENDPOINTS.MONTHLY_VIVID)
    .select(
      "id, month, month_label, date_range, recorded_days, is_ai_generated, created_at"
    )
    .eq("user_id", userId)
    .order("month", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch monthly vivid list: ${error.message}`);
  }

  // title 컬럼이 있는지 확인하고, 있으면 별도로 조회
  const rows = data || [];
  const titleMap = new Map<string, string | null>();

  if (rows.length > 0) {
    try {
      // title 컬럼 존재 여부 확인을 위해 첫 번째 행으로 테스트
      const testQuery = await supabase
        .from(API_ENDPOINTS.MONTHLY_VIVID)
        .select("id, title")
        .eq("id", rows[0].id)
        .single();

      // title 컬럼이 존재하는 경우 모든 행의 title 조회
      if (!testQuery.error && testQuery.data?.title !== undefined) {
        const ids = rows.map((row) => row.id);
        const { data: titleData } = await supabase
          .from(API_ENDPOINTS.MONTHLY_VIVID)
          .select("id, title")
          .eq("user_id", userId)
          .in("id", ids);

        if (titleData) {
          titleData.forEach((item) => {
            if (item.title) {
              const decryptedTitle = decryptJsonbFields(item.title) as string | null;
              titleMap.set(String(item.id), decryptedTitle);
            }
          });
        }
      }
    } catch {
      // title 컬럼이 없는 경우 무시하고 계속 진행
    }
  }

  return rows.map((row) => {
    const decryptedTitle = titleMap.get(String(row.id));
    const title = decryptedTitle || row.month_label || "";
    const monthlyScore = 0; // report에서 계산 가능하지만 리스트에서는 0으로 설정
    const dateRange = row.date_range as {
      start_date: string;
      end_date: string;
    } | null;

    return {
      id: String(row.id),
      month: row.month,
      month_label: row.month_label || "",
      date_range: dateRange || {
        start_date: "",
        end_date: "",
      },
      recorded_days: row.recorded_days || 0,
      title,
      monthly_score: monthlyScore,
      is_ai_generated: row.is_ai_generated ?? undefined,
      created_at: row.created_at ?? undefined,
    };
  });
}

/**
 * Monthly Vivid 상세 조회 (month 기반)
 */
export async function fetchMonthlyVividByMonth(
  supabase: SupabaseClient,
  userId: string,
  month: string // "YYYY-MM"
): Promise<MonthlyVivid | null> {
  const { data, error } = await supabase
    .from(API_ENDPOINTS.MONTHLY_VIVID)
    .select("*")
    .eq("user_id", userId)
    .eq("month", month)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch monthly vivid: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  // 각 JSONB 컬럼에서 데이터를 읽어서 MonthlyVivid 타입으로 변환
  // trend는 user_trends로 마이그레이션됨 - monthly_vivid에는 없음
  const rawFeedback = {
    id: String(data.id),
    month: data.month,
    month_label: data.month_label,
    date_range: data.date_range as MonthlyVivid["date_range"],
    total_days: data.total_days,
    recorded_days: data.recorded_days,
    title: (data.title as string | undefined) || data.month_label || "",
    report: data.report as MonthlyVivid["report"],
    is_ai_generated: data.is_ai_generated ?? undefined,
    created_at: data.created_at ?? undefined,
  };

  // 복호화 처리
  return decryptMonthlyVivid(
    rawFeedback as unknown as { [key: string]: unknown }
  ) as unknown as MonthlyVivid;
}

/**
 * Monthly Vivid 상세 조회 (id 기반)
 */
export async function fetchMonthlyVividDetail(
  supabase: SupabaseClient,
  userId: string,
  id: string
): Promise<MonthlyVivid | null> {
  const { data, error } = await supabase
    .from(API_ENDPOINTS.MONTHLY_VIVID)
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch monthly vivid: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  // 각 JSONB 컬럼에서 데이터를 읽어서 MonthlyVivid 타입으로 변환
  // trend는 user_trends로 마이그레이션됨 - monthly_vivid에는 없음
  const rawFeedback = {
    id: String(data.id),
    month: data.month,
    month_label: data.month_label,
    date_range: data.date_range as MonthlyVivid["date_range"],
    total_days: data.total_days,
    recorded_days: data.recorded_days,
    title: (data.title as string | undefined) || data.month_label || "",
    report: data.report as MonthlyVivid["report"],
    is_ai_generated: data.is_ai_generated ?? undefined,
    created_at: data.created_at ?? undefined,
  };

  // 복호화 처리
  return decryptMonthlyVivid(
    rawFeedback as unknown as { [key: string]: unknown }
  ) as unknown as MonthlyVivid;
}

/**
 * Monthly Vivid 저장
 * trend는 user_trends에 저장 (monthly_vivid에는 trend 컬럼 없음)
 */
export async function saveMonthlyVivid(
  supabase: SupabaseClient,
  userId: string,
  feedback: MonthlyVivid,
  generationDurationSeconds?: number
): Promise<string> {
  const encryptedFeedback = encryptMonthlyVivid(feedback);

  const { data, error } = await supabase
    .from(API_ENDPOINTS.MONTHLY_VIVID)
    .upsert(
      {
        user_id: userId,
        month: encryptedFeedback.month,
        month_label: encryptedFeedback.month_label,
        date_range: encryptedFeedback.date_range,
        total_days: encryptedFeedback.total_days,
        recorded_days: encryptedFeedback.recorded_days,
        title: encryptedFeedback.title,
        report: encryptedFeedback.report,
        is_ai_generated: encryptedFeedback.is_ai_generated ?? true,
        generation_duration_seconds: generationDurationSeconds ?? null,
      },
      { onConflict: "user_id,month" }
    )
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to save monthly vivid: ${error.message}`);
  }

  if (!data || !data.id) {
    throw new Error("Failed to save monthly vivid: no ID returned");
  }

  // trend는 user-trends cron에서만 생성/저장됨

  return String(data.id);
}
