import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { getAuthenticatedUserIdFromRequest } from "@/app/api/utils/auth";
import { API_ENDPOINTS } from "@/constants";

/**
 * GET /api/survey/participation-status
 * 설문 참여 여부 조회 (로그인 필수)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserIdFromRequest(request);
    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from(API_ENDPOINTS.SURVEY_SUBMISSIONS)
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("설문 참여 여부 조회 오류:", error);
      throw new Error(`Failed to check participation: ${error.message}`);
    }

    return NextResponse.json({
      hasParticipated: !!data,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unauthorized";
    const status = errorMessage.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
}
