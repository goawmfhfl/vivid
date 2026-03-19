import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { decryptJsonbFields, type JsonbValue } from "@/lib/jsonb-encryption";
import { RECENT_TRENDS_REVALIDATE, getCacheControlHeader } from "@/constants/cache";
import { API_ENDPOINTS } from "@/constants";
import type { FocusPatternData, KeywordTrendData } from "@/app/api/cron/update-investment-trends/helpers";

export interface InvestmentTrendsResponse {
  focus_pattern: FocusPatternData | null;
  keyword_trend: KeywordTrendData | null;
  based_on_weeks: number;
}

/**
 * GET 핸들러: user_trends에서 weekly_investment_trend 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const force = searchParams.get("force") === "1";

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from(API_ENDPOINTS.USER_TRENDS)
      .select("trend, period_start, period_end, generated_at")
      .eq("user_id", userId)
      .eq("type", "weekly_investment_trend")
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch investment trend: ${error.message}`);
    }

    if (!data) {
      return NextResponse.json<InvestmentTrendsResponse>(
        { focus_pattern: null, keyword_trend: null, based_on_weeks: 0 },
        {
          status: 200,
          headers: { "Cache-Control": "no-store, max-age=0" },
        }
      );
    }

    const decoded = decryptJsonbFields(data.trend as JsonbValue) as Record<string, unknown>;

    const response: InvestmentTrendsResponse = {
      focus_pattern: (decoded.focus_pattern as FocusPatternData) ?? null,
      keyword_trend: (decoded.keyword_trend as KeywordTrendData) ?? null,
      based_on_weeks: (decoded.based_on_weeks as number) ?? 0,
    };

    return NextResponse.json<InvestmentTrendsResponse>(response, {
      status: 200,
      headers: {
        "Cache-Control": force
          ? "no-store, max-age=0"
          : getCacheControlHeader(RECENT_TRENDS_REVALIDATE),
      },
    });
  } catch (error) {
    console.error("API error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
