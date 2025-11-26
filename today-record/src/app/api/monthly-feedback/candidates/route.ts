import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { API_ENDPOINTS } from "@/constants";
import { getKSTDateString } from "@/lib/date-utils";

/**
 * GET 핸들러: 월간 피드백 후보 조회
 * 월말에 AI가 생성되지 않은 월을 후보로 반환
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

    // 지난 달 계산
    const lastMonthDate = new Date(currentYear, currentMonthNum - 2, 1);
    const lastMonthStr = `${lastMonthDate.getFullYear()}-${String(
      lastMonthDate.getMonth() + 1
    ).padStart(2, "0")}`;

    // 최근 6개월 범위 계산 (더 넓은 범위로 후보를 반환하여 클라이언트에서 필터링 가능하도록)
    // 현재 달부터 6개월 전까지
    const monthsToCheck: string[] = [];
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(currentYear, currentMonthNum - i - 1, 1);
      const monthStr = `${monthDate.getFullYear()}-${String(
        monthDate.getMonth() + 1
      ).padStart(2, "0")}`;
      monthsToCheck.push(monthStr);
    }

    // 이미 생성된 월간 피드백 조회 (최근 3개월)
    const { data: existingFeedbacks, error: fetchError } = await supabase
      .from(API_ENDPOINTS.MONTHLY_FEEDBACK)
      .select("id, month")
      .eq("user_id", userId)
      .in("month", monthsToCheck)
      .order("month", { ascending: false });

    if (fetchError) {
      throw new Error(
        `Failed to fetch existing monthly feedbacks: ${fetchError.message}`
      );
    }

    const existingMonthsMap = new Map(
      (existingFeedbacks || []).map((f) => [f.month, f.id])
    );

    // 해당 월의 기록 개수 조회를 위한 날짜 범위 계산
    const getMonthDateRange = (month: string) => {
      const [year, monthNum] = month.split("-").map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0);
      return {
        start: getKSTDateString(startDate),
        end: getKSTDateString(endDate),
      };
    };

    // 후보 월 목록 생성 (최근 3개월 중 생성되지 않은 모든 월)
    const candidates: Array<{
      month: string;
      month_label: string;
      is_current: boolean;
      monthly_feedback_id: string | null;
      record_count?: number;
    }> = [];

    // 최근 3개월 중 모든 월을 후보에 추가 (생성 여부와 관계없이)
    // 클라이언트에서 referenceDate를 기준으로 필터링하므로, 여기서는 모든 후보를 반환
    for (const month of monthsToCheck) {
      const dateRange = getMonthDateRange(month);

      // 기록 개수 조회
      const { count: recordCount } = await supabase
        .from(API_ENDPOINTS.DAILY_FEEDBACK)
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("report_date", dateRange.start)
        .lte("report_date", dateRange.end);

      const [year, monthNum] = month.split("-");
      const existingFeedbackId = existingMonthsMap.get(month);

      candidates.push({
        month: month,
        month_label: `${year}년 ${monthNum}월`,
        is_current: month === currentMonth,
        monthly_feedback_id: existingFeedbackId || null,
        record_count: recordCount || 0,
      });
    }

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
