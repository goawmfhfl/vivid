import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCode } from "@/lib/phone-verification-store";
import { getServiceSupabase } from "@/lib/supabase-service";

/**
 * POST /api/auth/phone/verify
 * 핸드폰 인증번호 검증 및 사용자 메타데이터 업데이트
 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  try {
    const body = await request.json();
    const { phone, code, userId } = body;
    const runtimeEnv = process.env.NEXT_PUBLIC_NODE_ENV ?? process.env.NEXT_PUBLIC_NODE_ENV;
    const isDev = runtimeEnv !== "production";
    const testCode = "123456";

    // 필수 필드 검증
    if (!phone || !code) {
      return NextResponse.json(
        { error: "전화번호와 인증번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // 전화번호 정규화 (하이픈, 공백 제거)
    const normalizedPhone = phone.replace(/[\s-]/g, "");

    const updateUserMetadata = async () => {
      if (!userId) {
        return;
      }

      const supabase = getServiceSupabase();

      // 사용자 정보 가져오기
      const {
        data: { user },
        error: getUserError,
      } = await supabase.auth.admin.getUserById(userId);

      if (getUserError || !user) {
        console.error("사용자 조회 실패:", getUserError);
        // 사용자 조회 실패해도 인증은 성공으로 처리 (이미 검증 완료)
        return;
      }

      // user metadata 업데이트
      const updatedMetadata = {
        ...(user.user_metadata || {}),
        phone_verified: true,
        phone_verified_at: new Date().toISOString(),
        phone: normalizedPhone, // 정규화된 전화번호 저장
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
        throw new Error("메타데이터 업데이트에 실패했습니다.");
      }
    };

    if (isDev && code === testCode) {
      try {
        await updateUserMetadata();
      } catch {
        return NextResponse.json({
          success: true,
          message: "인증이 완료되었습니다. (메타데이터 업데이트 실패)",
          verified: true,
          warning: "메타데이터 업데이트에 실패했습니다.",
        });
      }

      return NextResponse.json({
        success: true,
        message: "인증이 완료되었습니다.",
        verified: true,
      });
    }

    // 디버깅: 전화번호와 인증번호 로그 출력
    console.log("[PhoneVerification Verify]", {
      originalPhone: phone,
      normalizedPhone,
      code,
      codeLength: code.length,
    });

    // 응답 객체 생성 (검증 성공 시 사용)
    const successResponse = NextResponse.json({
      success: true,
      message: "인증이 완료되었습니다.",
      verified: true,
    });

    // 인증번호 검증 (정규화된 전화번호 사용) - 쿠키에서 읽어서 검증
    const verificationResult = verifyCode(
      normalizedPhone,
      code,
      cookieStore,
      successResponse
    );

    // 디버깅: 검증 결과 로그 출력
    console.log("[PhoneVerification Verify Result]", {
      success: verificationResult.success,
      message: verificationResult.message,
    });

    if (!verificationResult.success) {
      return NextResponse.json(
        { error: verificationResult.message },
        { status: 400 }
      );
    }

    try {
      await updateUserMetadata();
    } catch {
      return NextResponse.json({
        success: true,
        message: "인증이 완료되었습니다. (메타데이터 업데이트 실패)",
        verified: true,
        warning: "메타데이터 업데이트에 실패했습니다.",
      });
    }

    return successResponse;
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
