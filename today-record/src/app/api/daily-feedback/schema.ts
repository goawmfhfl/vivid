export const RecordCategorizationSchema = {
  name: "RecordCategorization",
  schema: {
    type: "object",
    properties: {
      insights: { type: "array", items: { type: "string" } },
      feedbacks: { type: "array", items: { type: "string" } },
      visualizings: { type: "array", items: { type: "string" } },
    },
    required: ["insights", "feedbacks", "visualizings"],
    additionalProperties: false,
  },
  strict: true,
} as const;

export const SYSTEM_PROMPT_CATEGORIZATION = `
당신은 사용자의 하루 기록을 분석하여 아래 세 가지 카테고리로 분류합니다:

- insights: 통찰, 깨달음, 학습, 의미를 담은 문장

- feedbacks: 자기 피드백, 반성, 조정 포인트

- visualizings: 목표, 꿈, 상상, 계획, 시각화된 다짐

규칙:

- 각 레코드는 문맥에 따라 중복 포함 가능하나, 가장 적합한 카테고리에만 포함하세요.

- 각 배열은 string 배열로 출력합니다.

- 오직 JSON 하나만 출력하세요. 마크다운/설명 금지.
`;

export const DailyReportSchema = {
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

      // 일일 요약 섹션
      narrative: { type: "string" },
      lesson: { type: "string" },
      keywords: { type: "array", items: { type: "string" }, minItems: 0 },
      daily_ai_comment: { type: "string" },

      // 시각화 섹션
      vision_summary: { type: "string" },
      vision_self: { type: "string" },
      vision_keywords: {
        type: "array",
        items: { type: "string" },
        minItems: 0,
      },
      reminder_sentence: { type: "string" },
      vision_ai_feedback: { type: "string" },

      // 인사이트 섹션
      core_insight: { type: "string" },
      learning_source: { type: "string" },
      meta_question: { type: "string" },
      insight_ai_comment: { type: "string" },

      // 피드백 섹션
      core_feedback: { type: "string" },
      positives: { type: "array", items: { type: "string" }, minItems: 0 },
      improvements: { type: "array", items: { type: "string" }, minItems: 0 },
      feedback_ai_comment: { type: "string" },

      // 최종 섹션
      ai_message: { type: "string" },
      growth_point: { type: "string" },
      adjustment_point: { type: "string" },
      tomorrow_focus: { type: "string" },
      integrity_reason: { type: "string" },
    },
    required: [
      // 헤더 섹션
      "date",
      "day_of_week",
      "integrity_score",
      "narrative_summary",
      "emotion_curve",

      // 일일 요약 섹션
      "narrative",
      "lesson",
      "keywords",
      "daily_ai_comment",

      // 시각화 섹션
      "vision_summary",
      "vision_self",
      "vision_keywords",
      "reminder_sentence",
      "vision_ai_feedback",

      // 인사이트 섹션
      "core_insight",
      "learning_source",
      "meta_question",
      "insight_ai_comment",

      // 피드백 세션
      "core_feedback",
      "positives",
      "improvements",
      "feedback_ai_comment",

      // 최종 섹션
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
- 일일 리포트에 사용되는 단어나 어휘들은 누구나 이해할 수 있을 만큼 쉽게 작성합니다.

섹션별 처리 규칙:
1. 시각화 섹션: 오늘 입력한 레코드에서 시각화 관련 내용이 없다면, vision_summary, vision_self, vision_keywords, reminder_sentence, vision_ai_feedback 모두 빈 문자열("") 또는 빈 배열([])로 처리합니다.
2. 인사이트 섹션: 오늘 입력한 레코드에서 인사이트 관련 내용이 없다면, core_insight, learning_source, meta_question, insight_ai_comment 모두 빈 문자열("")로 처리합니다.
3. 피드백 섹션: 오늘 입력한 레코드에서 피드백 관련 내용이 없다면, core_feedback, positives, improvements, feedback_ai_comment 모두 빈 문자열("") 또는 빈 배열([])로 처리합니다.

데이터 규칙:
- narrative_summary: 공백 포함 250자로 제한합니다.
- narrative: 공백 포함 400자로 제한합니다.
- keywords: 20개 이하로 제한합니다.
- vision_keywords: 10개 이하로 제한합니다.
- tomorrow_focus: 내일 해야 할 리스트를 "1)기능 기획서 작성하기, 2)가전 리스트 예산 작성하기, 3)네이처리퍼블릭 샴푸 구매하기" 형식으로 생성합니다. 숫자)로 시작하고 쉼표로 구분하는 리스트 문자열 형식을 유지하세요.
- vision_ai_feedback: 반드시 "핵심 3단: 1) ..., 2) ..., 3) ..." 형식의 문자열로 작성합니다. 정확히 3개의 핵심 항목을 포함하고, 각 항목은 실행 가능한 행동 문장으로 간결하게 작성하세요. 관련 내용이 전혀 없다면 빈 문자열("")로 둡니다.

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
