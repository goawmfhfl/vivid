import type {
  EmotionOverview,
  NarrativeOverview,
  InsightOverview,
  VisionOverview,
  FeedbackOverview,
  MetaOverview,
} from "@/types/daily-feedback";

// Record 타입 정의
export interface Record {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
  kst_date: string;
}

// 카테고리화 결과 타입
export interface CategorizedRecords {
  insights: string[];
  feedbacks: string[];
  visualizings: string[];
  emotions: string[];
}

// Daily Report 타입 (AI 응답 구조 - jsonb 섹션 기반)
export interface DailyReport {
  date: string;
  day_of_week: string;
  integrity_score: number;

  // jsonb 섹션들
  emotion_overview: EmotionOverview;
  narrative_overview: NarrativeOverview;
  insight_overview: InsightOverview;
  vision_overview: VisionOverview;
  feedback_overview: FeedbackOverview;
  meta_overview: MetaOverview;
}

// API 요청 본문 타입
export interface DailyFeedbackRequest {
  userId: string;
  date: string;
}
