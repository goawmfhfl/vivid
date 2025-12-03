// 구독 정보 타입 정의

export type SubscriptionPlan = "free" | "pro";
export type SubscriptionStatus = "active" | "canceled" | "expired" | "past_due";

// user_metadata에 저장되는 구독 정보
export interface SubscriptionMetadata {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  expiresAt: string | null; // ISO string
  updatedAt: string; // ISO string (마지막 동기화 시간)
}

// subscriptions 테이블의 구독 정보
export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripe_subscription_id: string | null;
  started_at: string;
  expires_at: string | null;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

// 구독 검증 결과
export interface SubscriptionVerification {
  isPro: boolean;
  subscription: Subscription | null;
  isExpired: boolean;
}

