// Weekly Report Data Type (새로운 구조 반영)
import type {
  SummaryReport,
  DailyLifeReport,
  EmotionReport,
  VividReport,
  InsightReport,
  ExecutionReport,
  ClosingReport,
} from "@/types/weekly-feedback";

export type WeeklyReportData = {
  // Header (Summary Report)
  week_range: {
    start: string; // "2025.10.28"
    end: string; // "2025.11.03"
  };
  summary_report: SummaryReport;

  // Daily Life Report
  daily_life_report: DailyLifeReport;

  // Emotion Report
  emotion_report: EmotionReport | null;

  // Vivid Report
  vivid_report: VividReport;

  // Insight Report
  insight_report: InsightReport;

  // Execution Report
  execution_report: ExecutionReport;

  // Closing Report
  closing_report: ClosingReport;
};
