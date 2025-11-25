import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { fetchDailyFeedbacksByMonth, saveMonthlyFeedback } from "../db-service";
import { generateMonthlyFeedbackFromDaily } from "../ai-service";
import type { MonthlyFeedbackGenerateRequest } from "../types";

// Next.js API Route 타임아웃 설정 (최대 5분)
export const maxDuration = 300;

/**
 * 월의 시작일과 종료일 계산
 */
function getMonthDateRange(month: string): {
  start_date: string;
  end_date: string;
} {
  const [year, monthNum] = month.split("-").map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0); // 다음 달 0일 = 이번 달 마지막 날

  return {
    start_date: startDate.toISOString().split("T")[0],
    end_date: endDate.toISOString().split("T")[0],
  };
}

/**
 * POST 핸들러: 월간 피드백 생성
 *
 * 플로우:
 * 1. Daily Feedback 조회
 * 2. AI로 Monthly Feedback 생성
 * 3. DB 저장
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, month }: MonthlyFeedbackGenerateRequest = body;

    // 요청 검증
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

    // 날짜 범위 계산
    const dateRange = getMonthDateRange(month);

    // 1️⃣ Daily Feedback 데이터 조회
    const dailyFeedbacks = await fetchDailyFeedbacksByMonth(
      supabase,
      userId,
      dateRange.start_date,
      dateRange.end_date
    );

    if (dailyFeedbacks.length === 0) {
      return NextResponse.json(
        { error: "No daily feedbacks found for this month" },
        { status: 404 }
      );
    }

    // 2️⃣ AI 요청: Monthly Feedback 생성
    const monthlyFeedback = await generateMonthlyFeedbackFromDaily(
      dailyFeedbacks,
      month,
      dateRange
    );

    // month_label 설정 (없는 경우)
    if (!monthlyFeedback.month_label) {
      const [year, monthNum] = month.split("-");
      monthlyFeedback.month_label = `${year}년 ${monthNum}월`;
    }

    // date_range 설정 (없는 경우)
    if (!monthlyFeedback.date_range) {
      monthlyFeedback.date_range = dateRange;
    }

    // 3️⃣ Supabase monthly_feedback 테이블에 저장
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

    // 에러 타입에 따른 상태 코드 결정
    const errorMessage = error instanceof Error ? error.message : String(error);
    const statusCode = errorMessage.includes("No daily feedbacks")
      ? 404
      : errorMessage.includes("No content from OpenAI")
      ? 500
      : errorMessage.includes("Failed to")
      ? 500
      : 500;

    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: statusCode }
    );
  }
}
