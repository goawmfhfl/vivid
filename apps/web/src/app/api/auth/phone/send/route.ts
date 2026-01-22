import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  generateVerificationCode,
  storeVerificationCode,
  canResendCode,
} from "@/lib/phone-verification-store";
import { sendVerificationCode } from "@/lib/bizem-service";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
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

    // 전화번호 정규화 (하이픈, 공백 제거)
    const normalizedPhone = phone.replace(/[\s-]/g, "");

    // 전화번호 형식 검증 (한국 번호 형식)
    const phoneRegex = /^01[0-9][0-9]{3,4}[0-9]{4}$/;

    if (!phoneRegex.test(normalizedPhone) || normalizedPhone.length !== 11) {
      return NextResponse.json(
        { error: "올바른 전화번호 형식을 입력해주세요." },
        { status: 400 }
      );
    }

    // 재전송 가능 여부 확인 (정규화된 전화번호 사용)
    const resendCheck = canResendCode(normalizedPhone, cookieStore);
    if (!resendCheck.canResend) {
      return NextResponse.json(
        {
          error: `잠시 후 다시 시도해주세요. (${resendCheck.remainingSeconds}초 후 가능)`,
        },
        { status: 429 }
      );
    }

    const runtimeEnv = process.env.NEXT_PUBLIC_NODE_ENV ?? process.env.NEXT_PUBLIC_NODE_ENV;
    const isDev = runtimeEnv !== "production";
    const testCode = "123456";

    // 인증번호 생성
    const code = isDev ? testCode : generateVerificationCode();


    if (isDev) {
      const devResponse = NextResponse.json({
        success: true,
        message: "개발 환경용 인증번호가 전송되었습니다.",
        testCode,
      });
      // 인증번호 저장 (정규화된 전화번호 사용) - 쿠키에 저장
      storeVerificationCode(normalizedPhone, code, devResponse);
      return devResponse;
    }

    const hasBizEMConfig =
      process.env.BIZEM_API_BASE_URL &&
      process.env.BIZEM_API_KEY &&
      process.env.BIZEM_SENDER_KEY &&
      process.env.BIZM_TEMPLATE_CODE_PHONE_VERIFICATION;

    if (!hasBizEMConfig) {
      return NextResponse.json(
        { error: "SMS 서비스가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const smsResult = await sendVerificationCode(normalizedPhone, code);

    const devPayload = isDev
      ? { bizemResponse: smsResult.providerResponse }
      : {};

    if (!smsResult.success) {
      return NextResponse.json(
        {
          error: smsResult.error || "인증번호 전송에 실패했습니다.",
          ...devPayload,
        },
        { status: 500 }
      );
    }

    // 응답 객체 생성
    const response = NextResponse.json({
      success: true,
      message: "인증번호가 전송되었습니다.",
      ...(smsResult.messageId ? { messageId: smsResult.messageId } : {}),
      ...devPayload,
    });

    // 인증번호 저장 (정규화된 전화번호 사용) - 쿠키에 저장
    storeVerificationCode(normalizedPhone, code, response);

    return response;
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
