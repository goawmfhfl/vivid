import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import {
  fetchWeeklyFeedbackDetail,
  fetchDailyFeedbacksByRange,
} from "../db-service";

/**
 * GET 핸들러: 주간 피드백 상세 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const feedback = await fetchWeeklyFeedbackDetail(supabase, userId, id);

    if (!feedback) {
      return NextResponse.json(
        { error: "Weekly feedback not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { data: feedback },
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
