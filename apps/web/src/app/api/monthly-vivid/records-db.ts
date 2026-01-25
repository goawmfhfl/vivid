import type { SupabaseClient } from "@supabase/supabase-js";
import { decrypt } from "@/lib/encryption";
import type { Record } from "../daily-vivid/types";

/**
 * 날짜 범위로 vivid-records 조회 (월간 비비드 생성용)
 * 해당 월의 모든 VIVID 기록을 가져옴
 */
export async function fetchRecordsByDateRange(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<Record[]> {
  const { data: records, error } = await supabase
    .from("vivid_records")
    .select("*")
    .eq("user_id", userId)
    .in("type", ["vivid", "dream"]) // VIVID 타입만 조회
    .gte("kst_date", startDate)
    .lte("kst_date", endDate)
    .order("kst_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch vivid-records: ${error.message}`);
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
