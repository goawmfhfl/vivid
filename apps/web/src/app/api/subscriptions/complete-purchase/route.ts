import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserIdFromRequest } from "@/app/api/utils/auth";
import { syncRevenueCatSubscriptionToMetadata } from "@/lib/revenuecat";

/**
 * POST /api/subscriptions/complete-purchase
 * 결제 완료 후 RevenueCat authoritative data로 구독 미러를 동기화
 */
export async function POST(request: NextRequest) {
  try {
    let userId: string;
    try {
      userId = await getAuthenticatedUserIdFromRequest(request);
    } catch (error) {
      console.error("[Complete Purchase Auth Error]", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      product_id?: string;
    };
    const productId = typeof body?.product_id === "string" ? body.product_id : undefined;

    const { subscription } = await syncRevenueCatSubscriptionToMetadata(userId, {
      productIdOverride: productId,
    });

    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error("구독 완료 처리 실패:", error);
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `구독 완료 처리 실패: ${errorMessage}` },
      { status: 500 }
    );
  }
}
