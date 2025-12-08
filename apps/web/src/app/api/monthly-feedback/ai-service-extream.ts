import type { DailyFeedbackRow } from "@/types/daily-feedback";
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
 * Daily Feedback 배열을 기반으로 월간 피드백 생성 (스트리밍 진행 상황 포함)
 *
 * 7개 영역을 병렬로 생성 (Promise.all 사용)
 */
export async function generateMonthlyFeedbackFromDailyWithProgress(
  dailyFeedbacks: DailyFeedbackRow[],
  month: string,
  dateRange: { start_date: string; end_date: string },
  isPro: boolean,
  progressCallback?: ProgressCallback,
  userId?: string
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

  await generateDailyLifeReport(
    dailyFeedbacks,
    month,
    dateRange,
    isPro,
    progressCallback
  );

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
      dailyFeedbacks,
      month,
      dateRange,
      totalDays,
      dailyFeedbacks.length,
      isPro,
      progressCallback,
      1,
      userId
    ),
    generateDailyLifeReport(
      dailyFeedbacks,
      month,
      dateRange,
      isPro,
      progressCallback,
      2,
      userId
    ),
    generateEmotionReport(
      dailyFeedbacks,
      month,
      dateRange,
      isPro,
      progressCallback,
      3,
      userId
    ),
    generateVisionReport(
      dailyFeedbacks,
      month,
      dateRange,
      isPro,
      progressCallback,
      4,
      userId
    ),
    generateInsightReport(
      dailyFeedbacks,
      month,
      dateRange,
      isPro,
      progressCallback,
      5,
      userId
    ),
    generateExecutionReport(
      dailyFeedbacks,
      month,
      dateRange,
      isPro,
      progressCallback,
      6,
      userId
    ),
    generateClosingReport(
      dailyFeedbacks,
      month,
      dateRange,
      isPro,
      progressCallback,
      7,
      userId
    ),
  ]);

  const monthlyFeedback: MonthlyFeedback = {
    month,
    month_label: monthLabel,
    date_range: dateRange,
    total_days: totalDays,
    recorded_days: dailyFeedbacks.length,
    summary_report: summaryReport,
    daily_life_report: dailyLifeReport,
    emotion_report: emotionReport,
    vision_report: visionReport,
    insight_report: insightReport,
    execution_report: executionReport,
    closing_report: closingReport,
    is_ai_generated: true,
  };

  return monthlyFeedback;
}
