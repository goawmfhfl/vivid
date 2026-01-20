import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { fetchMonthlyVividDetail } from "../../db-service";
import {
  FEEDBACK_REVALIDATE,
  getCacheControlHeader,
} from "@/constants/cache";

/**
 * GET 핸들러: 월간 비비드 상세 조회 (id 기반)
 */
export async function handleGetMonthlyVividById(
  request: NextRequest,
  id: string
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
    const monthlyVivid = await fetchMonthlyVividDetail(
      supabase,
      userId,
      id
    );

    if (!monthlyVivid) {
      return NextResponse.json(
        { error: "Monthly vivid not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Monthly vivid retrieved successfully",
        data: monthlyVivid,
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
