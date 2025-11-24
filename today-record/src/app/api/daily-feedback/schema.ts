export const RecordCategorizationSchema = {
  name: "RecordCategorization",
  schema: {
    type: "object",
    properties: {
      insights: { type: "array", items: { type: "string" } },
      feedbacks: { type: "array", items: { type: "string" } },
      visualizings: { type: "array", items: { type: "string" } },
      emotions: { type: "array", items: { type: "string" } },
    },
    required: ["insights", "feedbacks", "visualizings", "emotions"],
    additionalProperties: false,
  },
  strict: true,
} as const;

export const SYSTEM_PROMPT_CATEGORIZATION = `
당신은 사용자의 하루 기록을 분석하여 아래 네 가지 카테고리로 분류합니다:

- insights: 통찰, 깨달음, 학습, 의미를 담은 문장

- feedbacks: 자기 피드백, 반성, 조정 포인트

- visualizings: 목표, 꿈, 상상, 계획, 시각화된 다짐

- emotions: 감정의 변화, 기분, 감정 상태, 스트레스, 몰입도, 감정적 반응을 나타내는 문장

규칙:

- 각 레코드는 문맥에 따라 중복 포함 가능하나, 가장 적합한 카테고리에만 포함하세요.

- 각 배열은 string 배열로 출력합니다.

- 입력한 기록 중에서 해당 카테고리와 관련이 없는 내용일 경우, 해당 카테고리는 빈 문자열로 처리하세요.
  * insights와 관련이 없는 내용이면 insights는 빈 문자열로 처리하세요.
  * feedbacks와 관련이 없는 내용이면 feedbacks는 빈 문자열로 처리하세요.
  * visualizings와 관련이 없는 내용이면 visualizings는 빈 문자열로 처리하세요.
  * emotions와 관련이 없는 내용이면 emotions는 빈 문자열로 처리하세요.

- 오직 JSON 하나만 출력하세요. 마크다운/설명 금지.
`;

export const DailyReportSchema = {
  name: "DailyReportResponse",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      // 기본 정보
      date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
      day_of_week: { type: "string" },
      integrity_score: { type: "integer", minimum: 0, maximum: 10 },

      // emotion_overview 섹션
      emotion_overview: {
        type: "object",
        properties: {
          ai_mood_valence: { type: "number", nullable: true },
          ai_mood_arousal: { type: "number", nullable: true },
          emotion_curve: {
            type: "array",
            items: { type: "string" },
            minItems: 0,
          },
          dominant_emotion: { type: "string", nullable: true },
        },
        required: [
          "ai_mood_valence",
          "ai_mood_arousal",
          "emotion_curve",
          "dominant_emotion",
        ],
        additionalProperties: false,
      },

      // narrative_overview 섹션
      narrative_overview: {
        type: "object",
        properties: {
          narrative_summary: { type: "string" },
          narrative: { type: "string" },
          lesson: { type: "string", nullable: true },
          keywords: { type: "array", items: { type: "string" }, minItems: 0 },
        },
        required: ["narrative_summary", "narrative", "lesson", "keywords"],
        additionalProperties: false,
      },

      // insight_overview 섹션
      insight_overview: {
        type: "object",
        properties: {
          core_insight: { type: "string" },
          learning_source: { type: "string", nullable: true },
          meta_question: { type: "string", nullable: true },
          insight_ai_comment: { type: "string", nullable: true },
        },
        required: [
          "core_insight",
          "learning_source",
          "meta_question",
          "insight_ai_comment",
        ],
        additionalProperties: false,
      },

      // vision_overview 섹션
      vision_overview: {
        type: "object",
        properties: {
          vision_summary: { type: "string" },
          vision_self: { type: "string" },
          vision_keywords: {
            type: "array",
            items: { type: "string" },
            minItems: 0,
          },
          reminder_sentence: { type: "string", nullable: true },
          vision_ai_feedback: { type: "string", nullable: true },
        },
        required: [
          "vision_summary",
          "vision_self",
          "vision_keywords",
          "reminder_sentence",
          "vision_ai_feedback",
        ],
        additionalProperties: false,
      },

      // feedback_overview 섹션
      feedback_overview: {
        type: "object",
        properties: {
          core_feedback: { type: "string" },
          positives: { type: "array", items: { type: "string" }, minItems: 0 },
          improvements: {
            type: "array",
            items: { type: "string" },
            minItems: 0,
          },
          feedback_ai_comment: { type: "string", nullable: true },
          ai_message: { type: "string", nullable: true },
        },
        required: [
          "core_feedback",
          "positives",
          "improvements",
          "feedback_ai_comment",
          "ai_message",
        ],
        additionalProperties: false,
      },

      // meta_overview 섹션
      meta_overview: {
        type: "object",
        properties: {
          growth_point: { type: "string", nullable: true },
          adjustment_point: { type: "string", nullable: true },
          tomorrow_focus: { type: "string", nullable: true },
          integrity_reason: { type: "string", nullable: true },
        },
        required: [
          "growth_point",
          "adjustment_point",
          "tomorrow_focus",
          "integrity_reason",
        ],
        additionalProperties: false,
      },
    },
    required: [
      "date",
      "day_of_week",
      "integrity_score",
      "emotion_overview",
      "narrative_overview",
      "insight_overview",
      "vision_overview",
      "feedback_overview",
      "meta_overview",
    ],
  },
  strict: true,
} as const;

export const SYSTEM_PROMPT = `
당신은 사용자의 하루 기록(저널/투두/운동/노트 등)을 분석해, 아래 스키마에 맞춘 일일 리포트를 생성합니다.

규칙:
- 오직 JSON 하나만 출력합니다. 설명/마크다운/코드블록 금지.
- 스키마 키와 타입을 정확히 준수합니다.
- 모든 키를 반드시 포함하세요. 값이 없으면 null, 빈 문자열("") 또는 빈 배열([])로 채웁니다.
- integrity_score는 0~10의 정수로 제공합니다.
- 일일 리포트에 사용되는 단어나 어휘들은 누구나 이해할 수 있을 만큼 쉽게 작성합니다.

--------------------------------
[섹션별 공통 처리 규칙]

카테고리화된 데이터를 확인하여, 특정 카테고리가 빈 배열([])로 전달된 경우 해당 섹션의 모든 필드를 빈 값으로 처리하세요. 
추론으로 억지로 내용을 채우지 마세요.

1. 시각화 섹션 (vision_overview): 
   - 카테고리화된 데이터에서 "시각화 기록" 섹션이 없거나 빈 배열([])인 경우:
     - vision_summary, vision_self는 ""(빈 문자열)로 처리합니다.
     - vision_keywords는 []로 처리합니다.
     - reminder_sentence, vision_ai_feedback은 null로 처리합니다.
   - 이 경우 시각화 관련 내용을 생성하거나 추론하지 마세요.

2. 인사이트 섹션 (insight_overview):
   - 카테고리화된 데이터에서 "인사이트 기록" 섹션이 없거나 빈 배열([])인 경우:
     - core_insight는 ""(빈 문자열)로 처리합니다.
     - learning_source, meta_question, insight_ai_comment는 null로 처리합니다.
   - 이 경우 인사이트 관련 내용을 생성하거나 추론하지 마세요.

3. 피드백 섹션 (feedback_overview):
   - 카테고리화된 데이터에서 "피드백 기록" 섹션이 없거나 빈 배열([])인 경우:
     - core_feedback는 ""(빈 문자열)로 처리합니다.
     - positives, improvements는 []로 처리합니다.
     - feedback_ai_comment, ai_message는 null로 처리합니다.
   - 이 경우 피드백 관련 내용을 생성하거나 추론하지 마세요.

4. 감정 섹션 (emotion_overview):
   - 감정과 관련된 텍스트(기분, 감정, 상태, 스트레스, 몰입도 등)가 거의 없거나 전혀 드러나지 않는 경우:
     - emotion_curve는 []로 처리합니다.
     - ai_mood_valence, ai_mood_arousal, dominant_emotion는 모두 null로 처리합니다.
     - 이 경우 감정을 추측해서 생성하지 마세요.
   - 감정 관련 내용이 충분히 드러나는 경우, 아래 규칙을 따릅니다.

--------------------------------
[감정 좌표 규칙 - emotion_overview]

emotion_overview는 사용자의 하루 감정을 "숫자로 표현한 공식 언어"입니다.
Circumplex Model of Affect 기반으로 다음 규칙을 따르세요.

1) ai_mood_valence (쾌-불쾌)
- 범위: -1.0 ~ +1.0 (number)
- 의미:
  - -1.0에 가까울수록 강한 부정 감정 (불안, 짜증, 슬픔, 체념 등)
  - 0에 가까울수록 중립
  - +1.0에 가까울수록 강한 긍정 감정 (설렘, 감사, 안도, 자신감 등)
- 예시 매핑:
  - 하루 전반이 불안·압박·짜증 위주 → -0.5 ~ -0.2
  - 크게 좋지도 나쁘지도 않음 → -0.1 ~ +0.1
  - 만족감, 성취감, 감사가 많음 → +0.3 ~ +0.7

2) ai_mood_arousal (각성-에너지)
- 범위: 0.0 ~ 1.0 (number)
- 의미:
  - 0.0에 가까울수록 낮은 에너지 (무기력, 피곤, 평온, 나른함)
  - 1.0에 가까울수록 높은 에너지 (몰입, 긴장, 초조, 흥분)
- 예시 매핑:
  - 하루 종일 늘어지고 쉬는 느낌 → 0.1 ~ 0.3
  - 적당히 바쁘고 활동적 → 0.4 ~ 0.6
  - 일에 치이거나 매우 몰입, 긴장 상태 → 0.7 ~ 0.9

3) emotion_curve
- 하루의 감정 흐름을 순서대로 나타내는 배열입니다.
- 3~7개 사이의 짧은 한국어 단어를 사용하세요. (예: "기대", "집중", "안정", "후회", "성취", "의지")
- 가능한 한 중복 없이 사용합니다.
- 하루의 시작 → 중간 → 끝 순서로 감정 변화를 요약합니다.

4) dominant_emotion
- 그날 하루를 대표하는 감정을 한 단어 또는 짧은 구로 작성합니다.
- emotion_curve에 포함된 단어 중 하나를 선택하거나, 전체 내용을 보고 가장 잘 어울리는 단어를 사용하세요.
- 예: "긴장된 몰입", "편안한 만족", "불안한 압박감", "지친 성취감"


--------------------------------
[데이터 규칙 - 기타 섹션]

- narrative_overview.narrative_summary: 공백 포함 250자로 제한합니다.
- narrative_overview.narrative: 공백 포함 400자로 제한합니다.
- narrative_overview.keywords: 20개 이하로 제한합니다.
- vision_overview.vision_keywords: 10개 이하로 제한합니다.
- meta_overview.tomorrow_focus: 내일 해야 할 리스트를 
  "1)기능 기획서 작성하기, 2)가전 리스트 예산 작성하기, 3)네이처리퍼블릭 샴푸 구매하기"
  형식으로 생성합니다. 숫자)로 시작하고 쉼표로 구분하는 리스트 문자열 형식을 유지하세요.
- vision_overview.vision_ai_feedback: 반드시 
  "핵심 3단: 1) ..., 2) ..., 3) ..." 
  형식의 문자열로 작성합니다. 정확히 3개의 핵심 항목을 포함하고, 각 항목은 실행 가능한 행동 문장으로 간결하게 작성하세요. 관련 내용이 전혀 없다면 null로 둡니다.

--------------------------------
[스키마(반드시 준수)]

{
  "date": "YYYY-MM-DD",
  "day_of_week": "월요일",
  "integrity_score": 7,
  "emotion_overview": {
    "ai_mood_valence": -0.1,
    "ai_mood_arousal": 0.7,
    "emotion_curve": ["불안", "몰입", "안도"],
    "dominant_emotion": "긴장된 몰입"
  },
  "narrative_overview": {
    "narrative_summary": "string",
    "narrative": "string",
    "lesson": "string",
    "keywords": ["string", ...]
  },
  "insight_overview": {
    "core_insight": "string",
    "learning_source": "string",
    "meta_question": "string",
    "insight_ai_comment": "string"
  },
  "vision_overview": {
    "vision_summary": "string",
    "vision_self": "string",
    "vision_keywords": ["string", ...],
    "reminder_sentence": "string",
    "vision_ai_feedback": "string"
  },
  "feedback_overview": {
    "core_feedback": "string",
    "positives": ["string", ...],
    "improvements": ["string", ...],
    "feedback_ai_comment": "string",
    "ai_message": "string"
  },
  "meta_overview": {
    "growth_point": "string",
    "adjustment_point": "string",
    "tomorrow_focus": "string",
    "integrity_reason": "string"
  }
}
`;
