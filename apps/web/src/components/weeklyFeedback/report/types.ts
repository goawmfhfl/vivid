// Weekly Report Data Type (새로운 구조 반영)
import type {
  WeeklyOverview,
  DailyLifeReport,
  EmotionReport,
  VisionReport,
  InsightReport,
  ExecutionReport,
  ClosingReport,
} from "@/types/weekly-feedback";

export type WeeklyReportData = {
  // Header (Weekly Overview 통합)
  week_range: {
    start: string; // "2025.10.28"
    end: string; // "2025.11.03"
  };
  integrity_score: number; // 0-10
  weekly_overview: WeeklyOverview;
  
  // Daily Life Report
  daily_life_report: DailyLifeReport;
  
  // Emotion Report
  emotion_report: EmotionReport | null;
  
  // Vision Report
  vision_report: VisionReport;
  
  // Insight Report
  insight_report: InsightReport;
  
  // Execution Report
  execution_report: ExecutionReport;
  
  // Closing Report
  closing_report: ClosingReport;
  
  // 일별 정합도 점수 (API에서 추가)
  daily_integrity_scores?: Array<{
    date: string; // "2025.10.28"
    weekday: string; // "월요일"
    score: number; // 0-10
  }>;
};
