import type { SupabaseClient } from "@supabase/supabase-js";
import type { DailyReportResponse, Record } from "./types";
import type { DailyVividRow } from "@/types/daily-vivid";
import { decrypt } from "@/lib/encryption";
import {
  encryptDailyVivid,
  decryptDailyVivid,
} from "@/lib/jsonb-encryption";

/**
 * 특정 날짜의 기록 조회
 */
export async function fetchRecordsByDate(
  supabase: SupabaseClient,
  userId: string,
  date: string
): Promise<Record[]> {
  const { data: records, error } = await supabase
    .from("vivid_records")
    .select("*")
    .eq("user_id", userId)
    .eq("kst_date", date);

  if (error) {
    throw new Error(`Failed to fetch records: ${error.message}`);
  }

  if (!records || records.length === 0) {
    throw new Error("No records found for this date");
  }

  // 복호화 처리
  return records.map((record) => ({
    ...record,
    content: decrypt(record.content),
  })) as Record[];
}

export type DailyReportGenerationType = "vivid" | "review";

export async function saveDailyReport(
  supabase: SupabaseClient,
  userId: string,
  report: DailyReportResponse,
  generationDurationSeconds?: number,
  generationType: DailyReportGenerationType = "vivid"
): Promise<DailyVividRow> {
  const isVivid = generationType === "vivid";

  // 해당 (user_id, report_date)에서 현재 generationType에 해당하는 행 조회
  const { data: existingRows, error: checkError } = await supabase
    .from("daily_vivid")
    .select("id")
    .eq("user_id", userId)
    .eq("report_date", report.date)
    .eq(isVivid ? "is_vivid_ai_generated" : "is_review_ai_generated", true)
    .limit(1);

  if (checkError) {
    throw new Error(`Failed to check existing feedback: ${checkError.message}`);
  }

  const existingData = existingRows?.[0] ?? null;

  const newReportDataToEncrypt: { [key: string]: unknown } = {
    report: report.report,
    trend: null,
  };

  const encryptedNewReports = encryptDailyVivid(newReportDataToEncrypt);

  const reportData = {
    user_id: userId,
    report_date: report.date,
    day_of_week: report.day_of_week ?? null,
    report: encryptedNewReports.report || null,
    trend: null,
    is_vivid_ai_generated: isVivid,
    is_review_ai_generated: !isVivid,
    generation_duration_seconds: generationDurationSeconds ?? null,
  };

  let result;
  if (existingData) {
    const { data: updatedData, error: updateError } = await supabase
      .from("daily_vivid")
      .update(reportData)
      .eq("id", existingData.id)
      .select();

    if (updateError) {
      throw new Error(
        `Failed to update feedback to database: ${updateError.message}`
      );
    }

    if (!updatedData || updatedData.length === 0) {
      throw new Error("Failed to update feedback to database");
    }

    result = updatedData;
  } else {
    const { data: insertedData, error: insertError } = await supabase
      .from("daily_vivid")
      .insert(reportData)
      .select();

    if (insertError) {
      throw new Error(
        `Failed to save feedback to database: ${insertError.message}`
      );
    }

    if (!insertedData || insertedData.length === 0) {
      throw new Error("Failed to save feedback to database");
    }

    result = insertedData;
  }

  // 저장된 레코드 반환
  if (!result || result.length === 0) {
    throw new Error("Failed to save feedback to database");
  }

  // 복호화하여 반환
  const savedRow = result[0] as DailyVividRow;
  const decrypted = decryptDailyVivid(
    savedRow as unknown as { [key: string]: unknown }
  );
  return decrypted as unknown as DailyVividRow;
}
