/**
 * Closing Report 스키마
 * Pro/Free 분기 포함
 */
export function getClosingReportSchema(isPro: boolean) {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      call_to_action: {
        type: "object",
        additionalProperties: false,
        properties: {
          weekly_one_liner: {
            type: "string",
            maxLength: isPro ? 200 : 150,
          },
          next_week_objective: {
            type: "string",
            maxLength: isPro ? 300 : 200,
          },
          actions: {
            type: "array",
            items: { type: "string" },
            minItems: 3,
            maxItems: 5,
          },
        },
        required: ["weekly_one_liner", "next_week_objective", "actions"],
      },
      this_week_identity: {
        type: "object",
        additionalProperties: false,
        properties: {
          summary: {
            type: "string",
            maxLength: isPro ? 300 : 200,
          },
          core_characteristics: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                characteristic: { type: "string" },
                description: {
                  type: "string",
                  maxLength: isPro ? 300 : 200,
                },
                evidence: {
                  type: "array",
                  items: { type: "string" },
                },
                frequency: { type: "integer", minimum: 0 },
              },
              required: [
                "characteristic",
                "description",
                "evidence",
                "frequency",
              ],
            },
            maxItems: isPro ? 7 : 5,
          },
          growth_story: {
            type: "object",
            additionalProperties: false,
            properties: {
              summary: {
                type: "string",
                maxLength: isPro ? 200 : 150,
              },
              narrative: {
                type: "string",
                maxLength: isPro ? 800 : 400,
              },
            },
            required: ["summary", "narrative"],
          },
          strengths_highlighted: {
            type: "object",
            additionalProperties: false,
            properties: {
              summary: {
                type: "string",
                maxLength: isPro ? 200 : 150,
              },
              top_strengths: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    strength: { type: "string" },
                    description: {
                      type: "string",
                      maxLength: isPro ? 300 : 200,
                    },
                    impact: {
                      type: "string",
                      maxLength: isPro ? 300 : 200,
                    },
                  },
                  required: ["strength", "description", "impact"],
                },
                maxItems: isPro ? 5 : 3,
              },
            },
            required: ["summary", "top_strengths"],
          },
          areas_of_awareness: {
            type: "object",
            additionalProperties: false,
            properties: {
              summary: {
                type: "string",
                maxLength: isPro ? 200 : 150,
              },
              key_areas: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    area: { type: "string" },
                    description: {
                      type: "string",
                      maxLength: isPro ? 300 : 200,
                    },
                    action_taken: {
                      type: "string",
                      maxLength: isPro ? 300 : 200,
                    },
                  },
                  required: ["area", "description", "action_taken"],
                },
                maxItems: isPro ? 5 : 3,
              },
            },
            required: ["summary", "key_areas"],
          },
          identity_evolution: {
            type: "object",
            additionalProperties: false,
            properties: {
              summary: {
                type: "string",
                maxLength: isPro ? 200 : 150,
              },
              evolution: {
                type: "string",
                maxLength: isPro ? 500 : 300,
              },
            },
            required: ["summary", "evolution"],
          },
          ...(isPro
            ? {
                visualization: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    characteristics_radar: {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        type: { type: "string", enum: ["radar"] },
                        data: {
                          type: "array",
                          items: {
                            type: "object",
                            additionalProperties: false,
                            properties: {
                              characteristic: { type: "string" },
                              value: {
                                type: "number",
                                minimum: 0,
                                maximum: 10,
                              },
                            },
                            required: ["characteristic", "value"],
                          },
                        },
                      },
                      required: ["type", "data"],
                    },
                    growth_journey: {
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
                              phase: { type: "string" },
                              description: { type: "string" },
                              response: { type: "string" },
                            },
                            required: ["phase", "description", "response"],
                          },
                        },
                      },
                      required: ["type", "data"],
                    },
                  },
                  required: ["characteristics_radar", "growth_journey"],
                },
              }
            : {}),
        },
        required: [
          "summary",
          "core_characteristics",
          "growth_story",
          "strengths_highlighted",
          "areas_of_awareness",
          "identity_evolution",
        ],
      },
      next_week_identity_intention: {
        type: "object",
        additionalProperties: false,
        properties: {
          summary: {
            type: "string",
            maxLength: isPro ? 300 : 200,
          },
          intention: {
            type: "string",
            maxLength: isPro ? 500 : 300,
          },
          focus_areas: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                area: { type: "string" },
                reason: { type: "string" },
                identity_shift: { type: "string" },
              },
              required: ["area", "reason", "identity_shift"],
            },
            maxItems: isPro ? 5 : 3,
          },
        },
        required: ["summary", "intention", "focus_areas"],
      },
    },
    required: [
      "call_to_action",
      "this_week_identity",
      "next_week_identity_intention",
    ],
  };
}
