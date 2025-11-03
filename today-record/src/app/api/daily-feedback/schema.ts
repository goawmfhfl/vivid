export const DailyFeedbackSchema = {
  name: "DailyReportResponse",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      // Header
      date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
      day_of_week: { type: "string" },
      integrity_score: { type: "integer", minimum: 0, maximum: 10 },
      narrative_summary: { type: "string" },
      emotion_curve: { type: "array", items: { type: "string" }, minItems: 0 },

      // Section 1: Daily Summary
      narrative: { type: "string" },
      lesson: { type: "string" },
      keywords: { type: "array", items: { type: "string" }, minItems: 0 },
      daily_ai_comment: { type: "string" },

      // Section 2: Visualization Review
      vision_summary: { type: "string" },
      vision_self: { type: "string" },
      vision_keywords: {
        type: "array",
        items: { type: "string" },
        minItems: 0,
      },
      reminder_sentence: { type: "string" },
      vision_ai_feedback: { type: "string" },

      // Section 3: Insight Analysis
      core_insight: { type: "string" },
      learning_source: { type: "string" },
      meta_question: { type: "string" },
      insight_ai_comment: { type: "string" },

      // Section 4: Feedback Review
      core_feedback: { type: "string" },
      positives: { type: "array", items: { type: "string" }, minItems: 0 },
      improvements: { type: "array", items: { type: "string" }, minItems: 0 },
      feedback_ai_comment: { type: "string" },

      // Section 5: Final Message
      ai_message: { type: "string" },
      growth_point: { type: "string" },
      adjustment_point: { type: "string" },
      tomorrow_focus: { type: "string" },
      integrity_reason: { type: "string" },
    },
    required: [
      // Header
      "date",
      "day_of_week",
      "integrity_score",
      "narrative_summary",
      "emotion_curve",

      // Section 1
      "narrative",
      "lesson",
      "keywords",
      "daily_ai_comment",

      // Section 2
      "vision_summary",
      "vision_self",
      "vision_keywords",
      "reminder_sentence",
      "vision_ai_feedback",

      // Section 3
      "core_insight",
      "learning_source",
      "meta_question",
      "insight_ai_comment",

      // Section 4
      "core_feedback",
      "positives",
      "improvements",
      "feedback_ai_comment",

      // Section 5
      "ai_message",
      "growth_point",
      "adjustment_point",
      "tomorrow_focus",
      "integrity_reason",
    ],
  },
  strict: true,
} as const;

export const SYSTEM_PROMPT = `
당신은 사용자의 하루 기록(저널/투두/운동/노트 등)을 분석해, 아래 스키마에 맞춘 일일 리포트를 생성합니다.

규칙:
- 오직 JSON 하나만 출력합니다. 설명/마크다운/코드블록 금지.
- 스키마 키와 타입을 정확히 준수합니다.
- 모든 키를 반드시 포함하세요. 값이 없으면 빈 문자열("") 또는 빈 배열([])로 채웁니다.
- integrity_score는 0~10의 정수로 제공합니다.

스키마(반드시 준수):
{
  "date": "YYYY-MM-DD",
  "day_of_week": "월요일",
  "integrity_score": 7,
  "narrative_summary": "string",
  "emotion_curve": ["string", ...],

  "narrative": "string",
  "lesson": "string",
  "keywords": ["string", ...],
  "daily_ai_comment": "string",

  "vision_summary": "string",
  "vision_self": "string",
  "vision_keywords": ["string", ...],
  "reminder_sentence": "string",
  "vision_ai_feedback": "string",

  "core_insight": "string",
  "learning_source": "string",
  "meta_question": "string",
  "insight_ai_comment": "string",

  "core_feedback": "string",
  "positives": ["string", ...],
  "improvements": ["string", ...],
  "feedback_ai_comment": "string",

  "ai_message": "string",
  "growth_point": "string",
  "adjustment_point": "string",
  "tomorrow_focus": "string",
  "integrity_reason": "string"
}
`;
