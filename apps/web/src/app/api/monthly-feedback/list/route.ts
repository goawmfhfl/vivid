import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { fetchMonthlyFeedbackList } from "../db-service";

/**
 * GET 핸들러: 월간 피드백 리스트 조회
 */
export async function GET(request: NextRequest) {
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

    const monthlyFeedbacks = await fetchMonthlyFeedbackList(supabase, userId);

    return NextResponse.json(
      {
        message: "Monthly feedback list retrieved successfully",
        data: monthlyFeedbacks,
      },
      { status: 200 }
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
