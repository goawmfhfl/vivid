import type { DailyFeedbackRow } from "@/types/daily-feedback";

/**
 * 진행 상황 콜백 타입 (공통 types.ts에서 재export)
 */
export type { ProgressCallback } from "../types";

// 월간 피드백 생성을 위한 Daily Feedback 타입 (필요한 필드만 포함)
export type DailyFeedbackForMonthly = Pick<
  DailyFeedbackRow,
  | "report_date"
  | "day_of_week"
  | "vivid_report"
  | "emotion_report"
  | "daily_report"
  | "summary_report"
  | "insight_report"
  | "feedback_report"
  | "final_report"
>;
