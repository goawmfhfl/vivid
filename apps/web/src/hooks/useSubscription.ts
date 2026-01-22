import { useCurrentUser } from "./useCurrentUser";
import type { SubscriptionMetadata, SubscriptionPlan, SubscriptionStatus } from "@/types/subscription";

export interface SubscriptionInfo {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  started_at: string | null;
  expires_at: string | null;
  updated_at: string | null;
  isPro: boolean;
  isExpired: boolean;
}

/**
 * user_metadata에서 구독 정보를 가져와서 Pro 멤버십 여부를 확인하는 훅
 * UI에서 빠르게 체크하기 위해 사용
 */
export const useSubscription = () => {
  const { data: currentUser, isLoading } = useCurrentUser();

  const subscription: SubscriptionInfo | null = (() => {
    // Admin 체크: Admin이면 항상 Pro 멤버십
    const isAdmin = currentUser?.user_metadata?.role === "admin";
    if (isAdmin) {
      return {
        plan: "pro" as const,
        status: "active" as const,
        started_at: null,
        expires_at: null,
        updated_at: null,
        isPro: true,
        isExpired: false,
      };
    }

    if (!currentUser?.user_metadata?.subscription) {
      return {
        plan: "free",
        status: "none",
        started_at: null,
        expires_at: null,
        updated_at: null,
        isPro: false,
        isExpired: false,
      };
    }

    const sub = currentUser.user_metadata.subscription as SubscriptionMetadata;
    const plan = sub.plan || "free";
    const status = sub.status || "none";
    const started_at = sub.started_at || null;
    const expires_at = sub.expires_at || null;
    const updated_at = sub.updated_at || null;

    const now = new Date();

    // 만료일 체크
    const isExpired = expires_at ? new Date(expires_at) < now : false;

    // Pro 멤버십 체크
    // plan이 "pro", status가 "active", started_at이 현재보다 과거, expires_at이 현재보다 미래일 때 Pro 멤버십
    const isPro =
      plan === "pro" &&
      status === "active" &&
      started_at !== null &&
      new Date(started_at) < now &&
      expires_at !== null &&
      new Date(expires_at) > now;

    return {
      plan,
      status,
      started_at,
      expires_at,
      updated_at,
      isPro,
      isExpired,
    };
  })();

  return {
    subscription,
    isLoading,
    isPro: subscription.isPro,
  };
};

