import { getServiceSupabase } from "./supabase-service";
import type { Coupon, CouponVerification, UsedCoupon } from "@/types/coupon";

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

  // 사용자가 이미 사용한 쿠폰인지 확인 (user_metadata에서)
  const { data: { user }, error: getUserError } = await supabase.auth.admin.getUserById(
    userId
  );

  if (getUserError || !user) {
    return {
      coupon: coupon as Coupon,
      isValid: false,
      isUsed: false,
      message: "사용자 정보를 확인할 수 없습니다.",
    };
  }

  // used_coupons는 객체 배열 또는 문자열 배열(기존 데이터 호환)일 수 있음
  const usedCouponsRaw = user.user_metadata?.used_coupons;
  let isUsed = false;

  if (Array.isArray(usedCouponsRaw)) {
    // 객체 배열인 경우 (새 형식: {id, code})
    if (usedCouponsRaw.length > 0 && typeof usedCouponsRaw[0] === "object") {
      const usedCoupons = usedCouponsRaw as UsedCoupon[];
      isUsed = usedCoupons.some(
        (used) =>
          used.id === coupon.id ||
          used.code === coupon.code ||
          used.code === coupon.name
      );
    } else {
      // 문자열 배열인 경우 (기존 형식: ["WELCOME30"])
      const usedCoupons = usedCouponsRaw as string[];
      isUsed =
        usedCoupons.includes(coupon.code) || usedCoupons.includes(coupon.name);
    }
  }

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

  // user_metadata에서 기존 정보 가져오기
  const { data: { user: currentUser }, error: getUserError } = await supabase.auth.admin.getUserById(
    userId
  );

  if (getUserError || !currentUser) {
    return {
      success: false,
      message: "사용자 정보를 확인할 수 없습니다.",
      expiresAt: null,
    };
  }

  const currentMetadata = currentUser.user_metadata || {};
  
  // 기존 used_coupons를 객체 배열로 변환 (기존 데이터 호환)
  const currentUsedCouponsRaw = currentMetadata.used_coupons;
  let currentUsedCoupons: UsedCoupon[] = [];

  if (Array.isArray(currentUsedCouponsRaw)) {
    if (currentUsedCouponsRaw.length > 0 && typeof currentUsedCouponsRaw[0] === "object") {
      // 이미 객체 배열인 경우
      currentUsedCoupons = currentUsedCouponsRaw as UsedCoupon[];
    } else {
      // 문자열 배열인 경우 객체 배열로 변환 (기존 데이터 마이그레이션)
      currentUsedCoupons = (currentUsedCouponsRaw as string[]).map((code) => ({
        id: "", // 기존 데이터는 id가 없으므로 빈 문자열
        code,
      }));
    }
  }

  // 중복 확인: id 또는 code로 확인
  const isAlreadyUsed = currentUsedCoupons.some(
    (used) => used.id === coupon.id || used.code === coupon.code
  );

  // 이미 사용한 쿠폰이 아니면 추가
  const updatedUsedCoupons = isAlreadyUsed
    ? currentUsedCoupons
    : [...currentUsedCoupons, { id: coupon.id, code: coupon.code }];

  // user_metadata에 구독 정보 및 used_coupons 업데이트
  // phone_verified 등 기존 메타데이터는 보존
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    userId,
    {
      user_metadata: {
        ...currentMetadata,
        subscription: {
          plan: "pro",
          status: "active",
          started_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        },
        used_coupons: updatedUsedCoupons,
        // phone_verified 정보 보존 (이미 true인 경우 유지)
        phone_verified: currentMetadata.phone_verified ?? true,
      },
    }
  );

  if (updateError) {
    console.error("구독 정보 업데이트 실패:", updateError);
    return {
      success: false,
      message: "구독 정보 업데이트 중 오류가 발생했습니다.",
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
