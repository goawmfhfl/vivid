import { getServiceSupabase } from "./supabase-service";
import type { Coupon, CouponVerification } from "@/types/coupon";
import { upsertSubscription } from "./subscription-utils";

/**
 * 쿠폰 검증 함수
 * 쿠폰 코드로 쿠폰을 조회하고 사용 가능 여부를 확인
 */
export async function verifyCoupon(
  code: string,
  userId: string
): Promise<CouponVerification> {
  const supabase = getServiceSupabase();

  // 쿠폰 조회
  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .single();

  if (error || !coupon) {
    return {
      coupon: null,
      isValid: false,
      isUsed: false,
      message: "쿠폰을 찾을 수 없습니다.",
    };
  }

  // 쿠폰 활성화 여부 확인
  if (!coupon.is_active) {
    return {
      coupon: coupon as Coupon,
      isValid: false,
      isUsed: false,
      message: "비활성화된 쿠폰입니다.",
    };
  }

  // 사용 횟수 제한 확인
  if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) {
    return {
      coupon: coupon as Coupon,
      isValid: false,
      isUsed: false,
      message: "쿠폰 사용 횟수가 초과되었습니다.",
    };
  }

  // 사용자가 이미 사용한 쿠폰인지 확인
  const { data: profile } = await supabase
    .from("profiles")
    .select("used_coupons")
    .eq("id", userId)
    .single();

  const usedCoupons = profile?.used_coupons || [];
  const isUsed = usedCoupons.includes(coupon.name);

  if (isUsed) {
    return {
      coupon: coupon as Coupon,
      isValid: false,
      isUsed: true,
      message: "이미 사용한 쿠폰입니다.",
    };
  }

  return {
    coupon: coupon as Coupon,
    isValid: true,
    isUsed: false,
  };
}

/**
 * 쿠폰 적용 함수
 * 쿠폰을 적용하여 subscriptions와 profiles를 업데이트
 */
export async function applyCoupon(
  code: string,
  userId: string
): Promise<{ success: boolean; message: string; expiresAt: string | null }> {
  const supabase = getServiceSupabase();

  // 쿠폰 검증
  const verification = await verifyCoupon(code, userId);

  if (!verification.isValid || !verification.coupon) {
    return {
      success: false,
      message: verification.message || "쿠폰을 적용할 수 없습니다.",
      expiresAt: null,
    };
  }

  const coupon = verification.coupon;

  // 현재 시간 기준으로 구독 기간 계산
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + coupon.duration_days);

  // subscriptions 업데이트
  await upsertSubscription(userId, {
    plan: "pro",
    status: "active",
    current_period_start: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    cancel_at_period_end: true, // 쿠폰으로 등록한 경우 기간 종료 시 자동 취소
  });

  // profiles.used_coupons에 쿠폰명 추가
  const { data: profile } = await supabase
    .from("profiles")
    .select("used_coupons")
    .eq("id", userId)
    .single();

  const currentUsedCoupons = profile?.used_coupons || [];
  const updatedUsedCoupons = [...currentUsedCoupons, coupon.name];

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ used_coupons: updatedUsedCoupons })
    .eq("id", userId);

  if (profileError) {
    console.error("프로필 업데이트 실패:", profileError);
    return {
      success: false,
      message: "프로필 업데이트 중 오류가 발생했습니다.",
      expiresAt: null,
    };
  }

  // coupons.current_uses 증가
  const { error: couponError } = await supabase
    .from("coupons")
    .update({
      current_uses: coupon.current_uses + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", coupon.id);

  if (couponError) {
    console.error("쿠폰 사용 횟수 업데이트 실패:", couponError);
    // 프로필은 이미 업데이트되었으므로 성공으로 처리
  }

  return {
    success: true,
    message: "쿠폰이 성공적으로 적용되었습니다.",
    expiresAt: expiresAt.toISOString(),
  };
}
