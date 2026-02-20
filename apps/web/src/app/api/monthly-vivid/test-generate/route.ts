import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { saveMonthlyVivid } from "../db-service";
import { generateMonthlyVividFromRecordsWithProgress } from "../ai-service-from-records";
import { fetchRecordsByDateRange } from "../records-db";
import { getKSTDateString } from "@/lib/date-utils";
import { verifySubscription } from "@/lib/subscription-utils";
import type { MonthlyVivid } from "@/types/monthly-vivid";
import type { WithTracking } from "../../types";
import { removeTrackingFromObject } from "../../utils/remove-tracking";

/**
 * __tracking 정보 제거 (DB 저장 전)
 */
function removeTrackingInfo(
  feedback: WithTracking<MonthlyVivid>
): MonthlyVivid {
  const cleaned = { ...feedback } as Record<string, unknown>;

  if ("__tracking" in cleaned) {
    delete cleaned.__tracking;
  }

  if (cleaned.title && typeof cleaned.title === "object" && cleaned.title !== null) {
    const titleObj = cleaned.title as Record<string, unknown> & { __tracking?: unknown; title?: string };
    if (titleObj.title && typeof titleObj.title === "string") {
      cleaned.title = titleObj.title;
    } else {
      cleaned.title = removeTrackingFromObject(titleObj);
    }
  }

  if (cleaned.report && typeof cleaned.report === "object" && cleaned.report !== null) {
    cleaned.report = removeTrackingFromObject(cleaned.report as Record<string, unknown>);
  }

  if (cleaned.trend && typeof cleaned.trend === "object" && cleaned.trend !== null) {
    cleaned.trend = removeTrackingFromObject(cleaned.trend as Record<string, unknown>);
  }

  return cleaned as MonthlyVivid;
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
 * 테스트용: 월간 비비드 생성 엔드포인트
 * 
 * 특징:
 * - 월말 필터링 우회 (언제든지 생성 가능)
 * - vivid-records를 기반으로 생성 (Gemini 2.0 Flash Exp Pro 모델 사용)
 * - Pro 멤버십 체크는 유지
 * 
 * 사용법:
 * POST /api/monthly-vivid/test-generate
 * Body: { userId: string, month: string, start_date?: string, end_date?: string, generation_duration_seconds?: number }
 * 
 * 주의: 테스트용이므로 프로덕션에서는 사용하지 마세요!
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now(); // 전체 생성 시간 측정 시작

  try {
    const body = await request.json();
    const { 
      userId, 
      month, 
      start_date, 
      end_date,
      generation_duration_seconds,
    }: { 
      userId: string; 
      month: string;
      start_date?: string;
      end_date?: string;
      generation_duration_seconds?: number;
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

    // 사용자 이름 조회
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", userId)
      .single();
    const userName = profile?.name || undefined;

    // 날짜 범위 계산 (커스텀 날짜가 있으면 사용, 없으면 월 전체)
    const dateRange = start_date && end_date
      ? { start_date, end_date }
      : getMonthDateRange(month);

    console.log(`[TEST] 월간 VIVID 생성 시작: ${month} (${dateRange.start_date} ~ ${dateRange.end_date})`);

    // 1️⃣ Vivid Records 데이터 조회 (해당 월의 모든 기록)
    const records = await fetchRecordsByDateRange(
      supabase,
      userId,
      dateRange.start_date,
      dateRange.end_date
    );

    // 조회된 데이터 로깅
    console.log(`[TEST] 조회된 기록 개수: ${records.length}`);
    
    // 날짜별 기록 개수 로깅
    const recordsByDate = new Map<string, number>();
    records.forEach((record) => {
      const date = record.kst_date;
      recordsByDate.set(date, (recordsByDate.get(date) || 0) + 1);
    });
    console.log(
      `[TEST] 날짜별 기록 개수:`,
      Array.from(recordsByDate.entries())
        .map(([date, count]) => `${date}: ${count}개`)
        .join(", ")
    );

    if (records.length === 0) {
      return NextResponse.json(
        { error: `vivid-records가 필요합니다. 날짜 범위: ${dateRange.start_date} ~ ${dateRange.end_date}` },
        { status: 400 }
      );
    }

    // 2️⃣ AI 요청: Monthly Vivid 생성 (Gemini 2.0 Flash Exp Pro 모델 사용, 기록 기반)
    const monthlyVivid = await generateMonthlyVividFromRecordsWithProgress(
      records,
      month,
      dateRange,
      isPro,
      userId,
      userName
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

    // 생성 시간 계산 (서버 측 측정, 클라이언트 측정값이 없을 때 사용)
    const endTime = Date.now();
    const serverDurationSeconds = (endTime - startTime) / 1000;
    const finalDurationSeconds = generation_duration_seconds ?? serverDurationSeconds;

    console.log(`[TEST] 월간 VIVID 생성 완료: ${finalDurationSeconds.toFixed(2)}초`);

    // 3️⃣ Supabase monthly_vivid 테이블에 저장
    const savedId = await saveMonthlyVivid(
      supabase,
      userId,
      cleanedFeedback,
      finalDurationSeconds
    );

    return NextResponse.json(
      {
        message: "Monthly vivid generated successfully (TEST MODE)",
        data: { 
          ...cleanedFeedback, 
          id: savedId,
          generation_duration_seconds: finalDurationSeconds,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[TEST] API error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
