import { getServiceSupabase } from "./supabase-service";
import type { SubscriptionVerification, SubscriptionMetadata } from "@/types/subscription";

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
  // plan이 "pro", status가 "active", started_at이 현재보다 과거, expires_at이 현재보다 미래일 때 Pro 멤버십
  const isPro =
    plan === "pro" &&
    status === "active" &&
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
    status: "none" | "active" | "canceled";
    started_at?: string | null;
    expires_at?: string | null;
  }
): Promise<void> {
  const supabase = getServiceSupabase();

  // Service Role을 사용하여 사용자 정보 가져오기
  const { data: { user }, error: getUserError } = await supabase.auth.admin.getUserById(
    userId
  );

  if (getUserError || !user) {
    throw new Error(`Failed to get user: ${getUserError?.message || "User not found"}`);
  }

  const currentMetadata = user.user_metadata || {};
  const currentSubscription = (currentMetadata.subscription as SubscriptionMetadata) || {};

  // 기존 구독이 pro이고 새로운 요청이 free면 업데이트하지 않음
  if (currentSubscription.plan === "pro" && subscriptionData.plan === "free") {
    return; // 기존 pro 구독 유지
  }

  // 구독 정보 업데이트 (기존 값 보존)
  const subscriptionMetadata: SubscriptionMetadata = {
    plan: subscriptionData.plan,
    status: subscriptionData.status,
    started_at: subscriptionData.started_at ?? currentSubscription.started_at ?? null,
    expires_at: subscriptionData.expires_at ?? currentSubscription.expires_at ?? null,
    updated_at: new Date().toISOString(),
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
    status: "none" | "active" | "canceled";
    started_at?: string | null;
    expires_at?: string | null;
  }
): Promise<void> {
  await updateSubscriptionMetadata(userId, subscriptionData);
}
