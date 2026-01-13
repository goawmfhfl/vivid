import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { decryptJsonbFields, type JsonbValue } from "@/lib/jsonb-encryption";
import { API_ENDPOINTS } from "@/constants";
import {
  RECENT_TRENDS_REVALIDATE,
  getCacheControlHeader,
} from "@/constants/cache";
import type { MonthlyTrendsResponse } from "@/types/monthly-feedback-new";

/**
 * GET 핸들러: 최근 4달간의 monthly-feedback trend 데이터 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 최근 4달간의 monthly-feedback 데이터 조회 (trend 컬럼만 선택)
    const { data, error } = await supabase
      .from(API_ENDPOINTS.MONTHLY_FEEDBACK)
      .select("month, trend")
      .eq("user_id", userId)
      .not("trend", "is", null)
      .order("month", { ascending: false })
      .limit(4);

    if (error) {
      throw new Error(`Failed to fetch monthly feedback trends: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return NextResponse.json<MonthlyTrendsResponse>(
        {
          breakdown_moments: [],
          recovery_moments: [],
          energy_sources: [],
          missing_future_elements: [],
          top_keywords: [],
        },
        { status: 200 }
      );
    }

    // trend 데이터 추출 및 복호화
    const breakdownMomentsList: MonthlyTrendsResponse["breakdown_moments"] = [];
    const recoveryMomentsList: MonthlyTrendsResponse["recovery_moments"] = [];
    const energySourcesList: MonthlyTrendsResponse["energy_sources"] = [];
    const missingFutureElementsList: MonthlyTrendsResponse["missing_future_elements"] = [];
    const topKeywordsList: MonthlyTrendsResponse["top_keywords"] = [];

    for (const item of data) {
      if (item.trend) {
        // trend 복호화
        const decryptedTrend = decryptJsonbFields(
          item.trend as JsonbValue
        ) as {
          breakdown_moments?: string;
          recovery_moments?: string;
          energy_sources?: string;
          missing_future_elements?: string;
          top_keywords?: string;
        } | null;

        if (decryptedTrend && typeof decryptedTrend === "object") {
          const month = item.month;

          if (decryptedTrend.breakdown_moments) {
            breakdownMomentsList.push({
              month,
              answer: decryptedTrend.breakdown_moments,
            });
          }

          if (decryptedTrend.recovery_moments) {
            recoveryMomentsList.push({
              month,
              answer: decryptedTrend.recovery_moments,
            });
          }

          if (decryptedTrend.energy_sources) {
            energySourcesList.push({
              month,
              answer: decryptedTrend.energy_sources,
            });
          }

          if (decryptedTrend.missing_future_elements) {
            missingFutureElementsList.push({
              month,
              answer: decryptedTrend.missing_future_elements,
            });
          }

          if (decryptedTrend.top_keywords) {
            topKeywordsList.push({
              month,
              answer: decryptedTrend.top_keywords,
            });
          }
        }
      }
    }

    const response: MonthlyTrendsResponse = {
      breakdown_moments: breakdownMomentsList,
      recovery_moments: recoveryMomentsList,
      energy_sources: energySourcesList,
      missing_future_elements: missingFutureElementsList,
      top_keywords: topKeywordsList,
    };

    return NextResponse.json<MonthlyTrendsResponse>(
      response,
      {
        status: 200,
        headers: {
          "Cache-Control": getCacheControlHeader(RECENT_TRENDS_REVALIDATE),
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
