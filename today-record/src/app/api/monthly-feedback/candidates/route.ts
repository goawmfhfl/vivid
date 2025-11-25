import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { API_ENDPOINTS } from "@/constants";

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

    // 현재 날짜 기준으로 이번 달과 지난 달 확인
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = `${lastMonth.getFullYear()}-${String(
      lastMonth.getMonth() + 1
    ).padStart(2, "0")}`;

    // 이번 달이 마지막 날인지 확인
    const lastDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();
    const isLastDayOfMonth = now.getDate() === lastDayOfMonth;

    // 이미 생성된 월간 피드백 조회
    const { data: existingFeedbacks, error: fetchError } = await supabase
      .from(API_ENDPOINTS.MONTHLY_FEEDBACK)
      .select("month")
      .eq("user_id", userId)
      .in("month", [currentMonth, lastMonthStr]);

    if (fetchError) {
      throw new Error(
        `Failed to fetch existing monthly feedbacks: ${fetchError.message}`
      );
    }

    const existingMonths = new Set(
      (existingFeedbacks || []).map((f) => f.month)
    );

    // 후보 월 목록 생성
    const candidates: Array<{
      month: string;
      month_label: string;
      is_current: boolean;
    }> = [];

    // 이번 달이 마지막 날이고 아직 생성되지 않았다면 후보에 추가
    if (isLastDayOfMonth && !existingMonths.has(currentMonth)) {
      const [year, monthNum] = currentMonth.split("-");
      candidates.push({
        month: currentMonth,
        month_label: `${year}년 ${monthNum}월`,
        is_current: true,
      });
    }

    // 지난 달이 아직 생성되지 않았다면 후보에 추가
    if (!existingMonths.has(lastMonthStr)) {
      const [year, monthNum] = lastMonthStr.split("-");
      candidates.push({
        month: lastMonthStr,
        month_label: `${year}년 ${monthNum}월`,
        is_current: false,
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
