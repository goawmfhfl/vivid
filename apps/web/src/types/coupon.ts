// 쿠폰 정보 타입 정의

export interface Coupon {
  id: string;
  code: string;
  name: string;
  duration_days: number;
  is_active: boolean;
  max_uses: number | null;
  current_uses: number;
  created_at: string;
  updated_at: string;
}

export interface CouponVerification {
  coupon: Coupon | null;
  isValid: boolean;
  isUsed: boolean;
  message?: string;
}
