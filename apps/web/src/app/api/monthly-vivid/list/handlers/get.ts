import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { fetchMonthlyVividList } from "../../db-service";
import {
  FEEDBACK_REVALIDATE,
  getCacheControlHeader,
} from "@/constants/cache";

/**
 * GET 핸들러: 월간 비비드 리스트 조회
 */
export async function handleGetMonthlyVividList(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();
    const monthlyVivids = await fetchMonthlyVividList(supabase, userId);

    return NextResponse.json(
      {
        message: "Monthly vivid list retrieved successfully",
        data: monthlyVivids,
      },
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
