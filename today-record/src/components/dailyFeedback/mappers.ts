import type { DailyReportData } from "./types";
import type { DailyFeedbackRow } from "@/types/daily-feedback";

export function mapDailyFeedbackRowToReport(
  row: DailyFeedbackRow
): DailyReportData {
  return {
    date: row.report_date,
    dayOfWeek: row.day_of_week ?? "",
    integrity_score: row.integrity_score ?? 0,
    narrative_summary: row.narrative_summary ?? "",
    emotion_curve: row.emotion_curve ?? [],
    narrative: row.narrative ?? "",
    lesson: row.lesson ?? "",
    keywords: row.keywords ?? [],
    daily_ai_comment: row.daily_ai_comment ?? "",
    vision_summary: row.vision_summary ?? "",
    vision_self: row.vision_self ?? "",
    vision_keywords: row.vision_keywords ?? [],
    reminder_sentence: row.reminder_sentence ?? "",
    vision_ai_feedback: row.vision_ai_feedback ?? "",
    core_insight: row.core_insight ?? "",
    learning_source: row.learning_source ?? "",
    meta_question: row.meta_question ?? "",
    insight_ai_comment: row.insight_ai_comment ?? "",
    core_feedback: row.core_feedback ?? "",
    positives: row.positives ?? [],
    improvements: row.improvements ?? [],
    feedback_ai_comment: row.feedback_ai_comment ?? "",
    ai_message: row.ai_message ?? "",
    growth_point: row.growth_point ?? "",
    adjustment_point: row.adjustment_point ?? "",
    tomorrow_focus: row.tomorrow_focus ?? "",
    integrity_reason: row.integrity_reason ?? "",
  };
}
