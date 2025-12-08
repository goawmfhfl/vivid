import type { DailyFeedbackRow } from "@/types/daily-feedback";

/**
 * Insight Report용 프롬프트 생성
 */
export function buildInsightReportPrompt(
  dailyFeedbacks: DailyFeedbackRow[],
  month: string,
  dateRange: { start_date: string; end_date: string }
): string {
  const [year, monthNum] = month.split("-");
  const monthLabel = `${year}년 ${monthNum}월`;

  let prompt = `아래는 ${monthLabel} (${dateRange.start_date} ~ ${dateRange.end_date}) 한 달간의 일일 피드백의 인사이트 데이터입니다. 
일일 insight_report들을 종합하여 월간 인사이트 리포트(insight_report)를 생성하여 JSON만 출력하세요.\n\n`;

  dailyFeedbacks.forEach((df, idx) => {
    prompt += `[일일 피드백 ${idx + 1} - ${df.report_date}]\n`;

    const ir = df.insight_report;
    if (ir) {
      if (Array.isArray(ir.core_insights) && ir.core_insights.length > 0) {
        prompt += `핵심 인사이트: ${ir.core_insights
          .map((i) => `${i.insight} (출처: ${i.source})`)
          .join(", ")}\n`;
      }
      if (ir.meta_question) {
        prompt += `메타 질문: ${ir.meta_question}\n`;
      }
      if (ir.insight_ai_comment) {
        prompt += `AI 코멘트: ${ir.insight_ai_comment}\n`;
      }
      // Pro 전용 필드
      if (
        Array.isArray(ir.insight_next_actions) &&
        ir.insight_next_actions.length > 0
      ) {
        prompt += `추천 행동: ${ir.insight_next_actions
          .map((a) => `${a.label} (난이도: ${a.difficulty})`)
          .join(", ")}\n`;
      }
    }

    prompt += `\n`;
  });

  prompt += `\n위 일일 인사이트 리포트들을 종합하여 월간 인사이트 리포트(insight_report)를 생성하세요.
- insight_days_count, insight_records_count: 인사이트가 있었던 날짜 수/문장 수 계산
- top_insights: 가장 중요하거나 자주 등장한 인사이트를 최대 20개까지 뽑기 (summary, first_date, last_date, frequency 포함)
- core_insights: 이번 달의 핵심 인사이트를 최대 3개까지 선별 (summary, explanation 포함)
- insight_ai_comment: 이 달의 인사이트를 기반으로, 사용자가 어떻게 성장하고 있는지 친절하게 정리 (200자 이내)
- insight_comprehensive_summary: 모든 인사이트를 종합하여 분석한 종합적인 인사이트 제공 (400자 이내)`;

  return prompt;
}
