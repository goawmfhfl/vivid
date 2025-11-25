import type {
  MonthlyFeedback,
  MonthlyFeedbackResponse,
} from "@/types/monthly-feedback";
import type { DailyFeedbackRow } from "@/types/daily-feedback";

// API 요청 타입
export interface MonthlyFeedbackGenerateRequest {
  userId: string;
  month: string; // "YYYY-MM"
  timezone?: string; // default "Asia/Seoul"
}

// AI 요청을 위한 daily feedback 배열 타입
export type DailyFeedbackForMonthly = DailyFeedbackRow[];

// AI 응답 래퍼 타입
export type { MonthlyFeedbackResponse };

// Monthly Feedback 타입 재export
export type { MonthlyFeedback };
