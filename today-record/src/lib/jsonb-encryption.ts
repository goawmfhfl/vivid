import { encrypt, decrypt, isEncrypted } from "./encryption";

// 숫자 암호화를 위한 마커 (암호화된 숫자를 식별하기 위해)
const NUMBER_MARKER = "__ENCRYPTED_NUMBER__:";

/**
 * JSONB 객체 내의 문자열과 숫자 필드를 재귀적으로 암호화
 * 불린, null은 그대로 유지
 */
export function encryptJsonbFields(obj: any): any {
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
  if (typeof obj === "object") {
    const encrypted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      encrypted[key] = encryptJsonbFields(value);
    }
    return encrypted;
  }

  // 불린 등은 그대로 반환
  return obj;
}

/**
 * JSONB 객체 내의 암호화된 문자열과 숫자 필드를 재귀적으로 복호화
 */
export function decryptJsonbFields(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // 문자열인 경우 복호화 시도
  if (typeof obj === "string") {
    try {
      const decrypted = decrypt(obj);

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
    } catch (error) {
      // 복호화 실패 시 원본 반환 (기존 평문 데이터일 수 있음)
      return obj;
    }
  }

  // 배열인 경우 각 요소에 대해 재귀 호출
  if (Array.isArray(obj)) {
    return obj.map((item) => decryptJsonbFields(item));
  }

  // 객체인 경우 각 속성에 대해 재귀 호출
  if (typeof obj === "object") {
    const decrypted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      decrypted[key] = decryptJsonbFields(value);
    }
    return decrypted;
  }

  // 불린 등은 그대로 반환
  return obj;
}

/**
 * WeeklyFeedback 객체의 모든 JSONB 필드를 암호화
 */
export function encryptWeeklyFeedback(feedback: any): any {
  return {
    ...feedback,
    weekly_overview: encryptJsonbFields(feedback.weekly_overview),
    emotion_overview: feedback.emotion_overview
      ? encryptJsonbFields(feedback.emotion_overview)
      : null,
    growth_trends: encryptJsonbFields(feedback.growth_trends),
    insight_replay: encryptJsonbFields(feedback.insight_replay),
    vision_visualization_report: encryptJsonbFields(
      feedback.vision_visualization_report
    ),
    execution_reflection: encryptJsonbFields(feedback.execution_reflection),
    closing_section: encryptJsonbFields(feedback.closing_section),
  };
}

/**
 * WeeklyFeedback 객체의 모든 JSONB 필드를 복호화
 */
export function decryptWeeklyFeedback(feedback: any): any {
  return {
    ...feedback,
    weekly_overview: decryptJsonbFields(feedback.weekly_overview),
    emotion_overview: feedback.emotion_overview
      ? decryptJsonbFields(feedback.emotion_overview)
      : null,
    growth_trends: decryptJsonbFields(feedback.growth_trends),
    insight_replay: decryptJsonbFields(feedback.insight_replay),
    vision_visualization_report: decryptJsonbFields(
      feedback.vision_visualization_report
    ),
    execution_reflection: decryptJsonbFields(feedback.execution_reflection),
    closing_section: decryptJsonbFields(feedback.closing_section),
  };
}

/**
 * MonthlyFeedback 객체의 모든 JSONB 필드를 암호화
 */
export function encryptMonthlyFeedback(feedback: any): any {
  return {
    ...feedback,
    summary_overview: encryptJsonbFields(feedback.summary_overview),
    emotion_overview: encryptJsonbFields(feedback.emotion_overview),
    insight_overview: encryptJsonbFields(feedback.insight_overview),
    feedback_overview: encryptJsonbFields(feedback.feedback_overview),
    vision_overview: encryptJsonbFields(feedback.vision_overview),
    conclusion_overview: encryptJsonbFields(feedback.conclusion_overview),
  };
}

/**
 * MonthlyFeedback 객체의 모든 JSONB 필드를 복호화
 */
export function decryptMonthlyFeedback(feedback: any): any {
  return {
    ...feedback,
    summary_overview: decryptJsonbFields(feedback.summary_overview),
    emotion_overview: decryptJsonbFields(feedback.emotion_overview),
    insight_overview: decryptJsonbFields(feedback.insight_overview),
    feedback_overview: decryptJsonbFields(feedback.feedback_overview),
    vision_overview: decryptJsonbFields(feedback.vision_overview),
    conclusion_overview: decryptJsonbFields(feedback.conclusion_overview),
  };
}

/**
 * DailyFeedback 객체의 모든 JSONB 필드를 암호화
 */
export function encryptDailyFeedback(feedback: any): any {
  return {
    ...feedback,
    emotion_overview: feedback.emotion_overview
      ? encryptJsonbFields(feedback.emotion_overview)
      : null,
    narrative_overview: feedback.narrative_overview
      ? encryptJsonbFields(feedback.narrative_overview)
      : null,
    insight_overview: feedback.insight_overview
      ? encryptJsonbFields(feedback.insight_overview)
      : null,
    vision_overview: feedback.vision_overview
      ? encryptJsonbFields(feedback.vision_overview)
      : null,
    feedback_overview: feedback.feedback_overview
      ? encryptJsonbFields(feedback.feedback_overview)
      : null,
    meta_overview: feedback.meta_overview
      ? encryptJsonbFields(feedback.meta_overview)
      : null,
  };
}

/**
 * DailyFeedback 객체의 모든 JSONB 필드를 복호화
 */
export function decryptDailyFeedback(feedback: any): any {
  return {
    ...feedback,
    emotion_overview: feedback.emotion_overview
      ? decryptJsonbFields(feedback.emotion_overview)
      : null,
    narrative_overview: feedback.narrative_overview
      ? decryptJsonbFields(feedback.narrative_overview)
      : null,
    insight_overview: feedback.insight_overview
      ? decryptJsonbFields(feedback.insight_overview)
      : null,
    vision_overview: feedback.vision_overview
      ? decryptJsonbFields(feedback.vision_overview)
      : null,
    feedback_overview: feedback.feedback_overview
      ? decryptJsonbFields(feedback.feedback_overview)
      : null,
    meta_overview: feedback.meta_overview
      ? decryptJsonbFields(feedback.meta_overview)
      : null,
  };
}
