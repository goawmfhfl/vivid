/**
 * Vision Report 스키마
 * Pro/Free 분기 포함
 */
export function getVisionReportSchema(isPro: boolean) {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      vision_summary: {
        type: "string",
        maxLength: isPro ? 400 : 200,
      },
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
        maxItems: 8, // 최대 8개
        description: "홀수 개수로 생성 (4, 6, 8개)",
      },
      goals_pattern: {
        type: "object",
        additionalProperties: false,
        properties: {
          summary: {
            type: "string",
            maxLength: isPro ? 300 : 200,
          },
          goal_categories: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                category: { type: "string" },
                count: { type: "integer", minimum: 0 },
                examples: {
                  type: "array",
                  items: { type: "string" },
                },
                insight: { type: "string" },
              },
              required: ["category", "count", "examples", "insight"],
            },
            minItems: 1,
            maxItems: isPro ? 10 : 7,
          },
          ...(isPro
            ? {
                visualization: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    goal_categories_chart: {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        type: { type: "string", enum: ["pie"] },
                        data: {
                          type: "array",
                          items: {
                            type: "object",
                            additionalProperties: false,
                            properties: {
                              category: { type: "string" },
                              value: { type: "number" },
                              color: { type: "string" },
                            },
                            required: ["category", "value", "color"],
                          },
                        },
                      },
                      required: ["type", "data"],
                    },
                  },
                  required: ["goal_categories_chart"],
                },
              }
            : {}),
        },
        required: isPro
          ? ["summary", "goal_categories", "visualization"]
          : ["summary", "goal_categories"],
      },
      // self_vision_alignment 제거됨
      dreamer_traits_evolution: {
        type: "object",
        additionalProperties: false,
        properties: {
          summary: {
            type: "string",
            maxLength: isPro ? 300 : 200,
          },
          common_traits: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                trait: { type: "string" },
                frequency: { type: "integer", minimum: 0 },
                insight: { type: "string" },
              },
              required: ["trait", "frequency", "insight"],
            },
            maxItems: isPro ? 10 : 5,
          },
          ...(isPro
            ? {
                visualization: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    trait_word_cloud: {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        traits: {
                          type: "array",
                          items: {
                            type: "object",
                            additionalProperties: false,
                            properties: {
                              text: { type: "string" },
                              size: { type: "number" },
                              color: { type: "string" },
                            },
                            required: ["text", "size", "color"],
                          },
                        },
                      },
                      required: ["traits"],
                    },
                  },
                  required: ["trait_word_cloud"],
                },
              }
            : {}),
        },
        required: isPro
          ? ["summary", "common_traits", "visualization"]
          : ["summary", "common_traits"],
      },
      ...(isPro
        ? {
            ai_feedback_patterns: {
              type: "object",
              additionalProperties: false,
              properties: {
                summary: {
                  type: "string",
                  maxLength: 300,
                },
                common_themes: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      theme: { type: "string" },
                      frequency: { type: "integer", minimum: 0 },
                      example: { type: "string" },
                      insight: { type: "string" },
                    },
                    required: ["theme", "frequency", "example", "insight"],
                  },
                },
              },
              required: ["summary", "common_themes"],
            },
            vision_action_alignment: {
              type: "object",
              additionalProperties: false,
              properties: {
                summary: {
                  type: "string",
                  maxLength: 300,
                },
                alignment_score: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    value: { type: "number", minimum: 0, maximum: 100 },
                    description: { type: "string" },
                  },
                  required: ["value", "description"],
                },
                gaps: {
                  type: "array",
                  items: { type: "string" },
                },
                strengths: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: ["summary", "alignment_score", "gaps", "strengths"],
            },
            // 비전을 통해서 내가 바라보는 나의 모습 - 5가지 특성
            vision_self_characteristics: {
              type: "array",
              items: { type: "string" },
              minItems: 5,
              maxItems: 5,
              description:
                "비전을 통해서 내가 바라보는 나의 모습 - 5가지 특성 리스트",
            },
            // 역사적 위인 추천
            vision_historical_figure: {
              type: "object",
              additionalProperties: false,
              properties: {
                name: { type: "string" },
                reason: { type: "string", maxLength: 300 },
              },
              required: ["name", "reason"],
              description:
                "역사적 위인 중 나와 같은 성향 혹은 꿈을 가진 사람 1명 추천",
            },
          }
        : {}),
      next_week_vision_focus: {
        type: "object",
        additionalProperties: false,
        properties: {
          focus_areas: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                area: { type: "string" },
                reason: { type: "string" },
                suggested_action: { type: "string" },
              },
              required: ["area", "reason", "suggested_action"],
            },
            maxItems: isPro ? 5 : 3,
          },
          maintain_momentum: {
            type: "array",
            items: { type: "string" },
            maxItems: isPro ? 5 : 3,
          },
        },
        required: ["focus_areas", "maintain_momentum"],
      },
    },
    required: isPro
      ? [
          "vision_summary",
          "vision_keywords_trend",
          "goals_pattern",
          "dreamer_traits_evolution",
          "ai_feedback_patterns",
          "vision_action_alignment",
          "vision_self_characteristics",
          "vision_historical_figure",
          "next_week_vision_focus",
        ]
      : [
          "vision_summary",
          "vision_keywords_trend",
          "goals_pattern",
          "dreamer_traits_evolution",
          "next_week_vision_focus",
        ],
  };
}
