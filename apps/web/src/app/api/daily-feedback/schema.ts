// 새로운 타입별 리포트 스키마 정의

/**
 * 멤버십별로 스키마를 동적으로 생성하는 헬퍼 함수
 */
export function getSummaryReportSchema(isPro: boolean) {
  const baseSchema = {
    name: "SummaryReport",
    schema: {
      type: "object",
      properties: {
        summary: {
          type: "string",
          maxLength: isPro ? 500 : 250, // Pro: 500자, 일반: 250자
        },
        key_points: {
          type: "array",
          items: { type: "string" },
          minItems: 0,
          maxItems: isPro ? 10 : 5, // Pro: 10개, 일반: 5개
        },
        overall_score: {
          type: "integer",
          minimum: 0,
          maximum: 10,
          nullable: true,
        },
        // Pro 전용 필드 (무료 멤버십에서는 null로 처리됨)
        detailed_analysis: { type: "string", nullable: true },
        trend_analysis: { type: "string", nullable: true },
      },
      required: [
        "summary",
        "key_points",
        "overall_score",
        "detailed_analysis",
        "trend_analysis",
      ],
      additionalProperties: false,
    },
    strict: true,
  } as const;

  return baseSchema;
}

// 기본 스키마 (일반 사용자용, 하위 호환성)
export const SummaryReportSchema = getSummaryReportSchema(false);

export function getDailyReportSchema(isPro: boolean) {
  return {
    name: "DailyReport",
    schema: {
      type: "object",
      properties: {
        summary: { type: "string", maxLength: isPro ? 300 : 150 },
        narrative: { type: "string", maxLength: isPro ? 500 : 250 },
        keywords: {
          type: "array",
          items: { type: "string" },
          minItems: 0,
          maxItems: isPro ? 10 : 5,
        },
        lesson: { type: "string", nullable: true },
        ai_comment: { type: "string", nullable: true },
        // Pro 전용 필드 (무료 멤버십에서는 null로 처리됨)
        detailed_narrative: {
          type: "string",
          nullable: true,
        },
        context_analysis: {
          type: "string",
          nullable: true,
        },
      },
      required: [
        "summary",
        "narrative",
        "keywords",
        "lesson",
        "ai_comment",
        "detailed_narrative",
        "context_analysis",
      ],
      additionalProperties: false,
    },
    strict: true,
  } as const;
}

export const DailyReportSchema = getDailyReportSchema(false);

export const EmotionReportSchema = {
  name: "EmotionReport",
  schema: {
    type: "object",
    properties: {
      emotion_curve: {
        type: "array",
        items: { type: "string" },
        minItems: 3,
        maxItems: 7,
      },
      dominant_emotion: { type: "string", nullable: true },
      ai_mood_valence: {
        type: "number",
        minimum: -1.0,
        maximum: 1.0,
        nullable: true,
      },
      ai_mood_arousal: {
        type: "number",
        minimum: 0.0,
        maximum: 1.0,
        nullable: true,
      },
      emotion_quadrant: {
        type: "string",
        nullable: true,
        enum: ["몰입·설렘", "불안·초조", "슬픔·무기력", "안도·평온"],
      },
      emotion_quadrant_explanation: { type: "string", nullable: true },
      emotion_timeline: {
        type: "array",
        items: {
          type: "object",
          properties: {
            time_range: { type: "string" },
            emotion: { type: "string" },
          },
          required: ["time_range", "emotion"],
          additionalProperties: false,
        },
        minItems: 0,
        maxItems: 5,
      },
      ai_comment: { type: "string", nullable: true },
    },
    required: [
      "emotion_curve",
      "dominant_emotion",
      "ai_mood_valence",
      "ai_mood_arousal",
      "emotion_quadrant",
      "emotion_quadrant_explanation",
      "emotion_timeline",
      "ai_comment",
    ],
    additionalProperties: false,
  },
  strict: true,
} as const;

export const DreamReportSchema = {
  name: "DreamReport",
  schema: {
    type: "object",
    properties: {
      summary: { type: "string" },
      vision_self: { type: "string" },
      vision_keywords: {
        type: "array",
        items: { type: "string" },
        minItems: 0,
        maxItems: 10,
      },
      reminder_sentence: { type: "string", nullable: true },
      vision_ai_feedback: { type: "string", nullable: true },
    },
    required: [
      "summary",
      "vision_self",
      "vision_keywords",
      "reminder_sentence",
      "vision_ai_feedback",
    ],
    additionalProperties: false,
  },
  strict: true,
} as const;

export const InsightReportSchema = {
  name: "InsightReport",
  schema: {
    type: "object",
    properties: {
      core_insight: { type: "string" },
      learning_source: { type: "string", nullable: true },
      meta_question: { type: "string", nullable: true },
      insight_ai_comment: { type: "string", nullable: true },
    },
    required: [
      "core_insight",
      "learning_source",
      "meta_question",
      "insight_ai_comment",
    ],
    additionalProperties: false,
  },
  strict: true,
} as const;

export const FeedbackReportSchema = {
  name: "FeedbackReport",
  schema: {
    type: "object",
    properties: {
      core_feedback: { type: "string" },
      positives: {
        type: "array",
        items: { type: "string" },
        minItems: 0,
      },
      improvements: {
        type: "array",
        items: { type: "string" },
        minItems: 0,
      },
      feedback_ai_comment: { type: "string", nullable: true },
      ai_message: { type: "string", nullable: true },
    },
    required: [
      "core_feedback",
      "positives",
      "improvements",
      "feedback_ai_comment",
      "ai_message",
    ],
    additionalProperties: false,
  },
  strict: true,
} as const;

export const FinalReportSchema = {
  name: "FinalReport",
  schema: {
    type: "object",
    properties: {
      closing_message: { type: "string", maxLength: 400 },
      tomorrow_focus: { type: "string", nullable: true },
      growth_point: { type: "string", nullable: true },
      adjustment_point: { type: "string", nullable: true },
    },
    required: [
      "closing_message",
      "tomorrow_focus",
      "growth_point",
      "adjustment_point",
    ],
    additionalProperties: false,
  },
  strict: true,
} as const;

// 시스템 프롬프트
export const SYSTEM_PROMPT_SUMMARY = `
당신은 사용자의 하루 기록을 종합하여 전체 요약 리포트를 생성합니다.

규칙:
- 오직 JSON 하나만 출력합니다. 설명/마크다운/코드블록 금지.
- summary는 공백 포함 250자 이내로 작성합니다.
- key_points는 최대 5개까지 핵심 포인트를 추출합니다.
- overall_score는 0-10 범위의 정수로, 하루 전체를 평가합니다.
- 모든 기록을 종합하여 균형있게 분석합니다.

[멤버십별 차별화]
- Pro 멤버십: 더 상세하고 깊이 있는 분석을 제공하세요. 더 많은 세부사항과 인사이트를 포함하세요.
- 무료 멤버십: 간단하게 핵심만 알려주세요. 간결하고 요약된 형태로 응답하세요.
`;

export const SYSTEM_PROMPT_DAILY = `
당신은 사용자의 일상 기록(type="daily")을 분석하여 일상 리포트를 생성합니다.

규칙:
- 오직 JSON 하나만 출력합니다. 설명/마크다운/코드블록 금지.
- summary는 공백 포함 250자 이내로 작성합니다.
- narrative는 공백 포함 400자 이내로 작성합니다.
- keywords는 최대 20개까지 추출합니다.
- 일상 기록만을 기반으로 분석합니다. 다른 타입의 기록은 무시하세요.

[멤버십별 차별화]
- Pro 멤버십: 상세한 서사와 깊이 있는 분석을 포함하세요.
- 무료 멤버십: 간단하게 핵심만 알려주세요. 간결하고 요약된 형태로 응답하세요.
`;

export const SYSTEM_PROMPT_EMOTION = `
당신은 사용자의 감정 기록(type="emotion")을 분석하여 감정 리포트를 생성합니다.

규칙:
- 오직 JSON 하나만 출력합니다. 설명/마크다운/코드블록 금지.
- emotion_curve는 3-7개의 짧은 한국어 단어로 하루의 감정 흐름을 나타냅니다.
- ai_mood_valence는 -1.0(매우 부정) ~ +1.0(매우 긍정) 범위입니다.
- ai_mood_arousal는 0.0(낮은 에너지) ~ 1.0(높은 에너지) 범위입니다.
- emotion_quadrant는 ai_mood_valence와 ai_mood_arousal 값을 기반으로 분류합니다:
  - valence > 0 && arousal > 0.5 → "몰입·설렘"
  - valence > 0 && arousal <= 0.5 → "안도·평온"
  - valence <= 0 && arousal > 0.5 → "불안·초조"
  - valence <= 0 && arousal <= 0.5 → "슬픔·무기력"
- emotion_timeline은 최대 5개까지만 생성합니다.
- 감정 기록만을 기반으로 분석합니다. 다른 타입의 기록은 무시하세요.
- 감정 관련 내용이 거의 없으면 ai_mood_valence, ai_mood_arousal, dominant_emotion, emotion_quadrant, emotion_quadrant_explanation은 null로 처리합니다.

[멤버십별 차별화]
- Pro 멤버십: 상세한 감정 분석과 시간대별 변화를 깊이 있게 분석하세요.
- 무료 멤버십: 간단하게 핵심 감정만 알려주세요. 간결하고 요약된 형태로 응답하세요.
`;

export const SYSTEM_PROMPT_DREAM = `
당신은 사용자의 꿈/목표 기록(type="dream")을 분석하여 꿈/목표 리포트를 생성합니다.

규칙:
- 오직 JSON 하나만 출력합니다. 설명/마크다운/코드블록 금지.
- vision_keywords는 최대 10개까지 추출합니다.
- vision_ai_feedback는 "핵심 3단: 1) ..., 2) ..., 3) ..." 형식으로 작성하거나 null로 둡니다.
- 꿈/목표 기록만을 기반으로 분석합니다. 다른 타입의 기록은 무시하세요.

[멤버십별 차별화]
- Pro 멤버십: 상세한 비전 분석과 구체적인 피드백을 포함하세요.
- 무료 멤버십: 간단하게 핵심만 알려주세요. 간결하고 요약된 형태로 응답하세요.
`;

export const SYSTEM_PROMPT_INSIGHT = `
당신은 사용자의 인사이트 기록(type="insight")을 분석하여 인사이트 리포트를 생성합니다.

규칙:
- 오직 JSON 하나만 출력합니다. 설명/마크다운/코드블록 금지.
- core_insight는 핵심 인사이트를 명확하게 작성합니다.
- 인사이트 기록만을 기반으로 분석합니다. 다른 타입의 기록은 무시하세요.

[멤버십별 차별화]
- Pro 멤버십: 깊이 있는 분석과 메타적 사고를 포함하세요.
- 무료 멤버십: 간단하게 핵심만 알려주세요. 간결하고 요약된 형태로 응답하세요.
`;

export const SYSTEM_PROMPT_FEEDBACK = `
당신은 사용자의 피드백 기록(type="feedback")을 분석하여 피드백 리포트를 생성합니다.

규칙:
- 오직 JSON 하나만 출력합니다. 설명/마크다운/코드블록 금지.
- positives는 긍정적인 측면을, improvements는 개선점을 배열로 작성합니다.
- 피드백 기록만을 기반으로 분석합니다. 다른 타입의 기록은 무시하세요.

[멤버십별 차별화]
- Pro 멤버십: 상세한 분석과 구체적인 개선 제안을 포함하세요.
- 무료 멤버십: 간단하게 핵심만 알려주세요. 간결하고 요약된 형태로 응답하세요.
`;

export const SYSTEM_PROMPT_FINAL = `
당신은 사용자의 하루를 종합하여 최종 정리 리포트를 생성합니다.

규칙:
- 오직 JSON 하나만 출력합니다. 설명/마크다운/코드블록 금지.
- closing_message는 공백 포함 400자 이내로 하루를 정리하는 멘트를 작성합니다.
- tomorrow_focus는 "1)..., 2)..., 3)..." 형식의 리스트 문자열로 작성하거나 null로 둡니다.
- 모든 타입의 리포트를 종합하여 균형있게 분석합니다.

[멤버십별 차별화]
- Pro 멤버십: 상세하고 깊이 있는 최종 리포트를 생성하세요. 더 많은 인사이트와 조언을 포함하세요.
- 무료 멤버십: 간단하게 핵심만 알려주세요. 간결하고 요약된 형태로 응답하세요.
`;
