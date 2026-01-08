import type { WeeklyFeedback } from "@/types/weekly-feedback";
import type { DailyFeedbackRow } from "@/types/daily-feedback";

// API 요청 타입
export interface WeeklyFeedbackGenerateRequest {
  userId: string;
  start: string; // "YYYY-MM-DD"
  end: string; // "YYYY-MM-DD"
  timezone?: string; // default "Asia/Seoul"
  isPro?: boolean; // Pro 멤버십 여부 (서버에서 확인하거나 클라이언트에서 전달)
}

// AI 요청을 위한 daily feedback 배열 타입 (vivid_report만 포함)
export type DailyFeedbackForWeekly = Pick<
  DailyFeedbackRow,
  "report_date" | "day_of_week" | "vivid_report"
>[];

// AI 응답 래퍼 타입
export interface WeeklyFeedbackResponse {
  weekly_feedback: WeeklyFeedback;
}
