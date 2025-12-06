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
  // summary_report 숫자 필드 변환
  const summaryReport = {
    ...feedback.summary_report,
    monthly_score: toNumber(feedback.summary_report.monthly_score),
    record_coverage_rate: toNumber(
      feedback.summary_report.record_coverage_rate
    ),
    life_balance_score: toNumber(feedback.summary_report.life_balance_score),
    execution_score: toNumber(feedback.summary_report.execution_score),
    rest_score: toNumber(feedback.summary_report.rest_score),
    relationship_score: toNumber(feedback.summary_report.relationship_score),
  };

  // emotion_report 숫자 필드 변환
  const emotionReport = {
    ...feedback.emotion_report,
    monthly_ai_mood_valence_avg: toNumberOrNull(
      feedback.emotion_report.monthly_ai_mood_valence_avg
    ),
    monthly_ai_mood_arousal_avg: toNumberOrNull(
      feedback.emotion_report.monthly_ai_mood_arousal_avg
    ),
    emotion_stability_score: toNumber(
      feedback.emotion_report.emotion_stability_score
    ),
    emotion_quadrant_distribution:
      feedback.emotion_report.emotion_quadrant_distribution.map((item) => ({
        ...item,
        count: toNumber(item.count),
        ratio: toNumber(item.ratio),
      })),
  };

  // insight_report 숫자 필드 변환
  const insightReport = {
    ...feedback.insight_report,
    insight_days_count: toNumber(feedback.insight_report.insight_days_count),
    insight_records_count: toNumber(
      feedback.insight_report.insight_records_count
    ),
    top_insights: feedback.insight_report.top_insights.map((item) => ({
      ...item,
      frequency: toNumber(item.frequency),
    })),
    // core_insights는 MonthlyInsightReport 타입이므로 그대로 유지
    core_insights: feedback.insight_report.core_insights,
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
    summary_report: summaryReport,
    daily_life_report: feedback.daily_life_report,
    emotion_report: emotionReport,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    insight_report: insightReport as any, // MonthlyInsightReport와 InsightReport 타입 차이로 인한 임시 타입 단언
    execution_report: feedback.execution_report,
    vision_report: feedback.vision_report,
    closing_report: feedback.closing_report,
  };
}
