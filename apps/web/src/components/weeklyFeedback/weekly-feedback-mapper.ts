import type { WeeklyFeedback } from "@/types/weekly-feedback";
import type { WeeklyReportData } from "./report/types";

/**
 * WeeklyFeedback을 WeeklyReportData로 변환
 */
export function mapWeeklyFeedbackToReportData(
  feedback: WeeklyFeedback
): WeeklyReportData {
  return {
    week_range: feedback.week_range,
    vivid_report: feedback.vivid_report,
    closing_report: feedback.closing_report,
  };
}
