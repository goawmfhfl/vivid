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
 * 특정 월의 마지막 일 문자열 반환 (YYYY-MM-DD, KST 기준)
 * @param month "YYYY-MM" 형식의 월 문자열
 */
export function getLastDayOfMonthStringByMonth(month: string): string {
  const [year, monthNum] = month.split("-").map(Number);
  const lastDay = new Date(year, monthNum, 0); // 다음 달의 0일 = 이번 달의 마지막 날
  return getKSTDateString(lastDay);
}

/**
 * 월간 피드백 생성 가능한 후보 필터링
 *
 * 📋 필터링 규칙:
 * 1. 해당 월의 마지막 일이 현재 날짜(KST)보다 작거나 같아야 함
 *    ⏰ 월의 마지막 일 오전 12시(00:00:00 KST)가 되면 그때부터 생성 대상이 됨
 *    예: 10월 31일 00:00:00 KST가 되면 → 10월 후보 노출 시작
 * 2. 주간 피드백이 2개 이상인 월만 포함 (weekly_feedback_count >= 2)
 *    - API에서 이미 필터링되지만, 클라이언트에서도 확인
 * 3. is_ai_generated가 true인 월간 피드백이 있으면 제외
 *    - API에서 이미 필터링되지만, 클라이언트에서도 확인
 *
 * 📅 생성 시점:
 * - 매월 마지막 일에만 노출 시작
 * - 지난 달 후보도 계속 남아있어야 함 (사용자가 아직 생성하지 않았을 수 있으므로)
 *
 * 💡 예시 시나리오:
 *
 * 현재 날짜: 2025-11-15 (KST)
 *
 * 후보 데이터:
 * [
 *   { month: "2025-11", weekly_feedback_count: 2 }
 *     → 11월 마지막 일: 2025-11-30
 *     → 2025-11-30 > 2025-11-15 (아직 안 지남)
 *     → ❌ 제외 (아직 마지막 일이 안 지남)
 *
 *   { month: "2025-10", weekly_feedback_count: 2 }
 *     → 10월 마지막 일: 2025-10-31
 *     → 2025-10-31 <= 2025-11-15 (이미 지남)
 *     → ✅ 포함
 *
 *   { month: "2025-09", weekly_feedback_count: 1 }
 *     → weekly_feedback_count: 1 < 2 ❌
 *     → ❌ 제외 (주간 피드백이 2개 미만)
 * ]
 *
 * 🔄 다음 시나리오 (2025-11-30 00:00:00 KST가 되면):
 * - 11월 마지막 일: 2025-11-30
 * - 2025-11-30 <= 2025-11-30 (이미 지남)
 * - weekly_feedback_count >= 2이면 ✅ 포함됨
 *
 * 🔄 생성 후 동작:
 * 1. 사용자가 "생성하기" 버튼 클릭
 * 2. monthly_feedbacks 테이블에 데이터 저장됨 (is_ai_generated: true)
 * 3. 쿼리 무효화로 새로운 데이터 가져옴
 * 4. API에서 is_ai_generated가 true인 월은 제외됨
 * 5. 결과: 해당 월이 후보 목록에서 사라짐 ✅
 *
 * @param candidates 전체 후보 목록 (API에서 이미 2개 이상 조건과 is_ai_generated 조건이 적용됨)
 * @param referenceDate 기준 날짜 (기본값: 오늘, KST 기준)
 * @returns 필터링된 후보 목록 (최신순 정렬)
 */
export function filterMonthlyCandidatesForCreation(
  candidates: MonthlyCandidate[],
  referenceDate: Date = new Date()
): MonthlyCandidate[] {
  // Step 1: KST 기준 현재 날짜 문자열 (YYYY-MM-DD)
  const currentKSTDateString = getKSTDateString(referenceDate);

  // Step 2: 필터링된 결과를 담을 배열
  const filtered: MonthlyCandidate[] = [];

  // Step 3: 모든 후보를 하나씩 확인
  for (const candidate of candidates) {
    // 조건 1: 주간 피드백이 2개 이상인지 확인 (API에서 이미 필터링되지만 안전장치)
    if (
      candidate.weekly_feedback_count === undefined ||
      candidate.weekly_feedback_count < 2
    ) {
      continue;
    }

    // 조건 2: 해당 월의 마지막 일이 현재 날짜(KST)보다 작거나 같아야 함
    const monthLastDayString = getLastDayOfMonthStringByMonth(candidate.month);

    // ⏰ 타이밍:
    // - 월의 마지막 일 오전 12시(00:00:00 KST)가 되면 해당 월이 생성 대상이 됨
    // - 예: 2025-10-31 00:00:00 KST가 되면 → "2025-10-31" <= "2025-10-31" → 포함됨
    //
    // 예시:
    // - "2025-11-30" <= "2025-11-15" → false (아직 안 지남) → 제외
    // - "2025-10-31" <= "2025-11-15" → true (이미 지남) → 포함
    // - "2025-10-31" <= "2025-10-31" → true (마지막 일 오전 12시가 됨) → 포함
    if (monthLastDayString <= currentKSTDateString) {
      filtered.push(candidate);
    }
  }

  // Step 4: 최신 월부터 정렬 (내림차순)
  return filtered.sort((a, b) => {
    return (
      new Date(b.month + "-01").getTime() - new Date(a.month + "-01").getTime()
    );
  });
}
