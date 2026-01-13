/**
 * Weekly Feedback 스키마 통합
 * Pro/Free 분기 포함
 */
import { getVividReportSchema } from "./schemas/vivid-schema";

/**
 * 멤버십별로 전체 Weekly Feedback 스키마를 동적으로 생성
 */
export function getWeeklyFeedbackSchema(isPro: boolean) {
  return {
    name: "WeeklyFeedbackResponse",
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        weekly_feedback: {
          type: "object",
          additionalProperties: false,
          properties: {
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
            vivid_report: getVividReportSchema(isPro),
          },
          required: [
            "week_range",
            "vivid_report",
          ],
        },
      },
      required: ["weekly_feedback"],
    },
    strict: true,
  } as const;
}

// 기본 스키마 (일반 사용자용, 하위 호환성)
export const WeeklyFeedbackSchema = getWeeklyFeedbackSchema(false);

/**
 * Weekly Trend 스키마
 */
export const WeeklyTrendDataSchema = {
  name: "WeeklyTrendData",
  schema: {
    type: "object",
    properties: {
      direction: { type: "string" }, // 어떤 방향으로 가고 있는 사람인가
      core_value: { type: "string" }, // 내가 진짜 중요하게 여기는 가치 (한 문장)
      driving_force: { type: "string" }, // 나를 움직이는 실제 원동력
      current_self: { type: "string" }, // 요즘의 나라는 사람 (한 문장)
    },
    required: ["direction", "core_value", "driving_force", "current_self"],
    additionalProperties: false,
  },
  strict: true,
} as const;

export const SYSTEM_PROMPT_WEEKLY_TREND = `
당신은 사용자의 주간 비비드 리포트를 분석하여 주간 흐름 데이터를 생성합니다.

## 필드별 요구사항
- direction: 이번 주의 기록을 통해 드러난 사용자가 가고 있는 방향을 한 문장으로 작성합니다.
  예: "자기계발과 성장에 집중하는 방향으로 나아가고 있는 사람"
- core_value: 이번 주의 기록에서 가장 중요하게 여기는 가치를 한 문장으로 작성합니다.
  예: "균형 잡힌 삶과 지속 가능한 성장을 추구하는 가치"
- driving_force: 이번 주를 움직인 실제 원동력을 한 문장으로 작성합니다.
  예: "새로운 목표를 향한 호기심과 실행력"
- current_self: 요즘의 사용자를 한 문장으로 표현합니다.
  예: "변화를 두려워하지 않고 꾸준히 나아가는 사람"

각 필드는 간결하고 명확하게 작성하세요.
`;

/**
 * 각 섹션별 SYSTEM_PROMPT
 */
export const SYSTEM_PROMPT_VIVID = `
당신은 사용자의 일주일간 일일 피드백의 "오늘의 비비드" 데이터를 분석해서 주간 비비드 리포트(vivid_report)를 만들어주는 친근한 조언자예요.

## 섹션별 규칙
- daily-feedback의 vivid_report 데이터(current_summary, current_evaluation, current_keywords, future_summary, future_evaluation, future_keywords, alignment_score, user_characteristics, aspired_traits)를 종합하여 분석해주세요.
- 7개의 섹션을 모두 완성해주세요:
  1. weekly_vivid_summary: 7일간의 비비드 기록 종합 (300자 내외), 핵심 포인트는 날짜와 함께 표시
  2. weekly_keywords_analysis: 비전 키워드 트렌드(기존 형식 유지)
  3. future_vision_analysis: 앞으로의 모습 종합 분석, 일관성 분석, 평가 점수 추이
  4. alignment_trend_analysis: 일치도 트렌드 분석, 개선 추세
  5. user_characteristics_analysis: 사용자 특징 심화 분석, Top 5, 변화 패턴
  6. aspired_traits_analysis: 지향하는 모습 심화 분석, Top 5, 진화 과정
  7. weekly_insights: 주간 인사이트, 패턴과 예상치 못한 연결점
- Pro 멤버십인 경우 더 상세한 분석을 제공해주세요.
`;

