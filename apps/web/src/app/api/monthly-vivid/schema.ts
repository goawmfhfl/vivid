export const MonthlyReportSchema = {
  name: "MonthlyReportResponse",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      // 기본 정보
      month: { type: "string", pattern: "^\\d{4}-\\d{2}$" },
      month_label: { type: "string" },
      date_range: {
        type: "object",
        properties: {
          start_date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
          end_date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
        },
        required: ["start_date", "end_date"],
        additionalProperties: false,
      },
      total_days: { type: "integer", minimum: 0 },
      recorded_days: { type: "integer", minimum: 0 },
      title: {
        type: "string",
        description: "월간 비비드 제목 ('~ 한 달' 형식)",
      },

      // Monthly Report
      report: {
        type: "object",
        additionalProperties: false,
        properties: {
          // 1. 비전 진화 스토리 (30%)
          vision_evolution: {
            type: "object",
            additionalProperties: false,
            properties: {
              core_visions: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    vision: { type: "string" },
                    consistency: { type: "number", minimum: 0, maximum: 1 },
                    first_date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                    last_date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                    evolution_story: { type: "string" },
                  },
                  required: ["vision", "consistency", "first_date", "last_date", "evolution_story"],
                },
                minItems: 0,
              },
              priority_shifts: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    from: { type: "string" },
                    to: { type: "string" },
                    when: { type: "string" },
                    why: { type: "string" },
                  },
                  required: ["from", "to", "when", "why"],
                },
                minItems: 0,
              },
            },
            required: ["core_visions", "priority_shifts"],
          },
          // 2. 현재-미래 일치도 분석 (25%)
          alignment_analysis: {
            type: "object",
            additionalProperties: false,
            properties: {
              gap_analysis: {
                type: "object",
                additionalProperties: false,
                properties: {
                  biggest_gaps: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        current_state: { type: "string" },
                        desired_state: { type: "string" },
                        gap_description: { type: "string" },
                        actionable_steps: {
                          type: "array",
                          items: { type: "string" },
                        },
                      },
                      required: ["current_state", "desired_state", "gap_description", "actionable_steps"],
                    },
                    minItems: 0,
                  },
                },
                required: ["biggest_gaps"],
              },
            },
            required: ["gap_analysis"],
          },
          // 3. 하루 패턴 인사이트 (20%)
          daily_life_patterns: {
            type: "object",
            additionalProperties: false,
            properties: {
              recurring_patterns: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    pattern: { type: "string" },
                    frequency: { type: "integer", minimum: 0 },
                    days: {
                      type: "array",
                      items: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                          date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                          summary: { type: "string" },
                        },
                        required: ["date", "summary"],
                      },
                    },
                    impact: {
                      type: "string",
                      enum: ["positive", "neutral", "negative"],
                    },
                    why_it_matters: { type: "string" },
                  },
                  required: ["pattern", "frequency", "days", "impact", "why_it_matters"],
                },
                minItems: 0,
              },
              weekly_evolution: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    week: { type: "integer", minimum: 1 },
                    dominant_activities: {
                      type: "array",
                      items: { type: "string" },
                    },
                    dominant_keywords: {
                      type: "array",
                      items: { type: "string" },
                    },
                    narrative: { type: "string" },
                  },
                  required: ["week", "dominant_activities", "dominant_keywords", "narrative"],
                },
                minItems: 0,
              },
              evaluation_themes: {
                type: "object",
                additionalProperties: false,
                properties: {
                  strengths: {
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
                        how_to_maintain: { type: "string" },
                      },
                      required: ["theme", "frequency", "examples", "how_to_maintain"],
                    },
                    minItems: 0,
                  },
                  improvements: {
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
                        actionable_steps: {
                          type: "array",
                          items: { type: "string" },
                        },
                      },
                      required: ["theme", "frequency", "examples", "actionable_steps"],
                    },
                    minItems: 0,
                  },
                },
                required: ["strengths", "improvements"],
              },
            },
            required: ["recurring_patterns", "weekly_evolution", "evaluation_themes"],
          },
          // 4. 특성-비전 매칭 (15%)
          identity_alignment: {
            type: "object",
            additionalProperties: false,
            properties: {
              trait_mapping: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    current: { type: "string" },
                    aspired: { type: "string" },
                    match_score: { type: "number", minimum: 0, maximum: 1 },
                    gap_description: { type: "string" },
                    progress_evidence: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                  required: ["current", "aspired", "match_score", "gap_description", "progress_evidence"],
                },
                minItems: 0,
              },
              trait_evolution: {
                type: "object",
                additionalProperties: false,
                properties: {
                  strengthened: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        trait: { type: "string" },
                        early_month: { type: "string" },
                        late_month: { type: "string" },
                        evidence: {
                          type: "array",
                          items: { type: "string" },
                        },
                      },
                      required: ["trait", "early_month", "late_month", "evidence"],
                    },
                    minItems: 0,
                  },
                  emerging: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        trait: { type: "string" },
                        first_date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                        frequency: { type: "integer", minimum: 0 },
                      },
                      required: ["trait", "first_date", "frequency"],
                    },
                    minItems: 0,
                  },
                  fading: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        trait: { type: "string" },
                        last_appeared: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                        why: { type: "string" },
                      },
                      required: ["trait", "last_appeared", "why"],
                    },
                    minItems: 0,
                  },
                },
                required: ["strengthened", "emerging", "fading"],
              },
              focus_traits: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    trait: { type: "string" },
                    current_state: { type: "string" },
                    desired_state: { type: "string" },
                    monthly_action: { type: "string" },
                  },
                  required: ["trait", "current_state", "desired_state", "monthly_action"],
                },
                minItems: 0,
              },
            },
            required: ["trait_mapping", "trait_evolution", "focus_traits"],
          },
          // 5. 실행 가능한 다음 달 플랜 (10%)
          next_month_plan: {
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
                    why: { type: "string" },
                    current_state: { type: "string" },
                    desired_state: { type: "string" },
                  },
                  required: ["area", "why", "current_state", "desired_state"],
                },
                minItems: 0,
              },
              maintain_patterns: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    pattern: { type: "string" },
                    why_important: { type: "string" },
                    how_to_maintain: { type: "string" },
                  },
                  required: ["pattern", "why_important", "how_to_maintain"],
                },
                minItems: 0,
              },
              experiment_patterns: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    pattern: { type: "string" },
                    why_suggested: { type: "string" },
                    how_to_start: { type: "string" },
                  },
                  required: ["pattern", "why_suggested", "how_to_start"],
                },
                minItems: 0,
              },
            },
            required: ["focus_areas", "maintain_patterns", "experiment_patterns"],
          },
          // 6. 월간 흐름 (최근 4달간의 트렌드)
        },
        required: [
          "vision_evolution",
          "alignment_analysis",
          "daily_life_patterns",
          "identity_alignment",
          "next_month_plan",
        ],
      },
    },
    required: [
      "month",
      "month_label",
      "date_range",
      "total_days",
      "recorded_days",
      "title",
      "report",
    ],
  },
  strict: true,
} as const;

/**
 * Monthly Trend Data 스키마 (weekly와 동일 - 나를 설명하는 4가지 흐름)
 */
export const MonthlyTrendDataSchema = {
  name: "MonthlyTrendData",
  schema: {
    type: "object",
    properties: {
      direction: { type: "string" }, // 어떤 방향으로 가고 있는 사람인가
      core_value: { type: "string" }, // 내가 진짜 중요하게 여기는 가치
      driving_force: { type: "string" }, // 나를 움직이는 실제 원동력
      current_self: { type: "string" }, // 요즘의 나라는 사람
    },
    required: ["direction", "core_value", "driving_force", "current_self"],
    additionalProperties: false,
  },
  strict: true,
} as const;

export const SYSTEM_PROMPT_MONTHLY_TREND = `
당신은 사용자의 월간 비비드 리포트를 분석하여 월간 흐름 데이터를 생성합니다.

## 필드별 요구사항
- direction: 이번 달의 기록을 통해 드러난 사용자가 가고 있는 방향을 한 문장으로 작성합니다.
  예: "자기계발과 성장에 집중하는 방향으로 나아가고 있는 사람"
- core_value: 이번 달의 기록에서 가장 중요하게 여기는 가치를 한 문장으로 작성합니다.
  예: "균형 잡힌 삶과 지속 가능한 성장을 추구하는 가치"
- driving_force: 이번 달을 움직인 실제 원동력을 한 문장으로 작성합니다.
  예: "새로운 목표를 향한 호기심과 실행력"
- current_self: 요즘의 사용자를 한 문장으로 표현합니다.
  예: "변화를 두려워하지 않고 꾸준히 나아가는 사람"

각 필드는 간결하고 명확하게 작성하세요.
`;

export const SYSTEM_PROMPT_MONTHLY = `
당신은 사용자의 "월간 기록"을 분석해, 위에 정의된 MonthlyReportResponse 스키마에 맞는 JSON 리포트를 생성합니다.

입력으로는 다음과 같은 정보가 주어집니다 (예시 개념):

- target_month: "2025-11" 형식의 문자열

- date_range: 월의 시작일과 종료일

- daily_reports: DailyReportResponse 스키마를 따르는 일일 리포트 리스트

- categorized_records: (선택) 각 날짜별 RecordCategorization 결과 (insights, feedbacks, visualizings, emotions 배열)

당신의 역할은:

- 하루 단위로 흩어져 있는 데이터를 "한 달의 흐름"으로 다시 엮어주는 것

- 숫자(점수/분포)와 서사(텍스트)를 결합해 사용자가 스스로를 이해하기 쉽게 도와주는 것

## 월간 리포트 특화 규칙

- MonthlyReportSchema 스키마 키와 타입을 정확히 준수합니다.

- daily_reports, categorized_records에 실제로 없는 내용을 상상해서 만들지 않습니다. 

- "반복 패턴" 역시 실제 데이터에서 최소 2회 이상 등장한 경우만 "반복"으로 간주합니다.

--------------------------------

[2. 월간 리포트(report) 생성 규칙]
- report 스키마를 준수하세요.
- 실제 daily 데이터 기반으로만 작성하세요.
`;
