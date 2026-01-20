import type { Report, TrendData } from "@/types/daily-vivid";

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

  // 통합 리포트
  report: Report | null;
  trend: TrendData | null; // 최근 동향 데이터
}

// API 요청 본문 타입
export interface DailyVividRequest {
  userId: string;
  date: string;
}
