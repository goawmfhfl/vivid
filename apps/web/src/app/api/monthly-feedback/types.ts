import type { DailyFeedbackRow } from "@/types/daily-feedback";

/**
 * 진행 상황 콜백 타입 (공통 types.ts에서 재export)
 */
export type { ProgressCallback } from "../types";

// 월간 피드백 생성을 위한 Daily Feedback 타입 (필요한 필드만 포함)
export interface DailyFeedbackForMonthly {
  report_date: string;
  day_of_week: string | null;
  vivid_report: DailyFeedbackRow["vivid_report"];
  emotion_report: DailyFeedbackRow["emotion_report"];
  // 현재 DailyFeedbackRow에는 emotion_report와 vivid_report만 존재
  // 다른 리포트 타입들은 null로 처리
  daily_report: null;
  summary_report: null;
  insight_report: null;
  feedback_report: null;
  final_report: null;
}
