import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { decryptJsonbFields, type JsonbValue } from "@/lib/jsonb-encryption";
import { API_ENDPOINTS } from "@/constants";
import {
  RECENT_TRENDS_REVALIDATE,
  getCacheControlHeader,
} from "@/constants/cache";

interface WeeklyTrendsResponse {
  direction: string[]; // 어떤 방향으로 가고 있는 사람인가 (최근 4주)
  core_value: string[]; // 내가 진짜 중요하게 여기는 가치 (최근 4주)
  driving_force: string[]; // 나를 움직이는 실제 원동력 (최근 4주)
  current_self: string[]; // 요즘의 나라는 사람 (최근 4주)
}

/**
 * GET 핸들러: 최근 4주간의 weekly-vivid trend 데이터 조회
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

    // 최근 4주간의 weekly-vivid 데이터 조회 (trend 컬럼만 선택)
    const { data, error } = await supabase
      .from(API_ENDPOINTS.WEEKLY_VIVID)
      .select("week_start, trend")
      .eq("user_id", userId)
      .not("trend", "is", null)
      .order("week_start", { ascending: false })
      .limit(4);

    if (error) {
      throw new Error(`Failed to fetch weekly vivid trends: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return NextResponse.json<WeeklyTrendsResponse>(
        {
          direction: [],
          core_value: [],
          driving_force: [],
          current_self: [],
        },
        { status: 200 }
      );
    }

    // trend 데이터 추출 및 복호화
    const directionList: string[] = [];
    const core_valueList: string[] = [];
    const driving_forceList: string[] = [];
    const current_selfList: string[] = [];

    for (const item of data) {
      if (item.trend) {
        // trend 복호화
        const decryptedTrend = decryptJsonbFields(
          item.trend as JsonbValue
        ) as { direction?: string; core_value?: string; driving_force?: string; current_self?: string } | null;

        if (decryptedTrend && typeof decryptedTrend === "object") {
          if (decryptedTrend.direction) {
            directionList.push(decryptedTrend.direction);
          }
          if (decryptedTrend.core_value) {
            core_valueList.push(decryptedTrend.core_value);
          }
          if (decryptedTrend.driving_force) {
            driving_forceList.push(decryptedTrend.driving_force);
          }
          if (decryptedTrend.current_self) {
            current_selfList.push(decryptedTrend.current_self);
          }
        }
      }
    }

    // 최대 4개로 제한
    const response: WeeklyTrendsResponse = {
      direction: directionList.slice(0, 4),
      core_value: core_valueList.slice(0, 4),
      driving_force: driving_forceList.slice(0, 4),
      current_self: current_selfList.slice(0, 4),
    };

    return NextResponse.json<WeeklyTrendsResponse>(
      response,
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
