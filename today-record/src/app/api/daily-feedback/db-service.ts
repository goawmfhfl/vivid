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

/**
 * Daily Report를 데이터베이스에 저장
 */
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
        narrative_summary: report.narrative_summary ?? null,
        emotion_curve: report.emotion_curve ?? [],

        narrative: report.narrative ?? null,
        lesson: report.lesson ?? null,
        keywords: report.keywords ?? [],
        daily_ai_comment: report.daily_ai_comment ?? null,

        vision_summary: report.vision_summary ?? null,
        vision_self: report.vision_self ?? null,
        vision_keywords: report.vision_keywords ?? [],
        reminder_sentence: report.reminder_sentence ?? null,
        vision_ai_feedback: report.vision_ai_feedback ?? null,

        core_insight: report.core_insight ?? null,
        learning_source: report.learning_source ?? null,
        meta_question: report.meta_question ?? null,
        insight_ai_comment: report.insight_ai_comment ?? null,

        core_feedback: report.core_feedback ?? null,
        positives: report.positives ?? [],
        improvements: report.improvements ?? [],
        feedback_ai_comment: report.feedback_ai_comment ?? null,

        ai_message: report.ai_message ?? null,
        growth_point: report.growth_point ?? null,
        adjustment_point: report.adjustment_point ?? null,
        tomorrow_focus: report.tomorrow_focus ?? null,
        integrity_reason: report.integrity_reason ?? null,
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
