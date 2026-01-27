import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { API_ENDPOINTS } from "@/constants";
import { getKSTDateString } from "@/lib/date-utils";
import { CANDIDATES_REVALIDATE, getCacheControlHeader } from "@/constants/cache";

/**
 * GET 핸들러: 월간 비비드 후보 조회
 *
 * 📋 로직:
 * 1. daily_vivid 테이블을 조회하여 월별로 그룹화
 * 2. 각 월에 daily_vivid가 있는지 확인
 * 3. is_ai_generated가 true인 월간 비비드가 있으면 제외
 * 4. 클라이언트에서 마지막 일 조건으로 필터링
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const force = searchParams.get("force") === "1";

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

    // daily_vivid 테이블에서 모든 일일 비비드 조회 (최근 6개월 범위)
    const sixMonthsAgo = new Date(currentYear, currentMonthNum - 6, 1);
    const sixMonthsAgoString = getKSTDateString(sixMonthsAgo);

    const { data: dailyVividRows, error: dailyError } = await supabase
      .from(API_ENDPOINTS.DAILY_VIVID)
      .select("id, report_date, user_id")
      .eq("user_id", userId)
      .gte("report_date", sixMonthsAgoString)
      .eq("is_ai_generated", true)
      .order("report_date", { ascending: false });

    if (dailyError) {
      throw new Error(`Failed to fetch daily vivid: ${dailyError.message}`);
    }

    // 월별로 그룹화하여 daily_vivid 개수 계산
    const monthlyDailyCountMap = new Map<string, number>();

    if (dailyVividRows && dailyVividRows.length > 0) {
      for (const df of dailyVividRows) {
        const reportDate = new Date(df.report_date);
        const month = `${reportDate.getFullYear()}-${String(
          reportDate.getMonth() + 1
        ).padStart(2, "0")}`;

        const currentCount = monthlyDailyCountMap.get(month) || 0;
        monthlyDailyCountMap.set(month, currentCount + 1);
      }
    }

    // 이미 생성된 월간 비비드 조회 (is_ai_generated가 true인 것만)
    const monthsWithDailyVivid = Array.from(monthlyDailyCountMap.keys());

    const { data: existingFeedbacks, error: monthlyError } = await supabase
      .from(API_ENDPOINTS.MONTHLY_VIVID)
      .select("id, month, is_ai_generated")
      .eq("user_id", userId)
      .in(
        "month",
        monthsWithDailyVivid.length > 0 ? monthsWithDailyVivid : [""]
      )
      .eq("is_ai_generated", true)
      .order("month", { ascending: false });

    if (monthlyError) {
      throw new Error(
        `Failed to fetch existing monthly vivids: ${monthlyError.message}`
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
      monthly_vivid_id: string | null;
      daily_vivid_count: number;
    }> = [];

    // daily_vivid가 있는 월만 후보에 추가
    for (const [month, count] of monthlyDailyCountMap.entries()) {
      // 조건: daily_vivid가 1개 이상이어야 함
      if (count < 1) {
        continue;
      }

      // 조건: is_ai_generated가 true인 월간 비비드가 있으면 제외
      if (generatedMonthsSet.has(month)) {
        continue;
      }

      const [year, monthNum] = month.split("-");

      // is_ai_generated가 true인 월은 이미 제외되었으므로,
      // monthly_vivid_id는 항상 null입니다.
      candidates.push({
        month: month,
        month_label: `${year}년 ${monthNum}월`,
        is_current: month === currentMonth,
        monthly_vivid_id: null,
        daily_vivid_count: count,
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
      {
        status: 200,
        headers: {
          "Cache-Control": force
            ? "no-store, max-age=0"
            : getCacheControlHeader(CANDIDATES_REVALIDATE),
        },
      }
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
