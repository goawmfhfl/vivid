export type CalendarLogMap = Record<
  string,
  { hasLog: boolean; hasDailyVivid: boolean }
>;

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

  for (let i = 0; i < startDay; i++) {
    const prevMonthDay = new Date(year, month - 1, -startDay + i + 1);
    currentWeek.push(prevMonthDay);
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    currentWeek.push(new Date(year, month - 1, day));

    if (currentWeek.length === 7) {
      matrix.push(currentWeek);
      currentWeek = [];
    }
  }

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

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isSameDay(dateA: Date, dateB: Date): boolean {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

export function isToday(date: Date, referenceDate: Date = new Date()): boolean {
  return isSameDay(date, getLocalStartOfDay(referenceDate));
}

export function getLocalStartOfDay(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parseISODateToLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}
