// 새로운 타입별 리포트 스키마 정의

/**
 * 멤버십별로 스키마를 동적으로 생성하는 헬퍼 함수
 */

export const DailyVividReportSchema = {
  name: "DailyVividReport",
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
      alignment_analysis_points: {
        type: "array",
        items: { type: "string" },
        minItems: 1,
        maxItems: 3,
        description: "비전 일치도 점수의 핵심 근거 3가지",
      },
      alignment_based_on_persona: {
        type: "boolean",
        description: "일치도가 user_persona의 지향하는 자아(ideal_self)를 기준으로 산정되었으면 true, Q2만 기준이면 false",
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
      "alignment_analysis_points",
      "user_characteristics",
      "aspired_traits",
    ],
    additionalProperties: false,
  },
  strict: true,
} as const;



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

/** 회고 전용 리포트 스키마 (오늘의 VIVID/앞으로의 나/일치도 제외) */
export const ReviewReportSchema = {
  name: "ReviewReport",
  schema: {
    type: "object",
    properties: {
      retrospective_summary: { type: "string" },
      retrospective_evaluation: { type: "string" },
      execution_score: { type: "number", minimum: 0, maximum: 100 },
      execution_analysis_points: {
        type: "array",
        items: { type: "string" },
      },
      completed_todos: { type: "array", items: { type: "string" } },
      uncompleted_todos: { type: "array", items: { type: "string" } },
      todo_feedback: { type: "array", items: { type: "string" } },
      daily_summary: { type: "string" },
      suggested_todos_for_tomorrow: {
        type: "object",
        properties: {
          reason: { type: "string" },
          items: { type: "array", items: { type: "string" } },
        },
        required: ["reason", "items"],
      },
    },
    required: [
      "retrospective_summary",
      "retrospective_evaluation",
      "execution_score",
      "execution_analysis_points",
      "completed_todos",
      "uncompleted_todos",
      "todo_feedback",
      "daily_summary",
    ],
    additionalProperties: false,
  },
  strict: true,
} as const;

export const SYSTEM_PROMPT_REVIEW = `
당신은 사용자의 회고 기록(Q3)과 투두 체크 현황을 분석하여 회고 전용 리포트를 생성합니다.
오늘의 VIVID(Q1), 앞으로의 나(Q2), 일치도 분석은 제외하고, Q3와 투두 실행 현황만을 기반으로 작성합니다.
`;

export const IntegratedDailyVividSchema = {
  name: "IntegratedDailyVividReport",
  schema: {
    type: "object",
    properties: {
      report: DailyVividReportSchema.schema,
      trend: TrendDataSchema.schema,
    },
    required: ["report", "trend"],
    additionalProperties: false,
  },
  strict: true,
} as const;

export const SYSTEM_PROMPT_REPORT = `
당신은 사용자의 VIVID 기록(type="vivid" 또는 type="dream")과 회고 기록(type="review")을 분석하여 통합 리포트를 생성합니다.

## 섹션별 규칙
- vision_keywords는 6~10개 필수로 추출합니다.
- vision_ai_feedback는 3개 요소의 배열로 반환합니다. 각 요소는 핵심 피드백 한 문장입니다.
- VIVID 기록(Q1, Q2)은 비전 분석에 사용합니다.
- 회고(retrospective)·실행력(execution) 관련 필드는 vivid에서 생성하지 않습니다. (review 전용)
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

export const SYSTEM_PROMPT_INTEGRATED = `
당신은 사용자의 VIVID 기록(type="vivid" 또는 type="dream")과 회고 기록(type="review")을 분석하여 통합 리포트와 최근 동향 데이터를 한 번에 생성합니다.
응답은 'report' 객체와 'trend' 객체를 모두 포함해야 합니다.

## 공통 규칙
- VIVID 기록(Q1, Q2)은 비전 분석에 사용합니다.
- 회고(retrospective)·실행력(execution) 관련 필드는 vivid에서 생성하지 않습니다. (review 전용)

## 1. Report 섹션 규칙
- vision_keywords는 6~10개 필수로 추출합니다.
- vision_ai_feedback는 3개 요소의 배열로 반환합니다. 각 요소는 핵심 피드백 한 문장입니다.

## 2. Trend 섹션 규칙
- 각 항목은 1개씩만 작성합니다.
- 간결하고 명확하게 작성하세요.
- **절대 빈 문자열("")을 반환하지 마세요. 모든 필드는 반드시 의미 있는 내용을 포함해야 합니다.**

### Trend 필드별 요구사항
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
