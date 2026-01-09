import { encrypt, decrypt, isEncrypted } from "./encryption";

// 숫자 암호화를 위한 마커 (암호화된 숫자를 식별하기 위해)
const NUMBER_MARKER = "__ENCRYPTED_NUMBER__:";

// JSONB 값의 가능한 타입
export type JsonbValue =
  | string
  | number
  | boolean
  | null
  | JsonbValue[]
  | { [key: string]: JsonbValue };

// 복호화 실패 감지를 위한 헬퍼 함수
function detectDecryptionFailure(original: string, decrypted: string): boolean {
  // 암호화된 형식이었는데 복호화 후에도 동일하면 실패
  return isEncrypted(original) && decrypted === original;
}

/**
 * JSONB 객체 내의 문자열과 숫자 필드를 재귀적으로 암호화
 * 불린, null은 그대로 유지
 */
export function encryptJsonbFields(obj: JsonbValue): JsonbValue {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // 문자열인 경우 암호화
  if (typeof obj === "string") {
    // 이미 암호화된 문자열은 다시 암호화하지 않음
    if (isEncrypted(obj)) {
      return obj;
    }
    // 숫자 마커가 포함된 경우도 이미 암호화된 것으로 간주
    if (obj.startsWith(NUMBER_MARKER)) {
      return obj;
    }
    return encrypt(obj);
  }

  // 숫자인 경우 문자열로 변환 후 암호화 (마커 추가)
  if (typeof obj === "number") {
    const numberString = NUMBER_MARKER + obj.toString();
    return encrypt(numberString);
  }

  // 배열인 경우 각 요소에 대해 재귀 호출
  if (Array.isArray(obj)) {
    return obj.map((item) => encryptJsonbFields(item));
  }

  // 객체인 경우 각 속성에 대해 재귀 호출
  if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
    const encrypted: Record<string, JsonbValue> = {};
    for (const [key, value] of Object.entries(obj)) {
      encrypted[key] = encryptJsonbFields(value as JsonbValue);
    }
    return encrypted;
  }

  // 불린 등은 그대로 반환
  return obj;
}

/**
 * JSONB 객체 내의 암호화된 문자열과 숫자 필드를 재귀적으로 복호화
 */
export function decryptJsonbFields(obj: JsonbValue): JsonbValue {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // 문자열인 경우 복호화 시도
  if (typeof obj === "string") {
    try {
      const decrypted = decrypt(obj);

      // 복호화 실패 감지: 암호화된 형식이었는데 복호화 후에도 동일하면 실패
      if (detectDecryptionFailure(obj, decrypted)) {
        // 복호화 실패 시 원본 반환 (에러를 throw하지 않음 - 부분 복호화 허용)
        // 에러 로깅 제거 - 조용히 처리
        return obj;
      }

      // decrypt는 항상 문자열을 반환하므로, 숫자 마커 확인
      if (
        typeof decrypted === "string" &&
        decrypted.startsWith(NUMBER_MARKER)
      ) {
        const numberString = decrypted.replace(NUMBER_MARKER, "");
        const number = parseFloat(numberString);
        // NaN이 아니고 유효한 숫자인 경우만 변환
        if (!isNaN(number) && isFinite(number)) {
          // 원본이 정수였는지 확인 (소수점이 없으면 정수)
          if (numberString.includes(".")) {
            return number;
          } else {
            return parseInt(numberString, 10);
          }
        }
      }

      return decrypted;
    } catch {
      // 복호화 실패 시 원본 반환 (기존 평문 데이터일 수 있음)
      // 에러 로깅 제거 - 조용히 처리
      return obj;
    }
  }

  // 배열인 경우 각 요소에 대해 재귀 호출
  if (Array.isArray(obj)) {
    return obj.map((item) => decryptJsonbFields(item));
  }

  // 객체인 경우 각 속성에 대해 재귀 호출
  if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
    const decrypted: Record<string, JsonbValue> = {};
    for (const [key, value] of Object.entries(obj)) {
      decrypted[key] = decryptJsonbFields(value as JsonbValue);
    }
    return decrypted;
  }

  // 불린 등은 그대로 반환
  return obj;
}

/**
 * WeeklyFeedback 객체의 모든 JSONB 필드를 암호화
 */
export function encryptWeeklyFeedback(
  feedback: Record<string, unknown>
): Record<string, unknown> {
  return {
    ...feedback,
    // 새로운 스키마 필드들
    summary_report: feedback.summary_report
      ? encryptJsonbFields(feedback.summary_report as JsonbValue)
      : null,
    daily_life_report: feedback.daily_life_report
      ? encryptJsonbFields(feedback.daily_life_report as JsonbValue)
      : null,
    emotion_report: feedback.emotion_report
      ? encryptJsonbFields(feedback.emotion_report as JsonbValue)
      : null,
    vision_report: feedback.vision_report
      ? encryptJsonbFields(feedback.vision_report as JsonbValue)
      : null,
    insight_report: feedback.insight_report
      ? encryptJsonbFields(feedback.insight_report as JsonbValue)
      : null,
    execution_report: feedback.execution_report
      ? encryptJsonbFields(feedback.execution_report as JsonbValue)
      : null,
    trend: feedback.trend
      ? encryptJsonbFields(feedback.trend as JsonbValue)
      : null,
    // closing_report는 주간 피드백에서 제거됨 (월간 피드백만 사용)
  };
}

/**
 * WeeklyFeedback 객체의 모든 JSONB 필드를 복호화
 */
export function decryptWeeklyFeedback(
  feedback: Record<string, unknown>
): Record<string, unknown> {
  return {
    ...feedback,
    // 새로운 스키마 필드들
    summary_report: feedback.summary_report
      ? decryptJsonbFields(feedback.summary_report as JsonbValue)
      : null,
    daily_life_report: feedback.daily_life_report
      ? decryptJsonbFields(feedback.daily_life_report as JsonbValue)
      : null,
    emotion_report: feedback.emotion_report
      ? decryptJsonbFields(feedback.emotion_report as JsonbValue)
      : null,
    vision_report: feedback.vision_report
      ? decryptJsonbFields(feedback.vision_report as JsonbValue)
      : null,
    insight_report: feedback.insight_report
      ? decryptJsonbFields(feedback.insight_report as JsonbValue)
      : null,
    execution_report: feedback.execution_report
      ? decryptJsonbFields(feedback.execution_report as JsonbValue)
      : null,
    trend: feedback.trend
      ? decryptJsonbFields(feedback.trend as JsonbValue)
      : null,
    // closing_report는 주간 피드백에서 제거됨 (월간 피드백만 사용)
  };
}

/**
 * MonthlyFeedback 객체의 모든 JSONB 필드를 암호화
 */
export function encryptMonthlyFeedback(
  feedback: Record<string, unknown>
): Record<string, unknown> {
  return {
    ...feedback,
    summary_report: feedback.summary_report
      ? encryptJsonbFields(feedback.summary_report as JsonbValue)
      : null,
    daily_life_report: feedback.daily_life_report
      ? encryptJsonbFields(feedback.daily_life_report as JsonbValue)
      : null,
    emotion_report: feedback.emotion_report
      ? encryptJsonbFields(feedback.emotion_report as JsonbValue)
      : null,
    insight_report: feedback.insight_report
      ? encryptJsonbFields(feedback.insight_report as JsonbValue)
      : null,
    execution_report: feedback.execution_report
      ? encryptJsonbFields(feedback.execution_report as JsonbValue)
      : null,
    vision_report: feedback.vision_report
      ? encryptJsonbFields(feedback.vision_report as JsonbValue)
      : null,
    closing_report: feedback.closing_report
      ? encryptJsonbFields(feedback.closing_report as JsonbValue)
      : null,
  };
}

/**
 * MonthlyFeedback 객체의 모든 JSONB 필드를 복호화
 */
export function decryptMonthlyFeedback(
  feedback: Record<string, unknown>
): Record<string, unknown> {
  return {
    ...feedback,
    summary_report: feedback.summary_report
      ? decryptJsonbFields(feedback.summary_report as JsonbValue)
      : null,
    daily_life_report: feedback.daily_life_report
      ? decryptJsonbFields(feedback.daily_life_report as JsonbValue)
      : null,
    emotion_report: feedback.emotion_report
      ? decryptJsonbFields(feedback.emotion_report as JsonbValue)
      : null,
    insight_report: feedback.insight_report
      ? decryptJsonbFields(feedback.insight_report as JsonbValue)
      : null,
    execution_report: feedback.execution_report
      ? decryptJsonbFields(feedback.execution_report as JsonbValue)
      : null,
    vision_report: feedback.vision_report
      ? decryptJsonbFields(feedback.vision_report as JsonbValue)
      : null,
    closing_report: feedback.closing_report
      ? decryptJsonbFields(feedback.closing_report as JsonbValue)
      : null,
  };
}

/**
 * DailyFeedback 객체의 모든 JSONB 필드를 암호화
 * 기존 필드와 새로운 타입별 리포트 필드를 모두 지원
 */
export function encryptDailyFeedback(
  feedback: Record<string, unknown>
): Record<string, unknown> {
  return {
    ...feedback,
    // 새로운 타입별 리포트 필드
    summary_report: feedback.summary_report
      ? encryptJsonbFields(feedback.summary_report as JsonbValue)
      : null,
    daily_report: feedback.daily_report
      ? encryptJsonbFields(feedback.daily_report as JsonbValue)
      : null,
    emotion_report: feedback.emotion_report
      ? encryptJsonbFields(feedback.emotion_report as JsonbValue)
      : null,
    vivid_report: feedback.vivid_report
      ? encryptJsonbFields(feedback.vivid_report as JsonbValue)
      : null,
    insight_report: feedback.insight_report
      ? encryptJsonbFields(feedback.insight_report as JsonbValue)
      : null,
    feedback_report: feedback.feedback_report
      ? encryptJsonbFields(feedback.feedback_report as JsonbValue)
      : null,
    final_report: feedback.final_report
      ? encryptJsonbFields(feedback.final_report as JsonbValue)
      : null,
    trend: feedback.trend
      ? encryptJsonbFields(feedback.trend as JsonbValue)
      : null,
  };
}

/**
 * DailyFeedback 객체의 모든 JSONB 필드를 복호화
 * 기존 필드와 새로운 타입별 리포트 필드를 모두 지원
 */
export function decryptDailyFeedback(
  feedback: Record<string, unknown>
): Record<string, unknown> {
  return {
    ...feedback,
    // 새로운 타입별 리포트 필드
    summary_report: feedback.summary_report
      ? decryptJsonbFields(feedback.summary_report as JsonbValue)
      : null,
    daily_report: feedback.daily_report
      ? decryptJsonbFields(feedback.daily_report as JsonbValue)
      : null,
    emotion_report: feedback.emotion_report
      ? decryptJsonbFields(feedback.emotion_report as JsonbValue)
      : null,
    vivid_report: feedback.vivid_report
      ? decryptJsonbFields(feedback.vivid_report as JsonbValue)
      : null,
    insight_report: feedback.insight_report
      ? decryptJsonbFields(feedback.insight_report as JsonbValue)
      : null,
    feedback_report: feedback.feedback_report
      ? decryptJsonbFields(feedback.feedback_report as JsonbValue)
      : null,
    final_report: feedback.final_report
      ? decryptJsonbFields(feedback.final_report as JsonbValue)
      : null,
    trend: feedback.trend
      ? decryptJsonbFields(feedback.trend as JsonbValue)
      : null,
  };
}
