import type { DailyFeedbackForMonthly } from "../types";

/**
 * Execution Report용 프롬프트 생성
 */
export function buildExecutionReportPrompt(
  dailyFeedbacks: DailyFeedbackForMonthly[],
  month: string,
  dateRange: { start_date: string; end_date: string }
): string {
  const [year, monthNum] = month.split("-");
  const monthLabel = `${year}년 ${monthNum}월`;

  let prompt = `아래는 ${monthLabel} (${dateRange.start_date} ~ ${dateRange.end_date}) 한 달간의 일일 피드백의 실행/피드백 데이터입니다. 
일일 feedback_report들을 종합하여 월간 실행 리포트(execution_report)를 생성하여 JSON만 출력하세요.\n\n`;

  dailyFeedbacks.forEach((df, idx) => {
    prompt += `[일일 피드백 ${idx + 1} - ${df.report_date}]\n`;

    const fr = df.feedback_report;
    if (fr) {
      if (fr.core_feedback) {
        prompt += `핵심 피드백: ${fr.core_feedback}\n`;
      }
      if (Array.isArray(fr.positives) && fr.positives.length > 0) {
        prompt += `긍정적 측면: ${fr.positives.join(", ")}\n`;
      }
      if (Array.isArray(fr.improvements) && fr.improvements.length > 0) {
        prompt += `개선점: ${fr.improvements.join(", ")}\n`;
      }
      if (fr.ai_message) {
        prompt += `AI 메시지: ${fr.ai_message}\n`;
      }
      // Pro 전용 필드
      if (
        Array.isArray(fr.feedback_person_traits) &&
        fr.feedback_person_traits.length > 0
      ) {
        prompt += `인물 특성: ${fr.feedback_person_traits.join(", ")}\n`;
      }
    }

    prompt += `\n`;
  });

  prompt += `\n위 일일 실행 리포트들을 종합하여 월간 실행 리포트(execution_report)를 생성하세요.
- feedback_days_count, feedback_records_count: 피드백 기록이 있는 날짜 수/문장 수 계산
- recurring_positives, recurring_improvements: 한 달 동안 여러 번 언급된 "잘한 점/아쉬운 점"을 각각 최대 10개로 요약
- habit_scores: 건강, 일/학습, 관계, 자기 돌봄을 0~10 점으로 평가 (각 점수에 대한 reason 필드 포함)
- core_feedbacks: 이번 달의 핵심 피드백을 최대 5개까지 선별 (summary, frequency 포함, 최소 2회 이상)
- recurring_improvements_with_frequency: 반복된 개선점과 각각의 등장 횟수 제공 (최소 2회 이상)
- core_feedback_for_month: 이 달 전체를 관통하는 피드백 한 문장으로 요약
- feedback_ai_comment: 사용자를 비난하지 말고, "이미 잘한 부분"과 "다음 달 조금만 조정하면 좋아질 부분"을 균형 있게 제시`;

  return prompt;
}
