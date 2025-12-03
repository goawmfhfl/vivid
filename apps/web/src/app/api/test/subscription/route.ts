import { NextRequest, NextResponse } from "next/server";
import { upsertSubscription } from "@/lib/subscription-utils";
import { getAuthenticatedUserId } from "../../utils/auth";

/**
 * POST /api/test/subscription
 * 테스트용 구독 생성/업데이트 API
 * 개발 환경에서만 사용 가능
 *
 * Authorization 헤더에서 토큰을 읽어 현재 로그인한 사용자의 구독을 업데이트합니다.
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
    const body = await request.json();
    const { plan, status, expiresAt } = body;

    // 요청 검증
    if (!plan || !status) {
      return NextResponse.json(
        { error: "plan and status are required" },
        { status: 400 }
      );
    }

    // Authorization 헤더에서 현재 로그인한 사용자 ID 가져오기
    const userId = await getAuthenticatedUserId(request);

    // 구독 생성/업데이트
    const subscription = await upsertSubscription(userId, {
      plan,
      status,
      expires_at: expiresAt || null,
    });

    return NextResponse.json(
      {
        message: "구독이 성공적으로 업데이트되었습니다.",
        subscription,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Subscription test API error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
