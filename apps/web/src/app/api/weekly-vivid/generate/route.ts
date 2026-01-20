import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { fetchDailyVividByRange, saveWeeklyVivid } from "../db-service";
import { generateWeeklyVividFromDailyWithProgress } from "../ai-service-stream";
import type { WeeklyVividGenerateRequest } from "../types";
import { verifySubscription } from "@/lib/subscription-utils";
import type { WeeklyVivid } from "@/types/weekly-vivid";

import type { WithTracking } from "../../types";
import type { ApiError } from "../../types";

function removeTrackingInfo(
  feedback: WithTracking<WeeklyVivid>
): WeeklyVivid {
  const cleaned = { ...feedback } as Record<string, unknown>;

  const sections = ["report"];

  for (const key of sections) {
    if (cleaned[key] && typeof cleaned[key] === "object") {
      const { __tracking: _, ...rest } = cleaned[key] as Record<
        string,
        unknown
      > & { __tracking?: unknown };
      cleaned[key] = rest;
    }
  }

  return cleaned as WeeklyVivid;
}

// Next.js API Route 타임아웃 설정 (최대 3분)
export const maxDuration = 180;

/**
 * POST 핸들러: 주간 비비드 생성
 *
 * 플로우:
 * 1. Daily Vivid 조회
 * 2. AI로 Weekly Vivid 생성
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
    }: WeeklyVividGenerateRequest = body;

    // 요청 검증
    if (!userId || !start || !end) {
      return NextResponse.json(
        { error: "userId, start, and end are required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Pro 멤버십 확인 (요청에 포함되어 있으면 사용, 없으면 서버에서 확인)
    const subscriptionVerification = await verifySubscription(userId);
    const isPro = isProFromRequest ?? subscriptionVerification.isPro;

    // Pro 멤버십이 아니면 403 에러 반환
    if (!isPro) {
      return NextResponse.json(
        { error: "Pro 멤버십이 필요합니다. 주간 VIVID 생성은 Pro 플랜에서만 사용할 수 있습니다." },
        { status: 403 }
      );
    }

    // 사용자 이름 조회
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", userId)
      .single();
    const userName = profile?.name || undefined;

    // 1️⃣ Daily Vivid 데이터 조회
    const dailyVividList = await fetchDailyVividByRange(
      supabase,
      userId,
      start,
      end
    );

    // 조회된 데이터 로깅
    console.log(`[Weekly Vivid Generate] 날짜 범위: ${start} ~ ${end}`);
    console.log(
      `[Weekly Vivid Generate] 조회된 daily vivid 개수: ${dailyVividList.length}`
    );
    console.log(
      `[Weekly Vivid Generate] 조회된 날짜 목록:`,
      dailyVividList.map((f) => f.report_date).join(", ")
    );

    if (dailyVividList.length === 0) {
      return NextResponse.json(
        { error: "No daily vivid found for this date range" },
        { status: 404 }
      );
    }

    // 2️⃣ AI 요청: Weekly Vivid 생성 (report만 생성)
    const weeklyVivid = await generateWeeklyVividFromDailyWithProgress(
      dailyVividList,
      { start, end, timezone },
      isPro,
      userId, // AI 사용량 로깅을 위한 userId 전달
      userName // 사용자 이름 전달
    );

    // 추적 정보 제거 (DB 저장 전)
    const cleanedFeedback = removeTrackingInfo(weeklyVivid);

    // 3️⃣ Supabase weekly_vivid 테이블에 저장
    const savedId = await saveWeeklyVivid(supabase, userId, cleanedFeedback);

    return NextResponse.json(
      {
        message: "Weekly vivid generated and saved successfully",
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
        error: "주간 비비드 생성 중 오류가 발생했습니다",
        message: errorMessage,
        details: errorMessage,
      },
      { status: statusCode }
    );
  }
}
