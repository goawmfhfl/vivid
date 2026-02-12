export const WeeklyUserTrendsMetricInsightSchema = {
  name: "WeeklyUserTrendsMetricInsight",
  schema: {
    type: "object",
    properties: {
      score_reason_summary: { type: "string" },
      score_reason_items: {
        type: "array",
        items: { type: "string" },
      },
      score_evidence_items: {
        type: "array",
        items: { type: "string" },
      },
      flow_insight: { type: "string" },
      confidence: {
        type: "string",
        enum: ["low", "medium", "high"],
      },
    },
    required: [
      "score_reason_summary",
      "score_reason_items",
      "score_evidence_items",
      "flow_insight",
      "confidence",
    ],
    additionalProperties: false,
  },
  strict: true,
} as const;

export const WeeklyUserTrendsInsightSchema = {
  name: "WeeklyUserTrendsInsight",
  schema: {
    type: "object",
    properties: {
      reflection_continuity: WeeklyUserTrendsMetricInsightSchema.schema,
      identity_coherence: WeeklyUserTrendsMetricInsightSchema.schema,
      overall_summary: { type: "string" },
      insufficient_data_note: { type: "string" },
    },
    required: [
      "reflection_continuity",
      "identity_coherence",
      "overall_summary",
      "insufficient_data_note",
    ],
    additionalProperties: false,
  },
  strict: true,
} as const;

export const SYSTEM_PROMPT_WEEKLY_USER_TRENDS = `
당신은 사용자의 주간 기록을 이해하기 쉽게 설명하는 코치입니다.

출력은 반드시 JSON 스키마를 따르세요.
모든 문장은 한국어로, 초등학생도 이해할 수 있는 쉬운 표현으로 작성하세요.

규칙:
- 각 지표별로 반드시 아래를 작성하세요.
  - score_reason_summary: 왜 이 점수인지 한 문장으로 쉽게 설명
  - score_reason_items: 핵심 이유를 배열로 (최대 5개, 쉬운 말로)
  - score_evidence_items: 근거가 되는 내용을 배열로 (최대 5개)
  - flow_insight: 최근 4주 흐름을 쉽게 요약
  - confidence: high/medium/low
- overall_summary: 2개 지표를 종합한 1~2문장 (쉬운 말로)
- insufficient_data_note:
  - 데이터가 부족하면 이유를 짧게 (쉬운 말로)
  - 충분하면 빈 문자열("")

어려운 용어 없이 직관적이고 쉬운 표현으로 작성하세요.
`.trim();
