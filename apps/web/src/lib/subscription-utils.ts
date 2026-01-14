import { getServiceSupabase } from "./supabase-service";
import type { Subscription, SubscriptionVerification } from "@/types/subscription";

/**
 * 서버 사이드에서 구독 정보를 검증하는 함수
 * subscriptions 테이블을 조회하여 정확한 구독 상태를 확인
 */
export async function verifySubscription(
  userId: string
): Promise<SubscriptionVerification> {
  const supabase = getServiceSupabase();

  // Admin role 체크
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  // Admin이면 항상 Pro 멤버십
  if (profile?.role === "admin") {
    return {
      isPro: true,
      subscription: null,
      isExpired: false,
    };
  }

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !subscription) {
    // 구독 정보가 없으면 free 플랜으로 간주
    return {
      isPro: false,
      subscription: null,
      isExpired: false,
    };
  }

  // 만료일 체크 및 자동 업데이트
  const now = new Date();
  const expiresAt = subscription.expires_at
    ? new Date(subscription.expires_at)
    : null;
  const isExpired = expiresAt ? expiresAt < now : false;

  // expires_at이 지났고 status가 active면 expired로 업데이트
  // cancel_at_period_end가 true인 경우에도 기간 종료 시 expired로 변경
  if (isExpired && subscription.status === "active") {
    const updateData: {
      status: "expired";
      cancel_at_period_end?: boolean;
    } = { status: "expired" };
    
    // cancel_at_period_end가 true였던 경우, 기간 종료 시 false로 변경
    if (subscription.cancel_at_period_end) {
      updateData.cancel_at_period_end = false;
    }

    const { data: updated } = await supabase
      .from("subscriptions")
      .update(updateData)
      .eq("user_id", userId)
      .select()
      .single();

    if (updated) {
      subscription.status = "expired";
      subscription.cancel_at_period_end = false;
    }
  }

  // Pro 멤버십 체크
  // cancel_at_period_end가 true여도 기간이 유효하면 active 상태로 Pro 멤버십 유지
  // 단, expires_at이 지나면 expired로 변경되므로 Pro 멤버십이 해제됨
  const isPro =
    subscription.plan === "pro" &&
    subscription.status === "active" &&
    !isExpired;

  return {
    isPro,
    subscription: subscription as Subscription,
    isExpired: subscription.status === "expired" || isExpired,
  };
}

/**
 * user_metadata에 구독 정보를 동기화하는 함수
 * 결제 웹훅이나 구독 업데이트 시 호출
 * 서버 사이드에서만 사용 가능 (Service Role 필요)
 */
export async function syncSubscriptionToMetadata(
  userId: string
): Promise<void> {
  const { subscription } = await verifySubscription(userId);

  const supabase = getServiceSupabase();

  // Service Role을 사용하여 사용자 정보 가져오기
  const { data: { user }, error: getUserError } = await supabase.auth.admin.getUserById(
    userId
  );

  if (getUserError || !user) {
    throw new Error(`Failed to get user: ${getUserError?.message || "User not found"}`);
  }

  const currentMetadata = user.user_metadata || {};

  // 구독 정보 업데이트
  const subscriptionMetadata = subscription
    ? {
        plan: subscription.plan,
        status: subscription.status,
        expiresAt: subscription.expires_at,
        updatedAt: new Date().toISOString(),
      }
    : {
        plan: "free" as const,
        status: "active" as const,
        expiresAt: null,
        updatedAt: new Date().toISOString(),
      };

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
    throw new Error(`Failed to sync subscription to metadata: ${updateError.message}`);
  }
}

/**
 * 구독 정보를 생성하거나 업데이트하는 함수
 * 결제 웹훅에서 호출
 */
export async function upsertSubscription(
  userId: string,
  subscriptionData: {
    plan: "free" | "pro";
    status: "active" | "canceled" | "expired" | "past_due";
    stripe_subscription_id?: string | null;
    expires_at?: string | null;
    started_at?: string;
    current_period_start?: string | null;
    cancel_at_period_end?: boolean;
  }
): Promise<Subscription> {
  const supabase = getServiceSupabase();

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  // current_period_start가 없으면 started_at을 기본값으로 사용
  const currentPeriodStart =
    subscriptionData.current_period_start !== undefined
      ? subscriptionData.current_period_start
      : subscriptionData.started_at || existing?.started_at || new Date().toISOString();

  const subscriptionPayload = {
    user_id: userId,
    plan: subscriptionData.plan,
    status: subscriptionData.status,
    stripe_subscription_id: subscriptionData.stripe_subscription_id || null,
    expires_at: subscriptionData.expires_at || null,
    started_at: subscriptionData.started_at || new Date().toISOString(),
    current_period_start: currentPeriodStart,
    cancel_at_period_end: subscriptionData.cancel_at_period_end ?? existing?.cancel_at_period_end ?? false,
    ...(subscriptionData.status === "canceled" && !existing?.canceled_at
      ? { canceled_at: new Date().toISOString() }
      : {}),
  };

  const { data: subscription, error } = existing
    ? await supabase
        .from("subscriptions")
        .update(subscriptionPayload)
        .eq("user_id", userId)
        .select()
        .single()
    : await supabase
        .from("subscriptions")
        .insert(subscriptionPayload)
        .select()
        .single();

  if (error || !subscription) {
    throw new Error(
      `Failed to upsert subscription: ${error?.message || "Unknown error"}`
    );
  }

  // user_metadata 동기화
  await syncSubscriptionToMetadata(userId);

  return subscription as Subscription;
}

