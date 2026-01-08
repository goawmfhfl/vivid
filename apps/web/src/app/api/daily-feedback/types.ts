import type {
  SummaryReport,
  DailyReport,
  EmotionReport,
  VividReport,
  InsightReport,
  FeedbackReport,
  FinalReport,
} from "@/types/daily-feedback";

// Record 타입 정의
export interface Record {
  id: number;
  user_id: string;
  content: string;
  type: string; // "daily" | "emotion" | "vivid" | "dream" | "insight" | "feedback" (dream은 하위 호환성)
  created_at: string;
  kst_date: string;
}

// 타입별 리포트를 포함한 Daily Report 타입
export interface DailyReportResponse {
  date: string;
  day_of_week: string;

  // 타입별 리포트
  summary_report: SummaryReport | null;
  daily_report: DailyReport | null;
  emotion_report: EmotionReport | null;
  vivid_report: VividReport | null;
  insight_report: InsightReport | null;
  feedback_report: FeedbackReport | null;
  final_report: FinalReport | null;
}

// API 요청 본문 타입
export interface DailyFeedbackRequest {
  userId: string;
  date: string;
}
