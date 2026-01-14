import { NextRequest, NextResponse } from "next/server";
import { verifyCode } from "@/lib/phone-verification-store";
import { getServiceSupabase } from "@/lib/supabase-service";

/**
 * POST /api/auth/phone/verify
 * 핸드폰 인증번호 검증 및 사용자 메타데이터 업데이트
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code, userId } = body;

    // 필수 필드 검증
    if (!phone || !code) {
      return NextResponse.json(
        { error: "전화번호와 인증번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // 인증번호 검증
    const verificationResult = verifyCode(phone, code);

    if (!verificationResult.success) {
      return NextResponse.json(
        { error: verificationResult.message },
        { status: 400 }
      );
    }

    // userId가 제공된 경우, Supabase user metadata 업데이트
    if (userId) {
      const supabase = getServiceSupabase();

      // 사용자 정보 가져오기
      const {
        data: { user },
        error: getUserError,
      } = await supabase.auth.admin.getUserById(userId);

      if (getUserError || !user) {
        console.error("사용자 조회 실패:", getUserError);
        // 사용자 조회 실패해도 인증은 성공으로 처리 (이미 검증 완료)
        return NextResponse.json({
          success: true,
          message: "인증이 완료되었습니다.",
          verified: true,
        });
      }

      // user metadata 업데이트
      const updatedMetadata = {
        ...(user.user_metadata || {}),
        phone_verified: true,
        phone_verified_at: new Date().toISOString(),
        phone: phone.replace(/[\s-]/g, ""), // 정규화된 전화번호 저장
      };

      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          user_metadata: updatedMetadata,
        }
      );

      if (updateError) {
        console.error("메타데이터 업데이트 실패:", updateError);
        // 업데이트 실패해도 인증은 성공으로 처리
        return NextResponse.json({
          success: true,
          message: "인증이 완료되었습니다. (메타데이터 업데이트 실패)",
          verified: true,
          warning: "메타데이터 업데이트에 실패했습니다.",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "인증이 완료되었습니다.",
      verified: true,
    });
  } catch (error) {
    console.error("인증번호 검증 중 오류:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "인증번호 검증 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
