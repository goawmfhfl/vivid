/**
 * Summary Report 스키마 (주간 피드백 헤더)
 * Pro/Free 분기 포함
 */
export function getSummaryReportSchema(isPro: boolean) {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      summary: {
        type: "string",
        description: "이번 주를 요약한 전체 요약",
        maxLength: isPro ? 500 : 250,
      },
      key_points: {
        type: "array",
        items: { type: "string" },
        minItems: 0,
        maxItems: isPro ? 10 : 5,
        description: "이번 주의 핵심 포인트 배열",
      },
      trend_analysis: {
        type: "string",
        nullable: true,
        description: "트렌드 분석 (Pro 전용)",
      },
    },
    required: ["summary", "key_points", "trend_analysis"],
  };
}
