import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserIdFromRequest } from "@/app/api/utils/auth";
import { syncRevenueCatSubscriptionToMetadata } from "@/lib/revenuecat";

/**
 * POST /api/subscriptions/sync
 * 현재 사용자의 구독 미러를 RevenueCat 기준으로 재동기화
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
    const { subscription, synchronized } =
      await syncRevenueCatSubscriptionToMetadata(userId, {
        fallbackToExisting: true,
      });

    return NextResponse.json({
      success: true,
      subscription,
      synchronized,
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
