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
}

// Daily Report 타입
export interface DailyReport {
  date: string;
  day_of_week: string;
  integrity_score: number;
  narrative_summary: string;
  emotion_curve: string[];
  narrative: string;
  lesson: string;
  keywords: string[];
  daily_ai_comment: string;
  vision_summary: string;
  vision_self: string;
  vision_keywords: string[];
  reminder_sentence: string;
  vision_ai_feedback: string;
  core_insight: string;
  learning_source: string;
  meta_question: string;
  insight_ai_comment: string;
  core_feedback: string;
  positives: string[];
  improvements: string[];
  feedback_ai_comment: string;
  ai_message: string;
  growth_point: string;
  adjustment_point: string;
  tomorrow_focus: string;
  integrity_reason: string;
}

// API 요청 본문 타입
export interface DailyFeedbackRequest {
  userId: string;
  date: string;
}
