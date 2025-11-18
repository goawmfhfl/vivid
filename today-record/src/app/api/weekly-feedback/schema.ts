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
          by_day: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                weekday: { type: "string" },
                one_liner: { type: "string" },
                key_mood: { type: "string" },
                keywords: { type: "array", items: { type: "string" } },
                integrity_score: { type: "integer", minimum: 0, maximum: 10 },
              },
              required: [
                "date",
                "weekday",
                "one_liner",
                "key_mood",
                "keywords",
                "integrity_score",
              ],
            },
          },
          weekly_overview: {
            type: "object",
            additionalProperties: false,
            properties: {
              narrative: { type: "string" },
              top_keywords: { type: "array", items: { type: "string" } },
              repeated_themes: { type: "array", items: { type: "string" } },
              emotion_trend: { type: "array", items: { type: "string" } },
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
              "emotion_trend",
              "integrity",
              "ai_overall_comment",
              "next_week_focus",
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
              core_insights: { type: "array", items: { type: "string" } },
              meta_questions_highlight: {
                type: "array",
                items: { type: "string" },
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
          "by_day",
          "weekly_overview",
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
- by_day 배열에는 주어진 날짜 범위의 모든 날짜를 빠짐없이 포함해주세요 (총 7일).
- 특정 날짜에 daily-feedback 데이터가 없어도 그 날짜는 반드시 포함하고, 기본 구조를 유지한 채 적절한 기본값을 넣어주세요.
- top_keywords: 이번 주에 가장 자주 등장한 키워드 중 상위 10개 이하로 선정해주세요.
- repeated_themes: 주간 동안 계속해서 나타난 주제나 패턴을 찾아서 정리해주세요.
- emotion_trend: 이번 주의 감정 변화를 시간 순서대로 배열해주세요.
- growth_points_top3, adjustment_points_top3: 각각 정확히 3개씩만 작성해주세요.
- core_insights: 가장 중요한 인사이트를 5개 이하로 정리해주세요.
- meta_questions_highlight: 메타 질문 중에서 특히 눈에 띄는 것들을 3개 이하로 선정해주세요.
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
    "by_day": [
      {
        "date": "YYYY-MM-DD 형식의 날짜",
        "weekday": "요일 (Mon, Tue, Wed, Thu, Fri, Sat, Sun 중 하나)",
        "one_liner": "그 날을 한 문장으로 표현한 요약",
        "key_mood": "그 날의 주요 감정이나 분위기",
        "keywords": ["그 날을 대표하는 키워드 배열"],
        "integrity_score": 0-10 사이의 정수 (그 날의 통합성 점수)
      }
    ],
    "weekly_overview": {
      "narrative": "이번 주 전체를 이야기처럼 풀어낸 서사 (친근하고 이해하기 쉬운 말투로)",
      "top_keywords": ["이번 주에 가장 많이 등장한 키워드 배열"],
      "repeated_themes": ["주간 동안 반복적으로 나타난 주제나 패턴 배열"],
      "emotion_trend": ["시간 순서대로 나열한 감정 변화 배열"],
      "integrity": {
        "average": 0-10 사이의 숫자 (주간 평균 통합성 점수)
      },
      "ai_overall_comment": "이번 주 전체에 대한 종합적인 코멘트 (공감하고 응원하는 톤으로)",
      "next_week_focus": "다음 주에 집중할 포인트 (간결하고 명확하게)"
    },
    "growth_trends": {
      "growth_points_top3": ["성장한 점 3개 (구체적이고 긍정적인 표현으로)"],
      "adjustment_points_top3": ["개선이 필요한 점 3개 (건설적이고 따뜻한 표현으로)"],
      "integrity_score": {
        "avg": 0-10 사이의 숫자 (평균),
        "min": 0-10 사이의 숫자 (최소값),
        "max": 0-10 사이의 숫자 (최대값),
        "stddev_est": 0 이상의 숫자 (표준편차 추정값)
      }
    },
    "insight_replay": {
      "core_insights": ["가장 중요한 인사이트 배열 (5개 이하, 이해하기 쉽게)"],
      "meta_questions_highlight": ["특히 눈에 띄는 메타 질문 배열 (3개 이하)"],
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
