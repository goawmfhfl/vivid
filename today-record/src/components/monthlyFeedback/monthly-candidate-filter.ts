import type { MonthlyCandidate } from "@/types/monthly-candidate";
import { getKSTDateString, getKSTDate } from "@/lib/date-utils";

/**
 * 월의 마지막 일 계산 (KST 기준)
 */
export function getLastDayOfMonth(referenceDate: Date): Date {
  const kstDate = getKSTDate(referenceDate);
  const year = kstDate.getFullYear();
  const month = kstDate.getMonth();

  // 다음 달의 0일 = 이번 달의 마지막 날
  const lastDay = new Date(year, month + 1, 0);
  lastDay.setHours(23, 59, 59, 999); // 마지막 날의 끝 (23:59:59.999)

  return lastDay;
}

/**
 * 월의 마지막 일 문자열 반환 (YYYY-MM-DD, KST 기준)
 */
export function getLastDayOfMonthString(referenceDate: Date): string {
  const lastDay = getLastDayOfMonth(referenceDate);
  return getKSTDateString(lastDay);
}

/**
 * 현재 날짜가 해당 월의 마지막 일인지 확인 (KST 기준)
 */
export function isLastDayOfMonth(referenceDate: Date = new Date()): boolean {
  const kstDate = getKSTDate(referenceDate);
  const currentDateString = getKSTDateString(kstDate);
  const lastDayString = getLastDayOfMonthString(kstDate);

  return currentDateString === lastDayString;
}

/**
 * 월간 피드백 생성 가능한 후보 필터링
 *
 * 📋 필터링 규칙:
 * 1. 매달 마지막 일에만 생성 가능: 기준 날짜(referenceDate)가 해당 월의 마지막 일이어야 함
 *    ⏰ 마지막 일 오전 12시(00:00:00 KST)가 되면 그때부터 생성 대상이 됨
 * 2. monthly_feedback_id가 null인 월만 포함 (아직 생성되지 않은 월)
 * 3. 기록이 있는 월만 포함 (record_count > 0)
 *
 * 📅 월간 범위: 1일 ~ 마지막 일
 * 📌 기준 날짜: 매달 마지막 일
 * ⏰ 생성 시점: 마지막 일 오전 12시(00:00:00 KST)가 되면 해당 월이 생성 대상이 됨
 * 🌏 시간대: KST (Asia/Seoul) 기준
 *
 * 💡 예시 시나리오:
 *
 * 기준 날짜: 2025-11-30 (11월 마지막 일, KST)
 *
 * 후보 데이터:
 * [
 *   { month: "2025-11", monthly_feedback_id: null, record_count: 24 }
 *     → 11월 마지막 일: 2025-11-30
 *     → 기준 날짜: 2025-11-30
 *     → 2025-11-30 === 2025-11-30 (마지막 일)
 *     → ✅ 포함
 *
 *   { month: "2025-10", monthly_feedback_id: null, record_count: 20 }
 *     → 10월 마지막 일: 2025-10-31
 *     → 기준 날짜: 2025-11-30
 *     → 2025-10-31 < 2025-11-30 (이미 지남)
 *     → ✅ 포함 (지난 달이 아직 생성되지 않은 경우)
 *
 *   { month: "2025-12", monthly_feedback_id: null, record_count: 0 }
 *     → 12월 마지막 일: 2025-12-31
 *     → 기준 날짜: 2025-11-30
 *     → 2025-12-31 > 2025-11-30 (아직 안 지남)
 *     → ❌ 제외
 *
 *   { month: "2025-11", monthly_feedback_id: "123", record_count: 24 }
 *     → monthly_feedback_id가 있음
 *     → ❌ 제외
 * ]
 *
 * 결과: [2025-11, 2025-10] (2개)
 *
 * 🔄 기준 날짜가 2025-12-01 (12월 1일)이 되면:
 * - 11월 마지막 일: 2025-11-30 < 2025-12-01 (이미 지남) → ✅ 포함
 * - 12월 마지막 일: 2025-12-31 > 2025-12-01 (아직 안 지남) → ❌ 제외
 * - 결과: [2025-11] (1개)
 *
 * 🔄 생성 후 동작:
 * 1. 사용자가 "생성하기" 버튼 클릭
 * 2. monthly_feedbacks 테이블에 데이터 저장됨
 * 3. 쿼리 무효화로 새로운 데이터 가져옴
 * 4. monthly_feedback_id가 null이 아니므로 필터링 조건에서 제외됨
 * 5. 결과: 해당 월이 후보 목록에서 사라짐 ✅
 *
 * @param candidates 전체 후보 목록
 * @param referenceDate 기준 날짜 (기본값: 오늘, KST 기준) - 테스트용으로 전달 가능
 * @returns 필터링된 후보 목록 (최신순 정렬)
 */
export function filterMonthlyCandidatesForCreation(
  candidates: MonthlyCandidate[],
  referenceDate: Date = new Date()
): MonthlyCandidate[] {
  // Step 1: KST 기준 기준 날짜 문자열 (YYYY-MM-DD)
  const referenceKSTDateString = getKSTDateString(referenceDate);

  // Step 2: 필터링된 결과를 담을 배열
  const filtered: MonthlyCandidate[] = [];

  // Step 3: 모든 후보를 하나씩 확인
  for (const candidate of candidates) {
    // 조건 1: monthly_feedback_id가 null인 경우만 확인
    if (
      candidate.monthly_feedback_id === null ||
      candidate.monthly_feedback_id === undefined
    ) {
      // candidate.month은 "YYYY-MM" 형식 (예: "2025-11")
      const [year, monthNum] = candidate.month.split("-").map(Number);
      const candidateMonthDate = new Date(year, monthNum - 1, 1);
      const candidateLastDay = getLastDayOfMonth(candidateMonthDate);
      const candidateLastDayString = getKSTDateString(candidateLastDay);

      // 조건 2: 해당 월의 마지막 일이 기준 날짜보다 작거나 같으면 포함
      // (즉, 마지막 일이 지났거나 오늘인 경우)
      //
      // ⏰ 타이밍:
      // - 마지막 일 오전 12시(00:00:00 KST)가 되면 해당 월이 생성 대상이 됨
      // - 예: 2025-11-30 00:00:00 KST가 되면 → "2025-11-30" <= "2025-11-30" → 포함됨
      //
      // 예시:
      // - 기준 날짜가 2025-11-30일 때:
      //   - "2025-11-30" <= "2025-11-30" → true (11월 마지막 일) → ✅ 포함
      //   - "2025-10-31" <= "2025-11-30" → true (이미 지남) → ✅ 포함
      //   - "2025-12-31" <= "2025-11-30" → false (아직 안 지남) → ❌ 제외
      if (candidateLastDayString <= referenceKSTDateString) {
        // 조건 3: 기록이 있는 경우만 포함 (record_count가 0보다 큰 경우)
        if (candidate.record_count && candidate.record_count > 0) {
          filtered.push(candidate);
        }
      }
    }
  }

  // Step 4: 최신 월부터 정렬 (내림차순)
  return filtered.sort((a, b) => {
    return (
      new Date(b.month + "-01").getTime() - new Date(a.month + "-01").getTime()
    );
  });
}
