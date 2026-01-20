export type Entry = {
  id: string;
  content: string;
  timestamp: Date;
};

export type DailyVivid = {
  date: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendation: string;
};

export type DailyVividPayload = {
  date: string; // "2025-10-21"
  lesson: string;
  keywords: string[]; // ["#몰입", "#자기효능감", "#루틴"]
  observation: string;
  insight: string;
  action_feedback: {
    well_done: string;
    to_improve: string;
  };
  focus_tomorrow: string;
  focus_score: number; // 0~10
  satisfaction_score: number; // 0~10
};

export type PeriodSummary = {
  id: string;
  period: string;
  type: "weekly" | "monthly";
  title: string;
  dateRange: string;
  keyInsights: string[];
  emotionalTrends: string;
  growthAreas: string[];
  highlights: string[];
  nextSteps: string;
  createdAt: Date;
  weekNumber?: number; // For weekly summaries
  monthNumber?: number; // For monthly summaries
  year?: number;
  // New fields for contextual analysis
  week?: string; // "2025-W43"
  week_start?: string; // "YYYY-MM-DD" - 주간 피드백의 주 시작일 (date 기반 라우팅용)
  month?: string; // "2025-10"
  summary?: string; // 주간/월간 전체 요약
  insight_core?: string; // 핵심 인사이트
  growth_area?: string; // 성장 영역
  dominant_keywords?: string[]; // ["루틴", "AI활용", "집중", "성찰"]
  pattern_summary?: string; // 행동 패턴 요약
  trend_changes?: string; // 트렌드 변화
  strengths?: string[]; // 강점 분석
  weaknesses?: string[]; // 약점 분석
  growth_direction?: string; // 성장 방향
  representative_sentence?: string; // 대표 문장
  // Monthly-specific fields
  keyword_trend?: {
    increased: string[];
    decreased: string[];
  };
  behavior_pattern?: string;
  growth_curve?: {
    focus_score_avg: number;
    satisfaction_trend: string | number;
    consistency: number;
  };
  insight_summary?: string;
  action_recommendation?: string[];
  weekly_refs?: Array<{ week: string; note?: string }>;
};
