import type { WeeklyVivid } from "@/types/weekly-vivid";
import type { WeeklyReportData } from "./report/types";

/**
 * WeeklyVivid를 WeeklyReportData로 변환
 */
export function mapWeeklyVividToReportData(
  feedback: WeeklyVivid
): WeeklyReportData {
  return {
    week_range: feedback.week_range,
    report: feedback.report,
  };
}
