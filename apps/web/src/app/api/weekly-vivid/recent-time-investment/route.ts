import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { fetchRecentWeeklyVivids } from "../db-service";
import {
  RECENT_TRENDS_REVALIDATE,
  getCacheControlHeader,
} from "@/constants/cache";

export interface TimeInvestmentWeekItem {
  week_start: string;
  week_end: string;
  week_label: string;
  breakdown: Array<{ category: string; percentage: number }>;
}

/** week_start (YYYY-MM-DD) → "[01월1주차]" 형식 */
function formatWeekLabel(weekStart: string): string {
  const match = String(weekStart).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  const month = match[2];
  const day = parseInt(match[3], 10);
  const weekNum = Math.ceil(day / 7);
  return `[${month}월${weekNum}주차]`;
}

/**
 * GET 핸들러: 최근 4주 주간 비비드의 time_investment_breakdown 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const force = searchParams.get("force") === "1";

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();
    const weeklyVivids = await fetchRecentWeeklyVivids(supabase, userId, 4);

    const data: TimeInvestmentWeekItem[] = [];

    for (const wv of weeklyVivids) {
      const breakdown =
        wv.report?.completed_todos_insights?.time_investment_breakdown;
      if (!breakdown || breakdown.length === 0) continue;

      const weekLabel = formatWeekLabel(wv.week_range.start);
      if (!weekLabel) continue;

      data.push({
        week_start: wv.week_range.start,
        week_end: wv.week_range.end,
        week_label: weekLabel,
        breakdown,
      });
    }

    return NextResponse.json(
      { data },
      {
        status: 200,
        headers: {
          "Cache-Control": force
            ? "no-store, max-age=0"
            : getCacheControlHeader(RECENT_TRENDS_REVALIDATE),
        },
      }
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
