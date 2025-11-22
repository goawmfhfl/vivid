import type { SupabaseClient } from "@supabase/supabase-js";
import type { DailyReport, Record } from "./types";

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

  return records as Record[];
}

export async function saveDailyReport(
  supabase: SupabaseClient,
  userId: string,
  report: DailyReport
): Promise<void> {
  const { data: insertedData, error: insertError } = await supabase
    .from("daily_feedback")
    .upsert(
      {
        user_id: userId,
        report_date: report.date,
        day_of_week: report.day_of_week ?? null,
        integrity_score: report.integrity_score ?? null,

        emotion_overview: report.emotion_overview,
        narrative_overview: report.narrative_overview,
        insight_overview: report.insight_overview,
        vision_overview: report.vision_overview,
        feedback_overview: report.feedback_overview,
        meta_overview: report.meta_overview,

        is_ai_generated: true,
      },
      { onConflict: "user_id,report_date" }
    )
    .select();

  if (insertError) {
    throw new Error(
      `Failed to save feedback to database: ${insertError.message}`
    );
  }

  if (!insertedData || insertedData.length === 0) {
    throw new Error("Failed to save feedback to database");
  }
}
