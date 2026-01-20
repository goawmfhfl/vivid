import type { SupabaseClient } from "@supabase/supabase-js";
import type { DailyVividRow } from "@/types/daily-vivid";
import type { DailyVividForMonthly } from "./types";
import { API_ENDPOINTS } from "@/constants";
import { decryptDailyVivid } from "@/lib/jsonb-encryption";

/**
 * DailyVividRow에서 월간 비비드 생성에 필요한 필드만 추출
 */
function extractMonthlyVividFields(
  feedback: DailyVividRow
): DailyVividForMonthly {
  return {
    report_date: feedback.report_date,
    day_of_week: feedback.day_of_week,
    report: feedback.report,
  };
}

/**
 * 날짜 범위로 daily-vivid 조회 (월간용, 필요한 리포트 필드만 포함)
 */
export async function fetchDailyVividByMonth(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailyVividForMonthly[]> {
  const { data, error } = await supabase
    .from(API_ENDPOINTS.DAILY_VIVID)
    .select("*")
    .eq("user_id", userId)
    .gte("report_date", startDate)
    .lte("report_date", endDate)
    .order("report_date", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch daily vivid: ${error.message}`);
  }

  // 복호화 처리
  const decryptedFeedbacks = (data || []).map(
    (item) =>
      decryptDailyVivid(
        item as unknown as { [key: string]: unknown }
      ) as unknown as DailyVividRow
  );

  // 월간 비비드 생성에 필요한 필드만 추출
  return decryptedFeedbacks.map(extractMonthlyVividFields);
}
