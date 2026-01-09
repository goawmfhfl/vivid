import type { PeriodSummary } from "@/types/Entry";
import type { WeeklyFeedbackListItem } from "@/types/weekly-feedback";

/**
 * 주의 시작일 계산 (월요일 기준)
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // 일요일(0)이면 -6, 월요일(1)이면 0, 화요일(2)이면 -1, ...
  const diff = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

/**
 * 주의 종료일 계산 (일요일 기준)
 */
function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
}

/**
 * 주간이 특정 월에 포함된 요일 수 계산
 */
function getDaysInMonth(weekStart: Date, weekEnd: Date, month: number, year: number): number {
  let count = 0;
  const current = new Date(weekStart);
  
  while (current <= weekEnd) {
    if (current.getMonth() === month && current.getFullYear() === year) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

/**
 * 주간이 속한 월 결정 (더 많은 요일이 포함된 월)
 */
function getPrimaryMonth(weekStart: Date, weekEnd: Date): { month: number; year: number } {
  const startMonth = weekStart.getMonth();
  const startYear = weekStart.getFullYear();
  const endMonth = weekEnd.getMonth();
  const endYear = weekEnd.getFullYear();
  
  // 같은 월이면 그대로 반환
  if (startMonth === endMonth && startYear === endYear) {
    return { month: startMonth, year: startYear };
  }
  
  // 다른 월인 경우, 더 많은 요일이 포함된 월 선택
  const daysInStartMonth = getDaysInMonth(weekStart, weekEnd, startMonth, startYear);
  const daysInEndMonth = getDaysInMonth(weekStart, weekEnd, endMonth, endYear);
  
  if (daysInStartMonth >= daysInEndMonth) {
    return { month: startMonth, year: startYear };
  } else {
    return { month: endMonth, year: endYear };
  }
}

/**
 * 월 기준 주차 계산
 * 해당 월의 몇 번째 주인지 계산 (월요일 기준)
 * 주간이 두 달에 걸쳐 있을 경우, 더 많은 요일이 포함된 달을 기준으로 계산
 */
export function calculateWeekNumberInMonth(weekStart: Date, weekEnd: Date): { weekNumber: number; month: number; year: number } {
  // 주간의 실제 시작일과 종료일 계산
  const actualWeekStart = getWeekStart(weekStart);
  const actualWeekEnd = getWeekEnd(weekEnd);
  
  // 주간이 속한 월 결정 (더 많은 요일이 포함된 월)
  const { month, year } = getPrimaryMonth(actualWeekStart, actualWeekEnd);
  
  // 해당 월의 첫 번째 날
  const firstDayOfMonth = new Date(year, month, 1);
  const firstDayOfMonthWeekStart = getWeekStart(firstDayOfMonth);
  
  // 주간 시작일이 속한 주의 시작일
  const targetWeekStart = getWeekStart(actualWeekStart);
  
  // 두 주간 시작일 사이의 차이 (일 단위)
  const diffTime = targetWeekStart.getTime() - firstDayOfMonthWeekStart.getTime();
  const diffDays = Math.floor(diffTime / (24 * 60 * 60 * 1000));
  
  // 주차 계산 (0부터 시작하므로 +1)
  // 음수가 나올 수 있으므로 (월의 첫 주가 이전 달에 시작하는 경우) 최소값 1로 보정
  const weekNumber = Math.max(1, Math.floor(diffDays / 7) + 1);
  
  return { weekNumber, month, year };
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
 * Period 포맷팅 (예: "12월 3주차")
 */
export function formatPeriod(weekStart: Date, weekEnd: Date): string {
  const { weekNumber, month, year } = calculateWeekNumberInMonth(weekStart, weekEnd);
  const monthName = new Date(year, month, 1).toLocaleDateString("ko-KR", { month: "long" });
  return `${monthName} ${weekNumber}주차`;
}

/**
 * PeriodSummary 객체 생성에 필요한 데이터
 */
export type CreatePeriodSummaryParams = {
  item: WeeklyFeedbackListItem;
  weekNumber: number;
  year: number;
  dateRange: string;
  period: string;
  title: string;
};

/**
 * WeeklyFeedbackListItem으로부터 PeriodSummary 객체 생성
 */
export function createPeriodSummaryFromWeeklyFeedback(
  params: CreatePeriodSummaryParams
): PeriodSummary {
  const { item, weekNumber, year, dateRange, period, title } = params;

  return {
    id: item.id,
    period,
    type: "weekly",
    dateRange,
    title: title,
    keyInsights: [],
    emotionalTrends: "",
    growthAreas: [],
    highlights: [],
    nextSteps: "",
    createdAt: item.created_at ? new Date(item.created_at) : new Date(),
    weekNumber,
    year,
    week: `${year}-W${weekNumber}`,
    week_start: item.week_range.start, // date 기반 라우팅에 사용
  };
}
