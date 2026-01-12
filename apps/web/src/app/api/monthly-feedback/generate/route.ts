import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import {
  fetchDailyFeedbacksByMonth,
  saveMonthlyFeedback,
} from "../db-service";
import { generateMonthlyFeedbackFromDailyWithProgress } from "../ai-service";
import { getKSTDateString } from "@/lib/date-utils";
import { verifySubscription } from "@/lib/subscription-utils";
// MonthlyFeedbackNew 타입은 사용하지 않지만 타입 정의를 위해 유지

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

// Next.js API Route 타임아웃 설정 (최대 5분)
export const maxDuration = 300;

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
    const { 
      userId, 
      month, 
      start_date, 
      end_date 
    }: { 
      userId: string; 
      month: string;
      start_date?: string;
      end_date?: string;
    } = body;

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

    // Pro 멤버십 확인
    const isPro = (await verifySubscription(userId)).isPro;

    // 날짜 범위 계산 (커스텀 날짜가 있으면 사용, 없으면 월 전체)
    const dateRange = start_date && end_date
      ? { start_date, end_date }
      : getMonthDateRange(month);

    // 1️⃣ Daily Feedback 데이터 조회
    const dailyFeedbacks = await fetchDailyFeedbacksByMonth(
      supabase,
      userId,
      dateRange.start_date,
      dateRange.end_date
    );

    // 최소 1개 이상의 daily-feedback이 있어야 함
    if (dailyFeedbacks.length < 1) {
      return NextResponse.json(
        { error: `일일 피드백이 필요합니다. 현재: ${dailyFeedbacks.length}개` },
        { status: 400 }
      );
    }

    // 2️⃣ AI 요청: Monthly Feedback 생성
    const monthlyFeedback = await generateMonthlyFeedbackFromDailyWithProgress(
      dailyFeedbacks,
      month,
      dateRange,
      isPro,
      userId
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
        message: "Monthly feedback generated successfully",
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
