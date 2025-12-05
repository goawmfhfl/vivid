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
        maxItems: isPro ? 10 : 7,
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
      self_vision_alignment: {
        type: "object",
        additionalProperties: false,
        properties: {
          summary: {
            type: "string",
            maxLength: isPro ? 300 : 200,
          },
          key_traits: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                trait: { type: "string" },
                evidence: { type: "string" },
                frequency: { type: "integer", minimum: 0 },
              },
              required: ["trait", "evidence", "frequency"],
            },
            maxItems: isPro ? 10 : 5,
          },
          ...(isPro
            ? {
                visualization: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    trait_frequency: {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        type: { type: "string", enum: ["bar"] },
                        data: {
                          type: "array",
                          items: {
                            type: "object",
                            additionalProperties: false,
                            properties: {
                              trait: { type: "string" },
                              count: { type: "integer" },
                            },
                            required: ["trait", "count"],
                          },
                        },
                      },
                      required: ["type", "data"],
                    },
                  },
                  required: ["trait_frequency"],
                },
              }
            : {}),
        },
        required: isPro
          ? ["summary", "key_traits", "visualization"]
          : ["summary", "key_traits"],
      },
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
          "self_vision_alignment",
          "dreamer_traits_evolution",
          "ai_feedback_patterns",
          "vision_action_alignment",
          "next_week_vision_focus",
        ]
      : [
          "vision_summary",
          "vision_keywords_trend",
          "goals_pattern",
          "self_vision_alignment",
          "dreamer_traits_evolution",
          "next_week_vision_focus",
        ],
  };
}
