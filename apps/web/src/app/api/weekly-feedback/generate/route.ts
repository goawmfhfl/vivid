import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { fetchDailyFeedbacksByRange, saveWeeklyFeedback } from "../db-service";
import { generateWeeklyFeedbackFromDaily } from "../ai-service";
import type { WeeklyFeedbackGenerateRequest } from "../types";

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
    }: WeeklyFeedbackGenerateRequest = body;

    // 요청 검증
    if (!userId || !start || !end) {
      return NextResponse.json(
        { error: "userId, start, and end are required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

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

    // 기록이 있는 날짜만 필터링하고 emotion_overview가 있는 데이터만 사용
    const validDailyFeedbacks = dailyFeedbacks.filter(
      (feedback) =>
        feedback.emotion_overview &&
        feedback.emotion_overview.ai_mood_valence !== null &&
        feedback.emotion_overview.ai_mood_arousal !== null
    );

    // emotion_overview 계산을 위한 데이터 준비
    const emotionOverviewData = {
      daily_emotions: validDailyFeedbacks.map((feedback) => ({
        date: feedback.report_date,
        weekday: new Date(feedback.report_date).toLocaleDateString("en-US", {
          weekday: "short",
        }),
        ai_mood_valence: feedback.emotion_overview!.ai_mood_valence,
        ai_mood_arousal: feedback.emotion_overview!.ai_mood_arousal,
        dominant_emotion: feedback.emotion_overview!.dominant_emotion,
      })),
      // 평균 계산
      avg_valence:
        validDailyFeedbacks.length > 0
          ? validDailyFeedbacks.reduce(
              (sum, f) => sum + (f.emotion_overview!.ai_mood_valence || 0),
              0
            ) / validDailyFeedbacks.length
          : null,
      avg_arousal:
        validDailyFeedbacks.length > 0
          ? validDailyFeedbacks.reduce(
              (sum, f) => sum + (f.emotion_overview!.ai_mood_arousal || 0),
              0
            ) / validDailyFeedbacks.length
          : null,
    };

    // 2️⃣ AI 요청: Weekly Feedback 생성
    const weeklyFeedback = await generateWeeklyFeedbackFromDaily(
      dailyFeedbacks,
      { start, end, timezone }
    );

    // AI 응답에서 계산된 평균값으로 emotion_overview 덮어쓰기
    if (weeklyFeedback.emotion_overview) {
      weeklyFeedback.emotion_overview.ai_mood_valence =
        emotionOverviewData.avg_valence;
      weeklyFeedback.emotion_overview.ai_mood_arousal =
        emotionOverviewData.avg_arousal;
    }

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
