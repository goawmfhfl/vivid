import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { generateMonthlyTrend } from "../sections/trend";
import { fetchMonthlyFeedbackByMonth } from "../db-service";
import type { VividReport } from "@/types/monthly-feedback-new";
import { verifySubscription } from "@/lib/subscription-utils";

/**
 * 테스트용: trend만 생성하는 엔드포인트
 * 
 * 사용법:
 * POST /api/monthly-feedback/test-trend
 * Body: { userId: string, month: string }
 * 
 * 주의: 테스트 후 이 파일을 삭제하세요!
 */
export async function POST(request: NextRequest) {
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

    // Pro 멤버십 확인
    const isPro = (await verifySubscription(userId)).isPro;

    // 기존 월간 피드백 조회 (vivid_report 필요)
    const monthlyFeedback = await fetchMonthlyFeedbackByMonth(
      supabase,
      userId,
      month
    );

    if (!monthlyFeedback || !monthlyFeedback.vivid_report) {
      return NextResponse.json(
        { error: "Monthly feedback with vivid_report not found. Please generate monthly feedback first." },
        { status: 404 }
      );
    }

    const [year, monthNum] = month.split("-");
    const monthLabel = `${year}년 ${monthNum}월`;

    // 사용자 이름 조회
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", userId)
      .single();
    const userName = profile?.name || undefined;

    console.log(`[TEST] Generating trend for ${monthLabel}...`);

    // Trend만 생성
    const trend = await generateMonthlyTrend(
      monthlyFeedback.vivid_report as VividReport,
      month,
      monthLabel,
      isPro,
      userId,
      userName
    );

    if (!trend) {
      return NextResponse.json(
        { error: "Failed to generate trend data" },
        { status: 500 }
      );
    }

    console.log(`[TEST] Trend generated successfully:`, {
      breakdown_moments: trend.breakdown_moments?.substring(0, 50) + "...",
      recovery_moments: trend.recovery_moments?.substring(0, 50) + "...",
      energy_sources: trend.energy_sources?.substring(0, 50) + "...",
      missing_future_elements: trend.missing_future_elements?.substring(0, 50) + "...",
      top_keywords: trend.top_keywords?.substring(0, 50) + "...",
    });

    return NextResponse.json({
      success: true,
      month,
      monthLabel,
      trend,
    });
  } catch (error) {
    console.error("[TEST] Trend generation error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
