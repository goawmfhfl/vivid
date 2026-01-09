import type { DailyFeedbackForMonthly } from "../types";

/**
 * Insight Report용 프롬프트 생성
 */
export function buildInsightReportPrompt(
  dailyFeedbacks: DailyFeedbackForMonthly[],
  month: string,
  dateRange: { start_date: string; end_date: string }
): string {
  const [year, monthNum] = month.split("-");
  const monthLabel = `${year}년 ${monthNum}월`;

  let prompt = `아래는 ${monthLabel} (${dateRange.start_date} ~ ${dateRange.end_date}) 한 달간의 일일 피드백의 비비드 데이터입니다. 
일일 vivid_report들을 종합하여 월간 인사이트 리포트(insight_report)를 생성하여 JSON만 출력하세요.\n\n`;

  dailyFeedbacks.forEach((df, idx) => {
    prompt += `[일일 피드백 ${idx + 1} - ${df.report_date}]\n`;

    // vivid_report 데이터 사용 (insight_report 대신)
    if (df.vivid_report) {
      const vivid = df.vivid_report;
      if (vivid.current_summary) {
        prompt += `오늘의 비비드 요약: ${vivid.current_summary}\n`;
      }
      if (vivid.future_summary) {
        prompt += `기대하는 모습 요약: ${vivid.future_summary}\n`;
      }
      if (
        Array.isArray(vivid.current_keywords) &&
        vivid.current_keywords.length > 0
      ) {
        prompt += `오늘의 비비드 키워드: ${vivid.current_keywords.join(", ")}\n`;
      }
      if (
        Array.isArray(vivid.future_keywords) &&
        vivid.future_keywords.length > 0
      ) {
        prompt += `기대하는 모습 키워드: ${vivid.future_keywords.join(", ")}\n`;
      }
      if (
        Array.isArray(vivid.user_characteristics) &&
        vivid.user_characteristics.length > 0
      ) {
        prompt += `사용자 특성: ${vivid.user_characteristics.join(", ")}\n`;
      }
      if (
        Array.isArray(vivid.aspired_traits) &&
        vivid.aspired_traits.length > 0
      ) {
        prompt += `지향하는 모습: ${vivid.aspired_traits.join(", ")}\n`;
      }
    }

    prompt += `\n`;
  });

  prompt += `\n위 일일 인사이트 리포트들을 종합하여 월간 인사이트 리포트(insight_report)를 생성하세요.
- insight_days_count, insight_records_count: 인사이트가 있었던 날짜 수/문장 수 계산
- top_insights: 가장 중요하거나 자주 등장한 인사이트를 최대 20개까지 뽑기 (summary, first_date, last_date, frequency 포함)
- core_insights: 이번 달의 핵심 인사이트를 최대 5개까지 선별 (summary, explanation, frequency 포함). frequency는 해당 인사이트가 등장한 횟수입니다.
- insight_comprehensive_summary: 모든 인사이트를 종합하여 분석한 종합적인 인사이트 제공 (400자 이내)
- insight_inspiration: 인사이트를 종합적으로 분석했을 때 특별한 영감이나 패턴이 감지되었다면, "이런 아이디어는 어때요?"라는 섹션을 생성하세요. has_inspiration이 true인 경우에만 ideas(최대 5개)와 explanation을 제공하고, 그렇지 않으면 null로 설정하세요.`;

  return prompt;
}
