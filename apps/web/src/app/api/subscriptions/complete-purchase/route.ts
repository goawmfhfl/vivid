import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserIdFromRequest } from "@/app/api/utils/auth";
import { updateSubscriptionMetadata } from "@/lib/subscription-utils";

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * POST /api/subscriptions/complete-purchase
 * 결제 완료 후 구독 정보를 user_metadata에 업데이트
 * - plan: pro, status: active
 * - started_at: 오늘, expires_at: planType에 따라 1개월 또는 1년 후
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

    const body = await request.json();
    const planType = body?.planType as string | undefined;
    if (planType !== "annual" && planType !== "monthly") {
      return NextResponse.json(
        { error: "planType은 annual 또는 monthly여야 합니다." },
        { status: 400 }
      );
    }

    const now = new Date();
    const startedAt = now.toISOString();
    const expiresAt =
      planType === "monthly"
        ? addMonths(now, 1).toISOString()
        : addYears(now, 1).toISOString();

    await updateSubscriptionMetadata(userId, {
      plan: "pro",
      status: "active",
      started_at: startedAt,
      expires_at: expiresAt,
    });

    return NextResponse.json({
      success: true,
      subscription: {
        plan: "pro",
        status: "active",
        started_at: startedAt,
        expires_at: expiresAt,
      },
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
