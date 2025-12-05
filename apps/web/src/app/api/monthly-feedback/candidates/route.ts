import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { API_ENDPOINTS } from "@/constants";
import { getKSTDateString } from "@/lib/date-utils";

/**
 * GET 핸들러: 월간 피드백 후보 조회
 *
 * 📋 로직:
 * 1. weekly_feedback 테이블을 조회하여 월별로 그룹화
 * 2. 각 월에 2개 이상의 주간 피드백이 있는지 확인
 * 3. is_ai_generated가 true인 월간 피드백이 있으면 제외
 * 4. 클라이언트에서 마지막 일 조건으로 필터링
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // KST 기준 현재 날짜
    const now = new Date();
    const currentKSTDateString = getKSTDateString(now);
    const [currentYear, currentMonthNum] = currentKSTDateString
      .split("-")
      .map(Number);

    const currentMonth = `${currentYear}-${String(currentMonthNum).padStart(
      2,
      "0"
    )}`;

    // weekly_feedback 테이블에서 모든 주간 피드백 조회 (최근 6개월 범위)
    const sixMonthsAgo = new Date(currentYear, currentMonthNum - 6, 1);
    const sixMonthsAgoString = getKSTDateString(sixMonthsAgo);

    const { data: weeklyFeedbacks, error: weeklyError } = await supabase
      .from(API_ENDPOINTS.WEEKLY_FEEDBACKS)
      .select("id, week_start, week_end, user_id")
      .eq("user_id", userId)
      .gte("week_start", sixMonthsAgoString)
      .order("week_start", { ascending: false });

    if (weeklyError) {
      throw new Error(
        `Failed to fetch weekly feedbacks: ${weeklyError.message}`
      );
    }

    // 월별로 그룹화하여 주간 피드백 개수 계산
    // fetchWeeklyFeedbacksByMonth와 동일한 로직을 사용하여 카운트
    // 주간 피드백이 해당 월과 겹치면 해당 월로 카운트
    // 예: 10월 28일(월) ~ 11월 3일(일) 주간 피드백은
    //     - 10월 조회 시: week_start="2025-10-28" <= "2025-10-31" ✅ AND week_end="2025-11-03" >= "2025-10-01" ✅ → 포함
    //     - 11월 조회 시: week_start="2025-10-28" <= "2025-11-30" ✅ AND week_end="2025-11-03" >= "2025-11-01" ✅ → 포함
    //     따라서 두 월 모두에 카운트되어야 함
    const monthlyWeeklyCountMap = new Map<string, number>();

    if (weeklyFeedbacks && weeklyFeedbacks.length > 0) {
      // 각 월별로 해당 월과 겹치는 주간 피드백 개수 계산
      const monthsToCheck = new Set<string>();

      // 모든 주간 피드백의 week_start와 week_end를 확인하여 관련된 월 추출
      for (const wf of weeklyFeedbacks) {
        const weekStartDate = new Date(wf.week_start);
        const weekEndDate = new Date(wf.week_end);

        // week_start가 속한 월
        const startMonth = `${weekStartDate.getFullYear()}-${String(
          weekStartDate.getMonth() + 1
        ).padStart(2, "0")}`;

        // week_end가 속한 월
        const endMonth = `${weekEndDate.getFullYear()}-${String(
          weekEndDate.getMonth() + 1
        ).padStart(2, "0")}`;

        monthsToCheck.add(startMonth);
        if (startMonth !== endMonth) {
          monthsToCheck.add(endMonth);
        }
      }

      // 각 월별로 해당 월과 겹치는 주간 피드백 개수 계산
      for (const month of monthsToCheck) {
        const [year, monthNum] = month.split("-").map(Number);
        const monthStartDate = new Date(year, monthNum - 1, 1);
        const monthEndDate = new Date(year, monthNum, 0); // 다음 달 0일 = 이번 달 마지막 날

        const monthStartString = getKSTDateString(monthStartDate);
        const monthEndString = getKSTDateString(monthEndDate);

        // 해당 월과 겹치는 주간 피드백 개수 계산
        // 조건: week_start <= monthEndString AND week_end >= monthStartString
        let count = 0;
        for (const wf of weeklyFeedbacks) {
          if (
            wf.week_start <= monthEndString &&
            wf.week_end >= monthStartString
          ) {
            count++;
          }
        }

        if (count > 0) {
          monthlyWeeklyCountMap.set(month, count);
        }
      }
    }

    // 이미 생성된 월간 피드백 조회 (is_ai_generated가 true인 것만)
    const monthsWithWeeklyFeedbacks = Array.from(monthlyWeeklyCountMap.keys());

    const { data: existingFeedbacks, error: monthlyError } = await supabase
      .from(API_ENDPOINTS.MONTHLY_FEEDBACK)
      .select("id, month, is_ai_generated")
      .eq("user_id", userId)
      .in(
        "month",
        monthsWithWeeklyFeedbacks.length > 0 ? monthsWithWeeklyFeedbacks : [""]
      )
      .eq("is_ai_generated", true)
      .order("month", { ascending: false });

    if (monthlyError) {
      throw new Error(
        `Failed to fetch existing monthly feedbacks: ${monthlyError.message}`
      );
    }

    // is_ai_generated가 true인 월들을 Set으로 저장
    const generatedMonthsSet = new Set(
      (existingFeedbacks || []).map((f) => f.month)
    );

    // 후보 월 목록 생성
    const candidates: Array<{
      month: string;
      month_label: string;
      is_current: boolean;
      monthly_feedback_id: string | null;
      weekly_feedback_count: number;
    }> = [];

    // 주간 피드백이 2개 이상인 월만 후보에 추가
    for (const [month, count] of monthlyWeeklyCountMap.entries()) {
      // 조건 1: 주간 피드백이 2개 이상이어야 함
      if (count < 2) {
        continue;
      }

      // 조건 2: is_ai_generated가 true인 월간 피드백이 있으면 제외
      if (generatedMonthsSet.has(month)) {
        continue;
      }

      const [year, monthNum] = month.split("-");

      // is_ai_generated가 true인 월은 이미 제외되었으므로,
      // monthly_feedback_id는 항상 null입니다.
      candidates.push({
        month: month,
        month_label: `${year}년 ${monthNum}월`,
        is_current: month === currentMonth,
        monthly_feedback_id: null,
        weekly_feedback_count: count,
      });
    }

    // 최신 월부터 정렬
    candidates.sort((a, b) => {
      return (
        new Date(b.month + "-01").getTime() -
        new Date(a.month + "-01").getTime()
      );
    });

    return NextResponse.json(
      {
        message: "Monthly candidates retrieved successfully",
        data: candidates,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
