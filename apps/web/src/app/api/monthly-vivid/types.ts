import type { DailyVividRow } from "@/types/daily-vivid";

// 월간 비비드 생성을 위한 Daily Vivid 타입 (필요한 필드만 포함)
export interface DailyVividForMonthly {
  report_date: string;
  day_of_week: string | null;
  report: DailyVividRow["report"];
}
