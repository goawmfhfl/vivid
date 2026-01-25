import type { WeeklyVivid } from "@/types/weekly-vivid";
import type { DailyVividRow } from "@/types/daily-vivid";
import type { Record } from "../daily-vivid/types";

// API 요청 타입
export interface WeeklyVividGenerateRequest {
  userId: string;
  start: string; // "YYYY-MM-DD"
  end: string; // "YYYY-MM-DD"
  timezone?: string; // default "Asia/Seoul"
  isPro?: boolean; // Pro 멤버십 여부 (서버에서 확인하거나 클라이언트에서 전달)
  generation_duration_seconds?: number; // 클라이언트에서 측정한 생성 시간 (초 단위)
}

// AI 요청을 위한 daily vivid 배열 타입 (report만 포함)
// @deprecated 기록 기반 생성으로 변경됨. RecordsForWeekly 사용 권장
export type DailyVividForWeekly = Pick<
  DailyVividRow,
  "report_date" | "day_of_week" | "report"
>[];

// AI 요청을 위한 records 배열 타입 (주간 피드백 생성용)
export type RecordsForWeekly = Record[];

// AI 응답 래퍼 타입
export interface WeeklyVividResponse {
  weekly_vivid: WeeklyVivid;
}
