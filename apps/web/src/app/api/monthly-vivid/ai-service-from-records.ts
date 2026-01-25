import type { MonthlyVivid } from "@/types/monthly-vivid";
import type { Record } from "../daily-vivid/types";
import { generateVividReportFromRecords } from "./sections/vivid-from-records";
import { generateTitle } from "./sections/title";
import { generateMonthlyTrend } from "./sections/trend";

/**
 * Vivid Records 배열을 기반으로 월간 비비드 생성
 *
 * report를 먼저 생성하고, 그 결과를 바탕으로 title을 생성합니다.
 */
export async function generateMonthlyVividFromRecordsWithProgress(
  records: Record[],
  month: string,
  dateRange: { start_date: string; end_date: string },
  isPro: boolean,
  userId?: string,
  userName?: string
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

  // 기록이 있는 날짜 수 계산
  const recordedDates = new Set(records.map((r) => r.kst_date));
  const recordedDays = recordedDates.size;

  // 1. Monthly Report 생성 (vivid-records 기반)
  const report = await generateVividReportFromRecords(
    records,
    month,
    dateRange,
    isPro,
    userId,
    userName
  );

  // 2. Title 생성 (report 기반)
  // title 생성은 report 기반이므로 dailyVivid 대신 빈 배열 전달
  const title = await generateTitle(
    [], // records 기반이므로 빈 배열 전달 (title은 report 기반)
    report,
    month,
    dateRange,
    isPro,
    userId
  );

  // 3. Trend 생성 (report 기반)
  const trend = await generateMonthlyTrend(
    report,
    month,
    monthLabel,
    isPro,
    userId,
    userName
  );

  const monthlyVivid: MonthlyVivid = {
    month,
    month_label: monthLabel,
    date_range: dateRange,
    total_days: totalDays,
    recorded_days: recordedDays,
    title,
    report,
    trend: trend || null,
    is_ai_generated: true,
  };

  return monthlyVivid;
}
