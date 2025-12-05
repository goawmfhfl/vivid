import type { WeeklyFeedback } from "@/types/weekly-feedback";
import type { MonthlyFeedback } from "@/types/monthly-feedback";
import type {
  SummaryReport,
  DailyLifeReport,
  EmotionReport,
  VisionReport,
  InsightReport,
  ExecutionReport,
  ClosingReport,
} from "@/types/weekly-feedback";

/**
 * 진행 상황 콜백 타입
 */
type ProgressCallback = (
  step: number,
  total: number,
  sectionName: string
) => void;

/**
 * Weekly Feedback 배열을 기반으로 월간 피드백 생성 (스트리밍 진행 상황 포함)
 *
 * 7개 영역을 병렬로 생성 (Promise.all 사용)
 */
export async function generateMonthlyFeedbackFromWeeklyWithProgress(
  weeklyFeedbacks: WeeklyFeedback[],
  month: string,
  dateRange: { start_date: string; end_date: string },
  isPro: boolean,
  progressCallback?: ProgressCallback
): Promise<MonthlyFeedback> {
  const [year, monthNum] = month.split("-");
  const monthLabel = `${year}년 ${monthNum}월`;

  // 총 일수 계산
  const startDate = new Date(dateRange.start_date);
  const endDate = new Date(dateRange.end_date);
  const totalDays =
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

  // 7개 영역을 병렬로 생성
  const [
    summaryReport,
    dailyLifeReport,
    emotionReport,
    visionReport,
    insightReport,
    executionReport,
    closingReport,
  ] = await Promise.all([
    generateSummaryReport(weeklyFeedbacks, month, isPro, progressCallback, 1),
    generateDailyLifeReport(weeklyFeedbacks, month, isPro, progressCallback, 2),
    generateEmotionReport(weeklyFeedbacks, month, isPro, progressCallback, 3),
    generateVisionReport(weeklyFeedbacks, month, isPro, progressCallback, 4),
    generateInsightReport(weeklyFeedbacks, month, isPro, progressCallback, 5),
    generateExecutionReport(weeklyFeedbacks, month, isPro, progressCallback, 6),
    generateClosingReport(weeklyFeedbacks, month, isPro, progressCallback, 7),
  ]);

  const monthlyFeedback: MonthlyFeedback = {
    month,
    month_label: monthLabel,
    date_range: dateRange,
    total_days: totalDays,
    recorded_days: weeklyFeedbacks.length,
    summary_report: summaryReport,
    daily_life_report: dailyLifeReport,
    emotion_report: emotionReport,
    vision_report: visionReport,
    insight_report: insightReport,
    execution_report: executionReport,
    closing_report: closingReport,
    is_ai_generated: true,
  };

  return monthlyFeedback;
}

/**
 * 1. Summary Report 생성
 */
async function generateSummaryReport(
  weeklyFeedbacks: WeeklyFeedback[],
  month: string,
  isPro: boolean,
  progressCallback?: ProgressCallback,
  step: number = 1
): Promise<SummaryReport> {
  if (progressCallback) {
    progressCallback(step, 7, "summary_report");
  }

  // TODO: AI 생성 로직 구현 필요
  // 주간 summary_report들을 종합하여 월간 summary_report 생성

  // 임시 구조 반환
  return {
    monthly_summary: "",
    key_themes: [],
    monthly_scores: {
      overall_score: 0,
      consistency_score: 0,
      growth_score: 0,
      self_awareness_score: 0,
      emotional_stability_score: 0,
      execution_score: 0,
      vision_clarity_score: 0,
    },
    weekly_scores_trend: [],
    visualization: {
      scores_radar_chart: {
        type: "radar",
        data: [],
      },
      weekly_trend_line: {
        type: "line",
        data: [],
        keys: [],
      },
      growth_timeline: {
        type: "timeline",
        data: [],
      },
    },
  };
}

/**
 * 2. Daily Life Report 생성
 */
async function generateDailyLifeReport(
  weeklyFeedbacks: WeeklyFeedback[],
  month: string,
  isPro: boolean,
  progressCallback?: ProgressCallback,
  step: number = 2
): Promise<DailyLifeReport> {
  if (progressCallback) {
    progressCallback(step, 7, "daily_life_report");
  }

  // TODO: AI 생성 로직 구현 필요
  // 주간 daily_life_report들을 종합하여 월간 daily_life_report 생성

  return {
    summary: "",
    daily_patterns: {
      most_frequent_events: [],
      behavioral_patterns: {
        avoidance: {
          frequency: 0,
          common_triggers: [],
          typical_behaviors: [],
          week_trend: [],
        },
        routine_attempt: {
          frequency: 0,
          success_rate: 0,
          most_successful: [],
          least_successful: [],
          week_trend: [],
        },
        planned_actions: {
          frequency: 0,
          avg_emotion_score: 0,
          examples: [],
          week_trend: [],
        },
      },
      keyword_evolution: [],
      emotion_triggers_summary: {
        summary: "",
        category_distribution: {
          self: {
            count: 0,
            percentage: 0,
            top_triggers: [],
            insight: "",
          },
          work: {
            count: 0,
            percentage: 0,
            top_triggers: [],
            insight: "",
          },
          people: {
            count: 0,
            percentage: 0,
            top_triggers: [],
            insight: "",
          },
          environment: {
            count: 0,
            percentage: 0,
            top_triggers: [],
            insight: "",
          },
        },
        week_evolution: [],
      },
    },
    visualization: {
      event_frequency_bar: {
        type: "bar",
        data: [],
      },
      behavior_pattern_radar: {
        type: "radar",
        data: [],
      },
      keyword_timeline: {
        type: "line",
        data: [],
      },
      routine_success_rate_area: {
        type: "area",
        data: [],
      },
      emotion_triggers_pie: {
        type: "pie",
        data: [],
      },
      emotion_triggers_weekly_line: {
        type: "line",
        data: [],
        keys: [],
      },
    },
  };
}

/**
 * 3. Emotion Report 생성
 */
async function generateEmotionReport(
  weeklyFeedbacks: WeeklyFeedback[],
  month: string,
  isPro: boolean,
  progressCallback?: ProgressCallback,
  step: number = 3
): Promise<EmotionReport> {
  if (progressCallback) {
    progressCallback(step, 7, "emotion_report");
  }

  // TODO: AI 생성 로직 구현 필요
  // 주간 emotion_report들을 종합하여 월간 emotion_report 생성

  return {
    summary: "",
    monthly_emotion_overview: {
      dominant_quadrant: "안도·평온",
      quadrant_distribution: {
        "몰입·설렘": 0,
        "불안·초조": 0,
        "슬픔·무기력": 0,
        "안도·평온": 0,
      },
      avg_valence: 0,
      avg_arousal: 0,
      emotion_stability_score: 0,
      most_frequent_emotions: [],
      emotion_triggers: {
        anxious_triggers: [],
        calm_triggers: [],
        engaged_triggers: [],
      },
    },
    weekly_emotion_evolution: [],
    emotion_pattern_changes: {
      valence_trend: "유지",
      arousal_trend: "유지",
      stability_trend: "유지",
      key_insights: [],
      pattern_summary: "",
    },
    visualization: {
      emotion_quadrant_pie: {
        type: "pie",
        data: [],
      },
      emotion_timeline_scatter: {
        type: "scatter",
        data: [],
      },
      weekly_emotion_radar: {
        type: "radar",
        data: [],
      },
      trigger_impact_bar: {
        type: "bar",
        data: [],
      },
      weekly_quadrant_trend: {
        type: "line",
        data: [],
        keys: [],
      },
    },
  };
}

/**
 * 4. Vision Report 생성
 */
async function generateVisionReport(
  weeklyFeedbacks: WeeklyFeedback[],
  month: string,
  isPro: boolean,
  progressCallback?: ProgressCallback,
  step: number = 4
): Promise<VisionReport> {
  if (progressCallback) {
    progressCallback(step, 7, "vision_report");
  }

  // TODO: AI 생성 로직 구현 필요
  // 주간 vision_report들을 종합하여 월간 vision_report 생성

  return {
    summary: "",
    vision_consistency: {
      core_theme: "",
      consistency_score: 0,
      theme_evolution: [],
      vision_keywords_trend: [],
      goal_categories: [],
      dreamer_traits: [],
    },
    vision_action_alignment: {
      summary: "",
      alignment_score: {
        value: 0,
        description: "",
      },
      strong_alignments: [],
      gaps: [],
    },
    visualization: {
      vision_keywords_timeline: {
        type: "line",
        data: [],
      },
      goal_progress_gauge: {
        type: "gauge",
        data: [],
      },
      dreamer_traits_bar: {
        type: "bar",
        data: [],
      },
      vision_consistency_timeline: {
        type: "timeline",
        data: [],
      },
      goal_categories_pie: {
        type: "pie",
        data: [],
      },
    },
  };
}

/**
 * 5. Insight Report 생성
 */
async function generateInsightReport(
  weeklyFeedbacks: WeeklyFeedback[],
  month: string,
  isPro: boolean,
  progressCallback?: ProgressCallback,
  step: number = 5
): Promise<InsightReport> {
  if (progressCallback) {
    progressCallback(step, 7, "insight_report");
  }

  // TODO: AI 생성 로직 구현 필요
  // 주간 insight_report들을 종합하여 월간 insight_report 생성

  return {
    summary: "",
    core_insights: [],
    insight_categories: [],
    meta_questions_evolution: [],
    insight_action_alignment: {
      summary: "",
      alignment_score: {
        value: 0,
        description: "",
      },
      strong_connections: [],
      weak_connections: [],
    },
    repeated_themes: [],
    visualization: {
      insight_categories_pie: {
        type: "pie",
        data: [],
      },
      insight_impact_bar: {
        type: "bar",
        data: [],
      },
      meta_questions_timeline: {
        type: "line",
        data: [],
      },
      insight_frequency_wordcloud: {
        type: "wordcloud",
        data: [],
      },
      insight_categories_weekly_area: {
        type: "area",
        data: [],
        keys: [],
      },
    },
  };
}

/**
 * 6. Execution Report 생성
 */
async function generateExecutionReport(
  weeklyFeedbacks: WeeklyFeedback[],
  month: string,
  isPro: boolean,
  progressCallback?: ProgressCallback,
  step: number = 6
): Promise<ExecutionReport> {
  if (progressCallback) {
    progressCallback(step, 7, "execution_report");
  }

  // TODO: AI 생성 로직 구현 필요
  // 주간 execution_report들을 종합하여 월간 execution_report 생성

  return {
    summary: "",
    feedback_patterns: {
      positives_count: 0,
      improvements_count: 0,
      execution_rate: 0,
      positives_trend: [],
      improvements_trend: [],
      feedback_categories: [],
      person_traits: [],
      improvement_alignment_score: 0,
    },
    core_feedback_themes: [],
    improvement_action_alignment: {
      summary: "",
      alignment_score: {
        value: 0,
        description: "",
      },
      strong_connections: [],
      weak_connections: [],
    },
    visualization: {
      feedback_trend_line: {
        type: "line",
        data: [],
      },
      feedback_categories_bar: {
        type: "bar",
        data: [],
      },
      execution_rate_gauge: {
        type: "gauge",
        data: {
          value: 0,
          target: 1,
          label: "실행률",
        },
      },
      person_traits_wordcloud: {
        type: "wordcloud",
        data: [],
      },
      positives_improvements_pie: {
        type: "pie",
        data: [],
      },
    },
  };
}

/**
 * 7. Closing Report 생성
 */
async function generateClosingReport(
  weeklyFeedbacks: WeeklyFeedback[],
  month: string,
  isPro: boolean,
  progressCallback?: ProgressCallback,
  step: number = 7
): Promise<ClosingReport> {
  if (progressCallback) {
    progressCallback(step, 7, "closing_report");
  }

  // TODO: AI 생성 로직 구현 필요
  // 주간 closing_report들을 종합하여 월간 closing_report 생성

  return {
    monthly_one_liner: "",
    this_month_identity: {
      core_identity: "",
      identity_evolution: [],
      key_characteristics: [],
      strengths_highlight: [],
      areas_of_awareness: [],
      growth_journey: [],
    },
    next_month_intention: {
      summary: "",
      intention: "",
      focus_areas: [],
    },
    visualization: {
      characteristics_radar: {
        type: "radar",
        data: [],
      },
      growth_journey: {
        type: "timeline",
        data: [],
      },
      characteristics_growth_line: {
        type: "line",
        data: [],
      },
    },
  };
}
