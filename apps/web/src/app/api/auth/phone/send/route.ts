import { NextRequest, NextResponse } from "next/server";
import {
  generateVerificationCode,
  storeVerificationCode,
  canResendCode,
} from "@/lib/phone-verification-store";
import { sendVerificationCode, sendSMSMock } from "@/lib/bizem-service";

/**
 * POST /api/auth/phone/send
 * 핸드폰 인증번호 전송
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    // 전화번호 검증
    if (!phone) {
      return NextResponse.json(
        { error: "전화번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // 전화번호 형식 검증 (한국 번호 형식)
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    const normalizedPhone = phone.replace(/[\s-]/g, "");

    if (!phoneRegex.test(normalizedPhone) && normalizedPhone.length !== 11) {
      return NextResponse.json(
        { error: "올바른 전화번호 형식을 입력해주세요." },
        { status: 400 }
      );
    }

    // 재전송 가능 여부 확인
    const resendCheck = canResendCode(phone);
    if (!resendCheck.canResend) {
      return NextResponse.json(
        {
          error: `잠시 후 다시 시도해주세요. (${resendCheck.remainingSeconds}초 후 가능)`,
        },
        { status: 429 }
      );
    }

    // 인증번호 생성
    const code = generateVerificationCode();

    // 인증번호 저장
    storeVerificationCode(phone, code);

    // SMS 전송
    // 개발 환경에서는 모의 전송 사용 (환경 변수 미설정 시)
    const isDevelopment = process.env.NODE_ENV === "development";
    const hasBizEMConfig =
      process.env.BIZEM_API_KEY && process.env.BIZEM_SENDER_NUMBER;

    let smsResult;
    if (isDevelopment && !hasBizEMConfig) {
      // 개발 환경 + 비즈엠 설정 없음 → 모의 전송
      smsResult = await sendSMSMock(phone, `인증번호: ${code}`);
    } else {
      // 프로덕션 또는 비즈엠 설정 있음 → 실제 전송
      smsResult = await sendVerificationCode(phone, code);
    }

    if (!smsResult.success) {
      return NextResponse.json(
        { error: smsResult.error || "인증번호 전송에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "인증번호가 전송되었습니다.",
      // 개발 환경에서는 인증번호도 반환 (테스트용)
      ...(isDevelopment && !hasBizEMConfig && { code }),
    });
  } catch (error) {
    console.error("인증번호 전송 중 오류:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "인증번호 전송 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
