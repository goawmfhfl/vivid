/**
 * Weekly Overview 스키마 (Header에 통합)
 * Pro/Free 분기 포함
 */
export function getWeeklyOverviewSchema(isPro: boolean) {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      title: {
        type: "string",
        description: "이번 주를 한 줄로 요약한 제목",
      },
      narrative: {
        type: "string",
        maxLength: isPro ? 800 : 400,
      },
      top_keywords: {
        type: "array",
        items: { type: "string" },
        maxItems: 10,
        description:
          "이번 주에 가장 많이 등장한 키워드 배열 (반드시 10개 이하)",
      },
      repeated_themes: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            theme: { type: "string" },
            count: { type: "integer", minimum: 0 },
          },
          required: ["theme", "count"],
        },
        maxItems: isPro ? 10 : 5,
      },
      ai_overall_comment: {
        type: "string",
        maxLength: isPro ? 500 : 300,
      },
    },
    required: [
      "title",
      "narrative",
      "top_keywords",
      "repeated_themes",
      "ai_overall_comment",
    ],
  };
}
