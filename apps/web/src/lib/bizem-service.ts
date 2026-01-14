/**
 * 비즈엠(BizEM) SMS 전송 서비스
 * 
 * 비즈엠 API 문서 참고:
 * https://www.bizem.co.kr/api
 * 
 * 환경 변수 필요:
 * - BIZEM_API_KEY: 비즈엠 API 키
 * - BIZEM_SENDER_NUMBER: 발신번호 (비즈엠에서 등록한 번호)
 */

interface BizEMConfig {
  apiKey: string;
  senderNumber: string;
  apiUrl?: string;
}

interface SendSMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * 비즈엠 SMS 전송
 * 
 * @param phone 수신자 전화번호 (하이픈 제거된 형식)
 * @param message 전송할 메시지
 */
export async function sendSMS(
  phone: string,
  message: string
): Promise<SendSMSResponse> {
  const config = getBizEMConfig();

  if (!config.apiKey || !config.senderNumber) {
    console.error("비즈엠 설정이 완료되지 않았습니다.");
    return {
      success: false,
      error: "SMS 서비스가 설정되지 않았습니다.",
    };
  }

  try {
    // 전화번호 정규화 (하이픈 제거)
    const normalizedPhone = phone.replace(/[\s-]/g, "");

    // 비즈엠 API 엔드포인트 (실제 API 문서 확인 필요)
    const apiUrl = config.apiUrl || "https://api.bizem.co.kr/v1/sms/send";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
        // 또는 API 키를 헤더에 넣는 방식일 수 있음 (비즈엠 문서 확인 필요)
        // "X-API-Key": config.apiKey,
      },
      body: JSON.stringify({
        to: normalizedPhone,
        from: config.senderNumber,
        message: message,
        // 비즈엠 API에 따라 추가 파라미터가 필요할 수 있음
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("비즈엠 SMS 전송 실패:", errorData);
      return {
        success: false,
        error: errorData.message || "SMS 전송에 실패했습니다.",
      };
    }

    const data = await response.json();

    return {
      success: true,
      messageId: data.messageId || data.id,
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
 * 인증번호 SMS 전송
 */
export async function sendVerificationCode(
  phone: string,
  code: string
): Promise<SendSMSResponse> {
  const message = `[Vivid] 인증번호는 ${code}입니다. 5분 내에 입력해주세요.`;

  return sendSMS(phone, message);
}

/**
 * 비즈엠 설정 가져오기
 */
function getBizEMConfig(): BizEMConfig {
  const apiKey = process.env.BIZEM_API_KEY || "";
  const senderNumber = process.env.BIZEM_SENDER_NUMBER || "";

  return {
    apiKey,
    senderNumber,
    apiUrl: process.env.BIZEM_API_URL,
  };
}

/**
 * 개발/테스트 환경용 모의 SMS 전송
 * (환경 변수가 설정되지 않은 경우 콘솔에 출력)
 */
export async function sendSMSMock(
  phone: string,
  message: string
): Promise<SendSMSResponse> {
  console.log("📱 [모의 SMS 전송]");
  console.log(`수신번호: ${phone}`);
  console.log(`메시지: ${message}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // 개발 환경에서는 실제 전송하지 않고 성공으로 처리
  return {
    success: true,
    messageId: `mock-${Date.now()}`,
  };
}
