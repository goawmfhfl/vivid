import type { PeriodSummary } from "@/types/Entry";
import type { MonthlyFeedbackListItem } from "@/types/monthly-feedback";

/**
 * 날짜 범위 포맷팅 (예: "11월 1일 - 11월 30일")
 */
export function formatMonthlyDateRange(
  startDate: string,
  endDate: string
): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startFormatted = start.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });
  const endFormatted = end.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });

  // 같은 달이면 "11월 1일 - 30일" 형식
  if (
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  ) {
    return `${start.toLocaleDateString("ko-KR", {
      month: "long",
    })} ${start.getDate()}일 - ${end.getDate()}일`;
  }

  return `${startFormatted} - ${endFormatted}`;
}

/**
 * PeriodSummary 객체 생성에 필요한 데이터
 */
type CreateMonthlyPeriodSummaryParams = {
  item: MonthlyFeedbackListItem;
  year: number;
  monthNumber: number;
  dateRange: string;
  period: string;
};

/**
 * MonthlyFeedbackListItem으로부터 PeriodSummary 객체 생성
 */
export function createPeriodSummaryFromMonthlyFeedback(
  params: CreateMonthlyPeriodSummaryParams
): PeriodSummary {
  const { item, year, monthNumber, dateRange, period } = params;

  return {
    id: item.id,
    period,
    type: "monthly" as const,
    title: item.title || item.month_label,
    dateRange,
    keyInsights: [],
    emotionalTrends: "",
    growthAreas: [],
    highlights: [],
    nextSteps: "",
    createdAt: item.created_at ? new Date(item.created_at) : new Date(),
    monthNumber,
    year,
    month: item.month, // "YYYY-MM" 형식
    summary: item.title || item.month_label,
  };
}

/**
 * MonthlyFeedbackListItem을 PeriodSummary로 변환
 */
export function convertMonthlyFeedbackToPeriodSummary(
  item: MonthlyFeedbackListItem
): PeriodSummary {
  // month에서 year와 monthNumber 추출 ("YYYY-MM" 형식)
  const [year, monthNum] = item.month.split("-").map(Number);
  const monthNumber = monthNum;

  const dateRange = formatMonthlyDateRange(
    item.date_range.start_date,
    item.date_range.end_date
  );
  const period = item.month_label || `${year}년 ${monthNumber}월`;

  return createPeriodSummaryFromMonthlyFeedback({
    item,
    year,
    monthNumber,
    dateRange,
    period,
  });
}
