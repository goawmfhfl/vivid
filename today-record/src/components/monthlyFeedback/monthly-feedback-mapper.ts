import type { MonthlyFeedback } from "@/types/monthly-feedback";
import type { MonthlyReportData } from "./report/types";

/**
 * 날짜 포맷 변환 (YYYY-MM-DD -> YYYY.MM.DD)
 */
function formatDateForDisplay(date: string): string {
  return date.replace(/-/g, ".");
}

/**
 * 숫자로 변환하는 헬퍼 함수 (복호화 과정에서 문자열로 변환될 수 있음)
 */
function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

/**
 * null/undefined를 유지하면서 숫자로 변환하는 헬퍼 함수
 */
function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const num = Number(value);
    return isNaN(num) ? null : num;
  }
  return null;
}

/**
 * MonthlyFeedback을 MonthlyReportData로 변환
 */
export function mapMonthlyFeedbackToReportData(
  feedback: MonthlyFeedback
): MonthlyReportData {
  // summary_overview 숫자 필드 변환
  const summaryOverview = {
    ...feedback.summary_overview,
    monthly_score: toNumber(feedback.summary_overview.monthly_score),
    record_coverage_rate: toNumber(
      feedback.summary_overview.record_coverage_rate
    ),
    integrity_average: toNumber(feedback.summary_overview.integrity_average),
    life_balance_score: toNumber(feedback.summary_overview.life_balance_score),
    execution_score: toNumber(feedback.summary_overview.execution_score),
    rest_score: toNumber(feedback.summary_overview.rest_score),
    relationship_score: toNumber(feedback.summary_overview.relationship_score),
  };

  // emotion_overview 숫자 필드 변환
  const emotionOverview = {
    ...feedback.emotion_overview,
    monthly_ai_mood_valence_avg: toNumberOrNull(
      feedback.emotion_overview.monthly_ai_mood_valence_avg
    ),
    monthly_ai_mood_arousal_avg: toNumberOrNull(
      feedback.emotion_overview.monthly_ai_mood_arousal_avg
    ),
    emotion_stability_score: toNumber(
      feedback.emotion_overview.emotion_stability_score
    ),
    emotion_quadrant_distribution:
      feedback.emotion_overview.emotion_quadrant_distribution.map((item) => ({
        ...item,
        count: toNumber(item.count),
        ratio: toNumber(item.ratio),
      })),
  };

  // insight_overview 숫자 필드 변환
  const insightOverview = {
    ...feedback.insight_overview,
    insight_days_count: toNumber(feedback.insight_overview.insight_days_count),
    insight_records_count: toNumber(
      feedback.insight_overview.insight_records_count
    ),
    top_insights: feedback.insight_overview.top_insights.map((item) => ({
      ...item,
      frequency: toNumber(item.frequency),
    })),
  };

  return {
    // 기본 정보
    month: feedback.month,
    month_label: feedback.month_label,
    date_range: {
      start_date: formatDateForDisplay(feedback.date_range.start_date),
      end_date: formatDateForDisplay(feedback.date_range.end_date),
    },
    total_days: toNumber(feedback.total_days),
    recorded_days: toNumber(feedback.recorded_days),

    // 섹션들
    summary_overview: summaryOverview,
    emotion_overview: emotionOverview,
    insight_overview: insightOverview,
    feedback_overview: feedback.feedback_overview,
    vision_overview: feedback.vision_overview,
    conclusion_overview: feedback.conclusion_overview,
  };
}
