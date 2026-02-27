// RevenueCat Webhook → Supabase Edge Function
// 구독 상태 변경 시 auth.users.user_metadata.subscription 업데이트

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// IDE 타입 체크용 (실행 시 Deno 런타임에서 제공)
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response>) => void;
  env: { get: (key: string) => string | undefined };
};
import { createClient } from "@supabase/supabase-js";

type SubscriptionPlan = "free" | "pro";
type SubscriptionStatus =
  | "none"
  | "active"
  | "canceled"
  | "expired"
  | "past_due";

interface SubscriptionMetadata {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  started_at: string | null;
  expires_at: string | null;
  updated_at: string | null;
}

interface RevenueCatWebhookEvent {
  api_version?: string;
  type: string;
  id?: string;
  event_timestamp_ms?: number;
  app_user_id?: string;
  original_app_user_id?: string;
  aliases?: string[];
  purchased_at_ms?: number;
  expiration_at_ms?: number;
  product_id?: string;
  new_product_id?: string; // PRODUCT_CHANGE only
  cancel_reason?: string;
  expiration_reason?: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function msToISO(ms: number | undefined): string | null {
  if (ms == null || typeof ms !== "number") return null;
  return new Date(ms).toISOString();
}

function jsonResponse(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const expectedAuth = Deno.env.get("REVENUECAT_WEBHOOK_AUTH");
  const authHeader = req.headers.get("Authorization");
  if (!expectedAuth || authHeader !== `Bearer ${expectedAuth}`) {
    console.warn("[RevenueCat Webhook] Unauthorized: missing or invalid auth");
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  let payload: RevenueCatWebhookEvent;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const eventType = payload?.type;
  const eventId = payload?.id;
  const appUserId = payload?.app_user_id;

  // TRANSFER events don't have app_user_id
  if (!appUserId && eventType !== "TRANSFER" && eventType !== "TEST") {
    console.warn("[RevenueCat Webhook] Missing app_user_id:", eventType);
    return jsonResponse({ error: "Missing app_user_id" }, 400);
  }

  // TEST event: acknowledge only
  if (eventType === "TEST") {
    console.log("[RevenueCat Webhook] TEST event acknowledged");
    return jsonResponse({ received: true }, 200);
  }

  // TRANSFER: skip (no app_user_id)
  if (eventType === "TRANSFER") {
    console.log("[RevenueCat Webhook] TRANSFER event skipped");
    return jsonResponse({ received: true }, 200);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[RevenueCat Webhook] Missing Supabase env");
    return jsonResponse({ error: "Server configuration error" }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Idempotency: skip if already processed (webhook_events 테이블 필요)
  if (eventId) {
    const { data: existing, error: checkError } = await supabase
      .from("webhook_events")
      .select("event_id")
      .eq("event_id", eventId)
      .maybeSingle();
    if (!checkError && existing) {
      console.log("[RevenueCat Webhook] Duplicate event skipped:", eventId);
      return jsonResponse({ received: true, duplicate: true }, 200);
    }
    // checkError 시 (테이블 미존재 등) 체크 스킵, 계속 처리
  }

  const purchasedAt = msToISO(payload.purchased_at_ms);
  const expiresAt = msToISO(payload.expiration_at_ms);

  let plan: SubscriptionPlan = "pro";
  let status: SubscriptionStatus = "active";
  let usePayloadDates = true;

  switch (eventType) {
    case "INITIAL_PURCHASE":
    case "RENEWAL":
    case "UNCANCELLATION":
    case "SUBSCRIPTION_EXTENDED":
      plan = "pro";
      status = "active";
      usePayloadDates = true;
      break;
    case "CANCELLATION":
      plan = "pro";
      status = "canceled";
      usePayloadDates = false; // preserve existing started_at/expires_at
      break;
    case "EXPIRATION":
      plan = "pro";
      status = "expired";
      usePayloadDates = true;
      break;
    case "BILLING_ISSUE":
      // Subscription still valid, log only
      console.log("[RevenueCat Webhook] BILLING_ISSUE:", appUserId, payload);
      if (eventId) {
        await supabase.from("webhook_events").insert({
          event_id: eventId,
          processed_at: new Date().toISOString(),
          event_type: eventType,
          app_user_id: appUserId,
        });
      }
      return jsonResponse({ received: true }, 200);
    case "PRODUCT_CHANGE":
      // Informative only. expiration_at_ms = old product's expiry.
      // Actual state update happens on RENEWAL when new plan takes effect.
      console.log("[RevenueCat Webhook] PRODUCT_CHANGE (informative):", appUserId, payload?.product_id, "->", payload.new_product_id);
      if (eventId) {
        await supabase.from("webhook_events").insert({
          event_id: eventId,
          processed_at: new Date().toISOString(),
          event_type: eventType,
          app_user_id: appUserId,
        });
      }
      return jsonResponse({ received: true }, 200);
    default:
      console.log("[RevenueCat Webhook] Unhandled event type:", eventType);
      if (eventId) {
        await supabase.from("webhook_events").insert({
          event_id: eventId,
          processed_at: new Date().toISOString(),
          event_type: eventType,
          app_user_id: appUserId,
        });
      }
      return jsonResponse({ received: true }, 200);
  }

  try {
    const { data: { user }, error: getUserError } =
      await supabase.auth.admin.getUserById(appUserId!);

    if (getUserError || !user) {
      console.error("[RevenueCat Webhook] User not found:", appUserId);
      return jsonResponse({ error: "User not found" }, 404);
    }

    const currentMetadata = user.user_metadata || {};
    const currentSubscription: Partial<SubscriptionMetadata> =
      (currentMetadata.subscription as SubscriptionMetadata | undefined) ?? {};

    const resolvedStartedAt = usePayloadDates
      ? purchasedAt ?? currentSubscription.started_at ?? null
      : currentSubscription.started_at ?? null;
    const resolvedExpiresAt = usePayloadDates
      ? expiresAt ?? currentSubscription.expires_at ?? null
      : currentSubscription.expires_at ?? null;

    const subscriptionMetadata: SubscriptionMetadata = {
      plan,
      status,
      started_at: resolvedStartedAt,
      expires_at: resolvedExpiresAt,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      appUserId!,
      {
        user_metadata: {
          ...currentMetadata,
          subscription: subscriptionMetadata,
        },
      }
    );

    if (updateError) {
      console.error("[RevenueCat Webhook] Update failed:", updateError);
      return jsonResponse(
        { error: `Update failed: ${updateError.message}` },
        500
      );
    }

    // Record for idempotency (테이블 없으면 무시)
    if (eventId) {
      const { error: insertErr } = await supabase.from("webhook_events").insert({
        event_id: eventId,
        processed_at: new Date().toISOString(),
        event_type: eventType,
        app_user_id: appUserId,
      });
      if (insertErr) {
        console.warn("[RevenueCat Webhook] Failed to record event_id:", insertErr);
      }
    }

    console.log("[RevenueCat Webhook] Updated:", appUserId, subscriptionMetadata);
    return jsonResponse({ received: true, updated: true }, 200);
  } catch (err) {
    console.error("[RevenueCat Webhook] Error:", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Unknown error" },
      500
    );
  }
});
