import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { decryptDailyVivid } from "@/lib/jsonb-encryption";
import type { DailyVividRow } from "@/types/daily-vivid";
import { API_ENDPOINTS } from "@/constants";
import {
  FEEDBACK_REVALIDATE,
  getCacheControlHeader,
} from "@/constants/cache";

/**
 * GET 핸들러: 일일 비비드 조회 (date 기반)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json({ error: "date is required" }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { data, error } = await supabase
    .from(API_ENDPOINTS.DAILY_VIVID)
      .select("*")
      .eq("user_id", userId)
      .eq("report_date", date)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch daily vivid: ${error.message}`);
    }

    if (!data) {
      return NextResponse.json(
        { data: null },
        {
          status: 200,
          headers: {
            "Cache-Control": getCacheControlHeader(FEEDBACK_REVALIDATE),
          },
        }
      );
    }

    // 서버 사이드에서 복호화 처리
    const decrypted = decryptDailyVivid(
      data as unknown as { [key: string]: unknown }
    ) as unknown as DailyVividRow;

    return NextResponse.json(
      { data: decrypted },
      {
        status: 200,
        headers: {
          "Cache-Control": getCacheControlHeader(FEEDBACK_REVALIDATE),
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
