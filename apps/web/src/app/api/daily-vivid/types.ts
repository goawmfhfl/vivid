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
  generation_mode?: "fast" | "reasoned"; // 응답 생성 모드
  generation_type?: "vivid" | "review"; // 비비드(Q1+Q2) vs 회고(Q1+Q2+Q3)
  generation_duration_seconds?: number; // 클라이언트에서 측정한 생성 시간 (초 단위)
}
