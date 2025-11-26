import type {
  SummaryOverview,
  EmotionOverview,
  InsightOverview,
  FeedbackOverview,
  VisionOverview,
  ConclusionOverview,
} from "@/types/monthly-feedback";

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
  record_coverage_rate: number;
  integrity_average: number;

  // 섹션들
  summary_overview: SummaryOverview;
  emotion_overview: EmotionOverview;
  insight_overview: InsightOverview;
  feedback_overview: FeedbackOverview;
  vision_overview: VisionOverview;
  conclusion_overview: ConclusionOverview;
};
