import type { DailyReportData } from "./types";
import type {
  DailyFeedbackRow,
  EmotionReport,
  VividReport,
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
  const emotionEvents = emotionReport?.emotion_events ?? null;

  // Vivid Report에서 데이터 추출 (새로운 구조)
  const vividReport: VividReport | null = row.vivid_report;
  // 오늘의 VIVID (현재 모습)
  const currentSummary = vividReport?.current_summary ?? "";
  const currentEvaluation = vividReport?.current_evaluation ?? "";
  const currentKeywords = vividReport?.current_keywords ?? [];
  // 앞으로의 나의 모습 (미래 비전)
  const futureSummary = vividReport?.future_summary ?? "";
  const futureEvaluation = vividReport?.future_evaluation ?? "";
  const futureKeywords = vividReport?.future_keywords ?? [];
  // 일치도 분석
  const alignmentScore = vividReport?.alignment_score ?? null;
  // 사용자 특성 분석
  const userCharacteristics = vividReport?.user_characteristics ?? [];
  const aspiredTraits = vividReport?.aspired_traits ?? [];
  
  // 하위 호환성을 위한 레거시 필드 매핑
  const visionSummary = currentSummary || futureSummary || "";
  const visionSelf = currentEvaluation || "";
  const visionKeywords = [...currentKeywords, ...futureKeywords];
  const visionAiFeedback: string[] = [];
  const dreamGoals = null;
  const dreamerTraits = null;

  // narrative_summary는 vivid_report의 current_summary를 사용
  const narrativeSummary = currentSummary || futureSummary;

  return {
    date: row.report_date,
    dayOfWeek: row.day_of_week ?? "",
    narrative_summary: narrativeSummary,

    // Emotion Report 데이터
    emotion_curve: emotionCurve,
    ai_mood_valence: aiMoodValence,
    ai_mood_arousal: aiMoodArousal,
    dominant_emotion: dominantEmotion,
    emotion_quadrant: emotionQuadrant,
    emotion_quadrant_explanation: emotionQuadrantExplanation,
    emotion_timeline: emotionTimeline,
    emotion_events: emotionEvents,

    // Vivid Report 데이터
    current_summary: currentSummary,
    current_evaluation: currentEvaluation,
    current_keywords: currentKeywords,
    future_summary: futureSummary,
    future_evaluation: futureEvaluation,
    future_keywords: futureKeywords,
    alignment_score: alignmentScore,
    user_characteristics: userCharacteristics,
    aspired_traits: aspiredTraits,
    
    // 하위 호환성을 위한 레거시 필드
    vision_summary: visionSummary,
    vision_self: visionSelf,
    vision_keywords: visionKeywords,
    vision_ai_feedback: visionAiFeedback,
    dream_goals: dreamGoals,
    dreamer_traits: dreamerTraits,
  };
}
