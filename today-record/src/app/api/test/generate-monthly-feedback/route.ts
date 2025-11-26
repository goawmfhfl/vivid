import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import {
  fetchDailyFeedbacksByMonth,
  saveMonthlyFeedback,
} from "@/app/api/monthly-feedback/db-service";
import { generateMonthlyFeedbackFromDaily } from "@/app/api/monthly-feedback/ai-service";
import { getKSTDateString } from "@/lib/date-utils";

/**
 * 테스트용 Monthly Feedback 생성 API
 * 개발 환경에서만 사용 가능
 */
export async function POST(request: NextRequest) {
  // 개발 환경 체크
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { userId, month }: { userId: string; month: string } = body;

    if (!userId || !month) {
      return NextResponse.json(
        { error: "userId and month are required" },
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

    const supabase = getServiceSupabase();

    // 월의 시작일과 종료일 계산
    const [year, monthNum] = month.split("-").map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);

    const startDateStr = getKSTDateString(startDate);
    const endDateStr = getKSTDateString(endDate);

    // Daily Feedback 조회
    const dailyFeedbacks = await fetchDailyFeedbacksByMonth(
      supabase,
      userId,
      startDateStr,
      endDateStr
    );

    if (dailyFeedbacks.length === 0) {
      return NextResponse.json(
        { error: "No daily feedbacks found for this month" },
        { status: 404 }
      );
    }

    // AI로 Monthly Feedback 생성
    const monthlyFeedback = await generateMonthlyFeedbackFromDaily(
      dailyFeedbacks,
      month,
      {
        start_date: startDateStr,
        end_date: endDateStr,
      }
    );

    // monthlyFeedback이 undefined인지 확인
    if (!monthlyFeedback) {
      return NextResponse.json(
        { error: "Failed to generate monthly feedback: result is undefined" },
        { status: 500 }
      );
    }

    // month_label 설정
    if (!monthlyFeedback.month_label) {
      monthlyFeedback.month_label = `${year}년 ${monthNum}월`;
    }

    // date_range 설정
    if (!monthlyFeedback.date_range) {
      monthlyFeedback.date_range = {
        start_date: startDateStr,
        end_date: endDateStr,
      };
    }

    // DB 저장
    const savedId = await saveMonthlyFeedback(
      supabase,
      userId,
      monthlyFeedback
    );

    return NextResponse.json(
      {
        message: "Monthly feedback generated and saved successfully",
        data: { ...monthlyFeedback, id: savedId },
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
