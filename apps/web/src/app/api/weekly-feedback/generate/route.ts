import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { fetchDailyFeedbacksByRange, saveWeeklyFeedback } from "../db-service";
import { generateWeeklyFeedbackFromDailyWithProgress } from "../ai-service-stream";
import type { WeeklyFeedbackGenerateRequest } from "../types";
import { verifySubscription } from "@/lib/subscription-utils";
import type { WeeklyFeedback } from "@/types/weekly-feedback";

import type { WithTracking } from "../../types";
import type { ApiError } from "../../types";

function removeTrackingInfo(
  feedback: WithTracking<WeeklyFeedback>
): WeeklyFeedback {
  const cleaned = { ...feedback } as Record<string, unknown>;

  const sections = [
    "vivid_report",
    "closing_report",
  ];

  for (const key of sections) {
    if (cleaned[key] && typeof cleaned[key] === "object") {
      const { __tracking: _, ...rest } = cleaned[key] as Record<
        string,
        unknown
      > & { __tracking?: unknown };
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

    // 사용자 이름 조회
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", userId)
      .single();
    const userName = profile?.name || undefined;

    // 1️⃣ Daily Feedback 데이터 조회
    const dailyFeedbacks = await fetchDailyFeedbacksByRange(
      supabase,
      userId,
      start,
      end
    );

    // 조회된 데이터 로깅
    console.log(`[Weekly Feedback Generate] 날짜 범위: ${start} ~ ${end}`);
    console.log(`[Weekly Feedback Generate] 조회된 daily feedback 개수: ${dailyFeedbacks.length}`);
    console.log(
      `[Weekly Feedback Generate] 조회된 날짜 목록:`,
      dailyFeedbacks.map((f) => f.report_date).join(", ")
    );

    if (dailyFeedbacks.length === 0) {
      return NextResponse.json(
        { error: "No daily feedbacks found for this date range" },
        { status: 404 }
      );
    }

    // 2️⃣ AI 요청: Weekly Feedback 생성 (vivid_report만 생성)
    const weeklyFeedback = await generateWeeklyFeedbackFromDailyWithProgress(
      dailyFeedbacks,
      { start, end, timezone },
      isPro,
      userId, // AI 사용량 로깅을 위한 userId 전달
      userName // 사용자 이름 전달
    );

    // 추적 정보 제거 (DB 저장 전)
    const cleanedFeedback = removeTrackingInfo(weeklyFeedback);

    // 3️⃣ Supabase weekly_feedbacks 테이블에 저장
    const savedId = await saveWeeklyFeedback(supabase, userId, cleanedFeedback);

    return NextResponse.json(
      {
        message: "Weekly feedback generated and saved successfully",
        data: { ...cleanedFeedback, id: savedId },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = (error as ApiError)?.code;
    const errorStatus = (error as ApiError)?.status;

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
