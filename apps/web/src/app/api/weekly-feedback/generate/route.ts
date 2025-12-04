import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { fetchDailyFeedbacksByRange, saveWeeklyFeedback } from "../db-service";
import { generateWeeklyFeedbackFromDaily } from "../ai-service";
import type { WeeklyFeedbackGenerateRequest } from "../types";
import { verifySubscription } from "@/lib/subscription-utils";

// Next.js API Route 타임아웃 설정 (최대 3분)
export const maxDuration = 180;

/**
 * POST 핸들러: 주간 피드백 생성
 *
 * 플로우:
 * 1. Daily Feedback 조회
 * 2. AI로 Weekly Feedback 생성
 * 3. DB 저장
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      start,
      end,
      timezone = "Asia/Seoul",
      isPro: isProFromRequest,
    }: WeeklyFeedbackGenerateRequest = body;

    // 요청 검증
    if (!userId || !start || !end) {
      return NextResponse.json(
        { error: "userId, start, and end are required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Pro 멤버십 확인 (요청에 포함되어 있으면 사용, 없으면 서버에서 확인)
    const isPro = isProFromRequest ?? (await verifySubscription(userId)).isPro;

    // 1️⃣ Daily Feedback 데이터 조회
    const dailyFeedbacks = await fetchDailyFeedbacksByRange(
      supabase,
      userId,
      start,
      end
    );

    if (dailyFeedbacks.length === 0) {
      return NextResponse.json(
        { error: "No daily feedbacks found for this date range" },
        { status: 404 }
      );
    }

    // 2️⃣ AI 요청: Weekly Feedback 생성 (Promise.all로 병렬 처리)
    const weeklyFeedback = await generateWeeklyFeedbackFromDaily(
      dailyFeedbacks,
      { start, end, timezone },
      isPro
    );

    // 3️⃣ Supabase weekly_feedbacks 테이블에 저장
    const savedId = await saveWeeklyFeedback(supabase, userId, weeklyFeedback);

    return NextResponse.json(
      {
        message: "Weekly feedback generated and saved successfully",
        data: { ...weeklyFeedback, id: savedId },
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
