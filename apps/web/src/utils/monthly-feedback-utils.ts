import type { MonthlyFeedback } from "@/types/monthly-feedback";

/**
 * 각 영역별로 데이터 존재 여부 체크
 * null이 아니고 undefined가 아닌 경우만 true 반환
 */
export function hasSectionData(
  data: MonthlyFeedback,
  sectionName: keyof MonthlyFeedback
): boolean {
  const sectionData = data[sectionName];
  return sectionData !== null && sectionData !== undefined;
}

/**
 * 모든 영역별 데이터 존재 여부 체크
 */
export function validateAllSectionsFrontend(data: MonthlyFeedback): {
  summary_report: boolean;
  daily_life_report: boolean;
  emotion_report: boolean;
  vision_report: boolean;
  insight_report: boolean;
  execution_report: boolean;
  closing_report: boolean;
} {
  return {
    summary_report: hasSectionData(data, "summary_report"),
    daily_life_report: hasSectionData(data, "daily_life_report"),
    emotion_report: hasSectionData(data, "emotion_report"),
    vision_report: hasSectionData(data, "vision_report"),
    insight_report: hasSectionData(data, "insight_report"),
    execution_report: hasSectionData(data, "execution_report"),
    closing_report: hasSectionData(data, "closing_report"),
  };
}
