import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  MonthlyFeedbackNew,
} from "@/types/monthly-feedback-new";
import type {
  MonthlyFeedbackListItem,
} from "@/types/monthly-feedback";
import { API_ENDPOINTS } from "@/constants";
import {
  encryptMonthlyFeedback,
  decryptMonthlyFeedback,
  decryptJsonbFields,
} from "@/lib/jsonb-encryption";

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
      "id, month, month_label, date_range, recorded_days, title, is_ai_generated, created_at"
    )
    .eq("user_id", userId)
    .order("month", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch monthly feedback list: ${error.message}`);
  }

  return (data || []).map((row) => {
    // title 복호화
    const decryptedTitle = decryptJsonbFields(row.title) as string | null;

    const title = decryptedTitle || row.month_label || "";
    const monthlyScore = 0; // vivid_report에서 계산 가능하지만 리스트에서는 0으로 설정
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
 * Monthly Feedback 상세 조회 (month 기반)
 */
export async function fetchMonthlyFeedbackByMonth(
  supabase: SupabaseClient,
  userId: string,
  month: string // "YYYY-MM"
): Promise<MonthlyFeedbackNew | null> {
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

  // 각 JSONB 컬럼에서 데이터를 읽어서 MonthlyFeedbackNew 타입으로 변환
  const rawFeedback = {
    id: String(data.id),
    month: data.month,
    month_label: data.month_label,
    date_range: data.date_range as MonthlyFeedbackNew["date_range"],
    total_days: data.total_days,
    recorded_days: data.recorded_days,
    title: data.title as string,
    vivid_report: data.vivid_report as MonthlyFeedbackNew["vivid_report"],
    is_ai_generated: data.is_ai_generated ?? undefined,
    created_at: data.created_at ?? undefined,
  };

  // 복호화 처리
  return decryptMonthlyFeedback(
    rawFeedback as unknown as { [key: string]: unknown }
  ) as unknown as MonthlyFeedbackNew;
}

/**
 * Monthly Feedback 상세 조회 (id 기반)
 */
export async function fetchMonthlyFeedbackDetail(
  supabase: SupabaseClient,
  userId: string,
  id: string
): Promise<MonthlyFeedbackNew | null> {
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

  // 각 JSONB 컬럼에서 데이터를 읽어서 MonthlyFeedbackNew 타입으로 변환
  const rawFeedback = {
    id: String(data.id),
    month: data.month,
    month_label: data.month_label,
    date_range: data.date_range as MonthlyFeedbackNew["date_range"],
    total_days: data.total_days,
    recorded_days: data.recorded_days,
    title: data.title as string,
    vivid_report: data.vivid_report as MonthlyFeedbackNew["vivid_report"],
    is_ai_generated: data.is_ai_generated ?? undefined,
    created_at: data.created_at ?? undefined,
  };

  // 복호화 처리
  return decryptMonthlyFeedback(
    rawFeedback as unknown as { [key: string]: unknown }
  ) as unknown as MonthlyFeedbackNew;
}

/**
 * Monthly Feedback 저장
 */
export async function saveMonthlyFeedback(
  supabase: SupabaseClient,
  userId: string,
  feedback: MonthlyFeedbackNew
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
        title: encryptedFeedback.title,
        vivid_report: encryptedFeedback.vivid_report,
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
