import type { DailyReportData } from "./types";
import type {
  DailyFeedbackRow,
  SummaryReport,
  DailyReport,
  EmotionReport,
  DreamReport,
  InsightReport,
  FeedbackReport,
  FinalReport,
} from "@/types/daily-feedback";

/**
 * jsonb 구조의 DailyFeedbackRow를 평면 구조의 DailyReportData로 변환
 * 새로운 리포트 구조(summary_report, daily_report 등)를 사용
 */
export function mapDailyFeedbackRowToReport(
  row: DailyFeedbackRow
): DailyReportData {
  // 숫자로 변환하는 헬퍼 함수
  const toNumber = (value: unknown): number | null => {
    if (value === null || value === undefined) return null;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const num = Number(value);
      return isNaN(num) ? null : num;
    }
    return null;
  };

  // Summary Report에서 데이터 추출
  const summaryReport: SummaryReport | null = row.summary_report;
  const summarySummary = summaryReport?.summary ?? "";
  const summaryKeyPoints = summaryReport?.key_points ?? [];
  const overallScore = toNumber(summaryReport?.overall_score) ?? 0;
  const detailedAnalysis = summaryReport?.detailed_analysis ?? null;
  const trendAnalysis = summaryReport?.trend_analysis ?? null;

  // Daily Report에서 데이터 추출
  const dailyReport: DailyReport | null = row.daily_report;
  const dailySummary = dailyReport?.summary ?? "";
  const dailyEvents = dailyReport?.daily_events ?? [];
  const dailyKeywords = dailyReport?.keywords ?? [];
  const dailyLesson = dailyReport?.lesson ?? null;
  const dailyAiComment = dailyReport?.ai_comment ?? null;
  const emotionTriggers = dailyReport?.emotion_triggers ?? null;
  const behavioralClues = dailyReport?.behavioral_clues ?? null;

  // Emotion Report에서 데이터 추출
  const emotionReport: EmotionReport | null = row.emotion_report;
  const emotionCurve = emotionReport?.emotion_curve ?? [];
  const aiMoodValence = toNumber(emotionReport?.ai_mood_valence);
  const aiMoodArousal = toNumber(emotionReport?.ai_mood_arousal);
  const dominantEmotion = emotionReport?.dominant_emotion ?? null;
  const emotionQuadrant = emotionReport?.emotion_quadrant ?? null;
  const emotionQuadrantExplanation =
    emotionReport?.emotion_quadrant_explanation ?? null;
  const emotionTimeline = emotionReport?.emotion_timeline ?? [];

  // Dream Report에서 데이터 추출
  const dreamReport: DreamReport | null = row.dream_report;
  const visionSummary = dreamReport?.summary ?? "";
  const visionSelf = dreamReport?.vision_self ?? "";
  const visionKeywords = dreamReport?.vision_keywords ?? [];
  const reminderSentence = dreamReport?.reminder_sentence ?? null;
  const visionAiFeedback = dreamReport?.vision_ai_feedback ?? null;
  const dreamGoals = dreamReport?.dream_goals ?? null;
  const dreamerTraits = dreamReport?.dreamer_traits ?? null;

  // Insight Report에서 데이터 추출
  const insightReport: InsightReport | null = row.insight_report;
  const coreInsights = insightReport?.core_insights ?? [];
  const metaQuestion = insightReport?.meta_question ?? null;
  const insightAiComment = insightReport?.insight_ai_comment ?? null;
  const insightNextActions = insightReport?.insight_next_actions ?? null;

  // Feedback Report에서 데이터 추출
  const feedbackReport: FeedbackReport | null = row.feedback_report;
  const coreFeedback = feedbackReport?.core_feedback ?? "";
  const positives = feedbackReport?.positives ?? [];
  const improvements = feedbackReport?.improvements ?? [];
  const feedbackAiComment = feedbackReport?.feedback_ai_comment ?? null;
  const aiMessage = feedbackReport?.ai_message ?? null;

  // Final Report에서 데이터 추출
  const finalReport: FinalReport | null = row.final_report;
  const closingMessage = finalReport?.closing_message ?? "";
  const tomorrowFocus = finalReport?.tomorrow_focus ?? null;
  const growthPoint = finalReport?.growth_point ?? null;
  const adjustmentPoint = finalReport?.adjustment_point ?? null;

  // narrative_summary는 summary_report의 summary를 사용
  // integrity_score는 summary_report의 overall_score를 사용
  const narrativeSummary = summarySummary;
  const integrityScore = overallScore;
  const integrityReason = ""; // Final Report에 없으므로 빈 문자열

  return {
    date: row.report_date,
    dayOfWeek: row.day_of_week ?? "",
    integrity_score: integrityScore,
    narrative_summary: narrativeSummary,

    // Summary Report 데이터
    summary_key_points: summaryKeyPoints,
    overall_score: overallScore,
    detailed_analysis: detailedAnalysis,
    trend_analysis: trendAnalysis,

    // Daily Report 데이터
    daily_summary: dailySummary,
    daily_events: dailyEvents,
    keywords: dailyKeywords,
    lesson: dailyLesson,
    ai_comment: dailyAiComment,
    emotion_triggers: emotionTriggers,
    behavioral_clues: behavioralClues,

    // Emotion Report 데이터
    emotion_curve: emotionCurve,
    ai_mood_valence: aiMoodValence,
    ai_mood_arousal: aiMoodArousal,
    dominant_emotion: dominantEmotion,
    emotion_quadrant: emotionQuadrant,
    emotion_quadrant_explanation: emotionQuadrantExplanation,
    emotion_timeline: emotionTimeline,

    // Dream Report 데이터
    vision_summary: visionSummary,
    vision_self: visionSelf,
    vision_keywords: visionKeywords,
    reminder_sentence: reminderSentence,
    vision_ai_feedback: visionAiFeedback,
    dream_goals: dreamGoals,
    dreamer_traits: dreamerTraits,

    // Insight Report 데이터
    core_insights: coreInsights,
    meta_question: metaQuestion,
    insight_ai_comment: insightAiComment,
    insight_next_actions: insightNextActions,

    // Feedback Report 데이터
    core_feedback: coreFeedback,
    positives: positives,
    improvements: improvements,
    feedback_ai_comment: feedbackAiComment,
    ai_message: aiMessage,

    // Final Report 데이터
    closing_message: closingMessage,
    tomorrow_focus: tomorrowFocus,
    growth_point: growthPoint,
    adjustment_point: adjustmentPoint,
    integrity_reason: integrityReason,
  };
}
