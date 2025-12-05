// Monthly Feedback 타입 정의

import {
  DailyLifeReport,
  SummaryReport,
  EmotionReport,
  InsightReport as WeeklyInsightReport,
  ExecutionReport,
  VisionReport,
  ClosingReport,
} from "./monthly-feedback-new";

// 월간 피드백용 InsightReport 확장
// core_insights가 {summary, explanation} 객체 배열일 수 있음
export type MonthlyInsightReport = Omit<
  WeeklyInsightReport,
  "core_insights"
> & {
  core_insights: Array<
    | string
    | {
        summary: string;
        explanation: string;
      }
  >;
};

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
  summary_report: SummaryReport;
  daily_life_report: DailyLifeReport;
  emotion_report: EmotionReport;
  insight_report: MonthlyInsightReport;
  execution_report: ExecutionReport;
  vision_report: VisionReport;
  closing_report: ClosingReport;

  is_ai_generated?: boolean;
  created_at?: string;
};

/**
 * Monthly Feedback 리스트 아이템 타입 (가벼운 데이터만 포함)
 */
export type MonthlyFeedbackListItem = {
  id: string;
  month: string; // "YYYY-MM"
  month_label: string; // "2025년 11월"
  date_range: {
    start_date: string; // "YYYY-MM-DD"
    end_date: string; // "YYYY-MM-DD"
  };
  recorded_days: number;
  title: string; // summary_report.summary_title 또는 month_label
  monthly_score: number; // summary_report.monthly_score 또는 0
  is_ai_generated?: boolean;
  created_at?: string;
};
