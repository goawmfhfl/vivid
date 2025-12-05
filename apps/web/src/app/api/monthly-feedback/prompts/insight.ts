import type { WeeklyFeedback } from "@/types/weekly-feedback";

/**
 * Insight Report용 프롬프트 생성
 */
export function buildInsightReportPrompt(
  weeklyFeedbacks: WeeklyFeedback[],
  month: string,
  dateRange: { start_date: string; end_date: string }
): string {
  const [year, monthNum] = month.split("-");
  const monthLabel = `${year}년 ${monthNum}월`;

  let prompt = `아래는 ${monthLabel} (${dateRange.start_date} ~ ${dateRange.end_date}) 한 달간의 주간 피드백의 인사이트 데이터입니다. 
주간 insight_report들을 종합하여 월간 인사이트 리포트(insight_report)를 생성하여 JSON만 출력하세요.\n\n`;

  weeklyFeedbacks.forEach((wf, idx) => {
    prompt += `[주간 피드백 ${idx + 1} - ${wf.week_range.start} ~ ${
      wf.week_range.end
    }]\n`;

    const ir = wf.insight_report;
    if (ir) {
      if (ir.core_insights.length > 0) {
        prompt += `핵심 인사이트: ${ir.core_insights.join(", ")}\n`;
      }
      if (ir.meta_questions_highlight.length > 0) {
        prompt += `메타 질문 하이라이트: ${ir.meta_questions_highlight.join(
          ", "
        )}\n`;
      }
      if (ir.repeated_themes.length > 0) {
        prompt += `반복 테마: ${ir.repeated_themes
          .map((t) => `${t.theme} (${t.count}회)`)
          .join(", ")}\n`;
      }
      if (ir.insight_patterns?.summary) {
        prompt += `인사이트 패턴 요약: ${ir.insight_patterns.summary}\n`;
      }
      if (ir.insight_patterns?.insight_categories.length > 0) {
        prompt += `인사이트 카테고리: ${ir.insight_patterns.insight_categories
          .map((c) => `${c.category} (${c.count}회)`)
          .join(", ")}\n`;
      }
      if (ir.meta_questions_analysis?.summary) {
        prompt += `메타 질문 분석: ${ir.meta_questions_analysis.summary}\n`;
      }
      if (ir.ai_comment_patterns?.summary) {
        prompt += `AI 코멘트 패턴: ${ir.ai_comment_patterns.summary}\n`;
      }
      if (ir.insight_action_alignment?.summary) {
        prompt += `인사이트-행동 정렬: ${ir.insight_action_alignment.summary}\n`;
      }
      if (ir.growth_insights?.key_learnings.length > 0) {
        prompt += `핵심 학습: ${ir.growth_insights.key_learnings
          .map((l) => l.learning)
          .join(", ")}\n`;
      }
    }

    prompt += `\n`;
  });

  prompt += `\n위 주간 인사이트 리포트들을 종합하여 월간 인사이트 리포트(insight_report)를 생성하세요.
- insight_days_count, insight_records_count: 인사이트가 있었던 날짜 수/문장 수 계산
- top_insights: 가장 중요하거나 자주 등장한 인사이트를 최대 20개까지 뽑기 (summary, first_date, last_date, frequency 포함)
- core_insights: 이번 달의 핵심 인사이트를 최대 3개까지 선별 (summary, explanation 포함)
- insight_ai_comment: 이 달의 인사이트를 기반으로, 사용자가 어떻게 성장하고 있는지 친절하게 정리 (200자 이내)
- insight_comprehensive_summary: 모든 인사이트를 종합하여 분석한 종합적인 인사이트 제공 (400자 이내)`;

  return prompt;
}
