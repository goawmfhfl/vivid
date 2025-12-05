import type { WeeklyFeedback } from "@/types/weekly-feedback";

/**
 * Closing Report용 프롬프트 생성
 */
export function buildClosingReportPrompt(
  weeklyFeedbacks: WeeklyFeedback[],
  month: string,
  dateRange: { start_date: string; end_date: string }
): string {
  const [year, monthNum] = month.split("-");
  const monthLabel = `${year}년 ${monthNum}월`;

  let prompt = `아래는 ${monthLabel} (${dateRange.start_date} ~ ${dateRange.end_date}) 한 달간의 주간 피드백의 마무리 데이터입니다. 
주간 closing_report들을 종합하여 월간 마무리 리포트(closing_report)를 생성하여 JSON만 출력하세요.\n\n`;

  weeklyFeedbacks.forEach((wf, idx) => {
    prompt += `[주간 피드백 ${idx + 1} - ${wf.week_range.start} ~ ${
      wf.week_range.end
    }]\n`;

    const cr = wf.closing_report;
    if (cr) {
      if (cr.call_to_action?.weekly_one_liner) {
        prompt += `주간 한 줄: ${cr.call_to_action.weekly_one_liner}\n`;
      }
      if (cr.call_to_action?.next_week_objective) {
        prompt += `다음 주 목표: ${cr.call_to_action.next_week_objective}\n`;
      }
      if (cr.call_to_action?.actions.length > 0) {
        prompt += `행동 목록: ${cr.call_to_action.actions.join(", ")}\n`;
      }
      if (cr.this_week_identity?.growth_story?.summary) {
        prompt += `성장 이야기: ${cr.this_week_identity.growth_story.summary}\n`;
      }
      if (cr.this_week_identity?.strengths_highlighted?.summary) {
        prompt += `강점 하이라이트: ${cr.this_week_identity.strengths_highlighted.summary}\n`;
      }
      if (cr.this_week_identity?.areas_of_awareness?.summary) {
        prompt += `인식 영역: ${cr.this_week_identity.areas_of_awareness.summary}\n`;
      }
      if (cr.this_week_identity?.identity_evolution?.summary) {
        prompt += `정체성 진화: ${cr.this_week_identity.identity_evolution.summary}\n`;
      }
      if (cr.next_week_identity_intention?.summary) {
        prompt += `다음 주 정체성 의도: ${cr.next_week_identity_intention.summary}\n`;
      }
    }

    prompt += `\n`;
  });

  prompt += `\n위 주간 마무리 리포트들을 종합하여 월간 마무리 리포트(closing_report)를 생성하세요.
- monthly_title: 이 달을 상징하는 제목을 만들기 (summary_report.summary_title과 다르게, 조금 더 감성적으로 표현)
- monthly_summary: 400자 이내로, 이 달의 결론을 정리 ("무엇을 배웠는지", "어디까지 와 있는지", "어떤 마음으로 다음 달을 맞이하면 좋을지" 포함)
- turning_points: 중요한 전환점/사건을 최대 5개까지 짧게 정리 (실제 기록에 등장한 사건에 기반)
- next_month_focus: "1) ~, 2) ~, 3) ~" 형식으로 작성 (가능한 한 구체적인 행동 중심)
- ai_encouragement_message: 이 달의 데이터를 충분히 인정해주면서, 다음 달을 향한 응원과 격려를 중심으로 메시지 작성`;

  return prompt;
}
