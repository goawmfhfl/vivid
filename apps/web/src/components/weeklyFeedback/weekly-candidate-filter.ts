import type { WeeklyCandidateWithFeedback } from "@/types/weekly-candidate";
import { getKSTDateString, getKSTDate } from "@/lib/date-utils";

/**
 * ============================================
 * 2. 주간 범위 계산 함수들
 * ============================================
 */

/**
 * 기준 날짜가 속한 주의 일요일을 계산 (KST 기준)
 *
 * 주간 범위: 월요일 ~ 일요일
 * 기준 요일: 일요일
 *
 * 예시:
 * - 입력: 2025-11-17 (월요일)
 * - 출력: 2025-11-23 (일요일)
 *
 * - 입력: 2025-11-20 (목요일)
 * - 출력: 2025-11-23 (일요일)
 *
 * - 입력: 2025-11-23 (일요일)
 * - 출력: 2025-11-23 (같은 일요일)
 */
export function getSundayOfWeek(referenceDate: Date): Date {
  // KST 기준으로 날짜 변환
  const kstDate = getKSTDate(referenceDate);
  const dayOfWeek = kstDate.getDay(); // 0(일요일) ~ 6(토요일)

  // 일요일까지의 날짜 차이 계산
  // 예: 월요일(1) → 일요일까지 6일, 화요일(2) → 일요일까지 5일
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

  const sunday = new Date(kstDate);
  sunday.setDate(kstDate.getDate() + daysUntilSunday);
  sunday.setHours(23, 59, 59, 999); // 일요일의 끝 (23:59:59.999)

  return sunday;
}

/**
 * 기준 날짜가 속한 주의 월요일(주 시작일)을 계산 (KST 기준)
 *
 * 예시:
 * - 입력: 2025-11-17 (월요일)
 * - 출력: 2025-11-17 (같은 월요일)
 *
 * - 입력: 2025-11-20 (목요일)
 * - 출력: 2025-11-17 (해당 주의 월요일)
 *
 * - 입력: 2025-11-23 (일요일)
 * - 출력: 2025-11-17 (해당 주의 월요일)
 */
export function getMondayOfWeek(referenceDate: Date): Date {
  const kstDate = getKSTDate(referenceDate);
  const dayOfWeek = kstDate.getDay(); // 0(일요일) ~ 6(토요일)

  // 월요일까지의 날짜 차이 계산
  // 예: 일요일(0) → 월요일까지 -6일 (6일 전), 월요일(1) → 0일
  const daysUntilMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(kstDate);
  monday.setDate(kstDate.getDate() + daysUntilMonday);
  monday.setHours(0, 0, 0, 0); // 월요일의 시작 (00:00:00)

  return monday;
}

/**
 * 주의 시작일(월요일)을 ISO 문자열로 반환 (YYYY-MM-DD, KST 기준)
 *
 * 예시:
 * - 입력: 2025-11-17 (월요일)
 * - 출력: "2025-11-17"
 */
export function getWeekStartISO(referenceDate: Date): string {
  const monday = getMondayOfWeek(referenceDate);
  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, "0");
  const day = String(monday.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 주의 종료일(일요일)을 ISO 문자열로 반환 (YYYY-MM-DD, KST 기준)
 *
 * 예시:
 * - 입력: 2025-11-17 (월요일)
 * - 출력: "2025-11-23" (해당 주의 일요일)
 */
export function getWeekEndISO(referenceDate: Date): string {
  const sunday = getSundayOfWeek(referenceDate);
  const year = sunday.getFullYear();
  const month = String(sunday.getMonth() + 1).padStart(2, "0");
  const day = String(sunday.getDate()).padStart(2, "0");
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
 * 1. 일요일이 지난 주만 포함: 해당 주의 일요일이 현재 날짜(KST)보다 작거나 같아야 함
 *    ⏰ 일요일 오전 12시(00:00:00 KST)가 되면 그때부터 생성 대상이 됨
 * 2. weekly_feedback_id가 null인 주만 포함 (아직 생성되지 않은 주)
 * 3. daily_feedback이 있는 주만 포함 (record_count > 0)
 *    - record_count는 해당 주의 daily_feedback 개수를 의미
 *    - 하나라도 있으면 (>= 1) 주간 피드백 생성 가능
 *
 * 📅 주간 범위: 월요일 ~ 일요일
 * 📌 기준 요일: 일요일
 * ⏰ 생성 시점: 일요일 오전 12시(00:00:00 KST)가 되면 해당 주가 생성 대상이 됨
 * 🌏 시간대: KST (Asia/Seoul) 기준
 *
 * 💡 예시 시나리오:
 *
 * 현재 날짜: 2025-11-17 (월요일, KST)
 *
 * 후보 데이터:
 * [
 *   { week_start: "2025-11-17", weekly_feedback_id: null, record_count: 3 }
 *     → 이번주 일요일: 2025-11-23
 *     → 2025-11-23 > 2025-11-17 (아직 안 지남)
 *     → record_count: 3 (daily_feedback 3개)
 *     → ❌ 제외 (일요일이 아직 안 지남)
 *
 *   { week_start: "2025-11-10", weekly_feedback_id: null, record_count: 5 }
 *     → 해당 주 일요일: 2025-11-16
 *     → 2025-11-16 <= 2025-11-17 (이미 지남)
 *     → record_count: 5 (daily_feedback 5개)
 *     → ✅ 포함
 *
 *   { week_start: "2025-11-03", weekly_feedback_id: 3, record_count: 7 }
 *     → weekly_feedback_id가 있음 (이미 생성됨)
 *     → ❌ 제외
 *
 *   { week_start: "2025-10-27", weekly_feedback_id: null, record_count: 1 }
 *     → 해당 주 일요일: 2025-11-02
 *     → 2025-11-02 <= 2025-11-17 (이미 지남)
 *     → record_count: 1 (daily_feedback 1개, 하나라도 있으면 생성 가능)
 *     → ✅ 포함
 * ]
 *
 * 결과: [2025-11-10, 2025-10-27] (2개)
 *
 * 🔄 다음주 월요일 (2025-11-24)이 되면:
 * - 2025-11-17 주의 일요일: 2025-11-23
 * - 2025-11-23 <= 2025-11-24 (이미 지남)
 * - weekly_feedback_id가 null이면 ✅ 포함됨
 *
 * 🔄 생성 후 동작:
 * 1. 사용자가 "생성하기" 버튼 클릭
 * 2. 해당 주의 daily_feedback 데이터를 기반으로 주간 피드백 생성
 * 3. weekly_feedbacks 테이블에 데이터 저장됨
 * 4. weekly_candidates 뷰의 weekly_feedback_id가 자동으로 업데이트됨 (LEFT JOIN)
 * 5. 쿼리 무효화로 새로운 데이터 가져옴
 * 6. weekly_feedback_id가 null이 아니므로 필터링 조건에서 제외됨
 * 7. 결과: 해당 주가 후보 목록에서 사라짐 ✅
 *
 * @param candidates 전체 후보 목록
 * @param referenceDate 기준 날짜 (기본값: 오늘, KST 기준)
 * @returns 필터링된 후보 목록 (최신순 정렬)
 */
export function filterWeeklyCandidatesForCreation(
  candidates: WeeklyCandidateWithFeedback[],
  referenceDate: Date = new Date()
): WeeklyCandidateWithFeedback[] {
  // Step 1: KST 기준 현재 날짜 문자열 (YYYY-MM-DD)
  // 예: "2025-11-17"
  const currentKSTDateString = getKSTDateString(referenceDate);

  // Step 2: 필터링된 결과를 담을 배열
  const filtered: WeeklyCandidateWithFeedback[] = [];

  // Step 3: 모든 후보를 하나씩 확인
  for (const candidate of candidates) {
    // 조건 1: weekly_feedback_id가 null이고 daily_feedback이 있는 경우만 확인
    // record_count는 해당 주의 daily_feedback 개수 (하나라도 있으면 >= 1)
    if (candidate.weekly_feedback_id === null && candidate.record_count > 0) {
      // candidate.week_start는 월요일 (예: "2025-11-17")
      // KST 시간대로 파싱 (T00:00:00+09:00는 KST 오전 0시를 의미)
      const weekStartDate = new Date(candidate.week_start + "T00:00:00+09:00");

      // Step 4: 해당 주의 일요일 계산
      // 예: week_start가 "2025-11-17" (월요일)이면
      //     일요일은 "2025-11-23"
      const weekSunday = getSundayOfWeek(weekStartDate);
      const weekSundayString = getKSTDateString(weekSunday);

      // Step 5: 일요일이 현재 날짜(KST)보다 작거나 같으면 포함
      //
      // ⏰ 타이밍:
      // - 일요일 오전 12시(00:00:00 KST)가 되면 해당 주가 생성 대상이 됨
      // - 예: 2025-11-23 00:00:00 KST가 되면 → "2025-11-23" <= "2025-11-23" → 포함됨
      //
      // 예시:
      // - "2025-11-23" <= "2025-11-17" → false (아직 안 지남) → 제외
      // - "2025-11-16" <= "2025-11-17" → true (이미 지남) → 포함
      // - "2025-11-23" <= "2025-11-23" → true (일요일 오전 12시가 됨) → 포함
      if (weekSundayString <= currentKSTDateString) {
        filtered.push(candidate);
      }
    }
  }

  // Step 6: 최신 주부터 정렬 (내림차순)
  // 예: [2025-11-10, 2025-10-27] → 최신순으로 정렬됨
  return filtered.sort((a, b) => {
    return new Date(b.week_start).getTime() - new Date(a.week_start).getTime();
  });
}
