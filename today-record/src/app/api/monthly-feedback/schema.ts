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
      record_coverage_rate: { type: "number", minimum: 0, maximum: 1 },
      integrity_average: { type: "number", minimum: 0, maximum: 10 },

      // 1. 월간 요약 섹션
      summary_overview: {
        type: "object",
        additionalProperties: false,
        properties: {
          monthly_score: { type: "integer", minimum: 0, maximum: 100 },
          summary_title: { type: "string" },
          summary_description: { type: "string" },
          main_themes: {
            type: "array",
            items: { type: "string" },
            minItems: 0,
            maxItems: 7,
          },
          main_themes_reason: {
            type: "string",
            description: "주요 테마를 7개 이하로 정한 이유 설명",
          },
          integrity_trend: {
            type: "string",
            nullable: true,
            enum: ["상승", "하락", "유지", "불규칙", null],
          },
          life_balance_score: { type: "integer", minimum: 0, maximum: 10 },
          life_balance_reason: {
            type: "string",
            description: "생활 밸런스 점수가 나온 이유 (데이터 출처 기반)",
          },
          life_balance_feedback: {
            type: "string",
            description: "생활 밸런스에 대한 피드백",
          },
          execution_score: { type: "integer", minimum: 0, maximum: 10 },
          execution_reason: {
            type: "string",
            description: "실행력 점수가 나온 이유 (데이터 출처 기반)",
          },
          execution_feedback: {
            type: "string",
            description: "실행력에 대한 피드백",
          },
          rest_score: { type: "integer", minimum: 0, maximum: 10 },
          rest_reason: {
            type: "string",
            description: "휴식/회복 점수가 나온 이유 (데이터 출처 기반)",
          },
          rest_feedback: {
            type: "string",
            description: "휴식/회복에 대한 피드백",
          },
          relationship_score: { type: "integer", minimum: 0, maximum: 10 },
          relationship_reason: {
            type: "string",
            description: "관계/소통 점수가 나온 이유 (데이터 출처 기반)",
          },
          relationship_feedback: {
            type: "string",
            description: "관계/소통에 대한 피드백",
          },
          summary_ai_comment: { type: "string", nullable: true },
        },
        required: [
          "monthly_score",
          "summary_title",
          "summary_description",
          "main_themes",
          "main_themes_reason",
          "integrity_trend",
          "life_balance_score",
          "life_balance_reason",
          "life_balance_feedback",
          "execution_score",
          "execution_reason",
          "execution_feedback",
          "rest_score",
          "rest_reason",
          "rest_feedback",
          "relationship_score",
          "relationship_reason",
          "relationship_feedback",
          "summary_ai_comment",
        ],
      },

      // 2. 감정 섹션
      emotion_overview: {
        type: "object",
        additionalProperties: false,
        properties: {
          monthly_ai_mood_valence_avg: { type: "number", nullable: true },
          monthly_ai_mood_arousal_avg: { type: "number", nullable: true },
          emotion_quadrant_dominant: {
            type: "string",
            nullable: true,
            enum: ["몰입·설렘", "불안·초조", "슬픔·무기력", "안도·평온", null],
          },
          emotion_quadrant_distribution: {
            type: "array",
            minItems: 4,
            maxItems: 4,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                quadrant: {
                  type: "string",
                  enum: ["몰입·설렘", "불안·초조", "슬픔·무기력", "안도·평온"],
                },
                count: { type: "integer", minimum: 0 },
                ratio: { type: "number", minimum: 0, maximum: 1 },
                explanation: {
                  type: "string",
                  description:
                    "해당 사분면이 이 비율을 차지하는 이유에 대한 월간 데이터 분석 기반 설명",
                },
              },
              required: ["quadrant", "count", "ratio", "explanation"],
            },
          },
          emotion_quadrant_analysis_summary: {
            type: "string",
            description: "4개 사분면 분포를 종합적으로 분석한 피드백",
          },
          emotion_pattern_summary: { type: "string", nullable: true },
          positive_triggers: {
            type: "array",
            items: { type: "string" },
            minItems: 0,
            maxItems: 10,
          },
          negative_triggers: {
            type: "array",
            items: { type: "string" },
            minItems: 0,
            maxItems: 10,
          },
          emotion_stability_score: { type: "integer", minimum: 0, maximum: 10 },
          emotion_stability_explanation: {
            type: "string",
            description: "감정 안정성 점수가 의미하는 바에 대한 설명",
          },
          emotion_stability_score_reason: {
            type: "string",
            description: "왜 그 점수인지 월간 데이터 분석 기반 설명",
          },
          emotion_stability_praise: {
            type: "string",
            nullable: true,
            description:
              "점수가 7점 이상인 경우 칭찬 메시지 (7점 미만이면 null)",
          },
          emotion_stability_guidelines: {
            type: "array",
            items: { type: "string" },
            minItems: 0,
            maxItems: 5,
            description:
              "감정 안정성 점수를 더 높이기 위한 구체적인 가이드라인",
          },
          emotion_stability_actions: {
            type: "array",
            items: { type: "string" },
            minItems: 0,
            maxItems: 5,
            description:
              "감정 안정성 점수를 높이기 위한 구체적인 행동 제안 (하위 호환성)",
          },
          emotion_ai_comment: { type: "string", nullable: true },
        },
        required: [
          "monthly_ai_mood_valence_avg",
          "monthly_ai_mood_arousal_avg",
          "emotion_quadrant_dominant",
          "emotion_quadrant_distribution",
          "emotion_quadrant_analysis_summary",
          "emotion_pattern_summary",
          "positive_triggers",
          "negative_triggers",
          "emotion_stability_score",
          "emotion_stability_explanation",
          "emotion_stability_score_reason",
          "emotion_stability_praise",
          "emotion_stability_guidelines",
          "emotion_stability_actions",
          "emotion_ai_comment",
        ],
      },

      // 4. 인사이트 섹션
      insight_overview: {
        type: "object",
        additionalProperties: false,
        properties: {
          insight_days_count: { type: "integer", minimum: 0 },
          insight_records_count: { type: "integer", minimum: 0 },
          top_insights: {
            type: "array",
            minItems: 0,
            maxItems: 20,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                summary: { type: "string" },
                first_date: {
                  type: "string",
                  pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                  nullable: true,
                },
                last_date: {
                  type: "string",
                  pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                  nullable: true,
                },
                frequency: { type: "integer", minimum: 0 },
              },
              required: ["summary", "first_date", "last_date", "frequency"],
            },
          },
          core_insights: {
            type: "array",
            minItems: 0,
            maxItems: 3,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                summary: { type: "string" },
                explanation: {
                  type: "string",
                  description: "이 인사이트가 핵심인 이유 설명",
                },
              },
              required: ["summary", "explanation"],
            },
            description: "이번 달의 핵심 인사이트 최대 3개",
          },
          insight_ai_comment: { type: "string", nullable: true },
          insight_comprehensive_summary: {
            type: "string",
            nullable: true,
            description: "모든 인사이트를 종합한 종합적인 인사이트 분석",
          },
        },
        required: [
          "insight_days_count",
          "insight_records_count",
          "top_insights",
          "core_insights",
          "insight_ai_comment",
          "insight_comprehensive_summary",
        ],
      },

      // 5. 피드백 섹션
      feedback_overview: {
        type: "object",
        additionalProperties: false,
        properties: {
          feedback_days_count: { type: "integer", minimum: 0 },
          feedback_records_count: { type: "integer", minimum: 0 },
          recurring_positives: {
            type: "array",
            items: { type: "string" },
            minItems: 0,
            maxItems: 10,
          },
          recurring_improvements: {
            type: "array",
            items: { type: "string" },
            minItems: 0,
            maxItems: 10,
          },
          habit_scores: {
            type: "object",
            additionalProperties: false,
            properties: {
              health: { type: "integer", minimum: 0, maximum: 10 },
              health_reason: {
                type: "string",
                description:
                  "건강 점수가 나온 이유를 월간 데이터 분석 기반으로 구체적으로 설명",
              },
              work: { type: "integer", minimum: 0, maximum: 10 },
              work_reason: {
                type: "string",
                description:
                  "일/학습 점수가 나온 이유를 월간 데이터 분석 기반으로 구체적으로 설명",
              },
              relationship: { type: "integer", minimum: 0, maximum: 10 },
              relationship_reason: {
                type: "string",
                description:
                  "관계 점수가 나온 이유를 월간 데이터 분석 기반으로 구체적으로 설명",
              },
              self_care: { type: "integer", minimum: 0, maximum: 10 },
              self_care_reason: {
                type: "string",
                description:
                  "자기 돌봄 점수가 나온 이유를 월간 데이터 분석 기반으로 구체적으로 설명",
              },
            },
            required: [
              "health",
              "health_reason",
              "work",
              "work_reason",
              "relationship",
              "relationship_reason",
              "self_care",
              "self_care_reason",
            ],
          },
          core_feedbacks: {
            type: "array",
            minItems: 0,
            maxItems: 5,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                summary: { type: "string" },
                frequency: { type: "integer", minimum: 1 },
              },
              required: ["summary", "frequency"],
            },
            description:
              "이번 달의 핵심 피드백 최대 5개 (가장 중요하고 반복적으로 등장한 피드백)",
          },
          recurring_improvements_with_frequency: {
            type: "array",
            minItems: 0,
            maxItems: 10,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                summary: { type: "string" },
                frequency: { type: "integer", minimum: 1 },
              },
              required: ["summary", "frequency"],
            },
            description:
              "반복된 개선점과 각각의 등장 횟수 (최소 2회 이상 등장한 것만 포함)",
          },
          core_feedback_for_month: { type: "string" },
          feedback_ai_comment: { type: "string", nullable: true },
        },
        required: [
          "feedback_days_count",
          "feedback_records_count",
          "recurring_positives",
          "recurring_improvements",
          "habit_scores",
          "core_feedbacks",
          "recurring_improvements_with_frequency",
          "core_feedback_for_month",
          "feedback_ai_comment",
        ],
      },

      // 6. 시각화(비전) 섹션
      vision_overview: {
        type: "object",
        additionalProperties: false,
        properties: {
          vision_days_count: { type: "integer", minimum: 0 },
          vision_records_count: { type: "integer", minimum: 0 },
          vision_consistency_score: {
            type: "integer",
            minimum: 0,
            maximum: 10,
          },
          main_visions: {
            type: "array",
            minItems: 0,
            maxItems: 10,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                summary: { type: "string" },
                frequency: { type: "integer", minimum: 0 },
              },
              required: ["summary", "frequency"],
            },
          },
          core_visions: {
            type: "array",
            minItems: 0,
            maxItems: 7,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                summary: { type: "string" },
                frequency: { type: "integer", minimum: 1 },
              },
              required: ["summary", "frequency"],
            },
            description:
              "이번 달의 핵심 비전 최대 7개 (가장 중요하고 반복적으로 등장한 비전)",
          },
          vision_progress_comment: { type: "string", nullable: true },
          vision_ai_feedbacks: {
            type: "array",
            minItems: 0,
            maxItems: 5,
            items: { type: "string" },
            description:
              "AI가 제공하는 비전 관련 피드백 리스트 (최대 5개, 각각 실행 가능한 구체적인 피드백)",
          },
        },
        required: [
          "vision_days_count",
          "vision_records_count",
          "vision_consistency_score",
          "main_visions",
          "core_visions",
          "vision_progress_comment",
          "vision_ai_feedbacks",
        ],
      },

      // 7. 마무리 섹션
      conclusion_overview: {
        type: "object",
        additionalProperties: false,
        properties: {
          monthly_title: { type: "string" },
          monthly_summary: { type: "string" },
          turning_points: {
            type: "array",
            items: { type: "string" },
            minItems: 0,
            maxItems: 5,
          },
          next_month_focus: { type: "string" },
          ai_encouragement_message: { type: "string" },
        },
        required: [
          "monthly_title",
          "monthly_summary",
          "turning_points",
          "next_month_focus",
          "ai_encouragement_message",
        ],
      },
    },
    required: [
      "month",
      "month_label",
      "date_range",
      "total_days",
      "recorded_days",
      "record_coverage_rate",
      "integrity_average",
      "summary_overview",
      "emotion_overview",
      "insight_overview",
      "feedback_overview",
      "vision_overview",
      "conclusion_overview",
    ],
  },
  strict: true,
} as const;

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

규칙(공통):

- 오직 JSON 하나만 출력합니다. 설명/마크다운/코드블록 금지.

- MonthlyReportSchema 스키마 키와 타입을 정확히 준수합니다.

- 모든 키를 반드시 포함하세요. 값이 없으면 null, ""(빈 문자열), [] 또는 0 등으로 채웁니다.

- 텍스트는 누구나 이해할 수 있을 만큼 쉽고 친절하게 작성합니다.

- daily_reports, categorized_records에 실제로 없는 내용을 상상해서 만들지 않습니다. 

  "반복 패턴" 역시 실제 데이터에서 최소 2회 이상 등장한 경우만 "반복"으로 간주합니다.

--------------------------------

[1. 기본 정보 처리]

1) month, month_label, date_range

- 프롬프트에서 제공된 target_month와 date_range를 그대로 사용합니다.

- month_label은 "YYYY년 MM월" 형식으로 자연스럽게 만듭니다.

2) total_days, recorded_days, record_coverage_rate

- total_days: date_range 에 포함된 일수(예: 30).

- recorded_days: daily_reports 의 개수.

- record_coverage_rate = recorded_days / total_days (소수 둘째 자리까지 반올림, 예: 0.73).

3) integrity_average

- daily_reports.integrity_score 의 평균값을 계산합니다.

- 소수 둘째 자리까지 반올림합니다.

--------------------------------

[2. summary_overview (월간 요약)]

- monthly_score:

  - 이 달을 0~100 점으로 평가합니다.

  - 기준 예시:

    - 기록 커버리지, integrity_average, 감정 안정성, 실행력 등을 종합적으로 반영

    - 매우 힘들었지만 꾸준히 버틴 달은 점수가 높을 수 있습니다. "성공"이 아니라 "정직하게 살아낸 정도"를 점수로 표현합니다.

- summary_title:

  - 한 문장으로 이 달을 한 줄 제목으로 요약합니다.

  - 예: "버티면서 전진한 한 달", "감정은 요동쳤지만 끝까지 포기하지 않은 한 달"

- summary_description:

  - 공백 포함 400자 이내로, 이 달에 있었던 주요 흐름을 서사적으로 정리합니다.

  - "처음에는 ~, 중반에는 ~, 마지막에는 ~" 처럼 자연스러운 이야기 구조를 사용합니다.

- main_themes:

  - 이 달의 키워드를 최대 7개까지 뽑습니다.

  - 예: ["기록", "정체감", "직업 고민", "체력 관리", "관계 정리"]

  - 반드시 7개 이하로 제한하고, 가장 중요하고 반복적으로 등장한 키워드만 선별합니다.

- main_themes_reason:

  - main_themes를 7개 이하로 정한 이유를 명확하게 설명합니다.

  - 예: "이번 달에는 '기록', '개발', '운동'이 가장 자주 등장했고, 이 세 가지가 전체 패턴을 대표합니다. 나머지 키워드들은 이 세 가지의 하위 주제로 볼 수 있어 7개로 제한했습니다."

- integrity_trend:

  - 일별 integrity_score 흐름을 기준으로,

    - 전체적으로 상승 → "상승"

    - 전체적으로 하락 → "하락"

    - 큰 변동 없이 비슷 → "유지"

    - 오르락내리락 심함 → "불규칙"

  - daily_reports가 거의 없다면 null로 처리합니다.

- life_balance_score, execution_score, rest_score, relationship_score:

  - 각 0~10 점으로, daily_reports 서사와 meta_overview 내용을 참고해 정성적으로 평가합니다.

  - 각 점수에 대해 반드시 다음 두 가지를 제공해야 합니다:

    1) {score}_reason: 점수가 나온 구체적인 이유를 데이터 출처를 명시하여 설명합니다.

       - 예: "생활 밸런스 점수 7점은 이번 달 일일 기록에서 운동(주 3회), 수면(평균 7시간), 업무 시간(일 8시간)이 비교적 균형 있게 유지되었기 때문입니다. 특히 주말에는 휴식과 회복 시간을 확보한 날이 8일로 확인되었습니다."

    2) {score}_feedback: 해당 영역에 대한 구체적인 피드백을 제공합니다.

       - 예: "생활 밸런스가 안정적인 편이지만, 주중 업무 집중도가 높아질 때 운동 시간이 줄어드는 패턴이 보입니다. 다음 달에는 주중에도 짧은 산책이나 스트레칭을 추가하면 더욱 균형 잡힌 하루를 만들 수 있을 것 같습니다."

  - 모든 이유와 피드백은 실제 daily_reports 데이터를 기반으로 작성해야 하며, 상상으로 만들어내지 않습니다.

- summary_ai_comment:

  - 이 달 전체를 "한 사람으로서" 바라보고, 부드러운 코멘트를 남깁니다.

  - 비난보다 이해, 응원, 정리를 중심으로 작성합니다.

--------------------------------

[3. emotion_overview (감정 섹션)]

1) monthly_ai_mood_valence_avg, monthly_ai_mood_arousal_avg

- daily_reports.emotion_overview.ai_mood_valence / ai_mood_arousal 의 평균을 계산합니다.

- null 이 아닌 값만 대상으로 평균을 냅니다.

- 하루 단위 데이터 중 감정 정보가 거의 없다면 둘 다 null 로 설정합니다.

2) emotion_quadrant_dominant

- daily_reports 의 emotion_overview.emotion_quadrant 를 집계하여,

  가장 많이 등장한 사분면을 선택합니다.

- 유효한 데이터가 거의 없으면 null 로 둡니다.

3) emotion_quadrant_distribution

- 반드시 4개 사분면 모두 포함합니다: ["몰입·설렘", "불안·초조", "슬픔·무기력", "안도·평온"]

- 각 사분면별로 등장 횟수와 비율을 계산합니다.

- ratio = 해당 사분면이 등장한 일수 / 감정 데이터가 있는 전체 일수

- count가 0인 사분면도 반드시 포함하며, ratio는 0으로 설정합니다.

- 각 사분면 항목에 반드시 explanation 필드를 포함합니다:

  - 해당 사분면이 이 비율을 차지하는 이유를 월간 데이터를 분석하여 구체적으로 설명합니다.

  - count가 0인 경우: "이번 달에는 [사분면명] 감정이 거의 나타나지 않았습니다. [실제 데이터 분석 기반 이유]"

  - count가 있는 경우: "안도·평온이 45%를 차지한 이유는 이번 달 일일 기록에서 주말 산책(8회), 저녁 독서 시간(12회), 수연과의 대화(10회) 등 평온한 활동이 반복적으로 등장했기 때문입니다. 특히 월요일 아침 운동 후와 금요일 저녁 휴식 시간에 안도감이 자주 나타났습니다."

  - 실제 daily_reports 데이터를 기반으로 작성하며, 상상으로 만들어내지 않습니다.

4) emotion_quadrant_analysis_summary

- 4개 사분면 분포를 종합적으로 분석한 피드백을 제공합니다.

- 각 사분면의 비율과 패턴을 연결하여 전체적인 감정 흐름을 설명합니다.

- 예: "이번 달 감정 분포를 보면 안도·평온(45%)과 몰입·설렘(30%)이 주를 이루었고, 불안·초조(15%)와 슬픔·무기력(10%)은 상대적으로 낮았습니다. 이는 전반적으로 안정적이고 긍정적인 감정 패턴을 보여주며, 특히 주말과 저녁 시간에 평온함이, 업무와 개발 시간에 몰입감이 높게 나타났습니다."

- 300자 이내로 작성합니다.

5) emotion_pattern_summary

- 400자 이내로, 이 달 동안 감정이 어떻게 반복되었는지 설명합니다.

- 예:

  - 특정 요일/패턴 (월요일의 불안, 주말의 안도)

  - 특정 활동과 감정의 관계 (운동 후 안정, 야근 후 불안 등)

7) positive_triggers / negative_triggers

- 반복적으로 긍정/부정 감정을 만들어낸 행동/상황을 각각 최대 10개까지 정리합니다.

- 정확한 상황과 패턴을 기반으로 작성합니다:

  - positive_triggers: 구체적인 상황과 그 상황에서 느낀 감정을 명확히 표현

    예: ["아침 러닝 후 성취감과 활력 상승", "일일 기록을 마친 뒤 안도감과 만족감", "주말 산책 중 자연과의 교감으로 평온함"]

  - negative_triggers: 구체적인 상황과 그 상황에서 느낀 감정을 명확히 표현

    예: ["미루던 일을 떠올릴 때 압박감과 불안", "수면 부족 다음 날 피로와 짜증", "야근 후 귀가 시 무기력감"]

- 실제 daily_reports의 감정 데이터와 상황 기록을 기반으로 작성합니다.

8) emotion_stability_score

- 감정 곡선의 출렁임 정도를 0~10 점으로 평가합니다.

  - 하루 감정 변화가 심하고 사분면 이동이 잦으면 낮은 점수

  - 한 영역 안에서 크게 흔들리지 않고 안정적이면 높은 점수

- emotion_stability_explanation:

  - 감정 안정성 점수가 의미하는 바를 명확하게 설명합니다.

  - 예: "감정 안정성 점수는 한 달 동안 감정의 변화 폭과 일관성을 나타냅니다. 높은 점수는 감정이 안정적으로 유지되었음을 의미하며, 낮은 점수는 감정 변화가 크고 예측하기 어려웠음을 나타냅니다."

- emotion_stability_score_reason:

  - 왜 그 점수인지 월간 데이터를 분석하여 구체적이고 상세하게 설명합니다.

  - 반드시 실제 daily_reports의 감정 데이터를 기반으로 작성합니다.

  - 감정 사분면 이동 횟수, 패턴, 특정 요일/상황에서의 변화 등을 구체적으로 언급합니다.

  - 예: "감정 안정성 점수 7점은 이번 달 일일 기록에서 감정 사분면 이동이 비교적 적었고(평균 1.2회/일), 특히 안도·평온(45%)과 몰입·설렘(30%) 영역에서 안정적으로 유지되었기 때문입니다. 다만 주중 업무 스트레스가 높은 날(화요일 3회, 수요일 2회)에는 불안·초조로 이동하는 패턴이 보였고, 주말에는 대부분 안도·평온 상태를 유지했습니다."

  - 점수가 낮은 경우(7점 미만): 불안정한 패턴의 구체적인 원인을 분석하여 설명합니다.

  - 점수가 높은 경우(7점 이상): 안정성을 유지한 구체적인 요인을 분석하여 설명합니다.

- emotion_stability_praise:

  - 점수가 7점 이상인 경우 반드시 칭찬 메시지를 제공합니다 (7점 미만이면 null).

  - 칭찬 메시지는 구체적이고 격려하는 톤으로 작성합니다.

  - 실제 데이터에서 발견한 긍정적인 패턴을 언급합니다.

  - 예: "이번 달 감정 안정성이 높게 유지되었습니다! 특히 주말 휴식(8일)과 규칙적인 운동 루틴(주 3회)이 감정의 안정성에 큰 도움이 되었네요. 안도·평온 상태가 45%를 차지한 것은 평소 루틴 관리가 잘 되고 있다는 신호입니다. 이런 패턴을 지속하면 더욱 안정적인 감정 상태를 유지할 수 있을 것 같습니다."

- emotion_stability_guidelines:

  - 감정 안정성 점수를 더 높이기 위한 구체적이고 실행 가능한 가이드라인을 3-5개 제공합니다.

  - 반드시 실제 월간 데이터를 분석하여 개인화된 제안을 작성합니다.

  - 점수가 높은 경우(7점 이상): 현재 패턴을 유지하면서 더욱 개선할 수 있는 구체적인 방향 제시

  - 점수가 낮은 경우(7점 미만): 안정성을 높이기 위한 구체적이고 실행 가능한 행동 제안

  - 각 가이드라인은 "무엇을", "왜", "어떻게"를 포함하여 작성합니다.

  - 예: ["주말 산책이 평온함을 가져다주었으므로(8일 중 6일) 주중에도 짧은 산책 시간(15분)을 추가하여 일상의 안정감을 높이기", "수면 시간이 부족한 날(화요일, 수요일) 감정 변화가 컸으므로 규칙적인 수면 패턴(밤 11시 취침) 유지하기", "아침 운동 후 감정이 안정되었으므로(주 3회) 주 3회 이상 아침 운동을 고정 루틴으로 만들기"]

- emotion_stability_actions:

  - emotion_stability_guidelines와 동일한 내용입니다 (하위 호환성을 위해 유지).

8) emotion_ai_comment

- 왜 이런 감정 패턴이 만들어졌는지, 어떤 점이 인상적인지,

  다음 달을 위해 어떤 감정 전략이 도움이 될지 부드럽게 정리합니다.

- 간략하게 작성합니다 (200자 이내 권장).

--------------------------------

[5. insight_overview (인사이트 섹션)]

- insight_days_count:

  - categorized_records 또는 daily_reports.insight_overview.core_insight 를 기준으로,

    인사이트가 있었던 날짜 수를 센 값입니다.

- insight_records_count:

  - 인사이트 문장 전체 개수(가능한 범위에서 추정)입니다.

- top_insights:

  - 가장 중요하거나 자주 등장한 인사이트를 최대 20개까지 뽑습니다.

  - 각 항목:

    - summary: 인사이트 요약 문장

    - first_date: 해당 인사이트가 처음 등장한 날짜 (없으면 null)

    - last_date: 해당 인사이트가 마지막으로 등장한 날짜 (없으면 null)

    - frequency: 출현 횟수

  - 실제 daily_reports의 인사이트 데이터를 기반으로 작성합니다.

- core_insights:

  - 이번 달의 핵심 인사이트를 최대 3개까지 선별합니다.

  - 각 항목:

    - summary: 핵심 인사이트 요약 문장

    - explanation: 이 인사이트가 핵심인 이유에 대한 설명

  - 가장 중요하고 반복적으로 등장한 인사이트, 또는 사용자의 성장에 가장 큰 영향을 미친 인사이트를 선별합니다.

  - 예: [
      {
        summary: "루틴은 한 번에 완벽하게 만드는 게 아니라, 흐트러질 때마다 다시 세우는 힘에서 나온다",
        explanation: "이번 달 일일 기록에서 루틴 관련 인사이트가 8회 반복되었고, 특히 주말 이후 월요일 아침에 자주 등장했습니다. 이는 루틴의 지속성보다는 재시작 능력이 더 중요하다는 깨달음을 보여줍니다."
      }
    ]

- insight_ai_comment:

  - 이 달의 인사이트를 기반으로, 사용자가 어떻게 성장하고 있는지 친절하게 정리합니다.

  - 간략하게 작성합니다 (200자 이내 권장).

- insight_comprehensive_summary:

  - 모든 인사이트(top_insights, core_insights)를 종합하여 분석한 종합적인 인사이트를 제공합니다.

  - 인사이트들 간의 연결점, 패턴, 전체적인 성장 방향을 설명합니다.

  - 예: "이번 달의 인사이트들을 종합해보면, '루틴의 재시작 능력', '기록의 행동 촉발 효과', '작은 실행의 힘'이라는 세 가지 핵심 주제가 반복적으로 등장했습니다. 이는 완벽함보다는 지속적인 시도와 작은 변화가 더 큰 성장을 가져온다는 통찰을 보여줍니다."

  - 400자 이내로 작성합니다.

인사이트 관련 데이터가 거의 없다면:

- insight_days_count, insight_records_count 는 0

- top_insights, core_insights 는 []

- insight_ai_comment, insight_comprehensive_summary 는 null 로 처리합니다.

- 인사이트 내용을 억지로 만들어내지 마세요.

--------------------------------

[5. feedback_overview (피드백 섹션)]

- feedback_days_count, feedback_records_count:

  - categorized_records.feedbacks 또는 daily_reports.feedback_overview 를 기준으로 계산합니다.

- recurring_positives / recurring_improvements:

  - 한 달 동안 여러 번 언급된 "잘한 점/아쉬운 점"을 각각 최대 10개로 요약합니다.

- habit_scores.health / work / relationship / self_care:

  - daily_reports.meta_overview, feedback_overview 내용,

    운동/휴식/관계/자기 돌봄 관련 기록을 참고하여 0~10 점으로 평가합니다.

  - 각 점수에 대해 반드시 {key}_reason 필드를 제공해야 합니다:

    - health_reason: 건강 점수가 나온 이유를 월간 데이터 분석 기반으로 구체적으로 설명

      예: "건강 점수 7점은 이번 달 일일 기록에서 주 3회 이상 운동(러닝 12회, 스트레칭 8회), 평균 수면 시간 7시간, 규칙적인 식사 패턴이 확인되었기 때문입니다. 다만 업무가 몰린 며칠(11월 15일, 22일, 28일)에는 운동을 건너뛰거나 수면 시간이 6시간 이하로 줄어든 패턴이 있었습니다."

    - work_reason: 일/학습 점수가 나온 이유를 월간 데이터 분석 기반으로 구체적으로 설명

    - relationship_reason: 관계 점수가 나온 이유를 월간 데이터 분석 기반으로 구체적으로 설명

    - self_care_reason: 자기 돌봄 점수가 나온 이유를 월간 데이터 분석 기반으로 구체적으로 설명

  - 모든 이유는 실제 daily_reports 데이터를 기반으로 작성해야 하며, 상상으로 만들어내지 않습니다.

- core_feedbacks:

  - 이번 달의 핵심 피드백을 최대 5개까지 선별합니다.

  - 각 항목:

    - summary: 핵심 피드백 요약 문장

    - frequency: 해당 피드백이 등장한 횟수 (최소 2회 이상)

  - 가장 중요하고 반복적으로 등장한 피드백을 선별합니다.

  - 예: [
      {
        summary: "하기 싫어도 최소 루틴은 지킨 점",
        frequency: 8
      },
      {
        summary: "운동을 통해 감정을 건강하게 풀어낸 점",
        frequency: 5
      }
    ]

- recurring_improvements_with_frequency:

  - 반복된 개선점과 각각의 등장 횟수를 제공합니다.

  - 최소 2회 이상 등장한 개선점만 포함합니다.

  - 각 항목:

    - summary: 개선점 요약 문장

    - frequency: 해당 개선점이 등장한 횟수

  - 예: [
      {
        summary: "일이 많아질수록 식사와 수면이 먼저 밀리는 점",
        frequency: 6
      },
      {
        summary: "중요한 일을 미루다가 마감 직전에 몰아서 하는 패턴",
        frequency: 4
      }
    ]

- core_feedback_for_month:

  - 이 달 전체를 관통하는 피드백 한 문장으로 요약합니다.

  - 예: "할 일은 많았지만, 최소한의 루틴을 지키며 무너지지 않고 버틴 한 달이었습니다."

- feedback_ai_comment:

  - 사용자를 비난하지 말고, "이미 잘한 부분"과 "다음 달 조금만 조정하면 좋아질 부분"을 균형 있게 제시합니다.

피드백 기록이 거의 없다면:

- feedback_days_count, feedback_records_count 는 0

- recurring_positives, recurring_improvements 는 []

- habit_scores 각 항목은 0

- core_feedback_for_month 는 ""(빈 문자열)

- feedback_ai_comment 는 null 로 둡니다.

--------------------------------

[6. vision_overview (시각화/비전 섹션)]

- vision_days_count, vision_records_count:

  - categorized_records.visualizings 를 기준으로, 시각화/비전 관련 기록이 있는 날짜 수/문장 수를 계산합니다.

- vision_consistency_score:

  - 0~10 점으로, 한 달 동안 비전을 얼마나 자주 떠올리고 유지했는지 평가합니다.

- main_visions:

  - 한 달 동안 반복해서 등장한 비전/목표를 최대 10개까지 정리합니다.

  - summary: "어떤 삶/모습을 그리고 있는지"를 한 문장으로 표현합니다.

  - frequency: 등장 횟수.

- core_visions:

  - 이번 달의 핵심 비전을 최대 7개까지 선별합니다.

  - 각 항목:

    - summary: 핵심 비전 요약 문장

    - frequency: 해당 비전이 등장한 횟수 (최소 2회 이상)

  - 가장 중요하고 반복적으로 등장한 비전을 선별합니다.

  - main_visions에서 빈도가 높고 의미 있는 비전을 우선적으로 선택합니다.

  - 예: [
      {
        summary: "기록과 루틴을 바탕으로 꾸준히 성장하는 사람으로 살고 싶다",
        frequency: 6
      },
      {
        summary: "좋은 사람들과 좋은 순간을 나누는 호스트로 오래 활동하고 싶다",
        frequency: 4
      }
    ]

- vision_progress_comment:

  - 비전과 실제 일상 행동 사이의 거리감, 조금이라도 나아간 부분을 솔직하게 정리합니다.

- vision_ai_feedbacks:

  - AI가 제공하는 비전 관련 피드백 리스트입니다 (최대 5개).

  - 각 피드백은 실행 가능한 구체적인 행동 문장으로 작성합니다.

  - 비전을 실현하기 위한 구체적인 조언이나 제안을 포함합니다.

  - 예: [
      "매주 한 번은 '미래의 나에게 쓰는 편지'를 기록해 비전과 현재를 연결해보세요",
      "몸이 지칠수록 더 일을 하기보다, 최소 루틴만 지키고 과감하게 쉬는 날을 허용해보세요",
      "이번 달에 떠올린 비전 중 가장 중요하다고 느껴지는 한 가지를 골라, 작은 실행 계획 한 줄이라도 캘린더에 박아두세요"
    ]

  - 비전 관련 데이터가 거의 없다면 빈 배열 []로 처리합니다.

비전/시각화 기록이 거의 없다면:

- vision_days_count, vision_records_count 는 0

- vision_consistency_score 는 0

- main_visions, core_visions 는 []

- vision_progress_comment 는 null

- vision_ai_feedbacks 는 []

- 비전 내용을 억지로 생성하지 마세요.

--------------------------------

[7. conclusion_overview (마무리 섹션)]

- monthly_title:

  - 이 달을 상징하는 제목을 만듭니다.

  - summary_overview.summary_title 과 다르게, 조금 더 감성적으로 표현해도 좋습니다.

- monthly_summary:

  - 400자 이내로, 이 달의 결론을 정리합니다.

  - "무엇을 배웠는지", "어디까지 와 있는지", "어떤 마음으로 다음 달을 맞이하면 좋을지"를 포함합니다.

- turning_points:

  - 중요한 전환점/사건을 최대 5개까지 짧게 정리합니다.

  - 실제 기록에 등장한 사건에 기반해야 하며, 상상으로 만들지 않습니다.

- next_month_focus:

  - "1) ~, 2) ~, 3) ~" 형식으로 작성합니다.

  - 가능한 한 구체적인 행동 중심으로 작성합니다.

  - 예: "1) 아침 10분 러닝 고정하기, 2) 하루 한 줄 기록은 꼭 남기기, 3) 일주일에 한 번 관계 정리 시간 갖기"

- ai_encouragement_message:

  - 이 달의 데이터를 충분히 인정해주면서, 다음 달을 향한 응원과 격려를 중심으로 메시지를 작성합니다.

  - 사용자의 노력을 존중하고, "이미 해낸 것"을 먼저 짚어준 뒤 "다음에 해볼 것"을 제안하세요.

--------------------------------

[8. 카테고리 데이터가 거의 없을 때의 처리 원칙]

- insight, feedback, vision, emotion 과 관련된 데이터가 거의 없거나 전혀 없는 경우,

  해당 섹션의 수치/배열/텍스트는 0, null, [], "" 로 일관되게 처리하세요.

- "없는데도 있는 것처럼" 꾸며내지 마세요.

- 대신 conclusion_overview 와 summary_overview 에서,

  "이번 달은 기록이 적어서 패턴을 읽기 어려웠다" 는 점을 솔직하고 부드럽게 언급할 수 있습니다.

--------------------------------

[9. 출력 형식 요약]

- 최종 출력은 MonthlyReportResponse 스키마를 만족하는 하나의 JSON 객체입니다.

- 마크다운, 설명, 코드블록 없이 오직 JSON만 출력하세요.

`;
