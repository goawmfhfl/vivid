// Monthly Feedback 타입 정의

export type MonthlyFeedback = {
  id?: string;
  month: string; // "YYYY-MM"
  month_label: string; // "2025년 11월"
  date_range: {
    start_date: string; // "YYYY-MM-DD"
    end_date: string; // "YYYY-MM-DD"
  };
  total_days: number;
  recorded_days: number;
  record_coverage_rate: number; // 0-1
  integrity_average: number; // 0-10

  // 섹션들
  summary_overview: SummaryOverview;
  weekly_overview: WeeklyOverview;
  emotion_overview: EmotionOverview;
  insight_overview: InsightOverview;
  feedback_overview: FeedbackOverview;
  vision_overview: VisionOverview;
  conclusion_overview: ConclusionOverview;

  is_ai_generated?: boolean;
  created_at?: string;
};

export type SummaryOverview = {
  monthly_score: number; // 0-100
  summary_title: string;
  summary_description: string;
  main_themes: string[]; // 최대 10개
  integrity_trend: "상승" | "하락" | "유지" | "불규칙" | null;
  life_balance_score: number; // 0-10
  execution_score: number; // 0-10
  rest_score: number; // 0-10
  relationship_score: number; // 0-10
  summary_ai_comment: string | null;
};

export type WeeklyOverview = {
  weeks: WeeklyItem[];
};

export type WeeklyItem = {
  week_index: number; // 1-5
  start_date: string; // "YYYY-MM-DD"
  end_date: string; // "YYYY-MM-DD"
  integrity_average: number; // 0-10
  dominant_emotion: string | null;
  emotion_quadrant:
    | "몰입·설렘"
    | "불안·초조"
    | "슬픔·무기력"
    | "안도·평온"
    | null;
  weekly_keyword: string | null;
  weekly_comment: string | null;
};

export type EmotionOverview = {
  monthly_ai_mood_valence_avg: number | null;
  monthly_ai_mood_arousal_avg: number | null;
  emotion_quadrant_dominant:
    | "몰입·설렘"
    | "불안·초조"
    | "슬픔·무기력"
    | "안도·평온"
    | null;
  emotion_quadrant_distribution: EmotionQuadrantDistribution[];
  emotion_keywords: string[]; // 최대 20개
  emotion_pattern_summary: string | null;
  positive_triggers: string[]; // 최대 10개
  negative_triggers: string[]; // 최대 10개
  emotion_stability_score: number; // 0-10
  emotion_ai_comment: string | null;
};

export type EmotionQuadrantDistribution = {
  quadrant: "몰입·설렘" | "불안·초조" | "슬픔·무기력" | "안도·평온";
  count: number;
  ratio: number; // 0-1
};

export type InsightOverview = {
  insight_days_count: number;
  insight_records_count: number;
  insight_themes: string[]; // 최대 15개
  top_insights: TopInsight[];
  insight_depth_score: number; // 0-10
  meta_question_for_month: string | null;
  insight_ai_comment: string | null;
};

export type TopInsight = {
  summary: string;
  first_date: string | null; // "YYYY-MM-DD"
  last_date: string | null; // "YYYY-MM-DD"
  frequency: number;
};

export type FeedbackOverview = {
  feedback_days_count: number;
  feedback_records_count: number;
  recurring_positives: string[]; // 최대 10개
  recurring_improvements: string[]; // 최대 10개
  habit_scores: HabitScores;
  core_feedback_for_month: string;
  feedback_ai_comment: string | null;
};

export type HabitScores = {
  health: number; // 0-10
  work: number; // 0-10
  relationship: number; // 0-10
  self_care: number; // 0-10
};

export type VisionOverview = {
  vision_days_count: number;
  vision_records_count: number;
  vision_consistency_score: number; // 0-10
  main_visions: MainVision[];
  vision_progress_comment: string | null;
  reminder_sentence_for_next_month: string | null;
  vision_ai_feedback: string | null; // "핵심 3단: 1) ..., 2) ..., 3) ..." 형식
};

export type MainVision = {
  summary: string;
  frequency: number;
};

export type ConclusionOverview = {
  monthly_title: string;
  monthly_summary: string;
  turning_points: string[]; // 최대 5개
  next_month_focus: string; // "1) ~, 2) ~, 3) ~" 형식
  ai_encouragement_message: string;
};

// API 요청 타입
export interface MonthlyFeedbackGenerateRequest {
  userId: string;
  month: string; // "YYYY-MM"
  timezone?: string; // default "Asia/Seoul"
}

// Monthly Feedback 리스트 아이템 (가벼운 데이터)
export type MonthlyFeedbackListItem = {
  id: string;
  title: string;
  month: string;
  month_label: string;
  date_range: {
    start_date: string;
    end_date: string;
  };
  monthly_score: number;
  is_ai_generated?: boolean;
  created_at?: string;
};

// AI 응답 래퍼 타입
export interface MonthlyFeedbackResponse {
  monthly_feedback: MonthlyFeedback;
}
