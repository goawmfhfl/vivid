import type { SupabaseClient } from "@supabase/supabase-js";
import type { WeeklyFeedback } from "@/types/weekly-feedback";
import { API_ENDPOINTS } from "@/constants";
import { decryptWeeklyFeedback } from "@/lib/jsonb-encryption";

/**
 * 주간 피드백이 특정 월에 속한 일수를 계산
 * @param weekStart 주간 피드백 시작일 (YYYY-MM-DD)
 * @param weekEnd 주간 피드백 종료일 (YYYY-MM-DD)
 * @param monthStart 월 시작일 (YYYY-MM-DD)
 * @param monthEnd 월 종료일 (YYYY-MM-DD)
 * @returns 해당 월에 속한 일수
 */
function calculateDaysInMonth(
  weekStart: string,
  weekEnd: string,
  monthStart: string,
  monthEnd: string
): number {
  const weekStartDate = new Date(weekStart);
  const weekEndDate = new Date(weekEnd);
  const monthStartDate = new Date(monthStart);
  const monthEndDate = new Date(monthEnd);

  // 주간 피드백과 월의 교집합 구하기
  const overlapStart =
    weekStartDate > monthStartDate ? weekStartDate : monthStartDate;
  const overlapEnd = weekEndDate < monthEndDate ? weekEndDate : monthEndDate;

  // 교집합이 없으면 0 반환
  if (overlapStart > overlapEnd) {
    return 0;
  }

  // 일수 계산 (포함 계산이므로 +1)
  const diffTime = overlapEnd.getTime() - overlapStart.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return diffDays;
}

/**
 * 날짜 범위로 weekly-feedback 조회 (월간용)
 *
 * 📋 필터링 기준:
 * - 해당 주의 과반수(4일 이상)가 포함된 달로 편입
 * - 예: 10월 27일~11월 2일 주간 피드백은
 *   - 10월: 4일 (10/27, 10/28, 10/29, 10/30, 10/31) → 포함 ✅
 *   - 11월: 3일 (11/1, 11/2) → 제외 ❌
 */
export async function fetchWeeklyFeedbacksByMonth(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<WeeklyFeedback[]> {
  // 1단계: 주간 피드백이 해당 월과 겹치는 경우 모두 조회
  // 조건: week_start <= endDate AND week_end >= startDate
  const { data, error } = await supabase
    .from(API_ENDPOINTS.WEEKLY_FEEDBACKS)
    .select("*")
    .eq("user_id", userId)
    .lte("week_start", endDate) // week_start가 월의 마지막 날보다 작거나 같아야 함
    .gte("week_end", startDate) // week_end가 월의 첫 날보다 크거나 같아야 함
    .order("week_start", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch weekly feedbacks: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // 2단계: 각 주간 피드백에 대해 해당 월에 속한 일수 계산
  // 과반수(4일 이상)가 포함된 경우만 필터링
  const filteredData = data.filter((row) => {
    const daysInMonth = calculateDaysInMonth(
      row.week_start,
      row.week_end,
      startDate,
      endDate
    );
    // 4일 이상이면 포함
    return daysInMonth >= 4;
  });

  // 각 JSONB 컬럼에서 데이터를 읽어서 WeeklyFeedback 타입으로 변환
  return filteredData.map((row) => {
    // vision_report는 레거시 필드명이므로 타입 단언으로 처리
    const rowWithLegacy = row as typeof row & { vision_report?: unknown };
    const rawFeedback = {
      id: String(row.id),
      week_range: {
        start: row.week_start,
        end: row.week_end,
        timezone: row.timezone || "Asia/Seoul",
      },
      summary_report: row.summary_report as WeeklyFeedback["summary_report"],
      daily_life_report:
        row.daily_life_report as WeeklyFeedback["daily_life_report"],
      emotion_report:
        (row.emotion_report as WeeklyFeedback["emotion_report"]) ?? null,
      vivid_report: (row.vivid_report ?? rowWithLegacy.vision_report) as WeeklyFeedback["vivid_report"],
      insight_report: row.insight_report as WeeklyFeedback["insight_report"],
      execution_report:
        row.execution_report as WeeklyFeedback["execution_report"],
      closing_report: row.closing_report as WeeklyFeedback["closing_report"],
      is_ai_generated: row.is_ai_generated ?? undefined,
      created_at: row.created_at ?? undefined,
    };

    // 복호화 처리
    return decryptWeeklyFeedback(
      rawFeedback as unknown as { [key: string]: unknown }
    ) as unknown as WeeklyFeedback;
  });
}
