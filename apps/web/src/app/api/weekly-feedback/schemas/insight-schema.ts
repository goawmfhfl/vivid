/**
 * Insight Report 스키마
 * Pro/Free 분기 포함
 */
export function getInsightReportSchema(isPro: boolean) {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      core_insights: {
        type: "array",
        items: { type: "string" },
        minItems: 3,
        maxItems: isPro ? 7 : 5,
      },
      meta_questions_highlight: {
        type: "array",
        items: { type: "string" },
        minItems: 2,
        maxItems: isPro ? 7 : 5,
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
      },
      insight_patterns: {
        type: "object",
        additionalProperties: false,
        properties: {
          summary: {
            type: "string",
            maxLength: isPro ? 300 : 200,
          },
          insight_categories: {
            type: "object",
            additionalProperties: true,
            patternProperties: {
              "^.*$": {
                type: "object",
                additionalProperties: false,
                properties: {
                  count: { type: "integer", minimum: 0 },
                  examples: {
                    type: "array",
                    items: { type: "string" },
                  },
                  insight: { type: "string" },
                },
                required: ["count", "examples", "insight"],
              },
            },
          },
          ...(isPro
            ? {
                visualization: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    insight_categories_chart: {
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
                    insight_timeline: {
                      type: "array",
                      items: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                          date: { type: "string" },
                          insights_count: { type: "integer", minimum: 0 },
                          main_theme: { type: "string" },
                        },
                        required: ["date", "insights_count", "main_theme"],
                      },
                    },
                  },
                  required: ["insight_categories_chart", "insight_timeline"],
                },
                key_strengths_identified: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      strength: { type: "string" },
                      frequency: { type: "integer", minimum: 0 },
                      evidence: {
                        type: "array",
                        items: { type: "string" },
                      },
                      insight: { type: "string" },
                    },
                    required: ["strength", "frequency", "evidence", "insight"],
                  },
                },
              }
            : {}),
        },
        required: ["summary", "insight_categories"],
      },
      meta_questions_analysis: {
        type: "object",
        additionalProperties: false,
        properties: {
          summary: {
            type: "string",
            maxLength: isPro ? 300 : 200,
          },
          question_themes: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                theme: { type: "string" },
                example: { type: "string" },
                frequency: { type: "integer", minimum: 0 },
                insight: { type: "string" },
              },
              required: ["theme", "example", "frequency", "insight"],
            },
            maxItems: isPro ? 7 : 5,
          },
          ...(isPro
            ? {
                visualization: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    question_themes_chart: {
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
                              theme: { type: "string" },
                              count: { type: "integer" },
                            },
                            required: ["theme", "count"],
                          },
                        },
                      },
                      required: ["type", "data"],
                    },
                  },
                  required: ["question_themes_chart"],
                },
              }
            : {}),
        },
        required: ["summary", "question_themes"],
      },
      ai_comment_patterns: {
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
      action_patterns: {
        type: "object",
        additionalProperties: false,
        properties: {
          summary: {
            type: "string",
            maxLength: isPro ? 300 : 200,
          },
          difficulty_distribution: {
            type: "object",
            additionalProperties: false,
            properties: {
              낮음: {
                type: "object",
                additionalProperties: false,
                properties: {
                  count: { type: "integer", minimum: 0 },
                  percentage: { type: "number", minimum: 0, maximum: 100 },
                  examples: {
                    type: "array",
                    items: { type: "string" },
                  },
                  insight: { type: "string", nullable: true },
                },
                required: ["count", "percentage", "examples", "insight"],
              },
              보통: {
                type: "object",
                additionalProperties: false,
                properties: {
                  count: { type: "integer", minimum: 0 },
                  percentage: { type: "number", minimum: 0, maximum: 100 },
                  examples: {
                    type: "array",
                    items: { type: "string" },
                  },
                  insight: { type: "string", nullable: true },
                },
                required: ["count", "percentage", "examples", "insight"],
              },
              높음: {
                type: "object",
                additionalProperties: false,
                properties: {
                  count: { type: "integer", minimum: 0 },
                  percentage: { type: "number", minimum: 0, maximum: 100 },
                  examples: {
                    type: "array",
                    items: { type: "string" },
                  },
                  insight: { type: "string", nullable: true },
                },
                required: ["count", "percentage", "examples", "insight"],
              },
            },
            required: ["낮음", "보통", "높음"],
          },
          time_commitment: {
            type: "object",
            additionalProperties: false,
            properties: {
              average_minutes: { type: "number", minimum: 0 },
              range: { type: "string" },
              insight: { type: "string" },
            },
            required: ["average_minutes", "range", "insight"],
          },
          ...(isPro
            ? {
                visualization: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    difficulty_chart: {
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
                              difficulty: { type: "string" },
                              count: { type: "integer" },
                              color: { type: "string" },
                            },
                            required: ["difficulty", "count", "color"],
                          },
                        },
                      },
                      required: ["type", "data"],
                    },
                  },
                  required: ["difficulty_chart"],
                },
              }
            : {}),
        },
        required: ["summary", "difficulty_distribution", "time_commitment"],
      },
      insight_action_alignment: {
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
                insight: { type: "string" },
                action: { type: "string" },
                connection: { type: "string" },
              },
              required: ["insight", "action", "connection"],
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
      "core_insights",
      "meta_questions_highlight",
      "repeated_themes",
      "insight_patterns",
      "meta_questions_analysis",
      "ai_comment_patterns",
      "action_patterns",
      "insight_action_alignment",
      "growth_insights",
    ],
  };
}
