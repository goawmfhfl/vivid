import { getServiceSupabase } from "./supabase-service";
import type { SubscriptionMetadata } from "@/types/subscription";

type RevenueCatEntitlement = {
  expires_date?: string | null;
  grace_period_expires_date?: string | null;
  product_identifier?: string | null;
  purchase_date?: string | null;
};

type RevenueCatSubscription = {
  billing_issues_detected_at?: string | null;
  expires_date?: string | null;
  grace_period_expires_date?: string | null;
  original_purchase_date?: string | null;
  ownership_type?: string | null;
  period_type?: string | null;
  product_plan_identifier?: string | null;
  purchase_date?: string | null;
  refunded_at?: string | null;
  store?: string | null;
  unsubscribe_detected_at?: string | null;
};

type RevenueCatSubscriber = {
  entitlements?: Record<string, RevenueCatEntitlement>;
  original_app_user_id?: string;
  subscriptions?: Record<string, RevenueCatSubscription>;
};

type RevenueCatSubscriberResponse = {
  subscriber?: RevenueCatSubscriber;
};

type RevenueCatSyncOptions = {
  fallbackToExisting?: boolean;
  productIdOverride?: string;
};

export type RevenueCatSyncResult = {
  subscription: SubscriptionMetadata | null;
  synchronized: boolean;
};

const REVENUECAT_API_BASE =
  process.env.REVENUECAT_API_BASE?.replace(/\/$/, "") ??
  "https://api.revenuecat.com/v1";

const REVENUECAT_SECRET_KEY = process.env.REVENUECAT_SECRET_KEY ?? null;

if (!REVENUECAT_SECRET_KEY) {
  throw new Error("REVENUECAT_SECRET_KEY is not set");
}

const REVENUECAT_PRO_ENTITLEMENT =
  process.env.REVENUECAT_PRO_ENTITLEMENT_ID?.trim() || "pro";

const REVENUECAT_PRO_PRODUCT_IDS = (
  process.env.REVENUECAT_PRO_PRODUCT_IDS ?? ""
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getLaterDate(
  left: string | null | undefined,
  right: string | null | undefined
): string | null {
  const leftDate = parseDate(left);
  const rightDate = parseDate(right);

  if (!leftDate && !rightDate) return null;
  if (!leftDate) return right ?? null;
  if (!rightDate) return left ?? null;

  return leftDate >= rightDate ? left ?? null : right ?? null;
}

function matchesProProductId(productId: string | null | undefined): boolean {
  if (!productId) return false;
  if (REVENUECAT_PRO_PRODUCT_IDS.includes(productId)) return true;

  return /pro/i.test(productId);
}

function getLatestSubscriptionEntry(subscriber: RevenueCatSubscriber): [
  string,
  RevenueCatSubscription,
] | null {
  const entries = Object.entries(subscriber.subscriptions ?? {}).filter(
    ([productId]) => matchesProProductId(productId)
  );

  if (entries.length === 0) return null;

  return entries.reduce((latest, current) => {
    const latestDate = parseDate(
      getLaterDate(
        latest[1].expires_date,
        latest[1].grace_period_expires_date ?? undefined
      )
    );
    const currentDate = parseDate(
      getLaterDate(
        current[1].expires_date,
        current[1].grace_period_expires_date ?? undefined
      )
    );

    if (!latestDate) return current;
    if (!currentDate) return latest;

    return currentDate > latestDate ? current : latest;
  });
}

function buildSubscriptionMetadataFromRevenueCat(
  subscriber: RevenueCatSubscriber
): SubscriptionMetadata | null {
  const now = new Date();
  const entitlement = subscriber.entitlements?.[REVENUECAT_PRO_ENTITLEMENT];
  const activeProductId = entitlement?.product_identifier ?? null;

  const activeSubscription =
    (activeProductId && subscriber.subscriptions?.[activeProductId]) || null;
  const latestSubscriptionEntry = getLatestSubscriptionEntry(subscriber);
  const latestProductId = latestSubscriptionEntry?.[0] ?? activeProductId;
  const latestSubscription =
    latestSubscriptionEntry?.[1] ?? activeSubscription ?? null;

  const startedAt =
    latestSubscription?.original_purchase_date ??
    latestSubscription?.purchase_date ??
    entitlement?.purchase_date ??
    null;

  const expiresAt =
    getLaterDate(
      entitlement?.expires_date,
      entitlement?.grace_period_expires_date ?? undefined
    ) ??
    getLaterDate(
      latestSubscription?.expires_date,
      latestSubscription?.grace_period_expires_date ?? undefined
    );

  const expiresDate = parseDate(expiresAt);
  const hasFutureExpiration = expiresDate ? expiresDate > now : false;

  if (entitlement && hasFutureExpiration) {
    let status: SubscriptionMetadata["status"] = "active";

    if (latestSubscription?.billing_issues_detected_at) {
      status = "past_due";
    } else if (latestSubscription?.unsubscribe_detected_at) {
      status = "canceled";
    }

    return {
      plan: "pro",
      status,
      started_at: startedAt,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
      source: "revenuecat",
      product_id: activeProductId ?? latestProductId ?? null,
      store: latestSubscription?.store ?? null,
      last_event_timestamp_ms: null,
    };
  }

  if (latestSubscription && expiresAt) {
    return {
      plan: "pro",
      status: "expired",
      started_at: startedAt,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
      source: "revenuecat",
      product_id: latestProductId ?? null,
      store: latestSubscription.store ?? null,
      last_event_timestamp_ms: null,
    };
  }

  return null;
}

async function fetchRevenueCatSubscriber(
  appUserId: string
): Promise<RevenueCatSubscriber | null> {
  if (!REVENUECAT_SECRET_KEY) {
    throw new Error("REVENUECAT_SECRET_KEY가 설정되지 않았습니다.");
  }

  const response = await fetch(
    `${REVENUECAT_API_BASE}/subscribers/${encodeURIComponent(appUserId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${REVENUECAT_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `RevenueCat subscriber 조회 실패 (${response.status}): ${errorText}`
    );
  }

  const data = (await response.json()) as RevenueCatSubscriberResponse;
  return data.subscriber ?? null;
}

async function updateSubscriptionMirror(
  userId: string,
  subscription: SubscriptionMetadata
): Promise<void> {
  const supabase = getServiceSupabase();
  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.admin.getUserById(userId);

  if (getUserError || !user) {
    throw new Error(
      `사용자 정보를 찾을 수 없습니다: ${getUserError?.message ?? "User not found"}`
    );
  }

  const currentMetadata = user.user_metadata ?? {};

  const { error: updateError } = await supabase.auth.admin.updateUserById(
    userId,
    {
      user_metadata: {
        ...currentMetadata,
        subscription,
      },
    }
  );

  if (updateError) {
    throw new Error(
      `구독 미러 업데이트 실패: ${updateError.message}`
    );
  }
}

export async function syncRevenueCatSubscriptionToMetadata(
  userId: string,
  options: RevenueCatSyncOptions = {}
): Promise<RevenueCatSyncResult> {
  const { fallbackToExisting = false, productIdOverride } = options;
  const supabase = getServiceSupabase();
  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.admin.getUserById(userId);

  if (getUserError || !user) {
    throw new Error(
      `사용자 정보를 찾을 수 없습니다: ${getUserError?.message ?? "User not found"}`
    );
  }

  const existingSubscription =
    (user.user_metadata?.subscription as SubscriptionMetadata | undefined) ??
    null;

  let subscriber: RevenueCatSubscriber | null;
  try {
    subscriber = await fetchRevenueCatSubscriber(userId);
  } catch (error) {
    if (fallbackToExisting) {
      return {
        subscription: existingSubscription,
        synchronized: false,
      };
    }
    throw error;
  }

  let revenueCatSubscription =
    subscriber && buildSubscriptionMetadataFromRevenueCat(subscriber);

  if (revenueCatSubscription && productIdOverride) {
    revenueCatSubscription = {
      ...revenueCatSubscription,
      product_id: productIdOverride,
    };
  }

  if (!revenueCatSubscription) {
    if (fallbackToExisting) {
      return {
        subscription: existingSubscription,
        synchronized: false,
      };
    }

    throw new Error("RevenueCat에서 Pro entitlement를 찾지 못했습니다.");
  }

  await updateSubscriptionMirror(userId, revenueCatSubscription);

  return {
    subscription: revenueCatSubscription,
    synchronized: true,
  };
}
