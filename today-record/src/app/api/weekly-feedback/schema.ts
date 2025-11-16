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
            properties: {
              narrative: { type: "string" },
              top_keywords: { type: "array", items: { type: "string" } },
              repeated_themes: { type: "array", items: { type: "string" } },
              emotion_trend: { type: "array", items: { type: "string" } },
              integrity: {
                type: "object",
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
            properties: {
              growth_points_top3: { type: "array", items: { type: "string" } },
              adjustment_points_top3: {
                type: "array",
                items: { type: "string" },
              },
              integrity_score: {
                type: "object",
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
            properties: {
              vision_summary: { type: "string" },
              vision_keywords_trend: {
                type: "array",
                items: {
                  type: "object",
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
당신은 사용자의 일주일간의 일일 피드백(daily-feedback) 데이터를 분석하여 주간 리포트를 생성합니다.

규칙:
- 오직 JSON 하나만 출력합니다. 설명/마크다운/코드블록 금지.
- 스키마 키와 타입을 정확히 준수합니다.
- 모든 키를 반드시 포함하세요. 값이 없으면 빈 문자열("") 또는 빈 배열([])로 채웁니다.
- integrity_score는 0~10의 정수로 제공합니다.
- 주간 리포트에 사용되는 단어나 어휘들은 누구나 이해할 수 있을 만큼 쉽게 작성합니다.

데이터 규칙:
- by_day 배열은 주어진 날짜 범위의 모든 날짜를 포함해야 합니다 (7일).
- 각 날짜별로 daily-feedback 데이터가 없는 경우에도 해당 날짜의 기본 구조를 유지하되, 적절한 기본값을 사용하세요.
- top_keywords: 전체 주간에서 가장 많이 등장한 키워드 상위 10개 이하
- repeated_themes: 주간 동안 반복적으로 나타난 주제나 패턴
- emotion_trend: 주간의 감정 변화 추이를 시간순으로 배열
- growth_points_top3, adjustment_points_top3: 각각 정확히 3개 항목
- core_insights: 핵심 인사이트 배열 (5개 이하 권장)
- meta_questions_highlight: 메타 질문들 중 하이라이트 (3개 이하 권장)
- vision_keywords_trend: 시각화 키워드가 등장한 날짜 수를 집계
- positives_top3, improvements_top3: 각각 정확히 3개 항목
- call_to_action: 다음 주를 위한 실행 가능한 액션 아이템 (3-5개)

스키마(반드시 준수):
{
  "weekly_feedback": {
    "title": "string",
    "week_range": {
      "start": "YYYY-MM-DD",
      "end": "YYYY-MM-DD",
      "timezone": "Asia/Seoul"
    },
    "by_day": [
      {
        "date": "YYYY-MM-DD",
        "weekday": "Mon|Tue|Wed|Thu|Fri|Sat|Sun",
        "one_liner": "string",
        "key_mood": "string",
        "keywords": ["string"],
        "integrity_score": 0-10
      }
    ],
    "weekly_overview": {
      "narrative": "string",
      "top_keywords": ["string"],
      "repeated_themes": ["string"],
      "emotion_trend": ["string"],
      "integrity": {
        "average": 0-10
      },
      "ai_overall_comment": "string",
      "next_week_focus": "string"
    },
    "growth_trends": {
      "growth_points_top3": ["string", "string", "string"],
      "adjustment_points_top3": ["string", "string", "string"],
      "integrity_score": {
        "avg": 0-10,
        "min": 0-10,
        "max": 0-10,
        "stddev_est": 0+
      }
    },
    "insight_replay": {
      "core_insights": ["string"],
      "meta_questions_highlight": ["string"],
      "repeated_themes": [
        {
          "theme": "string",
          "count": 0+
        }
      ]
    },
    "vision_visualization_report": {
      "vision_summary": "string",
      "vision_keywords_trend": [
        {
          "keyword": "string",
          "days": 0+
        }
      ],
      "alignment_comment": "string",
      "reminder_sentences_featured": ["string"]
    },
    "execution_reflection": {
      "positives_top3": ["string", "string", "string"],
      "improvements_top3": ["string", "string", "string"],
      "ai_feedback_summary": "string"
    },
    "closing_section": {
      "weekly_one_liner": "string",
      "next_week_objective": "string",
      "call_to_action": ["string"]
    }
  }
}
`;
