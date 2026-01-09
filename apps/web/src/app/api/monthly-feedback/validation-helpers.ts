import type { WeeklyFeedback } from "@/types/weekly-feedback";

/**
 * 각 영역별로 데이터 존재 여부 체크 (2개 이상)
 */
export function validateSectionData(
  weeklyFeedbacks: WeeklyFeedback[],
  sectionName: keyof WeeklyFeedback
): boolean {
  if (weeklyFeedbacks.length < 2) {
    return false;
  }

  const validDataCount = weeklyFeedbacks.filter((feedback) => {
    const sectionData = feedback[sectionName];
    // null이 아니고 undefined가 아닌 경우만 카운트
    return sectionData !== null && sectionData !== undefined;
  }).length;

  return validDataCount >= 2;
}

/**
 * 모든 영역별 데이터 존재 여부 체크
 */
export function validateAllSections(weeklyFeedbacks: WeeklyFeedback[]): {
  vivid_report: boolean;
} {
  return {
    vivid_report: validateSectionData(weeklyFeedbacks, "vivid_report"),
  };
}
