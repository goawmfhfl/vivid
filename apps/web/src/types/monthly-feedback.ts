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

  // 섹션들
  summary_overview: SummaryOverview;
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
  main_themes: string[]; // 최대 7개
  main_themes_reason: string; // 주요 테마를 7개 이하로 정한 이유
  integrity_trend: "상승" | "하락" | "유지" | "불규칙" | null;
  record_coverage_rate: number; // 0-1
  integrity_average: number; // 0-10
  life_balance_score: number; // 0-10
  life_balance_reason: string; // 점수가 나온 이유 (데이터 출처 기반)
  life_balance_feedback: string; // 생활 밸런스에 대한 피드백
  execution_score: number; // 0-10
  execution_reason: string; // 점수가 나온 이유 (데이터 출처 기반)
  execution_feedback: string; // 실행력에 대한 피드백
  rest_score: number; // 0-10
  rest_reason: string; // 점수가 나온 이유 (데이터 출처 기반)
  rest_feedback: string; // 휴식/회복에 대한 피드백
  relationship_score: number; // 0-10
  relationship_reason: string; // 점수가 나온 이유 (데이터 출처 기반)
  relationship_feedback: string; // 관계/소통에 대한 피드백
  summary_ai_comment: string | null;
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
  emotion_quadrant_distribution: EmotionQuadrantDistribution[]; // 반드시 4개 포함
  emotion_quadrant_analysis_summary: string; // 4개 사분면 분포 종합 분석 피드백
  emotion_pattern_summary: string | null;
  positive_triggers: string[]; // 최대 10개
  negative_triggers: string[]; // 최대 10개
  emotion_stability_score: number; // 0-10
  emotion_stability_explanation: string; // 감정 안정성 점수가 의미하는 바에 대한 설명
  emotion_stability_score_reason: string; // 왜 그 점수인지 월간 데이터 분석 기반 설명
  emotion_stability_praise: string | null; // 점수가 7점 이상인 경우 칭찬 메시지
  emotion_stability_guidelines: string[]; // 감정 안정성 점수를 더 높이기 위한 가이드라인 (최대 5개)
  emotion_stability_actions: string[]; // 감정 안정성 점수를 높이기 위한 행동 제안 (최대 5개, 하위 호환성)
  emotion_ai_comment: string | null;
};

export type EmotionQuadrantDistribution = {
  quadrant: "몰입·설렘" | "불안·초조" | "슬픔·무기력" | "안도·평온";
  count: number;
  ratio: number; // 0-1
  explanation: string; // 해당 사분면이 이 비율을 차지하는 이유에 대한 설명
};

export type InsightOverview = {
  insight_days_count: number;
  insight_records_count: number;
  top_insights: TopInsight[]; // 최대 20개
  core_insights: CoreInsight[]; // 최대 3개
  insight_ai_comment: string | null;
  insight_comprehensive_summary: string | null; // 종합 인사이트 분석
};

export type TopInsight = {
  summary: string;
  first_date: string | null; // "YYYY-MM-DD"
  last_date: string | null; // "YYYY-MM-DD"
  frequency: number;
};

export type CoreInsight = {
  summary: string;
  explanation: string; // 이 인사이트가 핵심인 이유 설명
};

export type FeedbackOverview = {
  feedback_days_count: number;
  feedback_records_count: number;
  recurring_positives: string[]; // 최대 10개
  recurring_improvements: string[]; // 최대 10개 (하위 호환성)
  habit_scores: HabitScores;
  core_feedbacks: CoreFeedback[]; // 최대 5개
  recurring_improvements_with_frequency: RecurringImprovement[]; // 최대 10개
  core_feedback_for_month: string;
  feedback_ai_comment: string | null;
};

export type HabitScores = {
  health: number; // 0-10
  health_reason: string; // 건강 점수가 나온 이유
  work: number; // 0-10
  work_reason: string; // 일/학습 점수가 나온 이유
  relationship: number; // 0-10
  relationship_reason: string; // 관계 점수가 나온 이유
  self_care: number; // 0-10
  self_care_reason: string; // 자기 돌봄 점수가 나온 이유
};

export type CoreFeedback = {
  summary: string;
  frequency: number; // 등장 횟수
};

export type RecurringImprovement = {
  summary: string;
  frequency: number; // 등장 횟수
};

export type VisionOverview = {
  vision_days_count: number;
  vision_records_count: number;
  vision_consistency_score: number; // 0-10
  main_visions: MainVision[];
  core_visions: MainVision[]; // 최대 7개
  vision_progress_comment: string | null;
  vision_ai_feedbacks: string[]; // 최대 5개
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
  recorded_days?: number;
  is_ai_generated?: boolean;
  created_at?: string;
};

// AI 응답 래퍼 타입
export interface MonthlyFeedbackResponse {
  monthly_feedback: MonthlyFeedback;
}
