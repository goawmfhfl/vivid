import type { MonthlyFeedback } from "@/types/monthly-feedback";
import type { MonthlyReportData } from "./report/types";

/**
 * 날짜 포맷 변환 (YYYY-MM-DD -> YYYY.MM.DD)
 */
function formatDateForDisplay(date: string): string {
  return date.replace(/-/g, ".");
}

/**
 * MonthlyFeedback을 MonthlyReportData로 변환
 */
export function mapMonthlyFeedbackToReportData(
  feedback: MonthlyFeedback
): MonthlyReportData {
  return {
    // 기본 정보
    month: feedback.month,
    month_label: feedback.month_label,
    date_range: {
      start_date: formatDateForDisplay(feedback.date_range.start_date),
      end_date: formatDateForDisplay(feedback.date_range.end_date),
    },
    total_days: feedback.total_days,
    recorded_days: feedback.recorded_days,
    record_coverage_rate: feedback.record_coverage_rate,
    integrity_average: feedback.integrity_average,

    // 섹션들
    summary_overview: feedback.summary_overview,
    weekly_overview: {
      weeks: feedback.weekly_overview.weeks.map((week) => ({
        ...week,
        start_date: formatDateForDisplay(week.start_date),
        end_date: formatDateForDisplay(week.end_date),
      })),
    },
    emotion_overview: feedback.emotion_overview,
    insight_overview: feedback.insight_overview,
    feedback_overview: feedback.feedback_overview,
    vision_overview: feedback.vision_overview,
    conclusion_overview: feedback.conclusion_overview,
  };
}
