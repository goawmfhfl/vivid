import type { WeeklyVivid } from "@/types/weekly-vivid";

/**
 * 각 영역별로 데이터 존재 여부 체크 (2개 이상)
 */
export function validateSectionData(
  weeklyVividList: WeeklyVivid[],
  sectionName: keyof WeeklyVivid
): boolean {
  if (weeklyVividList.length < 2) {
    return false;
  }

  const validDataCount = weeklyVividList.filter((weeklyVivid) => {
    const sectionData = weeklyVivid[sectionName];
    // null이 아니고 undefined가 아닌 경우만 카운트
    return sectionData !== null && sectionData !== undefined;
  }).length;

  return validDataCount >= 2;
}

/**
 * 모든 영역별 데이터 존재 여부 체크
 */
export function validateAllSections(weeklyVividList: WeeklyVivid[]): {
  report: boolean;
} {
  return {
    report: validateSectionData(weeklyVividList, "report"),
  };
}
