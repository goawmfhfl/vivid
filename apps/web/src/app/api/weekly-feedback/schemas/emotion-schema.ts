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
        items: { type: "string" },
        maxItems: isPro ? 7 : 5,
      },
      arousal_triggers: {
        type: "array",
        items: { type: "string" },
        maxItems: isPro ? 7 : 5,
      },
      anxious_triggers: {
        type: "array",
        items: { type: "string" },
        maxItems: isPro ? 5 : 3,
      },
      engaged_triggers: {
        type: "array",
        items: { type: "string" },
        maxItems: isPro ? 5 : 3,
      },
      sad_triggers: {
        type: "array",
        items: { type: "string" },
        maxItems: isPro ? 5 : 3,
      },
      calm_triggers: {
        type: "array",
        items: { type: "string" },
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
              pattern: "^\\d{2}/\\d{2}[월화수목금토일]$",
              description: "11/24월 형식",
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
