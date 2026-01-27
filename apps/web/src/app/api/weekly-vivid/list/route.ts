import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { fetchWeeklyVividList } from "../db-service";

/**
 * GET 핸들러: 주간 비비드 리스트 조회
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
    const list = await fetchWeeklyVividList(supabase, userId);

    return NextResponse.json(
      { data: list },
      {
        status: 200,
        headers: {
          // 최신 생성 데이터를 즉시 반영하기 위해 캐시 비활성화
          "Cache-Control": "no-store, max-age=0",
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
