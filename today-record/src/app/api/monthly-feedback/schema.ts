// Monthly Feedback 스키마는 사용자가 제공한 내용을 그대로 사용
// 여기서는 export만 수행

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
            maxItems: 10,
          },
          integrity_trend: {
            type: "string",
            nullable: true,
            enum: ["상승", "하락", "유지", "불규칙", null],
          },
          life_balance_score: { type: "integer", minimum: 0, maximum: 10 },
          execution_score: { type: "integer", minimum: 0, maximum: 10 },
          rest_score: { type: "integer", minimum: 0, maximum: 10 },
          relationship_score: { type: "integer", minimum: 0, maximum: 10 },
          summary_ai_comment: { type: "string", nullable: true },
        },
        required: [
          "monthly_score",
          "summary_title",
          "summary_description",
          "main_themes",
          "integrity_trend",
          "life_balance_score",
          "execution_score",
          "rest_score",
          "relationship_score",
          "summary_ai_comment",
        ],
      },

      // 2. 주차별 overview 섹션
      weekly_overview: {
        type: "object",
        additionalProperties: false,
        properties: {
          weeks: {
            type: "array",
            minItems: 0,
            maxItems: 5,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                week_index: { type: "integer", minimum: 1, maximum: 5 },
                start_date: {
                  type: "string",
                  pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                },
                end_date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                integrity_average: { type: "number", minimum: 0, maximum: 10 },
                dominant_emotion: { type: "string", nullable: true },
                emotion_quadrant: {
                  type: "string",
                  nullable: true,
                  enum: [
                    "몰입·설렘",
                    "불안·초조",
                    "슬픔·무기력",
                    "안도·평온",
                    null,
                  ],
                },
                weekly_keyword: { type: "string", nullable: true },
                weekly_comment: { type: "string", nullable: true },
              },
              required: [
                "week_index",
                "start_date",
                "end_date",
                "integrity_average",
                "dominant_emotion",
                "emotion_quadrant",
                "weekly_keyword",
                "weekly_comment",
              ],
            },
          },
        },
        required: ["weeks"],
      },

      // 3. 감정 섹션
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
            minItems: 0,
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
              },
              required: ["quadrant", "count", "ratio"],
            },
          },
          emotion_keywords: {
            type: "array",
            items: { type: "string" },
            minItems: 0,
            maxItems: 20,
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
          emotion_ai_comment: { type: "string", nullable: true },
        },
        required: [
          "monthly_ai_mood_valence_avg",
          "monthly_ai_mood_arousal_avg",
          "emotion_quadrant_dominant",
          "emotion_quadrant_distribution",
          "emotion_keywords",
          "emotion_pattern_summary",
          "positive_triggers",
          "negative_triggers",
          "emotion_stability_score",
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
          insight_themes: {
            type: "array",
            items: { type: "string" },
            minItems: 0,
            maxItems: 15,
          },
          top_insights: {
            type: "array",
            minItems: 0,
            maxItems: 10,
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
          insight_depth_score: { type: "integer", minimum: 0, maximum: 10 },
          meta_question_for_month: { type: "string", nullable: true },
          insight_ai_comment: { type: "string", nullable: true },
        },
        required: [
          "insight_days_count",
          "insight_records_count",
          "insight_themes",
          "top_insights",
          "insight_depth_score",
          "meta_question_for_month",
          "insight_ai_comment",
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
              work: { type: "integer", minimum: 0, maximum: 10 },
              relationship: { type: "integer", minimum: 0, maximum: 10 },
              self_care: { type: "integer", minimum: 0, maximum: 10 },
            },
            required: ["health", "work", "relationship", "self_care"],
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
          vision_progress_comment: { type: "string", nullable: true },
          reminder_sentence_for_next_month: { type: "string", nullable: true },
          vision_ai_feedback: { type: "string", nullable: true },
        },
        required: [
          "vision_days_count",
          "vision_records_count",
          "vision_consistency_score",
          "main_visions",
          "vision_progress_comment",
          "reminder_sentence_for_next_month",
          "vision_ai_feedback",
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
      "weekly_overview",
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

  - 이 달의 키워드를 최대 10개까지 뽑습니다.

  - 예: ["기록", "정체감", "직업 고민", "체력 관리", "관계 정리"]

- integrity_trend:

  - 주차별 integrity_average 흐름을 기준으로,

    - 전체적으로 상승 → "상승"

    - 전체적으로 하락 → "하락"

    - 큰 변동 없이 비슷 → "유지"

    - 오르락내리락 심함 → "불규칙"

  - daily_reports가 거의 없다면 null로 처리합니다.

- life_balance_score, execution_score, rest_score, relationship_score:

  - 각 0~10 점으로, daily_reports 서사와 meta_overview 내용을 참고해 정성적으로 평가합니다.

  - 점수에 대한 이유는 summary_ai_comment에서 간단히 설명합니다.

- summary_ai_comment:

  - 이 달 전체를 "한 사람으로서" 바라보고, 부드러운 코멘트를 남깁니다.

  - 비난보다 이해, 응원, 정리를 중심으로 작성합니다.

--------------------------------

[3. weekly_overview (1~4주차 요약)]

- weeks 배열에는 1주차부터 최대 5주차까지만 포함합니다.

- 각 주는 다음을 포함합니다:

  - week_index: 1~5

  - start_date, end_date: 해당 주의 실제 날짜 범위

  - integrity_average: 그 주에 속한 daily_reports 의 integrity_score 평균 (없으면 0)

  - dominant_emotion: 그 주에 가장 자주 나타난 대표 감정(짧은 단어 또는 구)

  - emotion_quadrant: 그 주에 가장 많이 등장한 emotion_quadrant (없으면 null)

  - weekly_keyword: 그 주를 표현하는 한 단어 또는 짧은 구

  - weekly_comment: 200자 이내로, 이 주의 핵심 포인트를 설명합니다.

- 특정 주에 해당하는 daily_reports 가 전혀 없다면:

  - 해당 주는 weeks 배열에 포함하지 않아도 됩니다.

--------------------------------

[4. emotion_overview (감정 섹션)]

1) monthly_ai_mood_valence_avg, monthly_ai_mood_arousal_avg

- daily_reports.emotion_overview.ai_mood_valence / ai_mood_arousal 의 평균을 계산합니다.

- null 이 아닌 값만 대상으로 평균을 냅니다.

- 하루 단위 데이터 중 감정 정보가 거의 없다면 둘 다 null 로 설정합니다.

2) emotion_quadrant_dominant

- daily_reports 의 emotion_overview.emotion_quadrant 를 집계하여,

  가장 많이 등장한 사분면을 선택합니다.

- 유효한 데이터가 거의 없으면 null 로 둡니다.

3) emotion_quadrant_distribution

- 각 사분면별로 등장 횟수와 비율을 계산합니다.

- ratio = 해당 사분면이 등장한 일수 / 감정 데이터가 있는 전체 일수

- count 가 0인 사분면은 배열에 포함하지 않아도 됩니다.

4) emotion_keywords

- daily_reports.emotion_overview.emotion_curve, dominant_emotion,

  narrative_overview.keywords 등을 참고해서,

  이 달의 감정을 잘 설명하는 단어들을 최대 20개까지 추립니다.

5) emotion_pattern_summary

- 400자 이내로, 이 달 동안 감정이 어떻게 반복되었는지 설명합니다.

- 예:

  - 특정 요일/패턴 (월요일의 불안, 주말의 안도)

  - 특정 활동과 감정의 관계 (운동 후 안정, 야근 후 불안 등)

6) positive_triggers / negative_triggers

- 반복적으로 긍정/부정 감정을 만들어낸 행동/상황을 각각 최대 10개까지 정리합니다.

- 예:

  - positive_triggers: ["아침 러닝 후 성취감", "기록을 마친 뒤 안도감"]

  - negative_triggers: ["미루던 일을 떠올릴 때 압박감", "수면 부족 다음 날 짜증"]

7) emotion_stability_score

- 감정 곡선의 출렁임 정도를 0~10 점으로 평가합니다.

  - 하루 감정 변화가 심하고 사분면 이동이 잦으면 낮은 점수

  - 한 영역 안에서 크게 흔들리지 않고 안정적이면 높은 점수

8) emotion_ai_comment

- 왜 이런 감정 패턴이 만들어졌는지, 어떤 점이 인상적인지,

  다음 달을 위해 어떤 감정 전략이 도움이 될지 부드럽게 정리합니다.

--------------------------------

[5. insight_overview (인사이트 섹션)]

- insight_days_count:

  - categorized_records 또는 daily_reports.insight_overview.core_insight 를 기준으로,

    인사이트가 있었던 날짜 수를 센 값입니다.

- insight_records_count:

  - 인사이트 문장 전체 개수(가능한 범위에서 추정)입니다.

- insight_themes:

  - 한 달 동안 반복적으로 등장한 인사이트 주제를 최대 15개까지 요약합니다.

  - 예: ["일의 의미", "관계에서의 거리감", "몸과 마음의 연결"]

- top_insights:

  - 가장 중요하거나 자주 등장한 인사이트를 최대 10개까지 뽑습니다.

  - 각 항목:

    - summary: 인사이트 요약 문장

    - first_date, last_date: 해당 인사이트가 처음/마지막으로 등장한 날짜 (없으면 null)

    - frequency: 출현 횟수

- insight_depth_score:

  - 0~10 점으로, "이 달의 생각이 얼마나 깊어졌는지"를 평가합니다.

  - 단순한 사실 나열보다 "나에 대한 이해, 패턴에 대한 깨달음"이 많을수록 높은 점수.

- meta_question_for_month:

  - 이 달 전체를 관통하는 하나의 큰 질문을 만듭니다.

  - 예: "나는 어떤 삶의 리듬에서 가장 나답게 살아가는가?"

- insight_ai_comment:

  - 이 달의 인사이트를 기반으로, 사용자가 어떻게 성장하고 있는지 친절하게 정리합니다.

인사이트 관련 데이터가 거의 없다면:

- insight_days_count, insight_records_count 는 0

- insight_themes, top_insights 는 []

- insight_depth_score 는 0

- meta_question_for_month, insight_ai_comment 는 null 로 처리합니다.

- 인사이트 내용을 억지로 만들어내지 마세요.

--------------------------------

[6. feedback_overview (피드백 섹션)]

- feedback_days_count, feedback_records_count:

  - categorized_records.feedbacks 또는 daily_reports.feedback_overview 를 기준으로 계산합니다.

- recurring_positives / recurring_improvements:

  - 한 달 동안 여러 번 언급된 "잘한 점/아쉬운 점"을 각각 최대 10개로 요약합니다.

- habit_scores.health / work / relationship / self_care:

  - daily_reports.meta_overview, feedback_overview 내용,

    운동/휴식/관계/자기 돌봄 관련 기록을 참고하여 0~10 점으로 평가합니다.

  - 점수에 대한 설명은 feedback_ai_comment 에 녹여서 작성합니다.

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

[7. vision_overview (시각화/비전 섹션)]

- vision_days_count, vision_records_count:

  - categorized_records.visualizings 를 기준으로, 시각화/비전 관련 기록이 있는 날짜 수/문장 수를 계산합니다.

- vision_consistency_score:

  - 0~10 점으로, 한 달 동안 비전을 얼마나 자주 떠올리고 유지했는지 평가합니다.

- main_visions:

  - 한 달 동안 반복해서 등장한 비전/목표를 최대 10개까지 정리합니다.

  - summary: "어떤 삶/모습을 그리고 있는지"를 한 문장으로 표현합니다.

  - frequency: 등장 횟수.

- vision_progress_comment:

  - 비전과 실제 일상 행동 사이의 거리감, 조금이라도 나아간 부분을 솔직하게 정리합니다.

- reminder_sentence_for_next_month:

  - 다음 달에 다시 떠올리면 좋은 리마인더 문장을 짧게 작성합니다.

  - 예: "나는 꾸준히 기록하고 움직일 때 가장 나다워진다는 걸 잊지 말자."

- vision_ai_feedback:

  - 반드시 "핵심 3단: 1) ..., 2) ..., 3) ..." 형식으로 작성합니다.

  - 각 항목은 실행 가능한 행동 문장으로, 너무 길지 않게 씁니다.

  - 비전 관련 데이터가 거의 없다면 vision_ai_feedback 은 null 로 둡니다.

비전/시각화 기록이 거의 없다면:

- vision_days_count, vision_records_count 는 0

- vision_consistency_score 는 0

- main_visions 는 []

- vision_progress_comment, reminder_sentence_for_next_month, vision_ai_feedback 은 null 또는 "" 로 처리합니다.

- 비전 내용을 억지로 생성하지 마세요.

--------------------------------

[8. conclusion_overview (마무리 섹션)]

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

[9. 카테고리 데이터가 거의 없을 때의 처리 원칙]

- insight, feedback, vision, emotion 과 관련된 데이터가 거의 없거나 전혀 없는 경우,

  해당 섹션의 수치/배열/텍스트는 0, null, [], "" 로 일관되게 처리하세요.

- "없는데도 있는 것처럼" 꾸며내지 마세요.

- 대신 conclusion_overview 와 summary_overview 에서,

  "이번 달은 기록이 적어서 패턴을 읽기 어려웠다" 는 점을 솔직하고 부드럽게 언급할 수 있습니다.

--------------------------------

[10. 출력 형식 요약]

- 최종 출력은 MonthlyReportResponse 스키마를 만족하는 하나의 JSON 객체입니다.

- 마크다운, 설명, 코드블록 없이 오직 JSON만 출력하세요.

`;
