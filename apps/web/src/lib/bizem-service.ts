/**
 * 비즈엠(BizEM) 카카오 알림톡 전송 서비스
 *
 * 비즈엠 API 문서 참고:
 * https://www.bizem.co.kr/api
 *
 * 환경 변수 필요:
 * - BIZEM_API_BASE_URL: 비즈엠 API 베이스 URL
 * - BIZEM_API_KEY: 비즈엠 API 키
 * - BIZEM_USER_ID: 비즈엠 사용자 ID (헤더 userId)
 * - BIZEM_SENDER_KEY: 발신 프로필 키
 * - BIZM_TEMPLATE_CODE_PHONE_VERIFICATION: 인증번호 템플릿 코드
 */
import { BizEMSendItem } from "./bizem-types";

interface BizEMConfig {
  apiKey: string;
  userId: string;
  senderKey: string;
  templateCode: string;
  apiBaseUrl: string;
}

interface SendSMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  providerResponse?: unknown;
}

/**
 * 비즈엠 카카오 알림톡 템플릿 메시지 전송
 *
 * @param phone 수신자 전화번호 (하이픈 제거된 형식)
 * @param templateCode 템플릿 코드
 * @param variables 템플릿 치환 변수
 */
export async function sendTemplateMessage(
  phone: string,
  templateCode: string,
  variables: Record<string, string>
): Promise<SendSMSResponse> {
  const config = getBizEMConfig();

  if (
    !config.apiKey ||
    !config.userId ||
    !config.senderKey ||
    !config.apiBaseUrl
  ) {
    console.error("비즈엠 설정이 완료되지 않았습니다.");
    return {
      success: false,
      error: "SMS 서비스가 설정되지 않았습니다.",
    };
  }

  try {
    // 전화번호 정규화 (하이픈 제거)
    const normalizedPhone = phone.replace(/[\s-]/g, "");
    const phoneWithCountryCode = normalizedPhone.startsWith("82")
      ? normalizedPhone
      : normalizedPhone.startsWith("0")
        ? `82${normalizedPhone.slice(1)}`
        : normalizedPhone;


    const apiBaseUrl = config.apiBaseUrl.replace(/\/+$/, "");
    const requestBody: BizEMSendItem[] = [
      {
        message_type: "AT",
        phn: phoneWithCountryCode,
        profile: config.senderKey,
        tmplId: templateCode,
        msg: `VIVID 인증번호는 ${variables.code}입니다.\n5분 이내 입력해 주세요.`,
        variables: {
          인증번호: variables.code,
        },
      },
    ];

    const response = await fetch(`${apiBaseUrl}/v2/sender/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
        userId: config.userId,
      },
      body: JSON.stringify(requestBody),
    });

    const rawResponse = await response.text();
    let data: unknown = {};
    if (rawResponse) {
      try {
        data = JSON.parse(rawResponse) as unknown;
      } catch {
        data = { message: rawResponse };
      }
    }

    const primaryResponse = Array.isArray(data)
      ? (data[0] as Record<string, unknown> | undefined)
      : (data as Record<string, unknown>);
    const errorMessage =
      primaryResponse && typeof primaryResponse.message === "string"
        ? primaryResponse.message
        : undefined;
    const messageId =
      primaryResponse && typeof primaryResponse.messageId === "string"
        ? primaryResponse.messageId
        : primaryResponse && typeof primaryResponse.id === "string"
          ? primaryResponse.id
          : undefined;

    if (!response.ok) {
      console.error("비즈엠 SMS 전송 실패:", data);
      return {
        success: false,
        error: errorMessage || "SMS 전송에 실패했습니다.",
        providerResponse: data,
      };
    }

    const isBizemFailure =
      (primaryResponse &&
        typeof primaryResponse.code === "string" &&
        primaryResponse.code === "fail") ||
      (primaryResponse &&
        typeof primaryResponse.success === "boolean" &&
        primaryResponse.success === false) ||
      (primaryResponse &&
        typeof primaryResponse.result === "string" &&
        primaryResponse.result === "fail");

    if (isBizemFailure) {
      console.error("비즈엠 SMS 전송 실패:", data);
      return {
        success: false,
        error: errorMessage || "SMS 전송에 실패했습니다.",
        providerResponse: data,
      };
    }

    return {
      success: true,
      messageId,
      providerResponse: data,
    };
  } catch (error) {
    console.error("비즈엠 SMS 전송 중 오류:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "SMS 전송 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 인증번호 템플릿 전송
 */
export async function sendVerificationCode(
  phone: string,
  code: string
): Promise<SendSMSResponse> {
  const { templateCode } = getBizEMConfig();
  if (!templateCode) {
    return {
      success: false,
      error: "인증 템플릿 코드가 설정되지 않았습니다.",
    };
  }

  return sendTemplateMessage(phone, templateCode, { code });
}

/**
 * 비즈엠 설정 가져오기
 */
function getBizEMConfig(): BizEMConfig {
  const apiKey = process.env.BIZEM_API_KEY || "";
  const userId = process.env.BIZEM_USER_ID || "";
  const senderKey = process.env.BIZEM_SENDER_KEY || "";
  const templateCode = process.env.BIZM_TEMPLATE_CODE_PHONE_VERIFICATION || "";
  const apiBaseUrl = process.env.BIZEM_API_BASE_URL || "";

  return {
    apiKey,
    userId,
    senderKey,
    templateCode,
    apiBaseUrl,
  };
}

