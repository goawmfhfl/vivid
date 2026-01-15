import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserIdFromRequest } from "../../utils/auth";
import { applyCoupon } from "@/lib/coupon-utils";

/**
 * POST /api/coupons/apply
 * 쿠폰 적용
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: "쿠폰 코드가 필요합니다." },
        { status: 400 }
      );
    }

    // 현재 로그인한 사용자 ID 가져오기
    const userId = await getAuthenticatedUserIdFromRequest(request);

    // 쿠폰 적용
    const result = await applyCoupon(code, userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: result.message,
        expiresAt: result.expiresAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("쿠폰 적용 실패:", error);
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `쿠폰 적용 실패: ${errorMessage}` },
      { status: errorMessage.startsWith("Unauthorized") ? 401 : 500 }
    );
  }
}
