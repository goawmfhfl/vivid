export type WeeklyFeedbackByDay = {
  date: string; // "2025-10-28"
  weekday: string; // "Tue"
  one_liner: string;
  key_mood: string;
  keywords: string[];
  integrity_score: number;
};

export type WeeklyOverview = {
  narrative: string;
  top_keywords: string[];
  repeated_themes: string[];
  emotion_trend: string[];
  integrity: {
    average: number;
  };
  ai_overall_comment: string;
  next_week_focus: string;
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
  title: string;
  week_range: {
    start: string; // "YYYY-MM-DD"
    end: string; // "YYYY-MM-DD"
    timezone: string; // "Asia/Seoul"
  };
  by_day: WeeklyFeedbackByDay[];
  weekly_overview: WeeklyOverview;
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
  integrity_avg?: number; // weekly_overview.integrity.average 정도
  is_ai_generated?: boolean;
  created_at?: string;
};

// API 요청 타입
export type WeeklyFeedbackGenerateRequest = {
  start: string; // "YYYY-MM-DD"
  end: string; // "YYYY-MM-DD"
  timezone?: string; // default "Asia/Seoul"
};
