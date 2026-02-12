import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { generateMonthlyTrend } from "../sections/trend";
import { fetchMonthlyVividByMonth } from "../db-service";
import type { MonthlyReport } from "@/types/monthly-vivid";
import { verifySubscription } from "@/lib/subscription-utils";

/**
 * 테스트용: trend만 생성하는 엔드포인트
 * 
 * 사용법:
 * POST /api/monthly-vivid/test-trend
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

    // 기존 월간 비비드 조회 (report 필요)
    const monthlyVivid = await fetchMonthlyVividByMonth(
      supabase,
      userId,
      month
    );

    if (!monthlyVivid || !monthlyVivid.report) {
      return NextResponse.json(
        { error: "Monthly vivid with report not found. Please generate monthly vivid first." },
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
      monthlyVivid.report as MonthlyReport,
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
      recurring_self: trend.recurring_self?.substring(0, 50) + "...",
      effort_to_keep: trend.effort_to_keep?.substring(0, 50) + "...",
      most_meaningful: trend.most_meaningful?.substring(0, 50) + "...",
      biggest_change: trend.biggest_change?.substring(0, 50) + "...",
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
