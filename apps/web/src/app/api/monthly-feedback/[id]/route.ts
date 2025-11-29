import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { fetchMonthlyFeedbackDetail } from "../db-service";

/**
 * GET 핸들러: 월간 피드백 상세 조회 (id 기반)
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
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const monthlyFeedback = await fetchMonthlyFeedbackDetail(
      supabase,
      userId,
      id
    );

    if (!monthlyFeedback) {
      return NextResponse.json(
        { error: "Monthly feedback not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Monthly feedback retrieved successfully",
        data: monthlyFeedback,
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
