// ============================================
// 주간 피드백 타입 정의 (새로운 구조)
// ============================================

export type WeekRange = {
  start: string; // "YYYY-MM-DD"
  end: string; // "YYYY-MM-DD"
  timezone: string; // "Asia/Seoul"
};

// ============================================
// Weekly Overview (Header에 통합)
// ============================================
export type WeeklyOverview = {
  title: string;
  narrative: string;
  top_keywords: string[]; // 최대 10개
  repeated_themes: Array<{
    theme: string;
    count: number;
  }>;
  ai_overall_comment: string;
};

// ============================================
// Daily Life Report
// ============================================
export type DailyLifeReport = {
  summary: string;
  daily_summaries_trend: {
    overall_narrative: string;
    key_highlights: string[];
  };
  events_pattern: {
    most_frequent_events: Array<{
      event: string;
      frequency: number;
      days: string[]; // "YYYY-MM-DD"
      context: string;
    }>;
    event_categories: {
      work?: {
        count: number;
        examples: string[];
      };
      self_care?: {
        count: number;
        examples: string[];
      };
      social?: {
        count: number;
        examples: string[];
      };
      [key: string]:
        | {
            count: number;
            examples: string[];
          }
        | undefined;
    };
    timing_patterns: Array<{
      time_range: string;
      common_events: string[];
      pattern_description: string;
    }>;
  };
  emotion_triggers_analysis: {
    summary: string;
    category_distribution: {
      self: {
        count: number;
        percentage: number;
        top_triggers: string[];
        insight: string | null;
      };
      work: {
        count: number;
        percentage: number;
        top_triggers: string[];
        insight: string | null;
      };
      people: {
        count: number;
        percentage: number;
        top_triggers: string[];
        insight: string | null;
      };
      environment: {
        count: number;
        percentage: number;
        top_triggers: string[];
        insight: string | null;
      };
    };
    visualization?: {
      category_chart: {
        type: "pie";
        data: Array<{
          category: string;
          value: number;
          color: string;
        }>;
      };
      daily_triggers_timeline: Array<{
        date: string;
        weekday: string;
        triggers: {
          self: number;
          work: number;
          people: number;
          environment: number;
        };
      }>;
    };
  };
  behavioral_patterns: {
    summary: string;
    pattern_distribution: {
      planned: {
        count: number;
        percentage: number;
        examples: string[];
        insight: string | null;
      };
      impulsive: {
        count: number;
        percentage: number;
        examples: string[];
        insight: string | null;
      };
      routine_attempt: {
        count: number;
        percentage: number;
        examples: string[];
        insight: string | null;
      };
      avoidance: {
        count: number;
        percentage: number;
        examples: string[];
        insight: string | null;
      };
      routine_failure: {
        count: number;
        percentage: number;
        examples: string[];
        insight: string | null;
      };
    };
    visualization?: {
      behavior_chart: {
        type: "bar";
        data: Array<{
          behavior: string;
          count: number;
          percentage: number;
        }>;
      };
    };
    behavior_emotion_correlation: Array<{
      behavior: string;
      associated_emotions: string[];
      insight: string;
    }>;
  };
  keywords_analysis: {
    top_keywords: Array<{
      keyword: string;
      frequency: number;
      days: string[];
      context: string;
      sentiment: "positive" | "negative" | "neutral";
    }>;
    keyword_categories: {
      stress?: {
        keywords: string[];
        count: number;
      };
      resilience?: {
        keywords: string[];
        count: number;
      };
      self_care?: {
        keywords: string[];
        count: number;
      };
      [key: string]:
        | {
            keywords: string[];
            count: number;
          }
        | undefined;
    };
    visualization?: {
      word_cloud: {
        keywords: Array<{
          text: string;
          size: number;
          color: string;
        }>;
      };
      keyword_timeline: Array<{
        date: string;
        keywords: string[];
      }>;
    };
  };
  ai_comments_insights: {
    common_themes: Array<{
      theme: string;
      frequency: number;
      examples: string[];
      insight: string;
    }>;
    actionable_advice_summary: string;
    visualization?: {
      advice_categories: Array<{
        category: string;
        count: number;
        examples: string[];
      }>;
    };
  };
  daily_rhythm: {
    summary: string;
    time_patterns: Array<{
      time_period: string;
      common_activities: string[];
      typical_emotions: string[];
      pattern_description: string;
    }>;
    visualization?: {
      daily_flow_chart: {
        type: "timeline";
        data: Array<{
          time: string;
          activity: string;
          intensity: "low" | "medium" | "high";
        }>;
      };
    };
  };
  growth_insights: {
    resilience_patterns: Array<{
      pattern: string;
      evidence: string[];
      insight: string;
    }>;
    improvement_opportunities: Array<{
      area: string;
      suggestion: string;
      priority: "low" | "medium" | "high";
    }>;
    strengths_highlighted: string[];
  };
  next_week_suggestions: {
    focus_areas: Array<{
      area: string;
      reason: string;
      suggested_actions: string[];
    }>;
    maintain_strengths: string[];
  };
};

// ============================================
// Emotion Report
// ============================================
export type DailyEmotion = {
  date: string; // "11/24월" 형식
  weekday: string; // "일요일", "월요일" 등
  ai_mood_valence: number | null;
  ai_mood_arousal: number | null;
  dominant_emotion: string | null;
};

export type EmotionReport = {
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

// ============================================
// Vision Report
// ============================================
export type VisionReport = {
  vision_summary: string;
  vision_consistency: {
    summary: string;
    core_theme: string;
    evolution: string;
  };
  vision_keywords_trend: Array<{
    keyword: string;
    days: number;
    context: string;
    related_keywords: string[];
  }>;
  goals_pattern: {
    summary: string;
    goal_categories: {
      daily_routine?: {
        count: number;
        examples: string[];
        insight: string;
      };
      product_development?: {
        count: number;
        examples: string[];
        insight: string;
      };
      business_setup?: {
        count: number;
        examples: string[];
        insight: string;
      };
      [key: string]:
        | {
            count: number;
            examples: string[];
            insight: string;
          }
        | undefined;
    };
    visualization?: {
      goal_categories_chart: {
        type: "pie";
        data: Array<{
          category: string;
          value: number;
          color: string;
        }>;
      };
    };
  };
  self_vision_alignment: {
    summary: string;
    key_traits: Array<{
      trait: string;
      evidence: string;
      frequency: number;
    }>;
    visualization?: {
      trait_frequency: {
        type: "bar";
        data: Array<{
          trait: string;
          count: number;
        }>;
      };
    };
  };
  dreamer_traits_evolution: {
    summary: string;
    common_traits: Array<{
      trait: string;
      frequency: number;
      insight: string;
    }>;
    visualization?: {
      trait_word_cloud: {
        traits: Array<{
          text: string;
          size: number;
          color: string;
        }>;
      };
    };
  };
  ai_feedback_patterns?: {
    summary: string;
    common_themes: Array<{
      theme: string;
      frequency: number;
      example: string;
      insight: string;
    }>;
  };
  vision_action_alignment?: {
    summary: string;
    alignment_score: {
      value: number;
      description: string;
    };
    gaps: string[];
    strengths: string[];
  };
  next_week_vision_focus: {
    focus_areas: Array<{
      area: string;
      reason: string;
      suggested_action: string;
    }>;
    maintain_momentum: string[];
  };
};

// ============================================
// Insight Report
// ============================================
export type InsightReport = {
  core_insights: string[]; // 3-7개
  meta_questions_highlight: string[]; // 2-7개
  repeated_themes: Array<{
    theme: string;
    count: number;
  }>;
  insight_patterns: {
    summary: string;
    insight_categories: {
      strength_discovery?: {
        count: number;
        examples: string[];
        insight: string;
      };
      growth_mindset?: {
        count: number;
        examples: string[];
        insight: string;
      };
      [key: string]:
        | {
            count: number;
            examples: string[];
            insight: string;
          }
        | undefined;
    };
    visualization?: {
      insight_categories_chart: {
        type: "pie";
        data: Array<{
          category: string;
          value: number;
          color: string;
        }>;
      };
      insight_timeline: Array<{
        date: string;
        insights_count: number;
        main_theme: string;
      }>;
    };
    key_strengths_identified: Array<{
      strength: string;
      frequency: number;
      evidence: string[];
      insight: string;
    }>;
  };
  meta_questions_analysis: {
    summary: string;
    question_themes: Array<{
      theme: string;
      example: string;
      frequency: number;
      insight: string;
    }>;
    visualization?: {
      question_themes_chart: {
        type: "bar";
        data: Array<{
          theme: string;
          count: number;
        }>;
      };
    };
  };
  ai_comment_patterns: {
    summary: string;
    common_themes: Array<{
      theme: string;
      frequency: number;
      example: string;
      insight: string;
    }>;
  };
  action_patterns: {
    summary: string;
    difficulty_distribution: {
      낮음: {
        count: number;
        percentage: number;
        examples: string[];
        insight: string | null;
      };
      보통: {
        count: number;
        percentage: number;
        examples: string[];
        insight: string | null;
      };
      높음: {
        count: number;
        percentage: number;
        examples: string[];
        insight: string | null;
      };
    };
    time_commitment: {
      average_minutes: number;
      range: string;
      insight: string;
    };
    visualization?: {
      difficulty_chart: {
        type: "bar";
        data: Array<{
          difficulty: string;
          count: number;
          color: string;
        }>;
      };
    };
  };
  insight_action_alignment: {
    summary: string;
    alignment_score: {
      value: number;
      description: string;
    };
    strong_connections: Array<{
      insight: string;
      action: string;
      connection: string;
    }>;
  };
  growth_insights: {
    key_learnings: Array<{
      learning: string;
      evidence: string;
      implication: string;
    }>;
    next_week_focus: Array<{
      area: string;
      reason: string;
      suggested_action: string;
    }>;
  };
};

// ============================================
// Execution Report (Feedback)
// ============================================
export type ExecutionReport = {
  positives_top3: string[];
  improvements_top3: string[];
  ai_feedback_summary: string;
  feedback_patterns: {
    summary: string;
    positives_categories: {
      self_awareness?: {
        count: number;
        examples: string[];
        insight: string;
      };
      problem_solving?: {
        count: number;
        examples: string[];
        insight: string;
      };
      focus_and_execution?: {
        count: number;
        examples: string[];
        insight: string;
      };
      [key: string]:
        | {
            count: number;
            examples: string[];
            insight: string;
          }
        | undefined;
    };
    improvements_categories: {
      planning_structure?: {
        count: number;
        examples: string[];
        insight: string;
      };
      understanding_depth?: {
        count: number;
        examples: string[];
        insight: string;
      };
      execution_systems?: {
        count: number;
        examples: string[];
        insight: string;
      };
      [key: string]:
        | {
            count: number;
            examples: string[];
            insight: string;
          }
        | undefined;
    };
    visualization?: {
      positives_categories_chart: {
        type: "pie";
        data: Array<{
          category: string;
          value: number;
          color: string;
        }>;
      };
      improvements_categories_chart: {
        type: "bar";
        data: Array<{
          category: string;
          count: number;
          color: string;
        }>;
      };
    };
  };
  person_traits_analysis: {
    summary: string;
    key_traits: Array<{
      trait: string;
      frequency: number;
      evidence: string[];
      insight: string;
    }>;
    visualization?: {
      traits_word_cloud: {
        traits: Array<{
          text: string;
          size: number;
          color: string;
        }>;
      };
    };
  };
  core_feedback_themes: {
    summary: string;
    main_themes: Array<{
      theme: string;
      frequency: number;
      evidence: string[];
      insight: string;
    }>;
    visualization?: {
      themes_timeline: Array<{
        date: string;
        themes: string[];
      }>;
    };
  };
  ai_message_patterns: {
    summary: string;
    common_themes: Array<{
      theme: string;
      frequency: number;
      example: string;
      insight: string;
    }>;
  };
  improvement_action_alignment: {
    summary: string;
    alignment_score: {
      value: number;
      description: string;
    };
    strong_connections: Array<{
      feedback_theme: string;
      improvement: string;
      connection: string;
    }>;
  };
  growth_insights: {
    key_learnings: Array<{
      learning: string;
      evidence: string;
      implication: string;
    }>;
    next_week_focus: Array<{
      area: string;
      reason: string;
      suggested_action: string;
    }>;
  };
};

// ============================================
// Closing Report
// ============================================
export type ClosingReport = {
  call_to_action: {
    weekly_one_liner: string;
    next_week_objective: string;
    actions: string[]; // 3-5개
  };
  this_week_identity: {
    summary: string;
    core_characteristics: Array<{
      characteristic: string;
      description: string;
      evidence: string[];
      frequency: number;
    }>;
    growth_story: {
      summary: string;
      narrative: string;
    };
    strengths_highlighted: {
      summary: string;
      top_strengths: Array<{
        strength: string;
        description: string;
        impact: string;
      }>;
    };
    areas_of_awareness: {
      summary: string;
      key_areas: Array<{
        area: string;
        description: string;
        action_taken: string;
      }>;
    };
    identity_evolution: {
      summary: string;
      evolution: string;
    };
    visualization?: {
      characteristics_radar: {
        type: "radar";
        data: Array<{
          characteristic: string;
          value: number;
        }>;
      };
      growth_journey: {
        type: "timeline";
        data: Array<{
          phase: string;
          description: string;
          response: string;
        }>;
      };
    };
  };
  next_week_identity_intention: {
    summary: string;
    intention: string;
    focus_areas: Array<{
      area: string;
      reason: string;
      identity_shift: string;
    }>;
  };
};

// ============================================
// Weekly Feedback (메인 타입)
// ============================================
export type WeeklyFeedback = {
  id?: string;
  week_range: WeekRange;
  integrity_score: number; // 0-10, 평균값만
  weekly_overview: WeeklyOverview;
  daily_life_report: DailyLifeReport;
  emotion_report: EmotionReport | null;
  vision_report: VisionReport;
  insight_report: InsightReport;
  execution_report: ExecutionReport;
  closing_report: ClosingReport;
  // 메타 정보
  is_ai_generated?: boolean;
  created_at?: string;
  // 일별 정합도 점수 (API에서 추가)
  daily_integrity_scores?: Array<{
    date: string; // "YYYY.MM.DD"
    weekday: string; // "월요일"
    score: number; // 0-10
  }>;
};

// ============================================
// 리스트용 가벼운 타입
// ============================================
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

// ============================================
// API 요청 타입
// ============================================
export type WeeklyFeedbackGenerateRequest = {
  start: string; // "YYYY-MM-DD"
  end: string; // "YYYY-MM-DD"
  timezone?: string; // default "Asia/Seoul"
};
