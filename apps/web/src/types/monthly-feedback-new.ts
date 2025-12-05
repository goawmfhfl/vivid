// ============================================
// 새로운 Monthly Feedback 타입 정의 (Weekly Feedback 기반)
// ============================================

export type MonthlyFeedbackNew = {
  id?: string;
  month: string; // "YYYY-MM"
  month_label: string; // "2025년 11월"
  date_range: {
    start_date: string; // "YYYY-MM-DD"
    end_date: string; // "YYYY-MM-DD"
  };
  total_days: number;
  recorded_days: number; // weekly feedback 개수

  // 7개 영역별 리포트
  summary_report: SummaryReport;
  daily_life_report: DailyLifeReport;
  emotion_report: EmotionReport;
  vision_report: VisionReport;
  insight_report: InsightReport;
  execution_report: ExecutionReport;
  closing_report: ClosingReport;

  is_ai_generated?: boolean;
  created_at?: string;
};

// ============================================
// 1. Summary Report
// ============================================
export type SummaryReport = {
  monthly_summary: string;
  key_themes: KeyTheme[];
  monthly_scores: MonthlyScores;
  weekly_scores_trend: WeeklyScore[];
  visualization: SummaryVisualization;
};

export type KeyTheme = {
  theme: string;
  frequency: number;
  impact_score: number;
  description: string;
  week_evolution: WeekEvolution[];
};

export type WeekEvolution = {
  week: number;
  frequency: number;
  context: string;
};

export type MonthlyScores = {
  overall_score: number;
  consistency_score: number;
  growth_score: number;
  self_awareness_score: number;
  emotional_stability_score: number;
  execution_score: number;
  vision_clarity_score: number;
};

export type WeeklyScore = {
  week: number;
  overall_score: number;
  consistency_score: number;
  growth_score: number;
  self_awareness_score: number;
  emotional_stability_score: number;
  execution_score: number;
  vision_clarity_score: number;
};

export type SummaryVisualization = {
  scores_radar_chart: {
    type: "radar";
    data: Array<{
      category: string;
      value: number;
      fullMark: number;
    }>;
  };
  weekly_trend_line: {
    type: "line";
    data: Array<{
      week: string;
      overall: number;
      consistency: number;
      growth: number;
      self_awareness: number;
    }>;
    keys: string[];
  };
  growth_timeline: {
    type: "timeline";
    data: Array<{
      phase: string;
      date_range: string;
      description: string;
      key_moment: string;
    }>;
  };
};

// ============================================
// 2. Daily Life Report
// ============================================
export type DailyLifeReport = {
  summary: string;
  daily_patterns: DailyPatterns;
  visualization: DailyLifeVisualization;
};

export type DailyPatterns = {
  most_frequent_events: MostFrequentEvent[];
  behavioral_patterns: BehavioralPatterns;
  keyword_evolution: KeywordEvolution[];
  emotion_triggers_summary: EmotionTriggersSummary;
};

export type MostFrequentEvent = {
  event: string;
  frequency: number;
  avg_emotion_score: number;
  context: string;
  week_evolution: Array<{
    week: number;
    frequency: number;
    emotion_avg: number;
    context?: string;
  }>;
};

export type BehavioralPatterns = {
  avoidance: PatternWithTrend;
  routine_attempt: RoutineAttemptPattern;
  planned_actions: PlannedActionsPattern;
};

export type PatternWithTrend = {
  frequency: number;
  common_triggers: string[];
  typical_behaviors: string[];
  week_trend: Array<{
    week: number;
    frequency: number;
  }>;
};

export type RoutineAttemptPattern = {
  frequency: number;
  success_rate: number;
  most_successful: string[];
  least_successful: string[];
  week_trend: Array<{
    week: number;
    frequency: number;
    success_rate: number;
  }>;
};

export type PlannedActionsPattern = {
  frequency: number;
  avg_emotion_score: number;
  examples: string[];
  week_trend: Array<{
    week: number;
    frequency: number;
    emotion_avg: number;
  }>;
};

export type KeywordEvolution = {
  week: number;
  top_keywords: string[];
  dominant_theme: string;
};

export type EmotionTriggersSummary = {
  summary: string;
  category_distribution: {
    self: CategoryDistribution;
    work: CategoryDistribution;
    people: CategoryDistribution;
    environment: CategoryDistribution;
  };
  week_evolution: Array<{
    week: number;
    self: number;
    work: number;
    people: number;
    environment: number;
  }>;
};

export type CategoryDistribution = {
  count: number;
  percentage: number;
  top_triggers: string[];
  insight: string;
};

export type DailyLifeVisualization = {
  event_frequency_bar: {
    type: "bar";
    data: Array<{
      event: string;
      frequency: number;
      emotion_avg: number;
    }>;
  };
  behavior_pattern_radar: {
    type: "radar";
    data: Array<{
      category: string;
      value: number;
      fullMark: number;
    }>;
  };
  keyword_timeline: {
    type: "line";
    data: Array<{
      week: string;
      [key: string]: string | number;
    }>;
  };
  routine_success_rate_area: {
    type: "area";
    data: Array<{
      week: string;
      success_rate: number;
    }>;
  };
  emotion_triggers_pie: {
    type: "pie";
    data: Array<{
      category: string;
      value: number;
      percentage: number;
      color: string;
    }>;
  };
  emotion_triggers_weekly_line: {
    type: "line";
    data: Array<{
      week: string;
      self: number;
      work: number;
      people: number;
      environment: number;
    }>;
    keys: string[];
  };
};

// ============================================
// 3. Emotion Report
// ============================================
export type EmotionReport = {
  summary: string;
  monthly_emotion_overview: MonthlyEmotionOverview;
  weekly_emotion_evolution: WeeklyEmotionEvolution[];
  emotion_pattern_changes: EmotionPatternChanges;
  visualization: EmotionVisualization;
};

export type MonthlyEmotionOverview = {
  dominant_quadrant: "몰입·설렘" | "불안·초조" | "슬픔·무기력" | "안도·평온";
  quadrant_distribution: {
    "몰입·설렘": number;
    "불안·초조": number;
    "슬픔·무기력": number;
    "안도·평온": number;
  };
  avg_valence: number;
  avg_arousal: number;
  emotion_stability_score: number;
  most_frequent_emotions: Array<{
    emotion: string;
    frequency: number;
    avg_intensity: number;
  }>;
  emotion_triggers: {
    anxious_triggers: EmotionTrigger[];
    calm_triggers: EmotionTrigger[];
    engaged_triggers: EmotionTrigger[];
  };
};

export type EmotionTrigger = {
  trigger: string;
  frequency: number;
  avg_emotion_impact: number;
};

export type WeeklyEmotionEvolution = {
  week: number;
  dominant_quadrant: "몰입·설렘" | "불안·초조" | "슬픔·무기력" | "안도·평온";
  avg_valence: number;
  avg_arousal: number;
  stability_score: number;
  key_emotions: string[];
  valence_explanation: string;
  arousal_explanation: string;
};

export type EmotionPatternChanges = {
  valence_trend: "상승" | "하락" | "유지";
  arousal_trend: "상승" | "하락" | "유지";
  stability_trend: "상승" | "하락" | "유지";
  key_insights: string[];
  pattern_summary: string;
};

export type EmotionVisualization = {
  emotion_quadrant_pie: {
    type: "pie";
    data: Array<{
      quadrant: string;
      value: number;
      color: string;
    }>;
  };
  emotion_timeline_scatter: {
    type: "scatter";
    data: Array<{
      date: string;
      valence: number;
      arousal: number;
      emotion: string;
    }>;
  };
  weekly_emotion_radar: {
    type: "radar";
    data: Array<{
      category: string;
      week1: number;
      week2: number;
      week3: number;
      week4: number;
      fullMark: number;
    }>;
  };
  trigger_impact_bar: {
    type: "bar";
    data: Array<{
      trigger: string;
      impact: number;
      type: "positive" | "negative";
    }>;
  };
  weekly_quadrant_trend: {
    type: "line";
    data: Array<{
      week: string;
      "몰입·설렘": number;
      "불안·초조": number;
      "슬픔·무기력": number;
      "안도·평온": number;
    }>;
    keys: string[];
  };
};

// ============================================
// 4. Vision Report
// ============================================
export type VisionReport = {
  summary: string;
  vision_consistency: VisionConsistency;
  vision_action_alignment: VisionActionAlignment;
  visualization: VisionVisualization;
};

export type VisionConsistency = {
  core_theme: string;
  consistency_score: number;
  theme_evolution: ThemeEvolution[];
  vision_keywords_trend: VisionKeywordTrend[];
  goal_categories: GoalCategory[];
  dreamer_traits: DreamerTrait[];
};

export type ThemeEvolution = {
  period: string;
  theme: string;
  key_phrases: string[];
  summary: string;
};

export type VisionKeywordTrend = {
  keyword: string;
  frequency: number;
  trend: "increasing" | "decreasing" | "stable";
  first_appeared: string;
  last_appeared: string;
  week_evolution: Array<{
    week: number;
    frequency: number;
  }>;
  context: string;
  related_keywords: string[];
};

export type GoalCategory = {
  category: string;
  count: number;
  percentage: number;
  examples: string[];
  progress_rate: number;
  week_progress: Array<{
    week: number;
    progress: number;
  }>;
  insight: string;
};

export type DreamerTrait = {
  trait: string;
  frequency: number;
  evidence: string;
  insight: string;
  week_evolution: Array<{
    week: number;
    frequency: number;
  }>;
};

export type VisionActionAlignment = {
  summary: string;
  alignment_score: {
    value: number;
    description: string;
  };
  strong_alignments: Array<{
    vision_area: string;
    action_examples: string[];
    alignment_score: number;
  }>;
  gaps: Array<{
    vision_area: string;
    gap_description: string;
    suggested_actions: string[];
  }>;
};

export type VisionVisualization = {
  vision_keywords_timeline: {
    type: "line";
    data: Array<{
      week: string;
      [key: string]: string | number;
    }>;
  };
  goal_progress_gauge: {
    type: "gauge";
    data: Array<{
      category: string;
      progress: number;
      target: number;
    }>;
  };
  dreamer_traits_bar: {
    type: "bar";
    data: Array<{
      trait: string;
      frequency: number;
    }>;
  };
  vision_consistency_timeline: {
    type: "timeline";
    data: Array<{
      phase: string;
      theme: string;
      key_phrases: string[];
    }>;
  };
  goal_categories_pie: {
    type: "pie";
    data: Array<{
      category: string;
      value: number;
      percentage: number;
      color: string;
    }>;
  };
};

// ============================================
// 5. Insight Report
// ============================================
export type InsightReport = {
  summary: string;
  core_insights: CoreInsight[];
  insight_categories: InsightCategory[];
  meta_questions_evolution: MetaQuestionsEvolution[];
  insight_action_alignment: InsightActionAlignment;
  repeated_themes: RepeatedTheme[];
  visualization: InsightVisualization;
};

export type CoreInsight = {
  insight: string;
  source: string;
  category: string;
  frequency: number;
  impact_score: number;
  first_appeared: string;
  last_appeared: string;
  related_actions: string[];
  week_evolution: Array<{
    week: number;
    frequency: number;
    context?: string;
  }>;
};

export type InsightCategory = {
  category: string;
  count: number;
  percentage: number;
  avg_impact: number;
  week_distribution: Array<{
    week: number;
    count: number;
  }>;
  examples: string[];
  insight: string;
};

export type MetaQuestionsEvolution = {
  week: number;
  questions: string[];
  question_type: string;
  count: number;
  dominant_theme: string;
};

export type InsightActionAlignment = {
  summary: string;
  alignment_score: {
    value: number;
    description: string;
  };
  strong_connections: Array<{
    insight: string;
    action: string;
    connection: string;
    alignment_score: number;
  }>;
  weak_connections: Array<{
    insight: string;
    action: string;
    connection: string;
    alignment_score: number;
    gap_reason?: string;
  }>;
};

export type RepeatedTheme = {
  theme: string;
  total_count: number;
  week_distribution: Array<{
    week: number;
    count: number;
  }>;
  insight: string;
};

export type InsightVisualization = {
  insight_categories_pie: {
    type: "pie";
    data: Array<{
      category: string;
      value: number;
      percentage: number;
      color: string;
    }>;
  };
  insight_impact_bar: {
    type: "bar";
    data: Array<{
      insight: string;
      impact: number;
      frequency: number;
    }>;
  };
  meta_questions_timeline: {
    type: "line";
    data: Array<{
      week: string;
      count: number;
      type: string;
    }>;
  };
  insight_frequency_wordcloud: {
    type: "wordcloud";
    data: Array<{
      text: string;
      size: number;
      color: string;
    }>;
  };
  insight_categories_weekly_area: {
    type: "area";
    data: Array<{
      week: string;
      [key: string]: string | number;
    }>;
    keys: string[];
  };
};

// ============================================
// 6. Execution Report
// ============================================
export type ExecutionReport = {
  summary: string;
  feedback_patterns: FeedbackPatterns;
  core_feedback_themes: CoreFeedbackTheme[];
  improvement_action_alignment: ImprovementActionAlignment;
  visualization: ExecutionVisualization;
};

export type FeedbackPatterns = {
  positives_count: number;
  improvements_count: number;
  execution_rate: number;
  positives_trend: Array<{
    week: number;
    count: number;
  }>;
  improvements_trend: Array<{
    week: number;
    count: number;
  }>;
  feedback_categories: FeedbackCategory[];
  person_traits: PersonTrait[];
  improvement_alignment_score: number;
};

export type FeedbackCategory = {
  category: string;
  positives: number;
  improvements: number;
  total: number;
  percentage: number;
  examples: {
    positives: string[];
    improvements: string[];
  };
  week_evolution: Array<{
    week: number;
    positives: number;
    improvements: number;
  }>;
};

export type PersonTrait = {
  trait: string;
  frequency: number;
  evidence: string;
  context: string;
  week_evolution: Array<{
    week: number;
    frequency: number;
  }>;
};

export type CoreFeedbackTheme = {
  theme: string;
  frequency: number;
  evidence: string[];
  insight: string;
  week_evolution: Array<{
    week: number;
    frequency: number;
  }>;
};

export type ImprovementActionAlignment = {
  summary: string;
  alignment_score: {
    value: number;
    description: string;
  };
  strong_connections: Array<{
    feedback_theme: string;
    improvement: string;
    connection: string;
    alignment_score: number;
  }>;
  weak_connections: Array<{
    feedback_theme: string;
    improvement: string;
    connection: string;
    alignment_score: number;
    gap_reason?: string;
  }>;
};

export type ExecutionVisualization = {
  feedback_trend_line: {
    type: "line";
    data: Array<{
      week: string;
      positives: number;
      improvements: number;
    }>;
  };
  feedback_categories_bar: {
    type: "bar";
    data: Array<{
      category: string;
      positives: number;
      improvements: number;
    }>;
  };
  execution_rate_gauge: {
    type: "gauge";
    data: {
      value: number;
      target: number;
      label: string;
    };
  };
  person_traits_wordcloud: {
    type: "wordcloud";
    data: Array<{
      text: string;
      size: number;
      color: string;
    }>;
  };
  positives_improvements_pie: {
    type: "pie";
    data: Array<{
      type: string;
      value: number;
      percentage: number;
      color: string;
    }>;
  };
};

// ============================================
// 7. Closing Report
// ============================================
export type ClosingReport = {
  monthly_one_liner: string;
  this_month_identity: ThisMonthIdentity;
  next_month_intention: NextMonthIntention;
  visualization: ClosingVisualization;
};

export type ThisMonthIdentity = {
  core_identity: string;
  identity_evolution: IdentityEvolution[];
  key_characteristics: KeyCharacteristic[];
  strengths_highlight: StrengthHighlight[];
  areas_of_awareness: AreaOfAwareness[];
  growth_journey: GrowthJourney[];
};

export type IdentityEvolution = {
  period: string;
  identity: string;
  key_phrases: string[];
  dominant_emotion: string;
  summary: string;
};

export type KeyCharacteristic = {
  trait: string;
  score: number;
  evidence: string;
  growth: string;
  week_scores: Array<{
    week: number;
    score: number;
  }>;
};

export type StrengthHighlight = {
  strength: string;
  description: string;
  impact: string;
};

export type AreaOfAwareness = {
  area: string;
  description: string;
  action_taken: string;
};

export type GrowthJourney = {
  phase: string;
  date_range: string;
  description: string;
  key_moment: string;
  identity_shift: string;
};

export type NextMonthIntention = {
  summary: string;
  intention: string;
  focus_areas: FocusArea[];
};

export type FocusArea = {
  area: string;
  reason: string;
  suggested_actions: string[];
  identity_shift: string;
};

export type ClosingVisualization = {
  characteristics_radar: {
    type: "radar";
    data: Array<{
      characteristic: string;
      value: number;
      fullMark: number;
    }>;
  };
  growth_journey: {
    type: "timeline";
    data: Array<{
      phase: string;
      date_range: string;
      description: string;
      key_moment: string;
    }>;
  };
  characteristics_growth_line: {
    type: "line";
    data: Array<{
      week: string;
      [key: string]: string | number;
    }>;
  };
};
