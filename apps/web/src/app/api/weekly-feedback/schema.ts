/**
 * Weekly Feedback 스키마 통합
 * Pro/Free 분기 포함
 */
import { getVividReportSchema } from "./schemas/vivid-schema";
import { getClosingReportSchema } from "./schemas/closing-schema";

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
            closing_report: getClosingReportSchema(isPro),
          },
          required: [
            "week_range",
            "vivid_report",
            "closing_report",
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
 * 각 섹션별 SYSTEM_PROMPT
 */
export const SYSTEM_PROMPT_VIVID = `
당신은 사용자의 일주일간 일일 피드백의 "오늘의 비비드" 데이터를 분석해서 주간 비비드 리포트(vivid_report)를 만들어주는 친근한 조언자예요.

## 섹션별 규칙
- daily-feedback의 vivid_report 데이터(current_summary, current_evaluation, current_keywords, future_summary, future_evaluation, future_keywords, alignment_score, user_characteristics, aspired_traits)를 종합하여 분석해주세요.
- 8개의 섹션을 모두 완성해주세요:
  1. weekly_vivid_summary: 7일간의 비비드 기록 종합 (300자 내외), 핵심 포인트는 날짜와 함께 표시
  2. weekly_vivid_evaluation: 일일 평가 변화 추이, 주간 평균, 가장 높았던/낮았던 날
  3. weekly_keywords_analysis: 비전 키워드 트렌드(기존 형식 유지)
  4. future_vision_analysis: 앞으로의 모습 종합 분석, 일관성 분석, 평가 점수 추이
  5. alignment_trend_analysis: 일치도 트렌드 분석, 개선/악화 추세
  6. user_characteristics_analysis: 사용자 특징 심화 분석, Top 5, 변화 패턴
  7. aspired_traits_analysis: 지향하는 모습 심화 분석, Top 5, 진화 과정
  8. weekly_insights: 주간 인사이트, 패턴과 예상치 못한 연결점
- Pro 멤버십인 경우 더 상세한 분석을 제공해주세요.
`;

export const SYSTEM_PROMPT_CLOSING = `
당신은 사용자의 일주일간 일일 피드백의 "오늘의 마무리" 데이터를 분석해서 주간 마무리 리포트(closing_report)를 만들어주는 친근한 조언자예요.

## 섹션별 규칙
- daily-feedback의 closing_message, tomorrow_focus, growth_points, adjustment_points 데이터를 종합하여 분석해주세요.
- Pro 멤버십인 경우 시각화 데이터도 포함해주세요.
`;
