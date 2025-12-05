// Monthly Feedback 타입 정의

import {
  DailyLifeReport,
  SummaryReport,
  EmotionReport,
  InsightReport,
  ExecutionReport,
  VisionReport,
  ClosingReport,
} from "./weekly-feedback";

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
  insight_report: InsightReport;
  execution_report: ExecutionReport;
  vision_report: VisionReport;
  closing_report: ClosingReport;

  is_ai_generated?: boolean;
  created_at?: string;
};
