export type WeeklyFeedbackByDay = {
  date: string; // "2025-10-28"
  weekday: string; // "Tue"
  one_liner: string;
  key_mood: string;
  keywords: string[];
  integrity_score: number;
  emotion_overview: {
    ai_mood_valence: number | null;
    ai_mood_arousal: number | null;
    emotion_curve: string[];
    dominant_emotion: string | null;
  };
};

export type WeeklyOverview = {
  narrative: string;
  top_keywords: string[];
  repeated_themes: string[];
  integrity: {
    average: number;
  };
  ai_overall_comment: string;
  next_week_focus: string;
};

export type DailyEmotion = {
  date: string; // "YYYY-MM-DD"
  weekday: string; // "Mon", "Tue", etc.
  ai_mood_valence: number | null;
  ai_mood_arousal: number | null;
  dominant_emotion: string | null;
};

export type WeeklyEmotionOverview = {
  ai_mood_valence: number | null;
  ai_mood_arousal: number | null;
  dominant_emotion: string | null;
  valence_explanation: string;
  arousal_explanation: string;
  valence_patterns: string[];
  arousal_patterns: string[];
  valence_triggers: string[];
  arousal_triggers: string[];
  anxious_triggers: string[];
  engaged_triggers: string[];
  sad_triggers: string[];
  calm_triggers: string[];
  daily_emotions: DailyEmotion[];
};

export type GrowthTrends = {
  growth_points_top3: string[];
  adjustment_points_top3: string[];
  integrity_score: {
    avg: number;
    min: number;
    max: number;
    stddev_est: number;
  };
};

export type InsightReplay = {
  core_insights: string[];
  meta_questions_highlight: string[];
  repeated_themes: {
    theme: string;
    count: number;
  }[];
};

export type VisionVisualizationReport = {
  vision_summary: string;
  vision_keywords_trend: {
    keyword: string;
    days: number;
  }[];
  alignment_comment: string;
  reminder_sentences_featured: string[];
};

export type ExecutionReflection = {
  positives_top3: string[];
  improvements_top3: string[];
  ai_feedback_summary: string;
};

export type ClosingSection = {
  weekly_one_liner: string;
  next_week_objective: string;
  call_to_action: string[];
};

export type WeeklyFeedback = {
  id?: string; // 필요 시
  week_range: {
    start: string; // "YYYY-MM-DD"
    end: string; // "YYYY-MM-DD"
    timezone: string; // "Asia/Seoul"
  };
  weekly_overview: WeeklyOverview;
  emotion_overview?: WeeklyEmotionOverview | null;
  growth_trends: GrowthTrends;
  insight_replay: InsightReplay;
  vision_visualization_report: VisionVisualizationReport;
  execution_reflection: ExecutionReflection;
  closing_section: ClosingSection;
  // 메타 정보
  is_ai_generated?: boolean;
  created_at?: string;
};

// 리스트용 가벼운 타입
export type WeeklyFeedbackListItem = {
  id: string;
  title: string;
  week_range: {
    start: string;
    end: string;
  };
  is_ai_generated?: boolean;
  created_at?: string;
};

// API 요청 타입
export type WeeklyFeedbackGenerateRequest = {
  start: string; // "YYYY-MM-DD"
  end: string; // "YYYY-MM-DD"
  timezone?: string; // default "Asia/Seoul"
};
