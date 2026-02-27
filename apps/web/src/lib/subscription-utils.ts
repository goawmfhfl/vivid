import { getServiceSupabase } from "./supabase-service";
import type { SubscriptionVerification, SubscriptionMetadata } from "@/types/subscription";

/** 허용되는 구독 상태 (API 검증용) */
export const VALID_SUBSCRIPTION_STATUSES = [
  "none",
  "active",
  "canceled",
  "expired",
  "past_due",
] as const;

const STATUS_SET = new Set<string>(VALID_SUBSCRIPTION_STATUSES);

/** 허용되는 플랜 (API 검증용) */
export const VALID_PLANS = ["free", "pro"] as const;

/** status 값을 정규화하고 검증. 유효하면 정규화된 문자열 반환, 아니면 null */
export function normalizeAndValidateStatus(
  value: unknown
): (typeof VALID_SUBSCRIPTION_STATUSES)[number] | null {
  if (value === undefined || value === null) return null;
  const str = String(value).trim().toLowerCase();
  if (STATUS_SET.has(str)) {
    return str as (typeof VALID_SUBSCRIPTION_STATUSES)[number];
  }
  return null;
}

/** plan 값을 정규화하고 검증 */
export function normalizeAndValidatePlan(
  value: unknown
): (typeof VALID_PLANS)[number] | null {
  if (value === undefined || value === null) return null;
  const str = String(value).trim().toLowerCase();
  return VALID_PLANS.includes(str as (typeof VALID_PLANS)[number])
    ? (str as (typeof VALID_PLANS)[number])
    : null;
}

/**
 * user_metadata만으로 Pro 여부 판단 (동기, listUsers 결과 필터용)
 */
export function isProFromMetadata(userMetadata: Record<string, unknown> | undefined): boolean {
  if (!userMetadata?.subscription) return false;
  const role = userMetadata.role as string | undefined;
  if (role === "admin") return true;
  const subscription = userMetadata.subscription as SubscriptionMetadata;
  const plan = subscription.plan || "free";
  const status = subscription.status || "none";
  const started_at = subscription.started_at ? new Date(subscription.started_at) : null;
  const expires_at = subscription.expires_at ? new Date(subscription.expires_at) : null;
  const now = new Date();
  return (
    plan === "pro" &&
    (status === "active" || status === "canceled") &&
    started_at !== null &&
    started_at < now &&
    expires_at !== null &&
    expires_at > now
  );
}

/**
 * 서버 사이드에서 구독 정보를 검증하는 함수
 * user_metadata에서 구독 정보를 확인
 */
export async function verifySubscription(
  userId: string
): Promise<SubscriptionVerification> {
  const supabase = getServiceSupabase();

  // Service Role을 사용하여 사용자 정보 가져오기
  const { data: { user }, error: getUserError } = await supabase.auth.admin.getUserById(
    userId
  );

  if (getUserError || !user) {
    return {
      isPro: false,
      isExpired: false,
    };
  }

  // Admin role 체크 (user_metadata에서)
  const userRole = (user.user_metadata?.role as string) || "user";
  if (userRole === "admin") {
    return {
      isPro: true,
      isExpired: false,
    };
  }

  // user_metadata에서 구독 정보 확인
  const subscription = user.user_metadata?.subscription as SubscriptionMetadata | undefined;

  if (!subscription) {
    return {
      isPro: false,
      isExpired: false,
    };
  }

  const plan = subscription.plan || "free";
  const status = subscription.status || "none";
  const started_at = subscription.started_at ? new Date(subscription.started_at) : null;
  const expires_at = subscription.expires_at ? new Date(subscription.expires_at) : null;

  const now = new Date();

  // 만료일 체크
  const isExpired = expires_at ? expires_at < now : false;

  // Pro 멤버십 체크
  // plan이 "pro", status가 "active" 또는 "canceled"(만료 전까지 Pro 유지), started_at 과거, expires_at 미래일 때 Pro
  const isPro =
    plan === "pro" &&
    (status === "active" || status === "canceled") &&
    started_at !== null &&
    started_at < now &&
    expires_at !== null &&
    expires_at > now;

  return {
    isPro,
    isExpired,
  };
}

/**
 * user_metadata에 구독 정보를 업데이트하는 함수
 * 서버 사이드에서만 사용 가능 (Service Role 필요)
 */
export async function updateSubscriptionMetadata(
  userId: string,
  subscriptionData: {
    plan: "free" | "pro";
    status: "none" | "active" | "canceled" | "expired" | "past_due";
    started_at?: string | null;
    expires_at?: string | null;
  }
): Promise<void> {
  const supabase = getServiceSupabase();

  const { data: { user }, error: getUserError } =
    await supabase.auth.admin.getUserById(userId);

  if (getUserError || !user) {
    throw new Error(`Failed to get user: ${getUserError?.message || "User not found"}`);
  }

  const currentMetadata = user.user_metadata || {};
  const currentSubscription = (currentMetadata.subscription as SubscriptionMetadata) || {};

  // started_at 처리: 명시적으로 전달된 값(null 포함) > 기존 값 > null
  // undefined가 아닌 null을 전달한 경우에는 null로 저장 (?? 사용 시 null이 기존 값으로 대체되는 문제 방지)
  // Pro 플랜으로 업그레이드 시 started_at이 undefined(미전달)이고 기존 값도 없을 때만 현재 시간으로 설정
  let startedAt: string | null;
  if (subscriptionData.started_at !== undefined) {
    startedAt = subscriptionData.started_at ?? null;
  } else {
    startedAt = currentSubscription.started_at ?? null;
    if (subscriptionData.plan === "pro" && subscriptionData.status === "active" && !startedAt) {
      startedAt = new Date().toISOString();
      console.log("[SubscriptionUtils] started_at이 없어서 현재 시간으로 설정:", startedAt);
    }
  }

  // expires_at 처리: 명시적으로 전달된 값(null 포함) > 기존 값 > null
  const expiresAt =
    subscriptionData.expires_at !== undefined
      ? (subscriptionData.expires_at ?? null)
      : (currentSubscription.expires_at ?? null);

  const subscriptionMetadata: SubscriptionMetadata = {
    plan: subscriptionData.plan,
    status: subscriptionData.status,
    started_at: startedAt,
    expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  };

  console.log("[SubscriptionUtils] 구독 메타데이터 업데이트:", {
    userId,
    before: currentSubscription,
    after: subscriptionMetadata,
  });

  // user_metadata 업데이트 (Service Role 사용)
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    userId,
    {
      user_metadata: {
        ...currentMetadata,
        subscription: subscriptionMetadata,
      },
    }
  );

  if (updateError) {
    throw new Error(`Failed to update subscription metadata: ${updateError.message}`);
  }
}

/**
 * 구독 정보를 생성하거나 업데이트하는 함수
 * user_metadata에 직접 저장
 */
export async function upsertSubscription(
  userId: string,
  subscriptionData: {
    plan: "free" | "pro";
    status: "none" | "active" | "canceled" | "expired" | "past_due";
    started_at?: string | null;
    expires_at?: string | null;
  }
): Promise<void> {
  await updateSubscriptionMetadata(userId, subscriptionData);
}
