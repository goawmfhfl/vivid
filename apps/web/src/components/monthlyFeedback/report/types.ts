import type {
  SummaryReport,
  DailyLifeReport,
  EmotionReport,
  VisionReport,
  InsightReport,
  ExecutionReport,
  ClosingReport,
} from "@/types/monthly-feedback-new";

// Monthly Report Data Type (UI용)
export type MonthlyReportData = {
  // 기본 정보
  month: string; // "YYYY-MM"
  month_label: string; // "2025년 11월"
  date_range: {
    start_date: string; // "2025.11.01"
    end_date: string; // "2025.11.30"
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
};
