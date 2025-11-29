import type { DailyReportData } from "./types";
import type { DailyFeedbackRow } from "@/types/daily-feedback";

/**
 * jsonb 구조의 DailyFeedbackRow를 평면 구조의 DailyReportData로 변환
 * (프론트엔드 컴포넌트는 평면 구조를 사용)
 */
export function mapDailyFeedbackRowToReport(
  row: DailyFeedbackRow
): DailyReportData {
  // 기본값 설정 헬퍼 함수
  // 숫자로 변환하는 헬퍼 함수 (복호화 과정에서 문자열로 변환될 수 있음)
  const toNumber = (value: unknown): number | null => {
    if (value === null || value === undefined) return null;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const num = Number(value);
      return isNaN(num) ? null : num;
    }
    return null;
  };

  const getEmotionOverview = () => {
    if (!row.emotion_overview) {
      return {
        emotion_curve: [],
        ai_mood_valence: null,
        ai_mood_arousal: null,
        dominant_emotion: null,
        emotion_quadrant: null,
        emotion_quadrant_explanation: null,
        emotion_timeline: [],
      };
    }
    return {
      emotion_curve: row.emotion_overview.emotion_curve ?? [],
      ai_mood_valence: toNumber(row.emotion_overview.ai_mood_valence),
      ai_mood_arousal: toNumber(row.emotion_overview.ai_mood_arousal),
      dominant_emotion: row.emotion_overview.dominant_emotion ?? null,
      emotion_quadrant: row.emotion_overview.emotion_quadrant ?? null,
      emotion_quadrant_explanation:
        row.emotion_overview.emotion_quadrant_explanation ?? null,
      emotion_timeline: row.emotion_overview.emotion_timeline ?? [],
    };
  };

  const getNarrativeOverview = () => {
    if (!row.narrative_overview) {
      return {
        narrative_summary: "",
        narrative: "",
        lesson: "",
        keywords: [],
        integrity_score: 0,
      };
    }
    return {
      narrative_summary: row.narrative_overview.narrative_summary ?? "",
      narrative: row.narrative_overview.narrative ?? "",
      lesson: row.narrative_overview.lesson ?? "",
      keywords: row.narrative_overview.keywords ?? [],
      integrity_score: toNumber(row.narrative_overview.integrity_score) ?? 0,
    };
  };

  const getInsightOverview = () => {
    if (!row.insight_overview) {
      return {
        core_insight: "",
        learning_source: "",
        meta_question: "",
        insight_ai_comment: "",
      };
    }
    return {
      core_insight: row.insight_overview.core_insight ?? "",
      learning_source: row.insight_overview.learning_source ?? "",
      meta_question: row.insight_overview.meta_question ?? "",
      insight_ai_comment: row.insight_overview.insight_ai_comment ?? "",
    };
  };

  const getVisionOverview = () => {
    if (!row.vision_overview) {
      return {
        vision_summary: "",
        vision_self: "",
        vision_keywords: [],
        reminder_sentence: "",
        vision_ai_feedback: "",
      };
    }
    return {
      vision_summary: row.vision_overview.vision_summary ?? "",
      vision_self: row.vision_overview.vision_self ?? "",
      vision_keywords: row.vision_overview.vision_keywords ?? [],
      reminder_sentence: row.vision_overview.reminder_sentence ?? "",
      vision_ai_feedback: row.vision_overview.vision_ai_feedback ?? "",
    };
  };

  const getFeedbackOverview = () => {
    if (!row.feedback_overview) {
      return {
        core_feedback: "",
        positives: [],
        improvements: [],
        feedback_ai_comment: "",
        ai_message: "",
      };
    }
    return {
      core_feedback: row.feedback_overview.core_feedback ?? "",
      positives: row.feedback_overview.positives ?? [],
      improvements: row.feedback_overview.improvements ?? [],
      feedback_ai_comment: row.feedback_overview.feedback_ai_comment ?? "",
      ai_message: row.feedback_overview.ai_message ?? "",
    };
  };

  const getMetaOverview = () => {
    if (!row.meta_overview) {
      return {
        growth_point: "",
        adjustment_point: "",
        tomorrow_focus: "",
        integrity_reason: "",
      };
    }
    return {
      growth_point: row.meta_overview.growth_point ?? "",
      adjustment_point: row.meta_overview.adjustment_point ?? "",
      tomorrow_focus: row.meta_overview.tomorrow_focus ?? "",
      integrity_reason: row.meta_overview.integrity_reason ?? "",
    };
  };

  const emotion = getEmotionOverview();
  const narrative = getNarrativeOverview();
  const insight = getInsightOverview();
  const vision = getVisionOverview();
  const feedback = getFeedbackOverview();
  const meta = getMetaOverview();

  return {
    date: row.report_date,
    dayOfWeek: row.day_of_week ?? "",
    integrity_score: narrative.integrity_score ?? 0,

    // Emotion Overview
    emotion_curve: emotion.emotion_curve,
    ai_mood_valence: emotion.ai_mood_valence,
    ai_mood_arousal: emotion.ai_mood_arousal,
    dominant_emotion: emotion.dominant_emotion,
    emotion_quadrant: emotion.emotion_quadrant,
    emotion_quadrant_explanation: emotion.emotion_quadrant_explanation,
    emotion_timeline: emotion.emotion_timeline,

    // Narrative Overview
    narrative_summary: narrative.narrative_summary,
    narrative: narrative.narrative,
    lesson: narrative.lesson,
    keywords: narrative.keywords,

    // Vision Overview
    vision_summary: vision.vision_summary,
    vision_self: vision.vision_self,
    vision_keywords: vision.vision_keywords,
    reminder_sentence: vision.reminder_sentence,
    vision_ai_feedback: vision.vision_ai_feedback,

    // Insight Overview
    core_insight: insight.core_insight,
    learning_source: insight.learning_source,
    meta_question: insight.meta_question,
    insight_ai_comment: insight.insight_ai_comment,

    // Feedback Overview
    core_feedback: feedback.core_feedback,
    positives: feedback.positives,
    improvements: feedback.improvements,
    feedback_ai_comment: feedback.feedback_ai_comment,
    ai_message: feedback.ai_message,

    // Meta Overview
    growth_point: meta.growth_point,
    adjustment_point: meta.adjustment_point,
    tomorrow_focus: meta.tomorrow_focus,
    integrity_reason: meta.integrity_reason,
  };
}
