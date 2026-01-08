import type { DailyFeedbackRow } from "@/types/daily-feedback";

/**
 * Vision Report용 프롬프트 생성
 */
export function buildVisionReportPrompt(
  dailyFeedbacks: DailyFeedbackRow[],
  month: string,
  dateRange: { start_date: string; end_date: string }
): string {
  const [year, monthNum] = month.split("-");
  const monthLabel = `${year}년 ${monthNum}월`;

  let prompt = `아래는 ${monthLabel} (${dateRange.start_date} ~ ${dateRange.end_date}) 한 달간의 일일 피드백의 비전 데이터입니다. 
일일 vivid_report들을 종합하여 월간 비전 리포트(vision_report)를 생성하여 JSON만 출력하세요.\n\n`;

  dailyFeedbacks.forEach((df, idx) => {
    prompt += `[일일 피드백 ${idx + 1} - ${df.report_date}]\n`;

    const dr = df.vivid_report;
    if (dr) {
      if (dr.summary) {
        prompt += `비전 요약: ${dr.summary}\n`;
      }
      if (dr.vision_self) {
        prompt += `자기 평가: ${dr.vision_self}\n`;
      }
      if (Array.isArray(dr.vision_keywords) && dr.vision_keywords.length > 0) {
        prompt += `비전 키워드: ${dr.vision_keywords.join(", ")}\n`;
      }
      if (dr.vision_ai_feedback) {
        prompt += `AI 피드백: ${dr.vision_ai_feedback}\n`;
      }
      // Pro 전용 필드
      if (Array.isArray(dr.dream_goals) && dr.dream_goals.length > 0) {
        prompt += `꿈/목표: ${dr.dream_goals.join(", ")}\n`;
      }
      if (Array.isArray(dr.dreamer_traits) && dr.dreamer_traits.length > 0) {
        prompt += `꿈꾸는 자 특성: ${dr.dreamer_traits.join(", ")}\n`;
      }
    }

    prompt += `\n`;
  });

  prompt += `\n위 일일 비전 리포트들을 종합하여 월간 비전 리포트(vision_report)를 생성하세요.
- vision_days_count, vision_records_count: 비전 관련 기록이 있는 날짜 수/문장 수 계산
- core_visions: 이번 달의 핵심 비전을 최대 7개까지 선별 (summary, frequency 포함, 최소 2회 이상)
- vision_progress_comment: 비전과 실제 일상 행동 사이의 거리감, 조금이라도 나아간 부분을 솔직하게 정리 (300자 이내)
- vision_ai_feedbacks: 비전을 실현하기 위한 구체적인 조언이나 제안을 최대 5개 제공
- desired_self: 이번 달의 비전 기록을 바탕으로 "내가 되고싶은 사람"에 대한 섹션을 생성하세요. characteristics는 최대 5개까지 작성하고, 각각은 "~~~ 한 사람" 형식으로 작성하세요. historical_figure는 이러한 특성들을 대표하는 역사적 위인 1명을 선택하고, 그 이유를 사용자의 현재 모습과 연결하여 설명하세요. 비전 기록이 충분하지 않으면 null로 설정하세요.`;

  return prompt;
}
