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
        description:
          "이번 주를 요약한 전체 요약 (Pro는 현재 길이의 2/3로 간결하게)",
        maxLength: isPro ? 330 : 250, // Pro는 500자에서 330자로 (2/3)
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
        description: "트렌드 분석 (Pro 전용) - 간결하게 작성 (현재 길이의 2/3)",
        maxLength: isPro ? 330 : 0, // Pro는 500자에서 330자로 (2/3)
      },
      // Pro 전용: 배열 구조로 재구성
      ...(isPro
        ? {
            patterns_and_strengths: {
              type: "array",
              items: { type: "string" },
              maxItems: 5,
              description: "패턴과 강점 배열",
            },
            mindset_and_tips: {
              type: "array",
              items: { type: "string" },
              maxItems: 5,
              description: "마인드셋과 실천 팁 배열",
            },
          }
        : {}),
    },
    required: isPro
      ? [
          "summary",
          "key_points",
          "trend_analysis",
          "patterns_and_strengths",
          "mindset_and_tips",
        ]
      : ["summary", "key_points", "trend_analysis"],
  };
}
