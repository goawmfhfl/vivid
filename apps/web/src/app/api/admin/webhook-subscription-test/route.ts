import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/(admin)/api/admin/util/admin-auth";

const EVENT_TYPES = [
  "TEST",
  "INITIAL_PURCHASE",
  "RENEWAL",
  "CANCELLATION",
  "EXPIRATION",
  "UNCANCELLATION",
  "SUBSCRIPTION_EXTENDED",
  "BILLING_ISSUE",
] as const;

/**
 * POST /api/admin/webhook-subscription-test
 * RevenueCat 웹훅 시뮬레이션 - Edge Function으로 테스트 페이로드 전송
 * 관리자 전용
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const webhookAuth = process.env.REVENUECAT_WEBHOOK_AUTH;

  if (!supabaseUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  if (!webhookAuth) {
    return NextResponse.json(
      {
        error:
          "REVENUECAT_WEBHOOK_AUTH가 설정되지 않았습니다. .env.local에 추가 후 서버를 재시작하세요.",
      },
      { status: 500 }
    );
  }

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const DAYS_PER_MONTH = 30;
  const DAYS_PER_YEAR = 365;

  try {
    const body = await request.json();
    const { eventType, userId, purchasedAtMs, expirationAtMs, planType } = body as {
      eventType: string;
      userId?: string;
      purchasedAtMs?: number;
      expirationAtMs?: number;
      planType?: "monthly" | "annual";
    };

    if (!eventType || !EVENT_TYPES.includes(eventType as (typeof EVENT_TYPES)[number])) {
      return NextResponse.json(
        { error: `eventType은 ${EVENT_TYPES.join(", ")} 중 하나여야 합니다.` },
        { status: 400 }
      );
    }

    if (eventType !== "TEST" && !userId?.trim()) {
      return NextResponse.json(
        { error: "TEST 외 이벤트는 userId가 필요합니다." },
        { status: 400 }
      );
    }

    const now = Date.now();
    const purchased = purchasedAtMs ?? now;

    let expirationMs: number;
    let productId: string | undefined;
    if (expirationAtMs != null && typeof expirationAtMs === "number") {
      expirationMs = expirationAtMs;
    } else if (planType === "monthly") {
      expirationMs = purchased + DAYS_PER_MONTH * MS_PER_DAY;
      productId = "VIVID_Pro_Monthly";
    } else {
      expirationMs = purchased + DAYS_PER_YEAR * MS_PER_DAY;
      productId = planType === "annual" ? "VIVID_Pro_Yearly" : undefined;
    }

    const payload: Record<string, unknown> = {
      type: eventType,
      id: `admin-test-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      event_timestamp_ms: now,
      app_user_id: userId?.trim() || undefined,
      purchased_at_ms: purchased,
      expiration_at_ms: expirationMs,
    };
    if (productId) {
      payload.product_id = productId;
    }

    const baseUrl = supabaseUrl.replace(/\/$/, "");
    const functionUrl = `${baseUrl}/functions/v1/revenuecat-webhook`;

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${webhookAuth}`,
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json().catch(() => ({}));

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      payload,
      response: responseData,
    });
  } catch (error) {
    console.error("[WebhookSubscriptionTest] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "웹훅 전송 실패",
      },
      { status: 500 }
    );
  }
}
