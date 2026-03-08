import type { WeeklyCandidateWithFeedback } from "@/types/weekly-candidate";
import { getKSTDateString, getKSTDate } from "@/lib/date-utils";

/**
 * ============================================
 * 2. 주간 범위 계산 함수들 (일요일 ~ 토요일 기준)
 * ============================================
 */

/**
 * 기준 날짜가 속한 주의 일요일(주 시작일)을 계산 (KST 기준)
 *
 * 주간 범위: 일요일 ~ 토요일
 * 기준 요일: 일요일 (주의 시작)
 *
 * 예시:
 * - 입력: 2025-11-17 (월요일)
 * - 출력: 2025-11-16 (해당 주의 일요일)
 *
 * - 입력: 2025-11-20 (목요일)
 * - 출력: 2025-11-16 (해당 주의 일요일)
 *
 * - 입력: 2025-11-23 (일요일)
 * - 출력: 2025-11-23 (같은 일요일)
 */
export function getSundayOfWeek(referenceDate: Date): Date {
  const kstDate = getKSTDate(referenceDate);
  const dayOfWeek = kstDate.getDay(); // 0(일요일) ~ 6(토요일)

  // 일요일까지의 날짜 차이 (과거 방향): 일요일(0)=0, 월요일(1)=-1, ...
  const daysToSunday = dayOfWeek;

  const sunday = new Date(kstDate);
  sunday.setDate(kstDate.getDate() - daysToSunday);
  sunday.setHours(0, 0, 0, 0); // 일요일의 시작 (00:00:00)

  return sunday;
}

/**
 * 기준 날짜가 속한 주의 토요일(주 종료일)을 계산 (KST 기준)
 *
 * 예시:
 * - 입력: 2025-11-16 (일요일)
 * - 출력: 2025-11-22 (해당 주의 토요일)
 *
 * - 입력: 2025-11-20 (목요일)
 * - 출력: 2025-11-22 (해당 주의 토요일)
 */
export function getSaturdayOfWeek(referenceDate: Date): Date {
  const sunday = getSundayOfWeek(referenceDate);
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  saturday.setHours(23, 59, 59, 999); // 토요일의 끝 (23:59:59.999)
  return saturday;
}

/**
 * getSundayOfWeek의 alias (호환용)
 * 주의 시작일 = 일요일
 */
export const getMondayOfWeek = getSundayOfWeek;

/**
 * 주의 시작일(일요일)을 ISO 문자열로 반환 (YYYY-MM-DD, KST 기준)
 */
export function getWeekStartISO(referenceDate: Date): string {
  const sunday = getSundayOfWeek(referenceDate);
  const year = sunday.getFullYear();
  const month = String(sunday.getMonth() + 1).padStart(2, "0");
  const day = String(sunday.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 주의 종료일(토요일)을 ISO 문자열로 반환 (YYYY-MM-DD, KST 기준)
 */
export function getWeekEndISO(referenceDate: Date): string {
  const saturday = getSaturdayOfWeek(referenceDate);
  const year = saturday.getFullYear();
  const month = String(saturday.getMonth() + 1).padStart(2, "0");
  const day = String(saturday.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * ============================================
 * 3. 필터링 메인 로직
 * ============================================
 */

/**
 * 주간 피드백 생성 가능한 후보 필터링
 *
 * 📋 필터링 규칙:
 * 1. 토요일이 지난 주만 포함: 해당 주의 토요일이 현재 날짜(KST)보다 작거나 같아야 함
 *    ⏰ 일요일 00:00 KST가 되면 직전 주(토요일까지)가 생성 대상이 됨
 * 2. weekly_vivid_id가 null인 주만 포함 (아직 생성되지 않은 주)
 * 3. vivid-records가 있는 주만 포함 (record_count > 0)
 *
 * 📅 주간 범위: 일요일 ~ 토요일
 * 📌 기준 요일: 일요일 (주의 시작)
 * ⏰ 생성 시점: 토요일이 지난 후 (일요일 00:00부터 해당 주 생성 가능)
 * 🌏 시간대: KST (Asia/Seoul) 기준
 *
 * @param candidates 전체 후보 목록
 * @param referenceDate 기준 날짜 (기본값: 오늘, KST 기준)
 * @returns 필터링된 후보 목록 (최신순 정렬)
 */
export function filterWeeklyCandidatesForCreation(
  candidates: WeeklyCandidateWithFeedback[],
  referenceDate: Date = new Date()
): WeeklyCandidateWithFeedback[] {
  const currentKSTDateString = getKSTDateString(referenceDate);
  const filtered: WeeklyCandidateWithFeedback[] = [];

  for (const candidate of candidates) {
    if (candidate.weekly_vivid_id === null && candidate.record_count > 0) {
      // candidate.week_start는 일요일 (예: "2025-11-16")
      const weekStartDate = new Date(candidate.week_start + "T00:00:00+09:00");

      // 해당 주의 토요일(주 종료일) 계산
      const weekSaturday = getSaturdayOfWeek(weekStartDate);
      const weekSaturdayString = getKSTDateString(weekSaturday);

      // 토요일이 현재 날짜(KST)보다 작거나 같으면 포함 (주가 끝난 후 생성 가능)
      if (weekSaturdayString <= currentKSTDateString) {
        filtered.push(candidate);
      }
    }
  }

  return filtered.sort((a, b) => {
    return new Date(b.week_start).getTime() - new Date(a.week_start).getTime();
  });
}
