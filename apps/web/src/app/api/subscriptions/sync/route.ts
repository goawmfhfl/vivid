import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { getAuthenticatedUserIdFromRequest } from "@/app/api/utils/auth";

/**
 * POST /api/subscriptions/sync
 * 현재 사용자의 구독 정보를 user_metadata에서 동기화
 * 카카오 연동 후 user_metadata 보존을 위해 사용
 */
export async function POST(request: NextRequest) {
  try {
    // 인증 확인 (쿠키 또는 Authorization 헤더에서)
    let userId: string;
    try {
      userId = await getAuthenticatedUserIdFromRequest(request);
    } catch (error) {
      console.error("[Subscription Sync Auth Error]", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }
    const supabaseService = getServiceSupabase();

    // user_metadata에서 구독 정보 가져오기
    const { data: { user }, error: getUserError } =
      await supabaseService.auth.admin.getUserById(userId);

    if (getUserError || !user) {
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // user_metadata의 subscription 정보 반환
    const subscription = user.user_metadata?.subscription || null;

    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error("구독 동기화 실패:", error);
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `구독 동기화 실패: ${errorMessage}` },
      { status: 500 }
    );
  }
}
