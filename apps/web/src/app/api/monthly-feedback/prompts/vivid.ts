import type { DailyFeedbackForMonthly } from "../types";

/**
 * Vivid Report용 프롬프트 생성
 */
export function buildVividReportPrompt(
  dailyFeedbacks: DailyFeedbackForMonthly[],
  month: string,
  dateRange: { start_date: string; end_date: string }
): string {
  const [year, monthNum] = month.split("-");
  const monthLabel = `${year}년 ${monthNum}월`;

  let prompt = `아래는 ${monthLabel} (${dateRange.start_date} ~ ${dateRange.end_date}) 한 달간의 일일 피드백의 비비드 데이터입니다. 
일일 vivid_report들을 종합하여 월간 비비드 리포트(vivid_report)를 생성하여 JSON만 출력하세요.\n\n`;

  dailyFeedbacks.forEach((df, idx) => {
    prompt += `[일일 피드백 ${idx + 1} - ${df.report_date}]\n`;

    const dr = df.vivid_report;
    if (dr) {
      // 오늘의 VIVID (현재 모습)
      if (dr.current_summary) {
        prompt += `오늘의 비비드 요약: ${dr.current_summary}\n`;
      }
      if (dr.current_evaluation) {
        prompt += `오늘의 비비드 평가: ${dr.current_evaluation}\n`;
      }
      if (Array.isArray(dr.current_keywords) && dr.current_keywords.length > 0) {
        prompt += `오늘의 비비드 키워드: ${dr.current_keywords.join(", ")}\n`;
      }

      // 앞으로의 나의 모습 (미래 비전)
      if (dr.future_summary) {
        prompt += `기대하는 모습 요약: ${dr.future_summary}\n`;
      }
      if (dr.future_evaluation) {
        prompt += `기대하는 모습 평가: ${dr.future_evaluation}\n`;
      }
      if (Array.isArray(dr.future_keywords) && dr.future_keywords.length > 0) {
        prompt += `기대하는 모습 키워드: ${dr.future_keywords.join(", ")}\n`;
      }

      // 일치도 분석
      if (dr.alignment_score !== null && dr.alignment_score !== undefined) {
        prompt += `일치도 점수: ${dr.alignment_score}\n`;
      }

      // 사용자 특성 분석
      if (Array.isArray(dr.user_characteristics) && dr.user_characteristics.length > 0) {
        prompt += `기록을 쓰는 사람의 특징: ${dr.user_characteristics.join(", ")}\n`;
      }
      if (Array.isArray(dr.aspired_traits) && dr.aspired_traits.length > 0) {
        prompt += `지향하는 모습: ${dr.aspired_traits.join(", ")}\n`;
      }
    }

    prompt += `\n`;
  });

  prompt += `\n위 일일 비비드 리포트들을 종합하여 월간 비비드 리포트(vivid_report)를 생성하세요.

## 5개 섹션 구성:

### 1. 비전 진화 스토리 (30%)
- future_summary들을 분석하여 한 달 동안 "앞으로의 나"가 어떻게 변했는지 추적하세요.
- core_visions: 반복적으로 등장한 비전들을 추출하고, 각 비전의 일관성(consistency, 0-1)을 계산하세요.
- clarity_trend: 비전이 구체화되었는지, 모호해졌는지, 유지되었는지 판단하세요.
- priority_shifts: 비전의 우선순위가 바뀐 시점과 이유를 분석하세요.

### 2. 현재-미래 일치도 분석 (25%)
- alignment_score의 한 달 추이를 주차별로 분석하세요.
- score_timeline: 각 주차별 평균 점수와 트렌드(상승/하락/유지)를 계산하세요.
- score_drivers: 점수를 올린 영역과 낮춘 영역을 구체적으로 분석하세요.
- gap_analysis: 현재 상태와 원하는 상태 사이의 가장 큰 격차를 찾고, 실행 가능한 액션을 제안하세요.

### 3. 하루 패턴 인사이트 (20%)
- current_summary와 current_evaluation을 분석하여 반복되는 패턴을 발견하세요.
- recurring_patterns: 한 달 동안 반복된 하루 패턴을 찾고, 각 패턴의 영향(positive/neutral/negative)을 평가하세요.
- weekly_evolution: 주차별로 하루가 어떻게 달라졌는지 서사적으로 정리하세요.
- evaluation_themes: current_evaluation에서 반복되는 강점과 개선점을 추출하세요.

### 4. 특성-비전 매칭 (15%)
- user_characteristics와 aspired_traits를 비교하여 일치도를 분석하세요.
- trait_mapping: 현재 특성과 지향 특성을 매칭하고, 각각의 일치도 점수를 계산하세요 (0-1).
- trait_evolution: 한 달 동안 강해진 특성, 새로 나타난 특성, 사라진 특성을 추적하세요.
- focus_traits: 다음 달에 집중할 특성을 선별하고, 구체적인 월간 액션을 제안하세요.

### 5. 실행 가능한 다음 달 플랜 (10%)
- 위 4개 섹션의 분석 결과를 바탕으로 구체적이고 실행 가능한 다음 달 플랜을 제안하세요.
- focus_areas: 다음 달에 집중할 3가지 영역을 선정하고, 주차별 액션과 성공 지표를 제시하세요.
- maintain_patterns: 유지할 좋은 패턴과 그 이유, 유지 방법을 제안하세요.
- experiment_patterns: 시도해볼 새로운 패턴과 그 이유, 시작 방법을 제안하세요.

모든 분석은 실제 일일 피드백 데이터를 기반으로 하며, 추상적인 조언보다 구체적이고 실행 가능한 액션을 제시하세요.`;

  return prompt;
}
