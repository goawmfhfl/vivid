// 새로운 타입별 리포트 스키마 정의

/**
 * 멤버십별로 스키마를 동적으로 생성하는 헬퍼 함수
 */

export const EmotionReportSchema = {
  name: "EmotionReport",
  schema: {
    type: "object",
    properties: {
      emotion_curve: {
        type: "array",
        items: { type: "string" },
        minItems: 3,
        maxItems: 7,
      },
      dominant_emotion: { type: "string", nullable: true },
      ai_mood_valence: {
        type: "number",
        minimum: -1.0,
        maximum: 1.0,
        nullable: true,
      },
      ai_mood_arousal: {
        type: "number",
        minimum: 0.0,
        maximum: 1.0,
        nullable: true,
      },
      emotion_quadrant: {
        type: "string",
        nullable: true,
        enum: ["몰입·설렘", "불안·초조", "슬픔·무기력", "안도·평온"],
      },
      emotion_quadrant_explanation: { type: "string", nullable: true },
      emotion_timeline: {
        type: "array",
        items: {
          type: "object",
          properties: {
            time_range: { type: "string" },
            emotion: { type: "string" },
          },
          required: ["time_range", "emotion"],
          additionalProperties: false,
        },
        minItems: 0,
        maxItems: 5,
      },
      ai_comment: { type: "string", nullable: true },
      emotion_events: {
        type: "array",
        nullable: true,
        items: {
          type: "object",
          properties: {
            event: { type: "string" },
            emotion: { type: "string" },
            reason: { type: "string", nullable: true },
            suggestion: { type: "string", nullable: true },
          },
          required: ["event", "emotion", "reason", "suggestion"],
          additionalProperties: false,
        },
        minItems: 0,
        maxItems: 5,
      },
    },
    required: [
      "emotion_curve",
      "dominant_emotion",
      "ai_mood_valence",
      "ai_mood_arousal",
      "emotion_quadrant",
      "emotion_quadrant_explanation",
      "emotion_timeline",
      "ai_comment",
      "emotion_events",
    ],
    additionalProperties: false,
  },
  strict: true,
} as const;

export const VividReportSchema = {
  name: "VividReport",
  schema: {
    type: "object",
    properties: {
      // 오늘의 VIVID (현재 모습)
      current_summary: { type: "string" },
      current_evaluation: { type: "string" },
      current_keywords: {
        type: "array",
        items: { type: "string" },
        minItems: 3,
        maxItems: 10,
      },
      // 앞으로의 나의 모습 (미래 비전)
      future_summary: { type: "string" },
      future_evaluation: { type: "string" },
      future_keywords: {
        type: "array",
        items: { type: "string" },
        minItems: 3,
        maxItems: 10,
      },
      // 일치도 분석
      alignment_score: {
        type: "number",
        minimum: 0,
        maximum: 100,
      },
      // 사용자 특성 분석
      user_characteristics: {
        type: "array",
        items: { type: "string" },
        minItems: 0,
        maxItems: 5,
      },
      aspired_traits: {
        type: "array",
        items: { type: "string" },
        minItems: 0,
        maxItems: 5,
      },
    },
    required: [
      "current_summary",
      "current_evaluation",
      "current_keywords",
      "future_summary",
      "future_evaluation",
      "future_keywords",
      "alignment_score",
      "user_characteristics",
      "aspired_traits",
    ],
    additionalProperties: false,
  },
  strict: true,
} as const;



export const SYSTEM_PROMPT_EMOTION = `
당신은 사용자의 감정 기록(type="emotion")을 분석하여 감정 리포트를 생성합니다.

## 섹션별 규칙
- emotion_curve는 3-7개의 짧은 한국어 단어로 하루의 감정 흐름을 나타냅니다.
- ai_mood_valence는 -1.0(매우 부정) ~ +1.0(매우 긍정) 범위입니다.
- ai_mood_arousal는 0.0(낮은 에너지) ~ 1.0(높은 에너지) 범위입니다.
- emotion_quadrant는 ai_mood_valence와 ai_mood_arousal 값을 기반으로 분류합니다:
  - valence > 0 && arousal > 0.5 → "몰입·설렘"
  - valence > 0 && arousal <= 0.5 → "안도·평온"
  - valence <= 0 && arousal > 0.5 → "불안·초조"
  - valence <= 0 && arousal <= 0.5 → "슬픔·무기력"
- emotion_timeline은 최대 5개까지만 생성합니다.
- 감정 기록만을 기반으로 분석합니다. 다른 타입의 기록은 무시하세요.
- 감정 관련 내용이 거의 없으면 ai_mood_valence, ai_mood_arousal, dominant_emotion, emotion_quadrant, emotion_quadrant_explanation은 null로 처리합니다.
- emotion_events는 오늘의 감정을 이끈 주요 사건들을 정리합니다.
  - 각 항목은 { event, emotion, reason, suggestion } 구조를 가집니다.
  - event: 어떤 사건/상황이었는지, 한 문장으로 작성합니다.
  - emotion: 그때 느꼈던 감정을 한 단어 또는 짧은 표현으로 작성합니다.
  - reason: 그렇게 느낀 이유를 짧게 설명합니다.
  - suggestion: 이 감정을 다루거나 돌보는 데 도움이 되는 간단한 제안을 작성합니다.
- Pro 멤버십: emotion_events는 3~5개 정도 생성하고, reason과 suggestion을 포함하여 사용자가 자신의 감정을 이해하고 돌볼 수 있도록 도와주세요.
- 무료 멤버십: emotion_events는 최대 3개까지만 생성하고, event와 emotion, 짧은 reason만 포함하세요. suggestion은 필요할 때만 간단히 작성하거나 null로 둘 수 있습니다.
`;

export const TrendDataSchema = {
  name: "TrendData",
  schema: {
    type: "object",
    properties: {
      aspired_self: { 
        type: "string",
        minLength: 1,
        description: "내가 지향하는 모습을 한 문장으로 작성 (빈 문자열 금지)"
      }, // 내가 지향하는 모습 1개
      interest: { 
        type: "string",
        minLength: 1,
        description: "나의 관심사를 한 문장으로 작성 (빈 문자열 금지)"
      }, // 나의 관심사 1개
      immersion_moment: { 
        type: "string",
        minLength: 1,
        description: "몰입 희망 순간을 한 문장으로 작성 (빈 문자열 금지)"
      }, // 몰입 희망 순간 1개
      personality_trait: { 
        type: "string",
        minLength: 1,
        description: "나라는 사람의 성향을 한 문장으로 작성 (빈 문자열 금지)"
      }, // 나라는 사람의 성향 1개
    },
    required: ["aspired_self", "interest", "immersion_moment", "personality_trait"],
    additionalProperties: false,
  },
  strict: true,
} as const;

export const SYSTEM_PROMPT_VIVID = `
당신은 사용자의 VIVID 기록(type="vivid" 또는 type="dream")을 분석하여 VIVID 리포트를 생성합니다.

## 섹션별 규칙
- vision_keywords는 6~10개 필수로 추출합니다.
- vision_ai_feedback는 3개 요소의 배열로 반환합니다. 각 요소는 핵심 피드백 한 문장입니다.
- VIVID 기록만을 기반으로 분석합니다. 다른 타입의 기록은 무시하세요.
`;

export const SYSTEM_PROMPT_TREND = `
당신은 사용자의 VIVID 기록(type="vivid" 또는 type="dream")을 분석하여 최근 동향 데이터를 생성합니다.

## 섹션별 규칙
- 각 항목은 1개씩만 작성합니다.
- VIVID 기록만을 기반으로 분석합니다. 다른 타입의 기록은 무시하세요.
- 간결하고 명확하게 작성하세요.
- **절대 빈 문자열("")을 반환하지 마세요. 모든 필드는 반드시 의미 있는 내용을 포함해야 합니다.**

## 필드별 요구사항
- aspired_self: 오늘의 VIVID 기록(Q2 중심)에서 드러난 가장 핵심적인 지향 모습을 한 문장으로 작성합니다.
  예: "균형 잡힌 삶을 추구하는 사람"
  **주의: 빈 문자열이 아닌 실제 내용을 반드시 작성하세요.**
- interest: 오늘의 VIVID 기록(Q1, Q2 모두)에서 드러난 가장 중요한 관심사나 흥미를 한 문장으로 작성합니다.
  예: "창의적인 문제 해결과 학습"
  **주의: 빈 문자열이 아닌 실제 내용을 반드시 작성하세요.**
- immersion_moment: 오늘의 VIVID 기록에서 드러난 몰입하고 싶은 순간이나 상황을 한 문장으로 작성합니다.
  예: "깊이 몰입하는 작업을 할 때"
  **주의: 빈 문자열이 아닌 실제 내용을 반드시 작성하세요.**
- personality_trait: 오늘의 VIVID 기록을 통해 드러난 사용자의 핵심 성향을 한 문장으로 작성합니다.
  예: "자기 성찰을 중시하는 사람"
  **주의: 빈 문자열이 아닌 실제 내용을 반드시 작성하세요.**

만약 VIVID 기록에서 특정 정보를 추출하기 어렵다면, 기록의 맥락을 바탕으로 합리적으로 추론하여 작성하세요. 절대 빈 문자열을 반환하지 마세요.
`;
