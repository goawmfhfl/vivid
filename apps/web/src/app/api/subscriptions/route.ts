import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "../utils/auth";
import { upsertSubscription } from "@/lib/subscription-utils";

/**
 * POST /api/subscriptions
 * 현재 로그인한 사용자의 구독 생성 또는 업데이트
 * 회원가입 시 기본 free 플랜 생성에 사용
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      plan = "free",
      status = "active",
      expires_at = null,
      current_period_start = null,
      cancel_at_period_end = false,
    } = body;

    // 현재 로그인한 사용자 ID 가져오기
    const userId = await getAuthenticatedUserId(request);

    // 구독 생성/업데이트
    const subscription = await upsertSubscription(userId, {
      plan: plan as "free" | "pro",
      status: status as "active" | "canceled" | "expired" | "past_due",
      expires_at: expires_at || null,
      current_period_start: current_period_start || null,
      cancel_at_period_end: cancel_at_period_end ?? false,
    });

    return NextResponse.json({
      message: "구독이 성공적으로 생성되었습니다.",
      subscription,
    });
  } catch (error) {
    console.error("구독 생성 실패:", error);
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `구독 생성 실패: ${errorMessage}` },
      { status: 500 }
    );
  }
}
