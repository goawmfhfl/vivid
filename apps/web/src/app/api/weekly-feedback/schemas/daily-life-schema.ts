/**
 * Daily Life Report 스키마
 * Pro/Free 분기 포함
 */
export function getDailyLifeReportSchema(isPro: boolean) {
  const visualizationSchema = isPro
    ? {
        visualization: {
          type: "object",
          additionalProperties: false,
          properties: {
            category_chart: {
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
            daily_triggers_timeline: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  date: { type: "string" },
                  weekday: { type: "string" },
                  triggers: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      self: { type: "number" },
                      work: { type: "number" },
                      people: { type: "number" },
                      environment: { type: "number" },
                    },
                    required: ["self", "work", "people", "environment"],
                  },
                },
                required: ["date", "weekday", "triggers"],
              },
            },
          },
          required: ["category_chart", "daily_triggers_timeline"],
        },
      }
    : {};

  return {
    type: "object",
    additionalProperties: false,
    properties: {
      summary: {
        type: "string",
        maxLength: isPro ? 300 : 150,
      },
      daily_summaries_trend: {
        type: "object",
        additionalProperties: false,
        properties: {
          overall_narrative: {
            type: "string",
            maxLength: isPro ? 500 : 300,
          },
          key_highlights: {
            type: "array",
            items: { type: "string" },
            maxItems: isPro ? 5 : 3,
          },
        },
        required: ["overall_narrative", "key_highlights"],
      },
      events_pattern: {
        type: "object",
        additionalProperties: false,
        properties: {
          most_frequent_events: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                event: { type: "string" },
                frequency: { type: "integer", minimum: 0 },
                days: {
                  type: "array",
                  items: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                },
                context: { type: "string" },
              },
              required: ["event", "frequency", "days", "context"],
            },
            maxItems: isPro ? 10 : 5,
          },
          event_categories: {
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
                },
                required: ["count", "examples"],
              },
            },
          },
          timing_patterns: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                time_range: { type: "string" },
                common_events: {
                  type: "array",
                  items: { type: "string" },
                },
                pattern_description: { type: "string" },
              },
              required: ["time_range", "common_events", "pattern_description"],
            },
            maxItems: isPro ? 5 : 3,
          },
        },
        required: ["most_frequent_events", "event_categories", "timing_patterns"],
      },
      emotion_triggers_analysis: {
        type: "object",
        additionalProperties: false,
        properties: {
          summary: {
            type: "string",
            maxLength: isPro ? 300 : 200,
          },
          category_distribution: {
            type: "object",
            additionalProperties: false,
            properties: {
              self: {
                type: "object",
                additionalProperties: false,
                properties: {
                  count: { type: "integer", minimum: 0 },
                  percentage: { type: "number", minimum: 0, maximum: 100 },
                  top_triggers: {
                    type: "array",
                    items: { type: "string" },
                  },
                  insight: { type: "string", nullable: true },
                },
                required: ["count", "percentage", "top_triggers", "insight"],
              },
              work: {
                type: "object",
                additionalProperties: false,
                properties: {
                  count: { type: "integer", minimum: 0 },
                  percentage: { type: "number", minimum: 0, maximum: 100 },
                  top_triggers: {
                    type: "array",
                    items: { type: "string" },
                  },
                  insight: { type: "string", nullable: true },
                },
                required: ["count", "percentage", "top_triggers", "insight"],
              },
              people: {
                type: "object",
                additionalProperties: false,
                properties: {
                  count: { type: "integer", minimum: 0 },
                  percentage: { type: "number", minimum: 0, maximum: 100 },
                  top_triggers: {
                    type: "array",
                    items: { type: "string" },
                  },
                  insight: { type: "string", nullable: true },
                },
                required: ["count", "percentage", "top_triggers", "insight"],
              },
              environment: {
                type: "object",
                additionalProperties: false,
                properties: {
                  count: { type: "integer", minimum: 0 },
                  percentage: { type: "number", minimum: 0, maximum: 100 },
                  top_triggers: {
                    type: "array",
                    items: { type: "string" },
                  },
                  insight: { type: "string", nullable: true },
                },
                required: ["count", "percentage", "top_triggers", "insight"],
              },
            },
            required: ["self", "work", "people", "environment"],
          },
          ...visualizationSchema,
        },
        required: ["summary", "category_distribution"],
      },
      behavioral_patterns: {
        type: "object",
        additionalProperties: false,
        properties: {
          summary: {
            type: "string",
            maxLength: isPro ? 300 : 200,
          },
          pattern_distribution: {
            type: "object",
            additionalProperties: false,
            properties: {
              planned: {
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
              impulsive: {
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
              routine_attempt: {
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
              avoidance: {
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
              routine_failure: {
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
            required: ["planned", "impulsive", "routine_attempt", "avoidance", "routine_failure"],
          },
          ...(isPro
            ? {
                visualization: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    behavior_chart: {
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
                              behavior: { type: "string" },
                              count: { type: "integer" },
                              percentage: { type: "number" },
                            },
                            required: ["behavior", "count", "percentage"],
                          },
                        },
                      },
                      required: ["type", "data"],
                    },
                  },
                  required: ["behavior_chart"],
                },
                behavior_emotion_correlation: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      behavior: { type: "string" },
                      associated_emotions: {
                        type: "array",
                        items: { type: "string" },
                      },
                      insight: { type: "string" },
                    },
                    required: ["behavior", "associated_emotions", "insight"],
                  },
                },
              }
            : {}),
        },
        required: ["summary", "pattern_distribution"],
      },
      keywords_analysis: {
        type: "object",
        additionalProperties: false,
        properties: {
          top_keywords: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                keyword: { type: "string" },
                frequency: { type: "integer", minimum: 0 },
                days: {
                  type: "array",
                  items: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                },
                context: { type: "string" },
                sentiment: {
                  type: "string",
                  enum: ["positive", "negative", "neutral"],
                },
              },
              required: ["keyword", "frequency", "days", "context", "sentiment"],
            },
            maxItems: isPro ? 15 : 10,
          },
          keyword_categories: {
            type: "object",
            additionalProperties: true,
            patternProperties: {
              "^.*$": {
                type: "object",
                additionalProperties: false,
                properties: {
                  keywords: {
                    type: "array",
                    items: { type: "string" },
                  },
                  count: { type: "integer", minimum: 0 },
                },
                required: ["keywords", "count"],
              },
            },
          },
          ...(isPro
            ? {
                visualization: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    word_cloud: {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        keywords: {
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
                      required: ["keywords"],
                    },
                    keyword_timeline: {
                      type: "array",
                      items: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                          date: { type: "string" },
                          keywords: {
                            type: "array",
                            items: { type: "string" },
                          },
                        },
                        required: ["date", "keywords"],
                      },
                    },
                  },
                  required: ["word_cloud", "keyword_timeline"],
                },
              }
            : {}),
        },
        required: ["top_keywords", "keyword_categories"],
      },
      ai_comments_insights: {
        type: "object",
        additionalProperties: false,
        properties: {
          common_themes: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                theme: { type: "string" },
                frequency: { type: "integer", minimum: 0 },
                examples: {
                  type: "array",
                  items: { type: "string" },
                },
                insight: { type: "string" },
              },
              required: ["theme", "frequency", "examples", "insight"],
            },
            maxItems: isPro ? 7 : 5,
          },
          actionable_advice_summary: {
            type: "string",
            maxLength: isPro ? 400 : 200,
          },
          ...(isPro
            ? {
                visualization: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    advice_categories: {
                      type: "array",
                      items: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                          category: { type: "string" },
                          count: { type: "integer" },
                          examples: {
                            type: "array",
                            items: { type: "string" },
                          },
                        },
                        required: ["category", "count", "examples"],
                      },
                    },
                  },
                  required: ["advice_categories"],
                },
              }
            : {}),
        },
        required: ["common_themes", "actionable_advice_summary"],
      },
      daily_rhythm: {
        type: "object",
        additionalProperties: false,
        properties: {
          summary: {
            type: "string",
            maxLength: isPro ? 300 : 200,
          },
          time_patterns: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                time_period: { type: "string" },
                common_activities: {
                  type: "array",
                  items: { type: "string" },
                },
                typical_emotions: {
                  type: "array",
                  items: { type: "string" },
                },
                pattern_description: { type: "string" },
              },
              required: ["time_period", "common_activities", "typical_emotions", "pattern_description"],
            },
            maxItems: isPro ? 5 : 3,
          },
          ...(isPro
            ? {
                visualization: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    daily_flow_chart: {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        type: { type: "string", enum: ["timeline"] },
                        data: {
                          type: "array",
                          items: {
                            type: "object",
                            additionalProperties: false,
                            properties: {
                              time: { type: "string" },
                              activity: { type: "string" },
                              intensity: {
                                type: "string",
                                enum: ["low", "medium", "high"],
                              },
                            },
                            required: ["time", "activity", "intensity"],
                          },
                        },
                      },
                      required: ["type", "data"],
                    },
                  },
                  required: ["daily_flow_chart"],
                },
              }
            : {}),
        },
        required: ["summary", "time_patterns"],
      },
      growth_insights: {
        type: "object",
        additionalProperties: false,
        properties: {
          resilience_patterns: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                pattern: { type: "string" },
                evidence: {
                  type: "array",
                  items: { type: "string" },
                },
                insight: { type: "string" },
              },
              required: ["pattern", "evidence", "insight"],
            },
            maxItems: isPro ? 5 : 3,
          },
          improvement_opportunities: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                area: { type: "string" },
                suggestion: { type: "string" },
                priority: {
                  type: "string",
                  enum: ["low", "medium", "high"],
                },
              },
              required: ["area", "suggestion", "priority"],
            },
            maxItems: isPro ? 5 : 3,
          },
          strengths_highlighted: {
            type: "array",
            items: { type: "string" },
            maxItems: isPro ? 5 : 3,
          },
        },
        required: ["resilience_patterns", "improvement_opportunities", "strengths_highlighted"],
      },
      next_week_suggestions: {
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
                suggested_actions: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: ["area", "reason", "suggested_actions"],
            },
            maxItems: isPro ? 5 : 3,
          },
          maintain_strengths: {
            type: "array",
            items: { type: "string" },
            maxItems: isPro ? 5 : 3,
          },
        },
        required: ["focus_areas", "maintain_strengths"],
      },
    },
    required: [
      "summary",
      "daily_summaries_trend",
      "events_pattern",
      "emotion_triggers_analysis",
      "behavioral_patterns",
      "keywords_analysis",
      "ai_comments_insights",
      "daily_rhythm",
      "growth_insights",
      "next_week_suggestions",
    ],
  };
}

