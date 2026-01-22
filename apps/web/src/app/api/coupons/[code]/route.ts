import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import type { Coupon } from "@/types/coupon";

/**
 * GET /api/coupons/[code]
 * 쿠폰 코드로 쿠폰 조회 및 검증 (인증 불필요, 누구나 조회 가능)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code) {
      return NextResponse.json(
        { error: "쿠폰 코드가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 쿠폰 조회 (인증 불필요)
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (error || !coupon) {
      return NextResponse.json(
        {
          coupon: null,
          isValid: false,
          isUsed: false,
          message: "쿠폰을 찾을 수 없습니다.",
        },
        { status: 200 }
      );
    }

    // 쿠폰 활성화 여부 확인
    if (!coupon.is_active) {
      return NextResponse.json({
        coupon: coupon as Coupon,
        isValid: false,
        isUsed: false,
        message: "비활성화된 쿠폰입니다.",
      });
    }

    // 사용 횟수 제한 확인
    if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) {
      return NextResponse.json({
        coupon: coupon as Coupon,
        isValid: false,
        isUsed: false,
        message: "쿠폰 사용 횟수가 초과되었습니다.",
      });
    }

    // 인증 헤더가 있으면 사용 여부 확인, 없으면 기본 정보만 반환
    const authHeader = request.headers.get("authorization");
    let isUsed = false;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabase.auth.getUser(token);
        
        if (user) {
          // user_metadata에서 used_coupons 확인
          const { data: { user: fullUser } } = await supabase.auth.admin.getUserById(user.id);
          
          if (fullUser) {
            const usedCouponsRaw = fullUser.user_metadata?.used_coupons;
            
            if (Array.isArray(usedCouponsRaw)) {
              // 객체 배열인 경우 (새 형식: {id, code})
              if (usedCouponsRaw.length > 0 && typeof usedCouponsRaw[0] === "object") {
                const usedCoupons = usedCouponsRaw as Array<{ id: string; code: string }>;
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
                  usedCoupons.includes(coupon.code) ||
                  usedCoupons.includes(coupon.name);
              }
            }
          }
        }
      } catch (authError) {
        // 인증 실패해도 쿠폰 정보는 반환 (사용 여부만 확인 불가)
        console.log("인증 정보 확인 실패, 기본 쿠폰 정보만 반환:", authError);
      }
    }

    return NextResponse.json({
      coupon: coupon as Coupon,
      isValid: true,
      isUsed,
      message: isUsed ? "이미 사용한 쿠폰입니다." : undefined,
    });
  } catch (error) {
    console.error("쿠폰 조회 실패:", error);
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `쿠폰 조회 실패: ${errorMessage}` },
      { status: 500 }
    );
  }
}
