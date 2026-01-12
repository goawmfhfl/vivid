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
  title: string; // "~ 한 달" 형식의 제목

  // Vivid Report
  vivid_report: VividReport;

  is_ai_generated?: boolean;
  created_at?: string;
};

// ============================================
// 1. Summary Report (서버 스키마 기반)
// ============================================
export type SummaryReport = {
  monthly_score: number; // 0-100
  summary_title: string;
  summary_description: string;
  main_themes: string[]; // 최대 7개
  main_themes_reason: string;
  integrity_trend: "상승" | "하락" | "유지" | "불규칙" | null;
  record_coverage_rate: number; // 0-1
  life_balance_score: number; // 0-10
  life_balance_reason: string;
  life_balance_feedback: string;
  execution_score: number; // 0-10
  execution_reason: string;
  execution_feedback: string;
  rest_score: number; // 0-10
  rest_reason: string;
  rest_feedback: string;
  relationship_score: number; // 0-10
  relationship_reason: string;
  relationship_feedback: string;
  summary_ai_comment: string | null;
};

// 하위 호환성을 위한 레거시 타입들 (사용되지 않을 수 있음)
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
  growth_score: number;
  self_awareness_score: number;
  emotional_stability_score: number;
  execution_score: number;
  vision_clarity_score: number;
};

export type WeeklyScore = {
  week: number;
  overall_score: number;
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
// 2. Daily Life Report (서버 스키마 기반)
// ============================================
export type DailyLifeReport = {
  summary: string[]; // 리스트 형태의 요약
  daily_summaries_trend: DailySummariesTrend;
  events_pattern: EventsPattern;
  emotion_triggers_analysis: EmotionTriggersAnalysis;
  behavioral_patterns: BehavioralPatterns;
  keywords_analysis: KeywordsAnalysis;
  daily_rhythm: DailyRhythm;
  ai_comment: string | null;
};

export type DailySummariesTrend = {
  overall_narrative: string;
  key_highlights: string[]; // 최대 5개
};

export type EventsPattern = {
  most_frequent_events: MostFrequentEvent[];
  event_categories: EventCategory[];
  timing_patterns: TimingPattern[];
};

export type MostFrequentEvent = {
  event: string;
  frequency: number;
  days: string[]; // YYYY-MM-DD 형식
  context: string;
};

export type EventCategory = {
  category: string;
  count: number;
  examples: string[];
};

export type TimingPattern = {
  time_range: string;
  common_events: string[];
  pattern_description: string;
};

export type EmotionTriggersAnalysis = {
  summary: string;
  category_distribution: {
    self: CategoryDistribution;
    work: CategoryDistribution;
    people: CategoryDistribution;
    environment: CategoryDistribution;
  };
};

export type CategoryDistribution = {
  count: number;
  percentage: number; // 0-100
  top_triggers: string[];
  insight: string | null;
};

export type BehavioralPatterns = {
  summary: string;
  pattern_distribution: {
    planned: PatternDistributionItem;
    impulsive: PatternDistributionItem;
    routine_attempt: PatternDistributionItem;
    avoidance: PatternDistributionItem;
    routine_failure: PatternDistributionItem;
  };
  behavior_emotion_correlation: BehaviorEmotionCorrelation[];
};

export type PatternDistributionItem = {
  count: number;
  percentage: number; // 0-100
  examples: string[];
  insight: string | null;
};

export type BehaviorEmotionCorrelation = {
  behavior: string;
  associated_emotions: string[];
  insight: string;
};

export type KeywordsAnalysis = {
  top_keywords: TopKeyword[];
  keyword_categories: KeywordCategory[];
};

export type TopKeyword = {
  keyword: string;
  frequency: number;
  days: string[]; // YYYY-MM-DD 형식
  context: string;
  sentiment: "positive" | "negative" | "neutral";
};

export type KeywordCategory = {
  category: string;
  keywords: string[];
  count: number;
};

export type DailyRhythm = {
  summary: string;
  time_patterns: TimePattern[];
};

export type TimePattern = {
  time_period: string;
  common_activities: string[];
  typical_emotions: string[];
  pattern_description: string;
};

// ============================================
// 3. Emotion Report (서버 스키마 기반)
// ============================================
export type EmotionReport = {
  monthly_ai_mood_valence_avg: number | null;
  monthly_ai_mood_arousal_avg: number | null;
  emotion_quadrant_dominant:
    | "몰입·설렘"
    | "불안·초조"
    | "슬픔·무기력"
    | "안도·평온"
    | null;
  emotion_quadrant_distribution: EmotionQuadrantDistribution[];
  emotion_quadrant_analysis_summary: string;
  emotion_pattern_summary: string | null;
  positive_triggers: string[];
  negative_triggers: string[];
  emotion_stability_score: number; // 0-10
  emotion_stability_explanation: string;
  emotion_stability_score_reason: string;
  emotion_stability_guidelines: string[];
  emotion_ai_comment: string | null;
  monthly_mood_timeline: MonthlyMoodTimelineItem[];
};

export type MonthlyMoodTimelineItem = {
  date: string; // "YYYY-MM-DD" 형식
  weekday: string; // "월요일", "화요일" 등
  ai_mood_arousal: number | null;
  ai_mood_valence: number | null;
  dominant_emotion: string | null;
};

export type EmotionQuadrantDistribution = {
  quadrant: "몰입·설렘" | "불안·초조" | "슬픔·무기력" | "안도·평온";
  count: number;
  ratio: number; // 0-1
  explanation: string;
};

// 하위 호환성을 위한 레거시 타입들 (사용되지 않을 수 있음)
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
// 4. Vivid Report (새로운 구조)
// ============================================
export type VividReport = {
  // 1. 비전 진화 스토리 (30%)
  vision_evolution: {
    core_visions: Array<{
      vision: string;
      consistency: number; // 0-1
      first_date: string;
      last_date: string;
      evolution_story: string;
    }>;
    clarity_trend: "구체화" | "모호해짐" | "유지";
    clarity_explanation: string;
    priority_shifts: Array<{
      from: string;
      to: string;
      when: string;
      why: string;
    }>;
  };

  // 2. 현재-미래 일치도 분석 (25%)
  alignment_analysis: {
    score_timeline: Array<{
      week: number;
      average_score: number;
      trend: "상승" | "하락" | "유지";
    }>;
    score_drivers: {
      improved_areas: Array<{
        area: string;
        impact: string;
        evidence: string[];
      }>;
      declined_areas: Array<{
        area: string;
        reason: string;
        evidence: string[];
      }>;
    };
    gap_analysis: {
      biggest_gaps: Array<{
        current_state: string;
        desired_state: string;
        gap_description: string;
        actionable_steps: string[];
      }>;
    };
  };

  // 3. 하루 패턴 인사이트 (20%)
  daily_life_patterns: {
    recurring_patterns: Array<{
      pattern: string;
      frequency: number;
      days: string[];
      impact: "positive" | "neutral" | "negative";
      why_it_matters: string;
    }>;
    weekly_evolution: Array<{
      week: number;
      dominant_activities: string[];
      dominant_keywords: string[];
      narrative: string;
    }>;
    evaluation_themes: {
      strengths: Array<{
        theme: string;
        frequency: number;
        examples: string[];
        how_to_maintain: string;
      }>;
      improvements: Array<{
        theme: string;
        frequency: number;
        examples: string[];
        actionable_steps: string[];
      }>;
    };
  };

  // 4. 특성-비전 매칭 (15%)
  identity_alignment: {
    trait_mapping: Array<{
      current: string;
      aspired: string;
      match_score: number; // 0-1
      gap_description: string;
      progress_evidence: string[];
    }>;
    trait_evolution: {
      strengthened: Array<{
        trait: string;
        early_month: string;
        late_month: string;
        evidence: string[];
      }>;
      emerging: Array<{
        trait: string;
        first_date: string;
        frequency: number;
      }>;
      fading: Array<{
        trait: string;
        last_appeared: string;
        why: string;
      }>;
    };
    focus_traits: Array<{
      trait: string;
      current_state: string;
      desired_state: string;
      monthly_action: string;
    }>;
  };

  // 5. 실행 가능한 다음 달 플랜 (10%)
  next_month_plan: {
    focus_areas: Array<{
      area: string;
      why: string;
      current_state: string;
      desired_state: string;
      weekly_actions: Array<{
        week: number;
        action: string;
        success_metric: string;
      }>;
    }>;
    maintain_patterns: Array<{
      pattern: string;
      why_important: string;
      how_to_maintain: string;
    }>;
    experiment_patterns: Array<{
      pattern: string;
      why_suggested: string;
      how_to_start: string;
    }>;
  };
};

// 하위 호환성을 위한 레거시 타입들 (사용되지 않을 수 있음)
export type VisionReport = {
  vision_days_count: number;
  vision_records_count: number;
  core_visions: CoreVision[];
  vision_progress_comment: string | null;
  vision_ai_feedbacks: string[]; // 최대 5개
  desired_self: DesiredSelf | null;
};

export type DesiredSelf = {
  characteristics: DesiredCharacteristic[]; // 최대 5개
  historical_figure: HistoricalFigure | null;
};

export type DesiredCharacteristic = {
  trait: string; // 예: "기록을 통해 나를 이해하고 성장하는 사람"
};

export type HistoricalFigure = {
  name: string; // 예: "레오나르도 다 빈치"
  reason: string; // 왜 이 인물을 선택했는지, 사용자의 현재 모습과의 연결점 설명
};

export type CoreVision = {
  summary: string;
  frequency: number; // 최소 1
};

// ============================================
// 5. Insight Report (서버 스키마 기반)
// ============================================
export type InsightReport = {
  insight_days_count: number;
  insight_records_count: number;
  top_insights: TopInsight[];
  core_insights: CoreInsight[];
  insight_comprehensive_summary: string | null;
  insight_inspiration: InsightInspiration | null;
};

export type InsightInspiration = {
  has_inspiration: boolean;
  ideas: string[]; // 최대 5개
  explanation: string | null; // 왜 이 아이디어를 제안했는지 설명
};

export type TopInsight = {
  summary: string;
  first_date: string | null; // YYYY-MM-DD 형식
  last_date: string | null; // YYYY-MM-DD 형식
  frequency: number;
};

export type CoreInsight = {
  summary: string;
  explanation: string;
  frequency: number; // 등장 횟수
};

// ============================================
// 6. Execution Report (서버 스키마 기반)
// ============================================
export type ExecutionReport = {
  feedback_days_count: number;
  feedback_records_count: number;
  recurring_positives: string[]; // 최대 10개
  recurring_improvements: string[]; // 최대 10개
  habit_scores: HabitScores;
  core_feedbacks: CoreFeedback[];
  recurring_improvements_with_frequency: RecurringImprovementWithFrequency[];
  core_feedback_for_month: string;
  feedback_ai_comment: string | null;
};

export type HabitScores = {
  health: number; // 0-10
  health_reason: string;
  work: number; // 0-10
  work_reason: string;
  relationship: number; // 0-10
  relationship_reason: string;
  self_care: number; // 0-10
  self_care_reason: string;
};

export type CoreFeedback = {
  summary: string;
  frequency: number; // 최소 1
};

export type RecurringImprovementWithFrequency = {
  summary: string;
  frequency: number; // 최소 1
};

// ============================================
// 7. Closing Report (서버 스키마 기반)
// ============================================
export type ClosingReport = {
  monthly_title: string;
  monthly_summary: string;
  turning_points: string[]; // 최대 5개
  next_month_focus: string;
  ai_encouragement_message: string;
  // Pro 모드에서만 제공되는 정체성 분석
  this_month_identity?: {
    visualization?: {
      characteristics_radar: {
        type: "radar";
        data: Array<{
          characteristic: string;
          value: number;
        }>;
      };
    };
  };
};
