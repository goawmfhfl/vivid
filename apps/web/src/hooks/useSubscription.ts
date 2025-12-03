import { useCurrentUser } from "./useCurrentUser";
import type { SubscriptionMetadata, SubscriptionPlan, SubscriptionStatus } from "@/types/subscription";

export interface SubscriptionInfo {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  expiresAt: string | null;
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
    if (!currentUser?.user_metadata?.subscription) {
      return {
        plan: "free",
        status: "active",
        expiresAt: null,
        isPro: false,
        isExpired: false,
      };
    }

    const sub = currentUser.user_metadata.subscription as SubscriptionMetadata;
    const plan = sub.plan || "free";
    const status = sub.status || "active";
    const expiresAt = sub.expiresAt || null;

    // 만료일 체크
    const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;

    // Pro 멤버십 체크
    const isPro =
      plan === "pro" &&
      status === "active" &&
      !isExpired;

    return {
      plan,
      status,
      expiresAt,
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

