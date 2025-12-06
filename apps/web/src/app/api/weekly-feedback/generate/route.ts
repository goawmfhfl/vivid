import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { fetchDailyFeedbacksByRange, saveWeeklyFeedback } from "../db-service";
import { generateWeeklyFeedbackFromDaily } from "../ai-service";
import type { WeeklyFeedbackGenerateRequest } from "../types";
import { verifySubscription } from "@/lib/subscription-utils";
import type { WeeklyFeedback } from "@/types/weekly-feedback";

/**
 * 추적 정보 추출 (테스트 환경용)
 */
function extractTrackingInfo(feedback: any): any[] {
  const tracking: any[] = [];

  // 각 섹션에서 추적 정보 추출
  const sections = [
    { key: "summary_report", name: "SummaryReport" },
    { key: "daily_life_report", name: "DailyLifeReport" },
    { key: "emotion_report", name: "EmotionReport" },
    { key: "vision_report", name: "VisionReport" },
    { key: "insight_report", name: "InsightReport" },
    { key: "execution_report", name: "ExecutionReport" },
    { key: "closing_report", name: "ClosingReport" },
  ];

  for (const section of sections) {
    const sectionData = feedback[section.key];
    if (sectionData?.__tracking) {
      tracking.push({
        name: sectionData.__tracking.name || section.name,
        model: sectionData.__tracking.model,
        duration_ms: sectionData.__tracking.duration_ms,
        usage: sectionData.__tracking.usage,
      });
    }
  }

  return tracking;
}

/**
 * 추적 정보 제거 (DB 저장 전)
 */
function removeTrackingInfo(feedback: any): WeeklyFeedback {
  const cleaned = { ...feedback };

  const sections = [
    "summary_report",
    "daily_life_report",
    "emotion_report",
    "vision_report",
    "insight_report",
    "execution_report",
    "closing_report",
  ];

  for (const key of sections) {
    if (cleaned[key] && typeof cleaned[key] === "object") {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { __tracking, ...rest } = cleaned[key];
      cleaned[key] = rest;
    }
  }

  return cleaned as WeeklyFeedback;
}

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

    // 2️⃣ AI 요청: Weekly Feedback 생성 (순차 처리)
    const weeklyFeedback = await generateWeeklyFeedbackFromDaily(
      dailyFeedbacks,
      { start, end, timezone },
      isPro
    );

    // 추적 정보 수집 (테스트 환경에서만)
    const trackingInfo =
      process.env.NODE_ENV === "development" ||
      process.env.NEXT_PUBLIC_NODE_ENV === "development"
        ? extractTrackingInfo(weeklyFeedback)
        : undefined;

    // 추적 정보 제거 (DB 저장 전)
    const cleanedFeedback = removeTrackingInfo(weeklyFeedback);

    // 3️⃣ Supabase weekly_feedbacks 테이블에 저장
    const savedId = await saveWeeklyFeedback(supabase, userId, cleanedFeedback);

    return NextResponse.json(
      {
        message: "Weekly feedback generated and saved successfully",
        data: { ...cleanedFeedback, id: savedId },
        ...(trackingInfo && { tracking: trackingInfo }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = (error as any)?.code;
    const errorStatus = (error as any)?.status;

    // 429 에러 (쿼터 초과) 처리
    if (
      errorStatus === 429 ||
      errorCode === "INSUFFICIENT_QUOTA" ||
      errorMessage.includes("쿼터") ||
      errorMessage.includes("quota")
    ) {
      return NextResponse.json(
        {
          error: "OpenAI API 쿼터가 초과되었습니다",
          message:
            "AI 서비스 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.",
          code: "INSUFFICIENT_QUOTA",
        },
        { status: 429 }
      );
    }

    // 에러 타입에 따른 상태 코드 결정
    const statusCode =
      errorMessage.includes("No daily feedbacks") || errorStatus === 404
        ? 404
        : errorMessage.includes("No content from OpenAI") || errorStatus === 500
        ? 500
        : errorMessage.includes("Failed to")
        ? 500
        : errorStatus || 500;

    return NextResponse.json(
      {
        error: "주간 피드백 생성 중 오류가 발생했습니다",
        message: errorMessage,
        details: errorMessage,
      },
      { status: statusCode }
    );
  }
}
