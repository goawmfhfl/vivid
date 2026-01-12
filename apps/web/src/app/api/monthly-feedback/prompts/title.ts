import type { DailyFeedbackForMonthly } from "../types";
import type { VividReport } from "@/types/monthly-feedback-new";

/**
 * Title 생성용 프롬프트
 */
export function buildTitlePrompt(
  dailyFeedbacks: DailyFeedbackForMonthly[],
  vividReport: VividReport,
  month: string,
  dateRange: { start_date: string; end_date: string }
): string {
  const [year, monthNum] = month.split("-");
  const monthLabel = `${year}년 ${monthNum}월`;

  const prompt = `${monthLabel} (${dateRange.start_date} ~ ${dateRange.end_date}) 한 달간의 일일 피드백과 비비드 리포트 분석 결과를 바탕으로, 이번 달을 한 문장으로 요약하는 제목을 생성해주세요.

**제목 형식: "~ 한 달" 또는 "~ 했던 한 달"**
**예시:**
- "기록과 성장에 집중했던 한 달"
- "비전을 구체화해나갔던 한 달"
- "패턴을 발견하며 변화했던 한 달"
- "주도적으로 값진 삶을 살았던 한 달"

**비전 진화 스토리 요약:**
- 핵심 비전: ${vividReport.vision_evolution.core_visions.map(v => v.vision).slice(0, 3).join(", ")}

**일치도 분석 요약:**
- 평균 일치도: ${vividReport.alignment_analysis.score_timeline.length > 0 
  ? Math.round(vividReport.alignment_analysis.score_timeline.reduce((sum, item) => sum + item.average_score, 0) / vividReport.alignment_analysis.score_timeline.length)
  : "N/A"}
- 주요 개선 영역: ${vividReport.alignment_analysis.score_drivers.improved_areas.map(a => a.area).slice(0, 2).join(", ") || "없음"}

**하루 패턴 요약:**
- 주요 패턴: ${vividReport.daily_life_patterns.recurring_patterns.map(p => p.pattern).slice(0, 2).join(", ") || "없음"}
- 주요 강점: ${vividReport.daily_life_patterns.evaluation_themes.strengths.map(s => s.theme).slice(0, 2).join(", ") || "없음"}

**특성 변화:**
- 강해진 특성: ${vividReport.identity_alignment.trait_evolution.strengthened.map(t => t.trait).slice(0, 2).join(", ") || "없음"}
- 집중할 특성: ${vividReport.identity_alignment.focus_traits.map(t => t.trait).slice(0, 2).join(", ") || "없음"}

위 분석 결과를 바탕으로, 이번 달의 가장 핵심적인 특징을 담은 제목을 "~ 한 달" 형식으로 생성해주세요.
제목은 간결하고 명확하며, 이번 달의 가장 중요한 활동이나 변화를 잘 표현해야 합니다.
JSON 형식으로 {"title": "제목"}만 출력해주세요.`;

  return prompt;
}
