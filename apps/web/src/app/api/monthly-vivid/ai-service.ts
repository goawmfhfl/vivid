import type { MonthlyVivid } from "@/types/monthly-vivid";
import type { DailyVividForMonthly } from "./types";
import { generateVividReport, generateTitle } from "./sections";

/**
 * Daily Feedback 배열을 기반으로 월간 비비드 생성
 *
 * report를 먼저 생성하고, 그 결과를 바탕으로 title을 생성합니다.
 */
export async function generateMonthlyVividFromDailyWithProgress(
  dailyVivid: DailyVividForMonthly[],
  month: string,
  dateRange: { start_date: string; end_date: string },
  isPro: boolean,
  userId?: string
): Promise<MonthlyVivid> {
  const [year, monthNum] = month.split("-");
  const monthLabel = `${year}년 ${monthNum}월`;

  // 총 일수 계산
  const startDate = new Date(dateRange.start_date);
  const endDate = new Date(dateRange.end_date);
  const totalDays =
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

  // 1. Monthly Report 생성
  const report = await generateVividReport(
    dailyVivid,
    month,
    dateRange,
    isPro,
    userId
  );

  // 2. Title 생성 (report 기반)
  const title = await generateTitle(
    dailyVivid,
    report,
    month,
    dateRange,
    isPro,
    userId
  );

  // trend는 user-trends cron에서만 생성됨

  const monthlyVivid: MonthlyVivid = {
    month,
    month_label: monthLabel,
    date_range: dateRange,
    total_days: totalDays,
    recorded_days: dailyVivid.length,
    title,
    report,
    trend: null, // user-trends cron에서만 생성
    is_ai_generated: true,
  };

  return monthlyVivid;
}
