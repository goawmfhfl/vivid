// Weekly Report Data Type
export type WeeklyReportData = {
  // Header
  week_range: {
    start: string; // "2025.10.28"
    end: string; // "2025.11.03"
  };
  integrity: {
    average: number;
    min: number;
    max: number;
    stddev: number;
    trend: string; // "전주 대비 +3"
  };
  weekly_one_liner: string; // "생각이 전략으로, 실행이 습관으로 달을 내린 한 주"
  next_week_focus: string; // "속도보다 방향 유지"

  // Weekly Overview
  weekly_overview: {
    narrative: string;
    top_keywords: string[];
    repeated_themes: Array<{ theme: string; count: number }>;
    emotion_trend: string[]; // ["불안", "몰입", "안도"]
    ai_overall_comment: string;
  };

  // By Day Timeline
  by_day: Array<{
    date: string; // "2025.10.28"
    weekday: string; // "월요일"
    one_liner: string;
    key_mood: string;
    keywords: string[];
    integrity_score: number;
  }>;

  // Growth Trends
  growth_points_top3: string[];
  adjustment_points_top3: string[];

  // Insight Replay
  core_insights: string[];
  meta_questions_highlight: string[];

  // Vision Report
  vision_summary: string;
  vision_keywords_trend: Array<{ keyword: string; count: number }>;
  alignment_comment: string;
  reminder_sentences_featured: string[];

  // Execution Reflection
  positives_top3: string[];
  improvements_top3: string[];
  ai_feedback_summary: string;

  // Closing
  next_week_objective: string;
  call_to_action: string[];
};
