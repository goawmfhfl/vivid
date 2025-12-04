/**
 * Execution Report (Feedback) 스키마
 * Pro/Free 분기 포함
 */
export function getExecutionReportSchema(isPro: boolean) {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      positives_top3: {
        type: "array",
        items: { type: "string" },
        minItems: 3,
        maxItems: 3,
      },
      improvements_top3: {
        type: "array",
        items: { type: "string" },
        minItems: 3,
        maxItems: 3,
      },
      ai_feedback_summary: {
        type: "string",
        maxLength: isPro ? 500 : 300,
      },
      feedback_patterns: {
        type: "object",
        additionalProperties: false,
        properties: {
          summary: {
            type: "string",
            maxLength: isPro ? 300 : 200,
          },
          positives_categories: {
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
          improvements_categories: {
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
                    positives_categories_chart: {
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
                    improvements_categories_chart: {
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
                              category: { type: "string" },
                              count: { type: "integer" },
                              color: { type: "string" },
                            },
                            required: ["category", "count", "color"],
                          },
                        },
                      },
                      required: ["type", "data"],
                    },
                  },
                  required: [
                    "positives_categories_chart",
                    "improvements_categories_chart",
                  ],
                },
              }
            : {}),
        },
        required: isPro
          ? [
              "summary",
              "positives_categories",
              "improvements_categories",
              "visualization",
            ]
          : ["summary", "positives_categories", "improvements_categories"],
      },
      person_traits_analysis: {
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
                frequency: { type: "integer", minimum: 0 },
                evidence: {
                  type: "array",
                  items: { type: "string" },
                },
                insight: { type: "string" },
              },
              required: ["trait", "frequency", "evidence", "insight"],
            },
            maxItems: isPro ? 10 : 5,
          },
          ...(isPro
            ? {
                visualization: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    traits_word_cloud: {
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
                  required: ["traits_word_cloud"],
                },
              }
            : {}),
        },
        required: isPro
          ? ["summary", "key_traits", "visualization"]
          : ["summary", "key_traits"],
      },
      core_feedback_themes: {
        type: "object",
        additionalProperties: false,
        properties: {
          summary: {
            type: "string",
            maxLength: isPro ? 300 : 200,
          },
          main_themes: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                theme: { type: "string" },
                frequency: { type: "integer", minimum: 0 },
                evidence: {
                  type: "array",
                  items: { type: "string" },
                },
                insight: { type: "string" },
              },
              required: ["theme", "frequency", "evidence", "insight"],
            },
            maxItems: isPro ? 7 : 5,
          },
          ...(isPro
            ? {
                visualization: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    themes_timeline: {
                      type: "array",
                      items: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                          date: { type: "string" },
                          themes: {
                            type: "array",
                            items: { type: "string" },
                          },
                        },
                        required: ["date", "themes"],
                      },
                    },
                  },
                  required: ["themes_timeline"],
                },
              }
            : {}),
        },
        required: isPro
          ? ["summary", "main_themes", "visualization"]
          : ["summary", "main_themes"],
      },
      ai_message_patterns: {
        type: "object",
        additionalProperties: false,
        properties: {
          summary: {
            type: "string",
            maxLength: isPro ? 300 : 200,
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
            maxItems: isPro ? 7 : 5,
          },
        },
        required: ["summary", "common_themes"],
      },
      improvement_action_alignment: {
        type: "object",
        additionalProperties: false,
        properties: {
          summary: {
            type: "string",
            maxLength: isPro ? 300 : 200,
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
          strong_connections: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                feedback_theme: { type: "string" },
                improvement: { type: "string" },
                connection: { type: "string" },
              },
              required: ["feedback_theme", "improvement", "connection"],
            },
            maxItems: isPro ? 7 : 5,
          },
        },
        required: ["summary", "alignment_score", "strong_connections"],
      },
      growth_insights: {
        type: "object",
        additionalProperties: false,
        properties: {
          key_learnings: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                learning: { type: "string" },
                evidence: { type: "string" },
                implication: { type: "string" },
              },
              required: ["learning", "evidence", "implication"],
            },
            maxItems: isPro ? 5 : 3,
          },
          next_week_focus: {
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
        },
        required: ["key_learnings", "next_week_focus"],
      },
    },
    required: [
      "positives_top3",
      "improvements_top3",
      "ai_feedback_summary",
      "feedback_patterns",
      "person_traits_analysis",
      "core_feedback_themes",
      "ai_message_patterns",
      "improvement_action_alignment",
      "growth_insights",
    ],
  };
}
