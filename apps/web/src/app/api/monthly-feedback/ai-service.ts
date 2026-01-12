import type { MonthlyFeedbackNew } from "@/types/monthly-feedback-new";
import type { ProgressCallback, DailyFeedbackForMonthly } from "./types";
import {
  generateVividReport,
  generateTitle,
} from "./sections";

/**
 * 진행 상황 콜백 타입 (re-export)
 */
export type { ProgressCallback } from "./types";

/**
 * Daily Feedback 배열을 기반으로 월간 피드백 생성
 *
 * vivid_report를 먼저 생성하고, 그 결과를 바탕으로 title을 생성합니다.
 */
export async function generateMonthlyFeedbackFromDailyWithProgress(
  dailyFeedbacks: DailyFeedbackForMonthly[],
  month: string,
  dateRange: { start_date: string; end_date: string },
  isPro: boolean,
  progressCallback?: ProgressCallback,
  userId?: string
): Promise<MonthlyFeedbackNew> {
  const [year, monthNum] = month.split("-");
  const monthLabel = `${year}년 ${monthNum}월`;

  // 총 일수 계산
  const startDate = new Date(dateRange.start_date);
  const endDate = new Date(dateRange.end_date);
  const totalDays =
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

  // 1. Vivid Report 생성
  const vividReport = await generateVividReport(
    dailyFeedbacks,
    month,
    dateRange,
    isPro,
    progressCallback,
    1,
    userId
  );

  // 2. Title 생성 (vivid_report 기반)
  const title = await generateTitle(
    dailyFeedbacks,
    vividReport,
    month,
    dateRange,
    isPro,
    progressCallback,
    2,
    userId
  );

  const monthlyFeedback: MonthlyFeedbackNew = {
    month,
    month_label: monthLabel,
    date_range: dateRange,
    total_days: totalDays,
    recorded_days: dailyFeedbacks.length,
    title,
    vivid_report: vividReport,
    is_ai_generated: true,
  };

  return monthlyFeedback;
}
