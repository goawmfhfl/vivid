/**
 * Emotion Report 스키마
 * Pro/Free 분기 포함
 */
export function getEmotionReportSchema(isPro: boolean) {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      ai_mood_valence: { type: "number", nullable: true },
      ai_mood_arousal: { type: "number", nullable: true },
      dominant_emotion: { type: "string", nullable: true },
      valence_explanation: {
        type: "string",
        maxLength: isPro ? 500 : 300,
        description:
          "날짜 표현 시 '2일차' 대신 '2025년 1월 15일 (수요일)' 형식 사용",
      },
      arousal_explanation: {
        type: "string",
        maxLength: isPro ? 500 : 300,
      },
      valence_patterns: {
        type: "array",
        items: { type: "string" },
        maxItems: isPro ? 5 : 3,
      },
      arousal_patterns: {
        type: "array",
        items: { type: "string" },
        maxItems: isPro ? 5 : 3,
      },
      valence_triggers: {
        type: "array",
        items: {
          type: "string",
          description:
            "날짜와 요일 포함 (예: '가족/이사 등의 큰 변화로 인한 기대와 불안의 공존(2025년 1월 15일 수요일)')",
        },
        maxItems: isPro ? 7 : 5,
      },
      arousal_triggers: {
        type: "array",
        items: {
          type: "string",
          description:
            "날짜와 요일 포함 (예: '일과 에너지 소모로 인한 피로감(2025년 1월 15일 수요일)')",
        },
        maxItems: isPro ? 7 : 5,
      },
      anxious_triggers: {
        type: "array",
        items: {
          type: "string",
          description:
            "각 요소를 현재보다 2배 길이로 작성 (예: '캐모마일 차와 가벼운 산책 같은 루틴이 주는 안정감' → 더 상세한 설명 추가)",
        },
        maxItems: isPro ? 5 : 3,
      },
      engaged_triggers: {
        type: "array",
        items: {
          type: "string",
          description: "각 요소를 현재보다 2배 길이로 작성",
        },
        maxItems: isPro ? 5 : 3,
      },
      sad_triggers: {
        type: "array",
        items: {
          type: "string",
          description: "각 요소를 현재보다 2배 길이로 작성",
        },
        maxItems: isPro ? 5 : 3,
      },
      calm_triggers: {
        type: "array",
        items: {
          type: "string",
          description: "각 요소를 현재보다 2배 길이로 작성",
        },
        maxItems: isPro ? 5 : 3,
      },
      daily_emotions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            date: {
              type: "string",
              pattern: "^\\d{4}-\\d{2}-\\d{2}$",
              description: "YYYY-MM-DD 형식 (예: 2025-01-15)",
            },
            weekday: { type: "string" },
            ai_mood_valence: { type: "number", nullable: true },
            ai_mood_arousal: { type: "number", nullable: true },
            dominant_emotion: { type: "string", nullable: true },
          },
          required: [
            "date",
            "weekday",
            "ai_mood_valence",
            "ai_mood_arousal",
            "dominant_emotion",
          ],
        },
        description: "기록이 있는 날짜의 일별 감정 데이터만 포함",
      },
    },
    required: [
      "ai_mood_valence",
      "ai_mood_arousal",
      "dominant_emotion",
      "valence_explanation",
      "arousal_explanation",
      "valence_patterns",
      "arousal_patterns",
      "valence_triggers",
      "arousal_triggers",
      "anxious_triggers",
      "engaged_triggers",
      "sad_triggers",
      "calm_triggers",
      "daily_emotions",
    ],
  };
}
