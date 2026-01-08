// ============================================
// 주간 피드백 타입 정의 (새로운 구조)
// ============================================

export type WeekRange = {
  start: string; // "YYYY-MM-DD"
  end: string; // "YYYY-MM-DD"
  timezone: string; // "Asia/Seoul"
};

// ============================================
// Summary Report (주간 피드백 헤더)
// ============================================
export type SummaryReport = {
  title: string; // 이번 주의 제목 (예: "데이터 손실과 회복을 경험했던 한 주")
  summary: string; // 전체 요약 (일반: 250자, Pro: 500자) - Pro는 2/3 길이로 간결화
  key_points: string[]; // 핵심 포인트 (일반: 최대 5개, Pro: 최대 10개)
  trend_analysis: string | null; // 트렌드 분석 (Pro 전용) - 배열 구조로 변경
  // Pro 전용: 배열 구조로 재구성
  patterns_and_strengths?: string[]; // 패턴과 강점 배열
  mindset_and_tips?: string[]; // 마인드셋과 실천 팁 배열
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
    event_categories: Array<{
      category: string;
      count: number;
      examples: string[];
    }>;
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
    keyword_categories: Array<{
      category: string;
      keywords: string[];
      count: number;
    }>;
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
  // Pro 전용: 이번 주 루틴을 보아하니, 나는 이런 일상을 보낸 사람이었어요 - 5가지 특징
  daily_life_characteristics?: string[]; // Pro 전용, 5개
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
  date: string; // "YYYY-MM-DD" 형식
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
// Vivid Report (주간 비비드 분석)
// ============================================
export type VividReport = {
  // 1. 주간 비비드 요약
  weekly_vivid_summary: {
    summary: string; // 300자 내외
    key_points: Array<{
      point: string;
      dates: string[]; // ["2025-12-17", "2025-12-18"]
    }>;
    next_week_vision_key_points: string[];
  };

  // 2. 주간 비비드 평가
  weekly_vivid_evaluation: {
    daily_evaluation_trend: Array<{
      date: string;
      evaluation_score: number; // current_evaluation에서 추출한 점수
    }>;
    weekly_average_score: number;
    highest_day: {
      date: string;
      score: number;
      reason: string;
    };
    lowest_day: {
      date: string;
      score: number;
      reason: string;
    };
  };

  // 3. 주간 키워드 분석
  weekly_keywords_analysis: {
    vision_keywords_trend: Array<{
      keyword: string;
      days: number;
      context: string;
      related_keywords: string[];
    }>; // 기존 vision_keywords_trend와 동일한 구조, 최대 8개, 홀수 개수(4, 6, 8개)
    top_10_keywords: Array<{
      keyword: string;
      frequency: number;
      dates: string[];
    }>;
  };

  // 4. 앞으로의 모습 종합 분석
  future_vision_analysis: {
    integrated_summary: string;
    consistency_analysis: {
      consistent_themes: string[];
      changing_themes: string[];
      analysis: string;
    };
    evaluation_trend: Array<{
      date: string;
      evaluation_score: number; // future_evaluation에서 추출한 점수
    }>;
  };

  // 5. 일치도 트렌드 분석
  alignment_trend_analysis: {
    daily_alignment_scores: Array<{
      date: string;
      score: number;
    }>;
    average_alignment_score: number;
    highest_alignment_day: {
      date: string;
      score: number;
      pattern: string;
    };
    lowest_alignment_day: {
      date: string;
      score: number;
      pattern: string;
    };
    trend: "improving" | "declining" | "stable";
  };

  // 6. 사용자 특징 심화 분석
  user_characteristics_analysis: {
    consistency_summary: string;
    top_5_characteristics: Array<{
      characteristic: string;
      frequency: number;
      dates: string[];
    }>;
    change_patterns: {
      new_characteristics: Array<{
        characteristic: string;
        first_appeared: string;
      }>;
      disappeared_characteristics: Array<{
        characteristic: string;
        last_appeared: string;
      }>;
    };
  };

  // 7. 지향하는 모습 심화 분석
  aspired_traits_analysis: {
    consistency_summary: string;
    average_score: number;
    top_5_aspired_traits: Array<{
      trait: string;
      frequency: number;
      dates: string[];
    }>;
    evolution_process: {
      summary: string;
      stages: Array<{
        period: string;
        traits: string[];
        description: string;
      }>;
    };
  };

  // 8. 주간 인사이트
  weekly_insights: {
    patterns: Array<{
      pattern: string;
      description: string;
      evidence: string[];
    }>;
    unexpected_connections: Array<{
      connection: string;
      description: string;
      significance: string;
    }>;
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
    insight_categories: Array<{
      category: string;
      count: number;
      examples: string[];
      insight: string;
    }>;
    visualization?: {
      insight_categories_chart: {
        type: "pie";
        data: Array<{
          category: string;
          value: number;
          color: string;
        }>;
      };
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
  // growth_insights와 next_week_focus 분리
  growth_insights: {
    key_learnings: Array<{
      learning: string;
      evidence: string;
      implication: string;
    }>;
  };
  // 다음 주 포커스는 별도 필드로 분리
  next_week_focus: {
    focus_areas: Array<{
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
  ai_feedback_summary: string; // AI 종합 피드백 (가장 먼저 표시)
  feedback_patterns: {
    summary: string;
    positives_categories: Array<{
      category: string;
      count: number;
      examples: string[];
      insight: string;
    }>;
    improvements_categories: Array<{
      category: string;
      count: number;
      examples: string[];
      insight: string;
    }>;
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
  // core_feedback_themes 제거됨
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
    summary: string; // 설명을 더 명확하게 개선 필요
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
  // growth_insights는 InsightReport로 이동됨
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
    // identity_evolution 제거됨
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
  summary_report: SummaryReport;
  daily_life_report: DailyLifeReport;
  emotion_report: EmotionReport | null;
  vivid_report: VividReport;
  insight_report: InsightReport;
  execution_report: ExecutionReport;
  closing_report: ClosingReport;
  // 메타 정보
  is_ai_generated?: boolean;
  created_at?: string;
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
