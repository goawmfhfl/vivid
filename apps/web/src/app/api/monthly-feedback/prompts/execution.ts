import type { WeeklyFeedback } from "@/types/weekly-feedback";

/**
 * Execution Report용 프롬프트 생성
 */
export function buildExecutionReportPrompt(
  weeklyFeedbacks: WeeklyFeedback[],
  month: string,
  dateRange: { start_date: string; end_date: string }
): string {
  const [year, monthNum] = month.split("-");
  const monthLabel = `${year}년 ${monthNum}월`;

  let prompt = `아래는 ${monthLabel} (${dateRange.start_date} ~ ${dateRange.end_date}) 한 달간의 주간 피드백의 실행/피드백 데이터입니다. 
주간 execution_report들을 종합하여 월간 실행 리포트(execution_report)를 생성하여 JSON만 출력하세요.\n\n`;

  weeklyFeedbacks.forEach((wf, idx) => {
    prompt += `[주간 피드백 ${idx + 1} - ${wf.week_range.start} ~ ${
      wf.week_range.end
    }]\n`;

    const er = wf.execution_report;
    if (er) {
      if (er.positives_top3.length > 0) {
        prompt += `긍정적 측면 Top 3: ${er.positives_top3.join(", ")}\n`;
      }
      if (er.improvements_top3.length > 0) {
        prompt += `개선점 Top 3: ${er.improvements_top3.join(", ")}\n`;
      }
      if (er.ai_feedback_summary) {
        prompt += `AI 피드백 요약: ${er.ai_feedback_summary}\n`;
      }
      if (er.feedback_patterns?.summary) {
        prompt += `피드백 패턴 요약: ${er.feedback_patterns.summary}\n`;
      }
      if (er.feedback_patterns?.positives_categories.length > 0) {
        prompt += `긍정적 카테고리: ${er.feedback_patterns.positives_categories
          .map((c) => `${c.category} (${c.count}회)`)
          .join(", ")}\n`;
      }
      if (er.feedback_patterns?.improvements_categories.length > 0) {
        prompt += `개선 카테고리: ${er.feedback_patterns.improvements_categories
          .map((c) => `${c.category} (${c.count}회)`)
          .join(", ")}\n`;
      }
      if (er.person_traits_analysis?.summary) {
        prompt += `인물 특성 분석: ${er.person_traits_analysis.summary}\n`;
      }
      if (er.person_traits_analysis?.key_traits.length > 0) {
        prompt += `주요 특성: ${er.person_traits_analysis.key_traits
          .map((t) => `${t.trait} (${t.frequency}회)`)
          .join(", ")}\n`;
      }
      if (er.core_feedback_themes?.summary) {
        prompt += `핵심 피드백 테마: ${er.core_feedback_themes.summary}\n`;
      }
      if (er.core_feedback_themes?.main_themes.length > 0) {
        prompt += `주요 테마: ${er.core_feedback_themes.main_themes
          .map((t) => `${t.theme} (${t.frequency}회)`)
          .join(", ")}\n`;
      }
      if (er.ai_message_patterns?.summary) {
        prompt += `AI 메시지 패턴: ${er.ai_message_patterns.summary}\n`;
      }
      if (er.improvement_action_alignment?.summary) {
        prompt += `개선-행동 정렬: ${er.improvement_action_alignment.summary}\n`;
      }
      if (er.growth_insights?.key_learnings.length > 0) {
        prompt += `핵심 학습: ${er.growth_insights.key_learnings
          .map((l) => l.learning)
          .join(", ")}\n`;
      }
    }

    prompt += `\n`;
  });

  prompt += `\n위 주간 실행 리포트들을 종합하여 월간 실행 리포트(execution_report)를 생성하세요.
- feedback_days_count, feedback_records_count: 피드백 기록이 있는 날짜 수/문장 수 계산
- recurring_positives, recurring_improvements: 한 달 동안 여러 번 언급된 "잘한 점/아쉬운 점"을 각각 최대 10개로 요약
- habit_scores: 건강, 일/학습, 관계, 자기 돌봄을 0~10 점으로 평가 (각 점수에 대한 reason 필드 포함)
- core_feedbacks: 이번 달의 핵심 피드백을 최대 5개까지 선별 (summary, frequency 포함, 최소 2회 이상)
- recurring_improvements_with_frequency: 반복된 개선점과 각각의 등장 횟수 제공 (최소 2회 이상)
- core_feedback_for_month: 이 달 전체를 관통하는 피드백 한 문장으로 요약
- feedback_ai_comment: 사용자를 비난하지 말고, "이미 잘한 부분"과 "다음 달 조금만 조정하면 좋아질 부분"을 균형 있게 제시`;

  return prompt;
}
