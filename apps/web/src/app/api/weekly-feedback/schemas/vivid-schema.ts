/**
 * Vivid Report 스키마
 * Pro/Free 분기 포함
 */
export function getVividReportSchema(isPro: boolean) {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      // 1. 주간 비비드 요약
      weekly_vivid_summary: {
        type: "object",
        additionalProperties: false,
        properties: {
          summary: {
            type: "string",
            maxLength: 350, // 300자 내외
            description: "7일간의 비비드 기록 종합 요약",
          },
          key_points: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                point: { type: "string" },
                dates: {
                  type: "array",
                  items: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                },
              },
              required: ["point", "dates"],
            },
            minItems: 1,
            maxItems: isPro ? 10 : 5,
            description: "핵심 포인트 배열 (날짜와 함께 표시)",
          },
          next_week_vision_key_points: {
            type: "array",
            items: { type: "string" },
            minItems: 0,
            maxItems: isPro ? 7 : 5,
            description: "다음주 비전의 핵심 포인트",
          },
        },
        required: ["summary", "key_points", "next_week_vision_key_points"],
      },

      // 2. 주간 비비드 평가
      weekly_vivid_evaluation: {
        type: "object",
        additionalProperties: false,
        properties: {
          daily_evaluation_trend: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                evaluation_score: { type: "number", minimum: 0, maximum: 100 },
              },
              required: ["date", "evaluation_score"],
            },
            minItems: 0,
            maxItems: 7,
            description: "7일간의 current_evaluation 점수 추이",
          },
          weekly_average_score: {
            type: "number",
            minimum: 0,
            maximum: 100,
            description: "주간 평균 평가 점수",
          },
          highest_day: {
            type: "object",
            additionalProperties: false,
            properties: {
              date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
              score: { type: "number", minimum: 0, maximum: 100 },
              reason: { type: "string" },
            },
            required: ["date", "score", "reason"],
          },
          lowest_day: {
            type: "object",
            additionalProperties: false,
            properties: {
              date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
              score: { type: "number", minimum: 0, maximum: 100 },
              reason: { type: "string" },
            },
            required: ["date", "score", "reason"],
          },
        },
        required: [
          "daily_evaluation_trend",
          "weekly_average_score",
          "highest_day",
          "lowest_day",
        ],
      },

      // 3. 주간 키워드 분석
      weekly_keywords_analysis: {
        type: "object",
        additionalProperties: false,
        properties: {
          vision_keywords_trend: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                keyword: { type: "string" },
                days: { type: "integer", minimum: 0 },
                context: { type: "string" },
                related_keywords: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: ["keyword", "days", "context", "related_keywords"],
            },
            maxItems: 8,
            description: "비전 키워드 트렌드 (홀수 개수: 4, 6, 8개)",
          },
          top_10_keywords: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                keyword: { type: "string" },
                frequency: { type: "integer", minimum: 0 },
                dates: {
                  type: "array",
                  items: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                },
              },
              required: ["keyword", "frequency", "dates"],
            },
            minItems: 0,
            maxItems: 10,
            description: "7일간 가장 자주 등장한 키워드 Top 10",
          },
        },
        required: ["vision_keywords_trend", "top_10_keywords"],
      },

      // 4. 앞으로의 모습 종합 분석
      future_vision_analysis: {
        type: "object",
        additionalProperties: false,
        properties: {
          integrated_summary: {
            type: "string",
            maxLength: isPro ? 400 : 300,
            description: "7일간의 앞으로의 모습 요약 통합",
          },
          consistency_analysis: {
            type: "object",
            additionalProperties: false,
            properties: {
              consistent_themes: {
                type: "array",
                items: { type: "string" },
              },
              changing_themes: {
                type: "array",
                items: { type: "string" },
              },
              analysis: { type: "string" },
            },
            required: ["consistent_themes", "changing_themes", "analysis"],
          },
          evaluation_trend: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                evaluation_score: { type: "number", minimum: 0, maximum: 100 },
              },
              required: ["date", "evaluation_score"],
            },
            minItems: 0,
            maxItems: 7,
            description: "주간 비전 평가 점수 추이 (future_evaluation)",
          },
        },
        required: [
          "integrated_summary",
          "consistency_analysis",
          "evaluation_trend",
        ],
      },

      // 5. 일치도 트렌드 분석
      alignment_trend_analysis: {
        type: "object",
        additionalProperties: false,
        properties: {
          daily_alignment_scores: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                score: { type: "number", minimum: 0, maximum: 100 },
              },
              required: ["date", "score"],
            },
            minItems: 0,
            maxItems: 7,
            description: "7일간 일치도 점수 변화",
          },
          average_alignment_score: {
            type: "number",
            minimum: 0,
            maximum: 100,
            description: "평균 일치도 점수",
          },
          highest_alignment_day: {
            type: "object",
            additionalProperties: false,
            properties: {
              date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
              score: { type: "number", minimum: 0, maximum: 100 },
              pattern: { type: "string" },
            },
            required: ["date", "score", "pattern"],
          },
          lowest_alignment_day: {
            type: "object",
            additionalProperties: false,
            properties: {
              date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
              score: { type: "number", minimum: 0, maximum: 100 },
              pattern: { type: "string" },
            },
            required: ["date", "score", "pattern"],
          },
          trend: {
            type: "string",
            enum: ["improving", "declining", "stable"],
            description: "일치도 개선/악화 추세",
          },
        },
        required: [
          "daily_alignment_scores",
          "average_alignment_score",
          "highest_alignment_day",
          "lowest_alignment_day",
          "trend",
        ],
      },

      // 6. 사용자 특징 심화 분석
      user_characteristics_analysis: {
        type: "object",
        additionalProperties: false,
        properties: {
          consistency_summary: {
            type: "string",
            maxLength: isPro ? 300 : 200,
            description: "7일간 특징의 일관성 요약",
          },
          top_5_characteristics: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                characteristic: { type: "string" },
                frequency: { type: "integer", minimum: 0 },
                dates: {
                  type: "array",
                  items: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                },
              },
              required: ["characteristic", "frequency", "dates"],
            },
            minItems: 0,
            maxItems: 5,
            description: "가장 자주 언급된 특징 Top 5",
          },
          change_patterns: {
            type: "object",
            additionalProperties: false,
            properties: {
              new_characteristics: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    characteristic: { type: "string" },
                    first_appeared: {
                      type: "string",
                      pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                    },
                  },
                  required: ["characteristic", "first_appeared"],
                },
              },
              disappeared_characteristics: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    characteristic: { type: "string" },
                    last_appeared: {
                      type: "string",
                      pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                    },
                  },
                  required: ["characteristic", "last_appeared"],
                },
              },
            },
            required: ["new_characteristics", "disappeared_characteristics"],
          },
        },
        required: [
          "consistency_summary",
          "top_5_characteristics",
          "change_patterns",
        ],
      },

      // 7. 지향하는 모습 심화 분석
      aspired_traits_analysis: {
        type: "object",
        additionalProperties: false,
        properties: {
          consistency_summary: {
            type: "string",
            maxLength: isPro ? 300 : 200,
            description: "7일간 지향하는 모습의 일관성 요약",
          },
          average_score: {
            type: "number",
            minimum: 0,
            maximum: 100,
            description: "지향하는 모습 점수 평균",
          },
          top_5_aspired_traits: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                trait: { type: "string" },
                frequency: { type: "integer", minimum: 0 },
                dates: {
                  type: "array",
                  items: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                },
              },
              required: ["trait", "frequency", "dates"],
            },
            minItems: 0,
            maxItems: 5,
            description: "가장 자주 언급된 지향 모습 Top 5",
          },
          evolution_process: {
            type: "object",
            additionalProperties: false,
            properties: {
              summary: { type: "string" },
              stages: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    period: { type: "string" },
                    traits: {
                      type: "array",
                      items: { type: "string" },
                    },
                    description: { type: "string" },
                  },
                  required: ["period", "traits", "description"],
                },
              },
            },
            required: ["summary", "stages"],
            description: "지향 모습의 진화 과정",
          },
        },
        required: [
          "consistency_summary",
          "average_score",
          "top_5_aspired_traits",
          "evolution_process",
        ],
      },

      // 8. 주간 인사이트
      weekly_insights: {
        type: "object",
        additionalProperties: false,
        properties: {
          patterns: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                pattern: { type: "string" },
                description: { type: "string" },
                evidence: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: ["pattern", "description", "evidence"],
            },
            minItems: 0,
            maxItems: isPro ? 10 : 7,
            description: "7일간의 기록에서 발견한 패턴",
          },
          unexpected_connections: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                connection: { type: "string" },
                description: { type: "string" },
                significance: { type: "string" },
              },
              required: ["connection", "description", "significance"],
            },
            minItems: 0,
            maxItems: isPro ? 7 : 5,
            description: "예상치 못한 연결점",
          },
        },
        required: ["patterns", "unexpected_connections"],
      },
    },
    required: [
      "weekly_vivid_summary",
      "weekly_vivid_evaluation",
      "weekly_keywords_analysis",
      "future_vision_analysis",
      "alignment_trend_analysis",
      "user_characteristics_analysis",
      "aspired_traits_analysis",
      "weekly_insights",
    ],
  };
}
