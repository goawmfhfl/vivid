import type { WeeklyFeedback } from "@/types/weekly-feedback";

/**
 * Vision Report용 프롬프트 생성
 */
export function buildVisionReportPrompt(
  weeklyFeedbacks: WeeklyFeedback[],
  month: string,
  dateRange: { start_date: string; end_date: string }
): string {
  const [year, monthNum] = month.split("-");
  const monthLabel = `${year}년 ${monthNum}월`;

  let prompt = `아래는 ${monthLabel} (${dateRange.start_date} ~ ${dateRange.end_date}) 한 달간의 주간 피드백의 비전 데이터입니다. 
주간 vision_report들을 종합하여 월간 비전 리포트(vision_report)를 생성하여 JSON만 출력하세요.\n\n`;

  weeklyFeedbacks.forEach((wf, idx) => {
    prompt += `[주간 피드백 ${idx + 1} - ${wf.week_range.start} ~ ${
      wf.week_range.end
    }]\n`;

    const vr = wf.vision_report;
    if (vr) {
      if (vr.vision_summary) {
        prompt += `비전 요약: ${vr.vision_summary}\n`;
      }
      if (vr.vision_keywords_trend.length > 0) {
        prompt += `비전 키워드 트렌드: ${vr.vision_keywords_trend
          .map((k) => `${k.keyword} (${k.days}일)`)
          .join(", ")}\n`;
      }
      if (vr.goals_pattern?.summary) {
        prompt += `목표 패턴: ${vr.goals_pattern.summary}\n`;
      }
      if (vr.goals_pattern?.goal_categories.length > 0) {
        prompt += `목표 카테고리: ${vr.goals_pattern.goal_categories
          .map((c) => `${c.category} (${c.count}회)`)
          .join(", ")}\n`;
      }
      if (vr.self_vision_alignment?.summary) {
        prompt += `자기 비전 정렬: ${vr.self_vision_alignment.summary}\n`;
      }
      if (vr.self_vision_alignment?.key_traits.length > 0) {
        prompt += `주요 특성: ${vr.self_vision_alignment.key_traits
          .map((t) => `${t.trait} (${t.frequency}회)`)
          .join(", ")}\n`;
      }
      if (vr.dreamer_traits_evolution?.summary) {
        prompt += `꿈꾸는 자 특성 진화: ${vr.dreamer_traits_evolution.summary}\n`;
      }
      if (vr.dreamer_traits_evolution?.common_traits.length > 0) {
        prompt += `공통 특성: ${vr.dreamer_traits_evolution.common_traits
          .map((t) => `${t.trait} (${t.frequency}회)`)
          .join(", ")}\n`;
      }
      if (vr.next_week_vision_focus?.focus_areas.length > 0) {
        prompt += `다음 주 비전 포커스: ${vr.next_week_vision_focus.focus_areas
          .map((a) => a.area)
          .join(", ")}\n`;
      }
    }

    prompt += `\n`;
  });

  prompt += `\n위 주간 비전 리포트들을 종합하여 월간 비전 리포트(vision_report)를 생성하세요.
- vision_days_count, vision_records_count: 비전 관련 기록이 있는 날짜 수/문장 수 계산
- main_visions: 한 달 동안 반복해서 등장한 비전/목표를 최대 10개까지 정리 (summary, frequency 포함)
- core_visions: 이번 달의 핵심 비전을 최대 7개까지 선별 (summary, frequency 포함, 최소 2회 이상)
- vision_progress_comment: 비전과 실제 일상 행동 사이의 거리감, 조금이라도 나아간 부분을 솔직하게 정리
- vision_ai_feedbacks: 비전을 실현하기 위한 구체적인 조언이나 제안을 최대 5개 제공`;

  return prompt;
}
