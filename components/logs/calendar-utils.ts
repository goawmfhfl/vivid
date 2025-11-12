export type CalendarLogMap = Record<string, { hasLog: boolean }>;

/**
 * 주어진 연/월을 기준으로 캘린더 매트릭스를 생성합니다.
 * 행은 주(week), 열은 요일(Day)을 나타냅니다.
 */
export function getCalendarMatrix(
  year: number,
  month: number,
  startOfWeek: "sun" | "mon" = "sun"
) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startDay =
    startOfWeek === "sun" ? firstDay.getDay() : (firstDay.getDay() + 6) % 7;

  const matrix: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];

  // 이전 달 빈 칸들 (해당 월이 아닌 날짜도 Date 객체로 유지)
  for (let i = 0; i < startDay; i++) {
    const prevMonthDay = new Date(year, month - 1, -startDay + i + 1);
    currentWeek.push(prevMonthDay);
  }

  // 현재 달 날짜들
  for (let day = 1; day <= lastDay.getDate(); day++) {
    currentWeek.push(new Date(year, month - 1, day));

    if (currentWeek.length === 7) {
      matrix.push(currentWeek);
      currentWeek = [];
    }
  }

  // 다음 달 빈 칸들
  let nextMonthDay = 1;
  while (currentWeek.length < 7) {
    currentWeek.push(new Date(year, month, nextMonthDay));
    nextMonthDay++;
  }

  if (currentWeek.length > 0) {
    matrix.push(currentWeek);
  }

  return matrix;
}

/**
 * Date 객체를 YYYY-MM-DD 형식의 문자열로 변환합니다.
 * (로컬 시간 기준)
 */
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 두 날짜가 같은 날인지 비교합니다.
 */
export function isSameDay(dateA: Date, dateB: Date): boolean {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

/**
 * 오늘 날짜인지 확인합니다. (로컬 시간 기준)
 */
export function isToday(date: Date, referenceDate: Date = new Date()): boolean {
  return isSameDay(date, getLocalStartOfDay(referenceDate));
}

/**
 * Date 객체를 로컬 시간 기준 자정으로 정규화합니다.
 */
export function getLocalStartOfDay(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * YYYY-MM-DD 형식의 문자열을 로컬 자정 시각의 Date 객체로 변환합니다.
 */
export function parseISODateToLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}
