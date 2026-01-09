import type { DailyFeedbackForMonthly } from "../types";

/**
 * Daily Life Report용 프롬프트 생성
 */
export function buildDailyLifeReportPrompt(
  dailyFeedbacks: DailyFeedbackForMonthly[],
  month: string,
  dateRange: { start_date: string; end_date: string }
): string {
  const [year, monthNum] = month.split("-");
  const monthLabel = `${year}년 ${monthNum}월`;

  let prompt = `아래는 ${monthLabel} (${dateRange.start_date} ~ ${dateRange.end_date}) 한 달간의 일일 피드백의 비비드 데이터입니다. 
일일 vivid_report들을 종합하여 월간 일상 리포트(daily_life_report)를 생성하여 JSON만 출력하세요.\n\n`;

  dailyFeedbacks.forEach((df, idx) => {
    prompt += `[일일 피드백 ${idx + 1} - ${df.report_date}]\n`;

    // vivid_report 데이터 사용
    if (df.vivid_report) {
      const vivid = df.vivid_report;
      if (vivid.current_summary) {
        prompt += `오늘의 비비드 요약: ${vivid.current_summary}\n`;
      }
      if (
        Array.isArray(vivid.current_keywords) &&
        vivid.current_keywords.length > 0
      ) {
        prompt += `오늘의 비비드 키워드: ${vivid.current_keywords.join(", ")}\n`;
      }
      if (vivid.future_summary) {
        prompt += `기대하는 모습 요약: ${vivid.future_summary}\n`;
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

  prompt += `\n위 일일 일상 리포트들을 종합하여 월간 일상 리포트(daily_life_report)를 생성하세요.
- summary: 이번 달의 일상을 요약한 리스트 형태로 작성하세요. 각 항목은 한 문장으로 작성하며, 서로 다른 유형의 날들을 구분하여 최대 10개까지 작성하세요. 예: ["집 관련 행정·점검을 처리하고 이동과 피로를 관리하려던 날(11-17)", "유튜브 콘텐츠 방향과 수익화 문제로 아이디어 고갈과 두통을 경험한 창작적 블록의 날(11-22)", "제품/기능 개발과 운영 진행 중 식후 슬럼프를 녹차·타이머로 관리하며 기술적 진척을 이룬 날(11-26)"]
일일 패턴들을 분석하여 월간 트렌드와 패턴을 발견하고, 반복되는 이벤트, 감정 트리거, 행동 패턴을 종합하세요.`;

  return prompt;
}
