import type { SupabaseClient } from "@supabase/supabase-js";
import type { DailyReportResponse, Record } from "./types";
import type { DailyFeedbackRow } from "@/types/daily-feedback";
import { decrypt } from "@/lib/encryption";
import {
  encryptDailyFeedback,
  decryptDailyFeedback,
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
    .from("records")
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

export async function saveDailyReport(
  supabase: SupabaseClient,
  userId: string,
  report: DailyReportResponse
): Promise<DailyFeedbackRow> {
  // 먼저 기존 레코드가 있는지 확인
  const { data: existingData, error: checkError } = await supabase
    .from("daily_feedback")
    .select("id")
    .eq("user_id", userId)
    .eq("report_date", report.date)
    .maybeSingle();

  if (checkError) {
    throw new Error(`Failed to check existing feedback: ${checkError.message}`);
  }

  // 새로운 타입별 리포트 데이터 준비 (암호화)
  const newReportDataToEncrypt: { [key: string]: unknown } = {
    summary_report: report.summary_report,
    daily_report: report.daily_report,
    emotion_report: report.emotion_report,
    dream_report: report.dream_report,
    insight_report: report.insight_report,
    feedback_report: report.feedback_report,
    final_report: report.final_report,
  };

  // 암호화 적용 (기존 encryptDailyFeedback 함수 재사용)
  const encryptedNewReports = encryptDailyFeedback(newReportDataToEncrypt);

  const reportData = {
    user_id: userId,
    report_date: report.date,
    day_of_week: report.day_of_week ?? null,
    // 새로운 타입별 리포트 필드
    summary_report: encryptedNewReports.summary_report || null,
    daily_report: encryptedNewReports.daily_report || null,
    emotion_report: encryptedNewReports.emotion_report || null,
    dream_report: encryptedNewReports.dream_report || null,
    insight_report: encryptedNewReports.insight_report || null,
    feedback_report: encryptedNewReports.feedback_report || null,
    final_report: encryptedNewReports.final_report || null,
    is_ai_generated: true,
  };

  let result;
  if (existingData) {
    // 기존 레코드가 있으면 업데이트
    const { data: updatedData, error: updateError } = await supabase
      .from("daily_feedback")
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
    // 기존 레코드가 없으면 삽입
    const { data: insertedData, error: insertError } = await supabase
      .from("daily_feedback")
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
  const savedRow = result[0] as DailyFeedbackRow;
  const decrypted = decryptDailyFeedback(
    savedRow as unknown as { [key: string]: unknown }
  );
  return decrypted as unknown as DailyFeedbackRow;
}
