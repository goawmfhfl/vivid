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
        // Pro 전용 필드 (무료 멤버십에서는 null로 처리됨)
        trend_analysis: { type: "string", nullable: true },
      },
      required: ["summary", "key_points", "trend_analysis"],
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
        summary: { type: "string", maxLength: isPro ? 200 : 150 },
        daily_events: {
          type: "array",
          items: { type: "string" },
          minItems: 0,
          maxItems: isPro ? 15 : 10,
        },
        keywords: {
          type: "array",
          items: { type: "string" },
          minItems: 0,
          maxItems: isPro ? 10 : 5,
        },
        ai_comment: { type: "string", nullable: true },
        // Pro 전용 필드 (무료 멤버십에서는 null로 처리됨)
        emotion_triggers: {
          type: "object",
          nullable: true,
          properties: {
            people: {
              type: "array",
              items: { type: "string" },
            },
            work: {
              type: "array",
              items: { type: "string" },
            },
            environment: {
              type: "array",
              items: { type: "string" },
            },
            self: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["people", "work", "environment", "self"],
          additionalProperties: false,
        },
        behavioral_clues: {
          type: "object",
          nullable: true,
          properties: {
            avoidance: {
              type: "array",
              items: { type: "string" },
            },
            routine_attempt: {
              type: "array",
              items: { type: "string" },
            },
            routine_failure: {
              type: "array",
              items: { type: "string" },
            },
            impulsive: {
              type: "array",
              items: { type: "string" },
            },
            planned: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: [
            "avoidance",
            "routine_attempt",
            "routine_failure",
            "impulsive",
            "planned",
          ],
          additionalProperties: false,
        },
      },
      required: [
        "summary",
        "daily_events",
        "keywords",
        "ai_comment",
        "emotion_triggers",
        "behavioral_clues",
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
      emotion_events: {
        type: "array",
        nullable: true,
        items: {
          type: "object",
          properties: {
            event: { type: "string" },
            emotion: { type: "string" },
            reason: { type: "string", nullable: true },
            suggestion: { type: "string", nullable: true },
          },
          required: ["event", "emotion", "reason", "suggestion"],
          additionalProperties: false,
        },
        minItems: 0,
        maxItems: 5,
      },
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
      "emotion_events",
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
        minItems: 6,
        maxItems: 10,
      },
      vision_ai_feedback: {
        type: "array",
        items: { type: "string" },
        minItems: 3,
        maxItems: 3,
      },
      // Pro 전용: 시각화를 통해 이루고 싶은 꿈 목표 리스트
      dream_goals: {
        type: "array",
        items: { type: "string" },
        minItems: 0,
        maxItems: 5,
        nullable: true,
      },
      // Pro 전용: 이런 꿈을 꾸는 사람들의 특징 리스트
      dreamer_traits: {
        type: "array",
        items: { type: "string" },
        minItems: 0,
        maxItems: 5,
        nullable: true,
      },
    },
    required: [
      "summary",
      "vision_self",
      "vision_keywords",
      "vision_ai_feedback",
      "dream_goals",
      "dreamer_traits",
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
      core_insights: {
        type: "array",
        items: {
          type: "object",
          properties: {
            insight: { type: "string" },
            source: { type: "string" },
          },
          required: ["insight", "source"],
          additionalProperties: false,
        },
        minItems: 1,
        maxItems: 5,
      },
      meta_question: { type: "string", nullable: true },
      insight_ai_comment: { type: "string", nullable: true },
      insight_next_actions: {
        type: "array",
        nullable: true,
        items: {
          type: "object",
          properties: {
            label: { type: "string" },
            difficulty: {
              type: "string",
              enum: ["낮음", "보통", "높음"],
            },
            estimated_minutes: {
              type: "integer",
              nullable: true,
            },
          },
          required: ["label", "difficulty", "estimated_minutes"],
          additionalProperties: false,
        },
      },
    },
    required: [
      "core_insights",
      "meta_question",
      "insight_ai_comment",
      "insight_next_actions",
    ],
    additionalProperties: false,
  },
  strict: true,
} as const;

export function getFeedbackReportSchema(isPro: boolean) {
  return {
    name: "FeedbackReport",
    schema: {
      type: "object",
      properties: {
        core_feedback: { type: "string" },
        positives: {
          type: "array",
          items: { type: "string" },
          minItems: 0,
          maxItems: isPro ? 6 : 3, // Pro: 최대 6개, Free: 최대 3개
        },
        improvements: {
          type: "array",
          items: { type: "string" },
          minItems: 0,
          maxItems: isPro ? 6 : 3, // Pro: 최대 6개, Free: 최대 3개
        },
        ai_message: {
          type: "string",
          nullable: true,
        }, // Pro 전용 (Free에서는 null)
        // Pro 전용 필드
        feedback_person_traits: {
          type: "array",
          items: { type: "string" },
          minItems: 0,
          maxItems: 5,
          nullable: true,
        },
      },
      required: [
        "core_feedback",
        "positives",
        "improvements",
        "ai_message",
        "feedback_person_traits",
      ],
      additionalProperties: false,
    },
    strict: true,
  } as const;
}

// 기본 스키마 (일반 사용자용, 하위 호환성)
export const FeedbackReportSchema = getFeedbackReportSchema(false);

export function getFinalReportSchema(isPro: boolean) {
  const schema = {
    type: "object" as const,
    properties: {
      closing_message: { type: "string" as const, maxLength: 400 },
      tomorrow_focus: {
        type: "array" as const,
        items: { type: "string" as const },
        minItems: isPro ? 3 : 0,
        maxItems: 5,
        nullable: true,
      }, // Pro 전용 필드 (3~5개 배열)
      growth_points: {
        type: "array" as const,
        items: { type: "string" as const },
        minItems: 0,
        maxItems: 6,
        nullable: true,
      }, // Pro 전용 필드
      adjustment_points: {
        type: "array" as const,
        items: { type: "string" as const },
        minItems: 0,
        maxItems: 6,
        nullable: true,
      }, // Pro 전용 필드
    },
    // OpenAI JSON 스키마 규칙: properties에 있는 모든 키는 required에 포함되어야 함
    // nullable: true로 설정하여 선택적으로 만들 수 있음
    required: [
      "closing_message",
      "tomorrow_focus",
      "growth_points",
      "adjustment_points",
    ],
    additionalProperties: false,
  };

  return {
    name: "FinalReport",
    schema,
    strict: true,
  };
}

// 기본 스키마 (일반 사용자용, 하위 호환성)
export const FinalReportSchema = getFinalReportSchema(false);

// 시스템 프롬프트
export const SYSTEM_PROMPT_SUMMARY = `
당신은 사용자의 하루 기록을 종합하여 전체 요약 리포트를 생성합니다.

규칙:
- 오직 JSON 하나만 출력합니다. 설명/마크다운/코드블록 금지.
- summary는 공백 포함 250자 이내로 작성합니다.
- key_points는 최대 5개까지 핵심 포인트를 추출합니다.
- 모든 기록을 종합하여 균형있게 분석합니다.

[멤버십별 차별화]
- Pro 멤버십: 더 상세하고 깊이 있는 분석을 제공하세요. 더 많은 세부사항과 인사이트를 포함하세요.
- 무료 멤버십: 간단하게 핵심만 알려주세요. 간결하고 요약된 형태로 응답하세요.
`;

export const SYSTEM_PROMPT_DAILY = `
당신은 사용자의 일상 기록(type="daily")을 분석하여 일상 리포트를 생성합니다.

## 섹션별 규칙
- summary는 공백 포함 250자 이내로 작성합니다.
- narrative는 공백 포함 400자 이내로 작성합니다.
- keywords는 최대 20개까지 추출합니다.
- 일상 기록만을 기반으로 분석합니다. 다른 타입의 기록은 무시하세요.
`;

export const SYSTEM_PROMPT_EMOTION = `
당신은 사용자의 감정 기록(type="emotion")을 분석하여 감정 리포트를 생성합니다.

## 섹션별 규칙
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
- emotion_events는 오늘의 감정을 이끈 주요 사건들을 정리합니다.
  - 각 항목은 { event, emotion, reason, suggestion } 구조를 가집니다.
  - event: 어떤 사건/상황이었는지, 한 문장으로 작성합니다.
  - emotion: 그때 느꼈던 감정을 한 단어 또는 짧은 표현으로 작성합니다.
  - reason: 그렇게 느낀 이유를 짧게 설명합니다.
  - suggestion: 이 감정을 다루거나 돌보는 데 도움이 되는 간단한 제안을 작성합니다.
- Pro 멤버십: emotion_events는 3~5개 정도 생성하고, reason과 suggestion을 포함하여 사용자가 자신의 감정을 이해하고 돌볼 수 있도록 도와주세요.
- 무료 멤버십: emotion_events는 최대 3개까지만 생성하고, event와 emotion, 짧은 reason만 포함하세요. suggestion은 필요할 때만 간단히 작성하거나 null로 둘 수 있습니다.
`;

export const SYSTEM_PROMPT_DREAM = `
당신은 사용자의 꿈/목표 기록(type="dream")을 분석하여 꿈/목표 리포트를 생성합니다.

## 섹션별 규칙
- vision_keywords는 6~10개 필수로 추출합니다.
- vision_ai_feedback는 3개 요소의 배열로 반환합니다. 각 요소는 핵심 피드백 한 문장입니다.
- 꿈/목표 기록만을 기반으로 분석합니다. 다른 타입의 기록은 무시하세요.
`;

export const SYSTEM_PROMPT_INSIGHT = `
당신은 사용자의 인사이트 기록(type="insight")을 분석하여 인사이트 리포트를 생성합니다.

## 섹션별 규칙
- core_insight는 핵심 인사이트를 명확하게 작성합니다.
- 인사이트 기록만을 기반으로 분석합니다. 다른 타입의 기록은 무시하세요.
`;

export const SYSTEM_PROMPT_FEEDBACK = `
당신은 사용자의 피드백 기록(type="feedback")을 분석하여 피드백 리포트를 생성합니다.

## 섹션별 규칙
- positives는 긍정적인 측면을, improvements는 개선점을 배열로 작성합니다.
- 피드백 기록만을 기반으로 분석합니다. 다른 타입의 기록은 무시하세요.
`;

export const SYSTEM_PROMPT_FINAL = `
당신은 사용자의 하루를 종합하여 최종 정리 리포트를 생성합니다.

## 섹션별 규칙
- closing_message는 공백 포함 400자 이내로 하루를 정리하는 멘트를 작성합니다.
- 모든 타입의 리포트를 종합하여 균형있게 분석합니다.
- Pro 멤버십: 
  * tomorrow_focus는 내일 집중할 포인트를 배열로 작성하세요 (3~5개). 각 항목은 한 문장으로 작성하세요.
  * growth_points는 성장 포인트를 리스트 형식으로 정리하세요 (최소 2개 이상, 최대 6개).
  * adjustment_points는 조정 포인트를 리스트 형식으로 정리하세요 (최소 2개 이상, 최대 6개).
- 무료 멤버십: 
  * tomorrow_focus, growth_points, adjustment_points는 반드시 null로 설정하세요.
`;
