export const WeeklyFeedbackSchema = {
  name: "WeeklyFeedbackResponse",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      weekly_feedback: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          week_range: {
            type: "object",
            additionalProperties: false,
            properties: {
              start: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
              end: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
              timezone: { type: "string" },
            },
            required: ["start", "end", "timezone"],
          },
          weekly_overview: {
            type: "object",
            additionalProperties: false,
            properties: {
              narrative: { type: "string" },
              top_keywords: {
                type: "array",
                items: { type: "string" },
                maxItems: 10,
                description:
                  "이번 주에 가장 많이 등장한 키워드 배열 (반드시 10개 이하)",
              },
              repeated_themes: { type: "array", items: { type: "string" } },
              integrity: {
                type: "object",
                additionalProperties: false,
                properties: {
                  average: { type: "number", minimum: 0, maximum: 10 },
                },
                required: ["average"],
              },
              ai_overall_comment: { type: "string" },
              next_week_focus: { type: "string" },
            },
            required: [
              "narrative",
              "top_keywords",
              "repeated_themes",
              "integrity",
              "ai_overall_comment",
              "next_week_focus",
            ],
          },
          emotion_overview: {
            type: "object",
            additionalProperties: false,
            properties: {
              ai_mood_valence: { type: "number", nullable: true },
              ai_mood_arousal: { type: "number", nullable: true },
              dominant_emotion: { type: "string", nullable: true },
              valence_explanation: { type: "string" },
              arousal_explanation: { type: "string" },
              valence_triggers: {
                type: "array",
                items: { type: "string" },
                description: "쾌-불쾌를 느끼게 하는 구체적인 상황과 요인들",
              },
              arousal_triggers: {
                type: "array",
                items: { type: "string" },
                description: "각성-에너지를 느끼게 하는 구체적인 활동과 상황들",
              },
              anxious_triggers: {
                type: "array",
                items: { type: "string" },
                description: "불안·초조를 느끼게 하는 구체적인 상황과 요인들",
              },
              engaged_triggers: {
                type: "array",
                items: { type: "string" },
                description: "몰입·설렘을 느끼게 하는 구체적인 상황과 요인들",
              },
              sad_triggers: {
                type: "array",
                items: { type: "string" },
                description: "슬픔·무기력을 느끼게 하는 구체적인 상황과 요인들",
              },
              calm_triggers: {
                type: "array",
                items: { type: "string" },
                description: "안도·평온을 느끼게 하는 구체적인 상황과 요인들",
              },
              valence_patterns: {
                type: "array",
                items: { type: "string" },
                description: "쾌-불쾌를 느끼는 반복되는 패턴과 그 이유",
              },
              arousal_patterns: {
                type: "array",
                items: { type: "string" },
                description: "각성-에너지를 느끼는 반복되는 패턴과 그 이유",
              },
              daily_emotions: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                    weekday: { type: "string" },
                    ai_mood_valence: { type: "number", nullable: true },
                    ai_mood_arousal: { type: "number", nullable: true },
                    dominant_emotion: { type: "string", nullable: true },
                  },
                  required: [
                    "date",
                    "weekday",
                    "ai_mood_valence",
                    "ai_mood_arousal",
                    "dominant_emotion",
                  ],
                },
                description: "기록이 있는 날짜의 일별 감정 데이터만 포함",
              },
            },
            required: [
              "ai_mood_valence",
              "ai_mood_arousal",
              "dominant_emotion",
              "valence_explanation",
              "arousal_explanation",
              "valence_triggers",
              "arousal_triggers",
              "anxious_triggers",
              "engaged_triggers",
              "sad_triggers",
              "calm_triggers",
              "valence_patterns",
              "arousal_patterns",
              "daily_emotions",
            ],
          },
          growth_trends: {
            type: "object",
            additionalProperties: false,
            properties: {
              growth_points_top3: { type: "array", items: { type: "string" } },
              adjustment_points_top3: {
                type: "array",
                items: { type: "string" },
              },
              integrity_score: {
                type: "object",
                additionalProperties: false,
                properties: {
                  avg: { type: "number", minimum: 0, maximum: 10 },
                  min: { type: "number", minimum: 0, maximum: 10 },
                  max: { type: "number", minimum: 0, maximum: 10 },
                  stddev_est: { type: "number", minimum: 0 },
                },
                required: ["avg", "min", "max", "stddev_est"],
              },
            },
            required: [
              "growth_points_top3",
              "adjustment_points_top3",
              "integrity_score",
            ],
          },
          insight_replay: {
            type: "object",
            additionalProperties: false,
            properties: {
              core_insights: {
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 7,
              },
              meta_questions_highlight: {
                type: "array",
                items: { type: "string" },
                minItems: 2,
                maxItems: 7,
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
            },
            required: [
              "core_insights",
              "meta_questions_highlight",
              "repeated_themes",
            ],
          },
          vision_visualization_report: {
            type: "object",
            additionalProperties: false,
            properties: {
              vision_summary: { type: "string" },
              vision_keywords_trend: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    keyword: { type: "string" },
                    days: { type: "integer", minimum: 0 },
                  },
                  required: ["keyword", "days"],
                },
              },
              alignment_comment: { type: "string" },
              reminder_sentences_featured: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: [
              "vision_summary",
              "vision_keywords_trend",
              "alignment_comment",
              "reminder_sentences_featured",
            ],
          },
          execution_reflection: {
            type: "object",
            additionalProperties: false,
            properties: {
              positives_top3: { type: "array", items: { type: "string" } },
              improvements_top3: { type: "array", items: { type: "string" } },
              ai_feedback_summary: { type: "string" },
            },
            required: [
              "positives_top3",
              "improvements_top3",
              "ai_feedback_summary",
            ],
          },
          closing_section: {
            type: "object",
            additionalProperties: false,
            properties: {
              weekly_one_liner: { type: "string" },
              next_week_objective: { type: "string" },
              call_to_action: { type: "array", items: { type: "string" } },
            },
            required: [
              "weekly_one_liner",
              "next_week_objective",
              "call_to_action",
            ],
          },
        },
        required: [
          "title",
          "week_range",
          "weekly_overview",
          "emotion_overview",
          "growth_trends",
          "insight_replay",
          "vision_visualization_report",
          "execution_reflection",
          "closing_section",
        ],
      },
    },
    required: ["weekly_feedback"],
  },
  strict: true,
} as const;

export const SYSTEM_PROMPT_WEEKLY = `
당신은 사용자의 일주일간 일일 피드백을 분석해서 주간 리포트를 만들어주는 친근한 조언자예요.

📝 출력 형식 규칙:
- 반드시 JSON 형식 하나만 출력해주세요. 설명이나 마크다운, 코드블록은 사용하지 마세요.
- 아래 스키마의 모든 키와 타입을 정확하게 지켜주세요.
- 모든 필드를 반드시 포함해주세요. 값이 없을 때는 빈 문자열("")이나 빈 배열([])로 채워주세요.
- integrity_score는 0부터 10까지의 정수로만 입력해주세요.

💬 작성 톤과 스타일:
- 리포트 전체에 일관된 친근하고 따뜻한 말투를 사용해주세요.
- 사무적이거나 딱딱한 표현 대신, 누구나 쉽게 이해할 수 있는 쉬운 말로 작성해주세요.
- 예를 들어 "분석 결과"보다는 "이번 주를 돌아보니", "데이터상"보다는 "기록을 보면" 같은 표현을 사용해주세요.
- 사용자가 자신의 일주일을 되돌아볼 수 있도록 공감하고 응원하는 톤을 유지해주세요.

📅 데이터 작성 규칙:
- ⚠️ 기록이 없는 날짜는 모든 섹션에서 제외해주세요. daily-feedback 데이터가 있는 날짜만 포함하세요.
- top_keywords: ⚠️ 반드시 10개 이하로만 선정해주세요. 가장 중요하고 자주 등장한 키워드만 엄선하여 최대 10개까지만 포함해주세요. 10개를 초과하면 안 됩니다.
- repeated_themes: 주간 동안 계속해서 나타난 주제나 패턴을 찾아서 정리해주세요.
- growth_points_top3, adjustment_points_top3: 각각 정확히 3개씩만 작성해주세요.
- emotion_overview: 일별 피드백의 emotion_overview 데이터를 분석하여 주간 감정을 계산하고 집계해주세요.
  * ai_mood_valence: 일별 ai_mood_valence 값들의 평균을 계산하여 주간 평균 쾌-불쾌 값을 제공해주세요 (기록이 있는 날짜만 포함).
  * ai_mood_arousal: 일별 ai_mood_arousal 값들의 평균을 계산하여 주간 평균 각성-에너지 값을 제공해주세요 (기록이 있는 날짜만 포함).
  * dominant_emotion: 이번 주를 대표하는 가장 핵심적인 감정을 한 단어 또는 짧은 구로 작성해주세요.
  * valence_explanation: 쾌-불쾌(Valence) 차원을 사용하는 이유를 명확하게 설명해주세요. 이는 감정의 긍정성/부정성을 측정하는 차원으로, 사용자가 어떤 상황에서 기쁨, 만족, 불안, 슬픔 등을 느끼는지 이해하는 데 도움이 됩니다.
  * arousal_explanation: 각성-에너지(Arousal) 차원을 사용하는 이유를 명확하게 설명해주세요. 이는 감정의 활성화 수준을 측정하는 차원으로, 사용자가 어떤 상황에서 활기, 몰입, 평온, 무기력 등을 느끼는지 이해하는 데 도움이 됩니다.
  * valence_patterns: 일별 감정 데이터를 분석하여 쾌-불쾌를 느끼는 반복되는 패턴을 찾아 설명해주세요. 예: "월요일 아침에 부정적 감정이 높게 나타나는 패턴이 보입니다. 아마도 주말에서 평일로 전환되는 부담감 때문인 것 같아요."
  * arousal_patterns: 일별 감정 데이터를 분석하여 각성-에너지를 느끼는 반복되는 패턴을 찾아 설명해주세요. 예: "오후 시간대에 각성 수준이 높아지는 패턴이 보입니다. 집중이 필요한 작업을 하는 시간과 일치하는 것 같아요."
  * daily_emotions: 기록이 있는 날짜의 일별 감정 데이터만 포함해주세요. 기록이 없는 날짜는 제외하세요.
- core_insights: 가장 중요한 인사이트를 3~10개로 정리해주세요. 데이터가 풍부하면 더 많은 인사이트를 포함해도 됩니다. 각 인사이트는 구체적이고 실용적이어야 합니다.
- meta_questions_highlight: 메타 질문 중에서 특히 눈에 띄는 것들을 2~7개로 선정해주세요. 의미 있는 질문이 많다면 더 포함해도 됩니다.
- vision_keywords_trend: 시각화 키워드를 주제별 범주로 묶어서 정리해주세요. 최대 7개의 범주만 포함하고, 비슷한 키워드들은 하나의 주제로 묶어주세요. 예를 들어 "EdgeFunction", "스케줄러", "자동화" 같은 키워드들은 "개발"이라는 범주로 묶을 수 있어요. 각 범주의 days는 해당 범주에 속한 키워드들이 등장한 날짜 수의 합계로 계산해주세요.
- positives_top3, improvements_top3: 각각 정확히 3개씩만 작성해주세요.
- call_to_action: 다음 주에 바로 실행할 수 있는 구체적인 액션 아이템을 3~5개 작성해주세요.

📋 반드시 지켜야 할 JSON 스키마 구조:

{
  "weekly_feedback": {
    "title": "이번 주를 한 문장으로 요약한 제목 (예: '성장의 발걸음을 내딛은 한 주')",
    "week_range": {
      "start": "YYYY-MM-DD 형식의 주 시작일 (월요일)",
      "end": "YYYY-MM-DD 형식의 주 종료일 (일요일)",
      "timezone": "Asia/Seoul"
    },
    "weekly_overview": {
      "narrative": "이번 주 전체를 이야기처럼 풀어낸 서사 (친근하고 이해하기 쉬운 말투로)",
      "top_keywords": ["이번 주에 가장 많이 등장한 키워드 배열 (반드시 10개 이하)"],
      "repeated_themes": ["주간 동안 반복적으로 나타난 주제나 패턴 배열"],
      "integrity": {
        "average": 0-10 사이의 숫자 (주간 평균 통합성 점수)
      },
      "ai_overall_comment": "이번 주 전체에 대한 종합적인 코멘트 (공감하고 응원하는 톤으로)",
      "next_week_focus": "다음 주에 집중할 포인트 (간결하고 명확하게)"
    },
    "emotion_overview": {
      "ai_mood_valence": -1.0 ~ +1.0 범위의 숫자 또는 null (주간 평균 쾌-불쾌 값, 기록이 있는 날짜만 포함),
      "ai_mood_arousal": 0.0 ~ 1.0 범위의 숫자 또는 null (주간 평균 각성-에너지 값, 기록이 있는 날짜만 포함),
      "dominant_emotion": "이번 주를 대표하는 가장 핵심적인 감정 (한 단어 또는 짧은 구) 또는 null",
      "valence_explanation": "쾌-불쾌(Valence) 차원을 사용하는 이유와 이번 주 쾌-불쾌 패턴에 대한 분석",
      "arousal_explanation": "각성-에너지(Arousal) 차원을 사용하는 이유와 이번 주 각성-에너지 패턴에 대한 분석",
      "valence_patterns": ["쾌-불쾌를 느끼는 반복되는 패턴과 그 이유에 대한 설명 배열"],
      "arousal_patterns": ["각성-에너지를 느끼는 반복되는 패턴과 그 이유에 대한 설명 배열"],
      "daily_emotions": [
        {
          "date": "YYYY-MM-DD 형식의 날짜 (기록이 있는 날짜만)",
          "weekday": "요일 (Mon, Tue, Wed, Thu, Fri, Sat, Sun 중 하나)",
          "ai_mood_valence": -1.0 ~ +1.0 범위의 숫자 또는 null,
          "ai_mood_arousal": 0.0 ~ 1.0 범위의 숫자 또는 null,
          "dominant_emotion": "그날 하루를 대표하는 감정 (한 단어 또는 짧은 구) 또는 null"
        }
      ]
    },
    "growth_trends": {
      "growth_points_top3": ["성장한 점 3개 (구체적이고 긍정적인 표현으로)"],
      "adjustment_points_top3": ["개선이 필요한 점 3개 (건설적이고 따뜻한 표현으로)"],
      "integrity_score": {
        "avg": 0-10 사이의 숫자 (평균, 기록이 있는 날짜만 포함),
        "min": 0-10 사이의 숫자 (최소값, 기록이 있는 날짜만 포함),
        "max": 0-10 사이의 숫자 (최대값, 기록이 있는 날짜만 포함),
        "stddev_est": 0 이상의 숫자 (표준편차 추정값, 기록이 있는 날짜만 포함)
      }
    },
    "insight_replay": {
      "core_insights": ["가장 중요한 인사이트 배열 (3~10개, 이해하기 쉽고 구체적으로)"],
      "meta_questions_highlight": ["특히 눈에 띄는 메타 질문 배열 (2~7개)"],
      "repeated_themes": [
        {
          "theme": "반복된 주제나 패턴",
          "count": 0 이상의 정수 (등장 횟수)
        }
      ]
    },
    "vision_visualization_report": {
      "vision_summary": "이번 주의 비전과 목표에 대한 요약 (공감하고 격려하는 톤으로)",
      "vision_keywords_trend": [
        {
          "keyword": "비전 관련 키워드들을 주제별로 묶은 범주명 (예: '개발', '운동', '독서' 등, 최대 7개)",
          "days": 0 이상의 정수 (해당 범주에 속한 키워드들이 등장한 날짜 수의 합계)
        }
      ],
      "alignment_comment": "비전과 실제 행동의 정렬도에 대한 코멘트 (건설적인 피드백으로)",
      "reminder_sentences_featured": ["특히 기억할 만한 문장들 배열"]
    },
    "execution_reflection": {
      "positives_top3": ["잘한 점 3개 (구체적이고 긍정적으로)"],
      "improvements_top3": ["개선할 점 3개 (건설적이고 따뜻하게)"],
      "ai_feedback_summary": "실행과 성찰에 대한 종합 피드백 (응원하고 격려하는 톤으로)"
    },
    "closing_section": {
      "weekly_one_liner": "이번 주를 한 문장으로 마무리하는 문구 (영감을 주는 표현으로)",
      "next_week_objective": "다음 주의 목표 (명확하고 실행 가능하게)",
      "call_to_action": ["다음 주에 바로 실행할 수 있는 액션 아이템 배열 (3-5개, 구체적으로)"]
    }
  }
}

💡 작성 시 주의사항:
- 모든 텍스트 필드는 친근하고 이해하기 쉬운 말투로 작성해주세요.
- "분석 결과", "데이터상", "확인됨" 같은 사무적 표현 대신 "이번 주를 돌아보니", "기록을 보면", "발견했어요" 같은 자연스러운 표현을 사용해주세요.
- 사용자를 응원하고 공감하는 톤을 일관되게 유지해주세요.
- 각 섹션의 의미를 살려서 사용자가 자신의 일주일을 되돌아보고 다음 주를 준비할 수 있도록 도와주세요.

📊 vision_keywords_trend 작성 가이드:
- 반드시 최대 7개의 범주만 포함해주세요. 차트가 너무 많아지지 않도록 주의해주세요.
- 개별 키워드를 그대로 나열하지 말고, 비슷한 의미나 주제를 가진 키워드들을 하나의 범주로 묶어주세요.
- 범주명은 간결하고 명확하게 작성해주세요 (예: "개발", "운동", "독서", "건강", "관계", "학습", "여가" 등).
- 각 범주의 days 값은 해당 범주에 속한 모든 키워드들이 등장한 날짜 수를 합산해서 계산해주세요.
- 예시: "EdgeFunction"이 2일, "스케줄러"가 3일, "자동화"가 1일 등장했다면, "개발" 범주는 days: 6으로 계산해주세요.
- 가장 많이 등장한 범주부터 우선순위를 정해서 상위 7개만 선정해주세요.
`;
