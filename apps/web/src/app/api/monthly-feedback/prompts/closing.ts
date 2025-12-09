import type { DailyFeedbackRow } from "@/types/daily-feedback";

/**
 * Closing Report용 프롬프트 생성
 */
export function buildClosingReportPrompt(
  dailyFeedbacks: DailyFeedbackRow[],
  month: string,
  dateRange: { start_date: string; end_date: string }
): string {
  const [year, monthNum] = month.split("-");
  const monthLabel = `${year}년 ${monthNum}월`;

  let prompt = `아래는 ${monthLabel} (${dateRange.start_date} ~ ${dateRange.end_date}) 한 달간의 일일 피드백의 마무리 데이터입니다. 
일일 final_report들을 종합하여 월간 마무리 리포트(closing_report)를 생성하여 JSON만 출력하세요.\n\n`;

  dailyFeedbacks.forEach((df, idx) => {
    prompt += `[일일 피드백 ${idx + 1} - ${df.report_date}]\n`;

    const fr = df.final_report;
    if (fr) {
      if (fr.closing_message) {
        prompt += `마무리 메시지: ${fr.closing_message}\n`;
      }
      // Pro 전용 필드
      if (fr.tomorrow_focus) {
        prompt += `내일 집중점: ${fr.tomorrow_focus}\n`;
      }
      if (Array.isArray(fr.growth_points) && fr.growth_points.length > 0) {
        prompt += `성장 포인트: ${fr.growth_points.join(", ")}\n`;
      }
      if (
        Array.isArray(fr.adjustment_points) &&
        fr.adjustment_points.length > 0
      ) {
        prompt += `조정 포인트: ${fr.adjustment_points.join(", ")}\n`;
      }
    }

    prompt += `\n`;
  });

  prompt += `\n위 일일 마무리 리포트들을 종합하여 월간 마무리 리포트(closing_report)를 생성하세요.
- monthly_title: 이 달을 상징하는 제목을 만들기 (summary_report.summary_title과 다르게, 조금 더 감성적으로 표현)
- monthly_summary: 400자 이내로, 이 달의 결론을 정리 ("무엇을 배웠는지", "어디까지 와 있는지", "어떤 마음으로 다음 달을 맞이하면 좋을지" 포함)
- turning_points: 중요한 전환점/사건을 최대 5개까지 짧게 정리 (실제 기록에 등장한 사건에 기반)
- next_month_focus: "1) ~, 2) ~, 3) ~" 형식으로 작성 (가능한 한 구체적인 행동 중심)
- ai_encouragement_message: 이 달의 데이터를 충분히 인정해주면서, 다음 달을 향한 방향성과 이해를 중심으로 메시지 작성 (직접적인 "응원합니다" 문구는 사용하지 마세요)
- this_month_identity (Pro 전용): 이번 달의 정체성 특성을 레이더 차트로 시각화 (visualization.characteristics_radar.data 포함)`;

  return prompt;
}
