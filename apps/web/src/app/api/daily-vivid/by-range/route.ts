import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { decryptDailyVivid } from "@/lib/jsonb-encryption";
import type { DailyVividRow } from "@/types/daily-vivid";
import { API_ENDPOINTS } from "@/constants";
import {
  FEEDBACK_REVALIDATE,
  getCacheControlHeader,
} from "@/constants/cache";
import { getKSTDateString } from "@/lib/date-utils";

/**
 * 월의 시작일과 종료일 계산 (KST 기준)
 */
function getMonthDateRange(month: string): {
  start_date: string;
  end_date: string;
} {
  const [year, monthNum] = month.split("-").map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0); // 다음 달 0일 = 이번 달 마지막 날

  return {
    start_date: getKSTDateString(startDate),
    end_date: getKSTDateString(endDate),
  };
}

/**
 * GET 핸들러: 일일 비비드 조회 (월 기준)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const month = searchParams.get("month");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (!month) {
      return NextResponse.json(
        { error: "month parameter is required (format: YYYY-MM)" },
        { status: 400 }
      );
    }

    // 월 형식 검증
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: "month must be in YYYY-MM format" },
        { status: 400 }
      );
    }

    // 월의 시작일과 종료일 계산
    const dateRange = getMonthDateRange(month);

    console.log(`[Daily Vivid By Range] userId: ${userId}, month: ${month}`);
    console.log(
      `[Daily Vivid By Range] dateRange: ${dateRange.start_date} ~ ${dateRange.end_date}`
    );

    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from(API_ENDPOINTS.DAILY_VIVID)
      .select("*")
      .eq("user_id", userId)
      .eq("type", "vivid")
      .gte("report_date", dateRange.start_date)
      .lte("report_date", dateRange.end_date)
      .order("report_date", { ascending: true });

    if (error) {
      console.error(`[Daily Vivid By Range] Supabase error:`, error);
      throw new Error(`Failed to fetch daily vivid: ${error.message}`);
    }

    console.log(
      `[Daily Vivid By Range] Found ${data?.length || 0} daily vivid entries`
    );

    // 서버 사이드에서 복호화 처리
    const decryptedFeedbacks = (data || []).map(
      (item) =>
        decryptDailyVivid(
          item as unknown as { [key: string]: unknown }
        ) as unknown as DailyVividRow
    );

    return NextResponse.json(
      { data: decryptedFeedbacks },
      {
        status: 200,
        headers: {
          "Cache-Control": getCacheControlHeader(FEEDBACK_REVALIDATE),
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
