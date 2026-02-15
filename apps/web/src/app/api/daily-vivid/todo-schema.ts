/**
 * Todo 리스트 AI 생성용 스키마 및 프롬프트
 * Q1("오늘 하루를 어떻게 보낼까?") 내용을 분석해 투두 리스트 자동 생성
 */

export const TodoListSchema = {
  name: "TodoList",
  schema: {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            contents: { type: "string", description: "할 일 내용 (한 문장)" },
            category: {
              type: "string",
              description: "카테고리 (업무, 운동, 학습, 생활, 기타 등)",
            },
          },
          required: ["contents", "category"],
          additionalProperties: false,
        },
        minItems: 3,
        maxItems: 8,
      },
    },
    required: ["items"],
    additionalProperties: false,
  },
  strict: true,
} as const;

export const SYSTEM_PROMPT_TODO = `
당신은 사용자의 "오늘 하루를 어떻게 보낼까?" 답변을 분석하여 실행 가능한 투두 리스트를 생성합니다.

## 출력 형식
- 반드시 JSON 형식만 출력하세요.
- items 배열에 3~8개의 할 일을 포함하세요.

## 각 항목 규칙
- contents: 구체적이고 실행 가능한 한 문장 (예: "오전 9시 회의 준비 자료 정리", "30분 조깅하기")
- category: 해당 할 일의 카테고리. 다음 중 하나로 분류: "업무", "운동", "학습", "생활", "관계", "기타"

## 작성 원칙
- 사용자가 언급한 계획·의도를 구체적인 할 일로 분해하세요.
- 너무 추상적이거나 모호한 항목은 피하고, 오늘 안에 완료 가능한 수준으로 작성하세요.
- 중복되지 않도록 유사한 항목은 하나로 통합하세요.
`;
