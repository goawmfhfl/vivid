import { NextRequest, NextResponse } from "next/server";
import { syncSubscriptionToMetadata } from "@/lib/subscription-utils";
import { getAuthenticatedUserId } from "../../../utils/auth";

/**
 * POST /api/test/subscription/sync
 * 테스트용 user_metadata 동기화 API
 * 개발 환경에서만 사용 가능
 *
 * Authorization 헤더에서 토큰을 읽어 현재 로그인한 사용자의 user_metadata를 동기화합니다.
 */
export async function POST(request: NextRequest) {
  // 프로덕션 환경에서는 접근 차단
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is not available in production" },
      { status: 403 }
    );
  }

  try {
    // Authorization 헤더에서 현재 로그인한 사용자 ID 가져오기
    const userId = await getAuthenticatedUserId(request);

    // user_metadata 동기화
    await syncSubscriptionToMetadata(userId);

    return NextResponse.json(
      {
        message: "user_metadata가 성공적으로 동기화되었습니다.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Subscription sync API error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
