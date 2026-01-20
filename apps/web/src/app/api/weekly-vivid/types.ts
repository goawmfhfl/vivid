import type { WeeklyVivid } from "@/types/weekly-vivid";
import type { DailyVividRow } from "@/types/daily-vivid";

// API 요청 타입
export interface WeeklyVividGenerateRequest {
  userId: string;
  start: string; // "YYYY-MM-DD"
  end: string; // "YYYY-MM-DD"
  timezone?: string; // default "Asia/Seoul"
  isPro?: boolean; // Pro 멤버십 여부 (서버에서 확인하거나 클라이언트에서 전달)
}

// AI 요청을 위한 daily vivid 배열 타입 (report만 포함)
export type DailyVividForWeekly = Pick<
  DailyVividRow,
  "report_date" | "day_of_week" | "report"
>[];

// AI 응답 래퍼 타입
export interface WeeklyVividResponse {
  weekly_vivid: WeeklyVivid;
}
