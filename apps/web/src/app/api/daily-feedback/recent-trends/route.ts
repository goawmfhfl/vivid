import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { type JsonbValue } from "@/lib/jsonb-encryption";
import { API_ENDPOINTS } from "@/constants";
import {
  RECENT_TRENDS_REVALIDATE,
  getCacheControlHeader,
} from "@/constants/cache";

interface RecentTrendsResponse {
  aspired_self: string[]; // 내가 지향하는 모습 (최근 5개)
  interests: string[]; // 나의 관심사 (최근 5개)
  immersion_moments: string[]; // 몰입 희망 순간 (최근 5개)
  personality_traits: string[]; // 나라는 사람의 성향 (최근 5개)
}

/**
 * GET 핸들러: 최근 5일의 daily-feedback 데이터 조회
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

    // 최근 5일의 날짜 계산
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates: string[] = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split("T")[0]);
    }

    // 최근 5일의 daily-feedback 데이터 조회 (trend 컬럼만 선택)
    const { data, error } = await supabase
      .from(API_ENDPOINTS.DAILY_FEEDBACK)
      .select("report_date, trend")
      .eq("user_id", userId)
      .in("report_date", dates)
      .order("report_date", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch daily feedback: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return NextResponse.json<RecentTrendsResponse>(
        {
          aspired_self: [],
          interests: [],
          immersion_moments: [],
          personality_traits: [],
        },
        { status: 200 }
      );
    }

    // trend 데이터 추출 및 복호화
    const { decryptJsonbFields } = await import("@/lib/jsonb-encryption");
    const aspired_selfList: string[] = [];
    const interestsList: string[] = [];
    const immersion_momentsList: string[] = [];
    const personality_traitsList: string[] = [];

    for (const item of data) {
      if (item.trend) {
        // trend 복호화
        const decryptedTrend = decryptJsonbFields(
          item.trend as unknown as JsonbValue
        ) as { aspired_self?: string; interest?: string; immersion_moment?: string; personality_trait?: string } | null;

        if (decryptedTrend && typeof decryptedTrend === "object") {
          if (decryptedTrend.aspired_self) {
            aspired_selfList.push(decryptedTrend.aspired_self);
          }
          if (decryptedTrend.interest) {
            interestsList.push(decryptedTrend.interest);
          }
          if (decryptedTrend.immersion_moment) {
            immersion_momentsList.push(decryptedTrend.immersion_moment);
          }
          if (decryptedTrend.personality_trait) {
            personality_traitsList.push(decryptedTrend.personality_trait);
          }
        }
      }
    }

    // 최대 5개로 제한
    const response: RecentTrendsResponse = {
      aspired_self: aspired_selfList.slice(0, 5),
      interests: interestsList.slice(0, 5),
      immersion_moments: immersion_momentsList.slice(0, 5),
      personality_traits: personality_traitsList.slice(0, 5),
    };

    return NextResponse.json<RecentTrendsResponse>(
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
