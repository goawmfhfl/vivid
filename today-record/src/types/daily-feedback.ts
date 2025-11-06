export interface DailyFeedbackRow {
  // 기본 정보
  user_id: string;
  report_date: string;
  day_of_week: string | null;
  integrity_score: number | null;
  narrative_summary: string | null;
  emotion_curve: string[];
  narrative: string | null;
  lesson: string | null;
  keywords: string[];
  daily_ai_comment: string | null;

  // 비전(Vision) 영역
  vision_summary: string | null;
  vision_self: string | null;
  vision_keywords: string[];
  reminder_sentence: string | null;
  vision_ai_feedback: string | null;

  // 인사이트(Insight) 영역
  core_insight: string | null;
  learning_source: string | null;
  meta_question: string | null;
  insight_ai_comment: string | null;

  // 피드백(Feedback) 영역
  core_feedback: string | null;
  positives: string[];
  improvements: string[];
  feedback_ai_comment: string | null;

  // 최종(Final) 영역
  ai_message: string | null;
  growth_point: string | null;
  adjustment_point: string | null;
  tomorrow_focus: string | null;
  integrity_reason: string | null;
}
