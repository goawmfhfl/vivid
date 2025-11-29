import type { WeeklyFeedback } from "@/types/weekly-feedback";
import type { DailyFeedbackRow } from "@/types/daily-feedback";

// API 요청 타입
export interface WeeklyFeedbackGenerateRequest {
  userId: string;
  start: string; // "YYYY-MM-DD"
  end: string; // "YYYY-MM-DD"
  timezone?: string; // default "Asia/Seoul"
}

// AI 요청을 위한 daily feedback 배열 타입
export type DailyFeedbackForWeekly = DailyFeedbackRow[];

// AI 응답 래퍼 타입
export interface WeeklyFeedbackResponse {
  weekly_feedback: WeeklyFeedback;
}
