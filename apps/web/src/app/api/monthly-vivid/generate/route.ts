import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import {
  fetchDailyVividByMonth,
  saveMonthlyVivid,
} from "../db-service";
import { generateMonthlyVividFromDailyWithProgress } from "../ai-service";
import { getKSTDateString } from "@/lib/date-utils";
import { verifySubscription } from "@/lib/subscription-utils";
import type { MonthlyVivid } from "@/types/monthly-vivid";
import type { WithTracking } from "../../types";

/**
 * __tracking 정보 제거 (DB 저장 전)
 */
function removeTrackingInfo(
  feedback: WithTracking<MonthlyVivid>
): MonthlyVivid {
  const cleaned = { ...feedback } as Record<string, unknown>;

  // __tracking 제거
  if ("__tracking" in cleaned) {
    delete cleaned.__tracking;
  }

  // title이 객체인 경우 처리 (__tracking 제거 및 title 추출)
  if (cleaned.title && typeof cleaned.title === "object" && cleaned.title !== null) {
    const titleObj = cleaned.title as Record<string, unknown> & { __tracking?: unknown; title?: string };
    if (titleObj.title && typeof titleObj.title === "string") {
      cleaned.title = titleObj.title;
    } else {
      // title 필드가 없으면 __tracking만 제거
      const { __tracking: _, ...rest } = titleObj;
      cleaned.title = rest;
    }
  }

  // report에서 __tracking 제거 (재귀적으로)
  if (cleaned.report && typeof cleaned.report === "object" && cleaned.report !== null) {
    cleaned.report = removeTrackingFromObject(cleaned.report as Record<string, unknown>);
  }

  // trend에서 __tracking 제거
  if (cleaned.trend && typeof cleaned.trend === "object" && cleaned.trend !== null) {
    const { __tracking: _, ...rest } = cleaned.trend as Record<
      string,
      unknown
    > & { __tracking?: unknown };
    cleaned.trend = rest;
  }

  return cleaned as MonthlyVivid;
}

/**
 * 객체에서 재귀적으로 __tracking 제거
 */
function removeTrackingFromObject(obj: Record<string, unknown>): unknown {
  const cleaned = { ...obj };
  
  if ("__tracking" in cleaned) {
    delete cleaned.__tracking;
  }

  // 모든 속성을 순회하며 재귀적으로 처리
  for (const key in cleaned) {
    if (cleaned[key] && typeof cleaned[key] === "object" && !Array.isArray(cleaned[key])) {
      cleaned[key] = removeTrackingFromObject(cleaned[key] as Record<string, unknown>);
    } else if (Array.isArray(cleaned[key])) {
      cleaned[key] = (cleaned[key] as unknown[]).map(item => {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          return removeTrackingFromObject(item as Record<string, unknown>);
        }
        return item;
      });
    }
  }

  return cleaned;
}

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
 * POST 핸들러: 월간 비비드 생성
 *
 * 플로우:
 * 1. Daily Vivid 조회
 * 2. AI로 Monthly Vivid 생성
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
    const subscriptionVerification = await verifySubscription(userId);
    const isPro = subscriptionVerification.isPro;

    // Pro 멤버십이 아니면 403 에러 반환
    if (!isPro) {
      return NextResponse.json(
        { error: "Pro 멤버십이 필요합니다. 월간 VIVID 생성은 Pro 플랜에서만 사용할 수 있습니다." },
        { status: 403 }
      );
    }

    // 날짜 범위 계산 (커스텀 날짜가 있으면 사용, 없으면 월 전체)
    const dateRange = start_date && end_date
      ? { start_date, end_date }
      : getMonthDateRange(month);

    // 1️⃣ Daily Vivid 데이터 조회
    const dailyVividList = await fetchDailyVividByMonth(
      supabase,
      userId,
      dateRange.start_date,
      dateRange.end_date
    );

    // 최소 1개 이상의 daily-vivid가 있어야 함
    if (dailyVividList.length < 1) {
      return NextResponse.json(
        { error: `일일 비비드가 필요합니다. 현재: ${dailyVividList.length}개` },
        { status: 400 }
      );
    }

    // 2️⃣ AI 요청: Monthly Vivid 생성
    const monthlyVivid = await generateMonthlyVividFromDailyWithProgress(
      dailyVividList,
      month,
      dateRange,
      isPro,
      userId
    );

    // month_label 설정 (없는 경우)
    if (!monthlyVivid.month_label) {
      const [year, monthNum] = month.split("-");
      monthlyVivid.month_label = `${year}년 ${monthNum}월`;
    }

    // date_range 설정 (없는 경우)
    if (!monthlyVivid.date_range) {
      monthlyVivid.date_range = dateRange;
    }

    // __tracking 정보 제거 (DB 저장 전)
    const cleanedFeedback = removeTrackingInfo(monthlyVivid);

    // 3️⃣ Supabase monthly_vivid 테이블에 저장
    const savedId = await saveMonthlyVivid(
      supabase,
      userId,
      cleanedFeedback
    );

    return NextResponse.json(
      {
        message: "Monthly vivid generated successfully",
        data: { ...cleanedFeedback, id: savedId },
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
