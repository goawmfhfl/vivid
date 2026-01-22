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
                      items: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
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
 * Monthly Trend Data 스키마 (별도 컬럼)
 */
export const MonthlyTrendDataSchema = {
  name: "MonthlyTrendData",
  schema: {
    type: "object",
    properties: {
      breakdown_moments: { type: "string" }, // 나는 어떤 순간에서 가장 무너지는가
      recovery_moments: { type: "string" }, // 나는 어떤 순간에서 가장 회복되는가
      energy_sources: { type: "string" }, // 내가 실제로 에너지를 얻는 방향
      missing_future_elements: { type: "string" }, // 내가 미래를 그릴 때 빠뜨리는 요소
      top_keywords: { type: "string" }, // 이 달에서 가장 자주 등장하는 키워드 5가지
    },
    required: ["breakdown_moments", "recovery_moments", "energy_sources", "missing_future_elements", "top_keywords"],
    additionalProperties: false,
  },
  strict: true,
} as const;

export const SYSTEM_PROMPT_MONTHLY_TREND = `
당신은 사용자의 월간 비비드 리포트를 분석하여 월간 흐름 데이터를 생성합니다.

📝 출력 형식 규칙:
- 반드시 JSON 형식 하나만 출력해주세요.
- 아래 스키마의 모든 키와 타입을 정확하게 지켜주세요.
- 모든 필드를 반드시 포함해주세요.

## 필드별 요구사항
각 필드는 이번 달의 데이터를 분석하여 1줄의 자연스러운 인사이트로 작성합니다.

- breakdown_moments: 나는 어떤 순간에서 가장 무너지는가
  예: "유튜브 업로드·결제 시스템·사람 모으기 때문에 조급함과 부담을 느끼기도 하면서 인간관계 기대/열등감/인정 욕구가 무너지는 요인이에요"

- recovery_moments: 나는 어떤 순간에서 가장 회복되는가
  예: "컨디션을 지키면서도 꾸준히 지속 가능한 실행과 삶-일 균형을 추구하는 가치가 있음"

- energy_sources: 내가 실제로 에너지를 얻는 방향
  예: "새로운 기술을 학습하거나 프로젝트에 몰입할 때 에너지가 상승하고 성취감을 느낌"

- missing_future_elements: 내가 미래를 그릴 때 빠뜨리는 요소
  예: "완벽보다 시작을 택하되 진정성·정직한 메시지와 관계·휴식의 균형으로 꾸준함을 지키는 가치를 가장 중요하게 여깁니다"

- top_keywords: 이 달에서 가장 자주 등장하는 키워드 5가지
  예: "기록, 성장, 루틴, 운동, 독서가 이번 달에 가장 자주 등장한 키워드였어요"

## 작성 스타일
- "~패턴이 반복됨", "~데이터가 확인됨" 같은 기계적인 표현을 사용하지 마세요.
- 실제 데이터를 바탕으로 자연스럽고 인간적인 말투로 작성하세요.
- 구체적인 상황, 감정, 가치, 행동을 자연스럽게 연결하여 작성하세요.
- 각 필드는 1줄로 간결하게 작성하세요.
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
