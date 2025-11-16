import type { PeriodSummary } from "@/types/Entry";
import type { WeeklyFeedbackListItem } from "@/types/weekly-feedback";

/**
 * 주차 계산 (ISO 주차)
 */
export function calculateWeekNumber(date: Date): number {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor(
    (date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
  );
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

/**
 * 날짜 범위 포맷팅 (예: "10월 28일 - 11월 3일")
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const startFormatted = startDate.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });
  const endFormatted = endDate.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });
  return `${startFormatted} - ${endFormatted}`;
}

/**
 * Period 포맷팅 (예: "10월 43주차")
 */
export function formatPeriod(date: Date, weekNumber: number): string {
  const monthName = date.toLocaleDateString("ko-KR", { month: "long" });
  return `${monthName} ${weekNumber}주차`;
}

/**
 * PeriodSummary 객체 생성에 필요한 데이터
 */
type CreatePeriodSummaryParams = {
  item: WeeklyFeedbackListItem;
  weekNumber: number;
  year: number;
  dateRange: string;
  period: string;
};

/**
 * WeeklyFeedbackListItem으로부터 PeriodSummary 객체 생성
 */
export function createPeriodSummaryFromWeeklyFeedback(
  params: CreatePeriodSummaryParams
): PeriodSummary {
  const { item, weekNumber, year, dateRange, period } = params;

  return {
    id: item.id,
    period,
    type: "weekly",
    dateRange,
    totalEntries: 0, // 주간 피드백에서는 사용하지 않음
    overview: item.title || "",
    keyInsights: [],
    emotionalTrends: "",
    growthAreas: [],
    highlights: [],
    nextSteps: "",
    createdAt: item.created_at ? new Date(item.created_at) : new Date(),
    weekNumber,
    year,
    week: `${year}-W${weekNumber}`,
  };
}
