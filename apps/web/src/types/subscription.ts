// 구독 정보 타입 정의

export type SubscriptionPlan = "free" | "pro";
export type SubscriptionStatus =
  | "none"
  | "active"
  | "canceled"
  | "expired"
  | "past_due";

// user_metadata에 저장되는 구독 정보
export interface SubscriptionMetadata {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  started_at: string | null; // ISO string
  expires_at: string | null; // ISO string
  updated_at: string | null; // ISO string (마지막 업데이트 시간)
}

// 구독 검증 결과
export interface SubscriptionVerification {
  isPro: boolean;
  isExpired: boolean;
}

