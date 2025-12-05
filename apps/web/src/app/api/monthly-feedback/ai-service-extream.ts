import type { WeeklyFeedback } from "@/types/weekly-feedback";
import type { MonthlyFeedback } from "@/types/monthly-feedback";
import type { ProgressCallback } from "./types";
import {
  generateSummaryReport,
  generateDailyLifeReport,
  generateEmotionReport,
  generateVisionReport,
  generateInsightReport,
  generateExecutionReport,
  generateClosingReport,
} from "./sections";

/**
 * 진행 상황 콜백 타입 (re-export)
 */
export type { ProgressCallback } from "./types";

/**
 * Weekly Feedback 배열을 기반으로 월간 피드백 생성 (스트리밍 진행 상황 포함)
 *
 * 7개 영역을 병렬로 생성 (Promise.all 사용)
 */
export async function generateMonthlyFeedbackFromWeeklyWithProgress(
  weeklyFeedbacks: WeeklyFeedback[],
  month: string,
  dateRange: { start_date: string; end_date: string },
  isPro: boolean,
  progressCallback?: ProgressCallback
): Promise<MonthlyFeedback> {
  const [year, monthNum] = month.split("-");
  const monthLabel = `${year}년 ${monthNum}월`;

  // 총 일수 계산
  const startDate = new Date(dateRange.start_date);
  const endDate = new Date(dateRange.end_date);
  const totalDays =
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

  // 7개 영역을 병렬로 생성
  const [
    summaryReport,
    dailyLifeReport,
    emotionReport,
    visionReport,
    insightReport,
    executionReport,
    closingReport,
  ] = await Promise.all([
    generateSummaryReport(
      weeklyFeedbacks,
      month,
      dateRange,
      totalDays,
      weeklyFeedbacks.length,
      isPro,
      progressCallback,
      1
    ),
    generateDailyLifeReport(
      weeklyFeedbacks,
      month,
      dateRange,
      isPro,
      progressCallback,
      2
    ),
    generateEmotionReport(
      weeklyFeedbacks,
      month,
      dateRange,
      isPro,
      progressCallback,
      3
    ),
    generateVisionReport(
      weeklyFeedbacks,
      month,
      dateRange,
      isPro,
      progressCallback,
      4
    ),
    generateInsightReport(
      weeklyFeedbacks,
      month,
      dateRange,
      isPro,
      progressCallback,
      5
    ),
    generateExecutionReport(
      weeklyFeedbacks,
      month,
      dateRange,
      isPro,
      progressCallback,
      6
    ),
    generateClosingReport(
      weeklyFeedbacks,
      month,
      dateRange,
      isPro,
      progressCallback,
      7
    ),
  ]);

  const monthlyFeedback: MonthlyFeedback = {
    month,
    month_label: monthLabel,
    date_range: dateRange,
    total_days: totalDays,
    recorded_days: weeklyFeedbacks.length,
    summary_report: summaryReport as any,
    daily_life_report: dailyLifeReport as any,
    emotion_report: emotionReport as any,
    vision_report: visionReport as any,
    insight_report: insightReport as any,
    execution_report: executionReport as any,
    closing_report: closingReport as any,
    is_ai_generated: true,
  };

  return monthlyFeedback;
}
