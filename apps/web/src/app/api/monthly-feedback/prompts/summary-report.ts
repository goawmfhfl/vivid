import type { WeeklyFeedback } from "@/types/weekly-feedback";

/**
 * Summary Report용 프롬프트 생성
 */
export function buildSummaryReportPrompt(
  weeklyFeedbacks: WeeklyFeedback[],
  month: string,
  dateRange: { start_date: string; end_date: string },
  totalDays: number,
  recordedDays: number
): string {
  const [year, monthNum] = month.split("-");
  const monthLabel = `${year}년 ${monthNum}월`;

  let prompt = `아래는 ${monthLabel} (${dateRange.start_date} ~ ${dateRange.end_date}) 한 달간의 주간 피드백 데이터입니다. 
주간 피드백들을 종합하여 월간 요약 리포트(summary_report)를 생성하여 JSON만 출력하세요.\n\n`;

  prompt += `=== 기본 정보 ===\n`;
  prompt += `- target_month: ${month}\n`;
  prompt += `- month_label: ${monthLabel}\n`;
  prompt += `- date_range: ${dateRange.start_date} ~ ${dateRange.end_date}\n`;
  prompt += `- total_days: ${totalDays}\n`;
  prompt += `- recorded_days: ${recordedDays} (주간 피드백 개수)\n`;
  prompt += `- record_coverage_rate: ${
    Math.round((recordedDays / totalDays) * 100) / 100
  }\n\n`;

  prompt += `=== 주간 피드백 데이터 ===\n\n`;

  weeklyFeedbacks.forEach((wf, idx) => {
    prompt += `[주간 피드백 ${idx + 1} - ${wf.week_range.start} ~ ${
      wf.week_range.end
    }]\n`;

    // Summary Report 데이터
    if (wf.summary_report?.summary) {
      prompt += `요약: ${wf.summary_report.summary}\n`;
    }
    if (
      Array.isArray(wf.summary_report?.key_points) &&
      wf.summary_report.key_points.length > 0
    ) {
      prompt += `핵심 포인트: ${wf.summary_report.key_points.join(", ")}\n`;
    }
    if (wf.summary_report?.trend_analysis) {
      prompt += `트렌드 분석: ${wf.summary_report.trend_analysis}\n`;
    }

    // Daily Life Report에서 주요 정보 추출
    if (wf.daily_life_report?.summary) {
      prompt += `일상 요약: ${wf.daily_life_report.summary}\n`;
    }

    // Emotion Report에서 주요 정보 추출
    if (wf.emotion_report) {
      if (wf.emotion_report.ai_mood_valence !== null) {
        prompt += `감정 가치감: ${wf.emotion_report.ai_mood_valence}\n`;
      }
      if (wf.emotion_report.ai_mood_arousal !== null) {
        prompt += `감정 각성도: ${wf.emotion_report.ai_mood_arousal}\n`;
      }
      if (wf.emotion_report.dominant_emotion) {
        prompt += `주요 감정: ${wf.emotion_report.dominant_emotion}\n`;
      }
    }

    // Execution Report에서 주요 정보 추출
    if (wf.execution_report?.positives_top3?.length > 0) {
      prompt += `긍정적 측면: ${wf.execution_report.positives_top3.join(
        ", "
      )}\n`;
    }
    if (wf.execution_report?.improvements_top3?.length > 0) {
      prompt += `개선점: ${wf.execution_report.improvements_top3.join(", ")}\n`;
    }

    prompt += `\n`;
  });

  prompt += `\n위 주간 피드백 데이터를 종합하여 월간 요약 리포트(summary_report)를 생성하세요.
- monthly_score: 이 달을 0~100 점으로 평가 (기록 커버리지, 감정 안정성, 실행력 등을 종합적으로 반영)
- summary_title: 한 문장으로 이 달을 한 줄 제목으로 요약
- summary_description: 공백 포함 400자 이내로, 이 달에 있었던 주요 흐름을 서사적으로 정리
- main_themes: 이 달의 키워드를 최대 7개까지 뽑기
- main_themes_reason: main_themes를 7개 이하로 정한 이유 설명
- integrity_trend: 주간 피드백들의 흐름을 기준으로 "상승", "하락", "유지", "불규칙" 중 선택
- 각 점수(life_balance_score, execution_score, rest_score, relationship_score)와 그 이유, 피드백 제공
- summary_ai_comment: 이 달 전체를 "한 사람으로서" 바라보고, 부드러운 코멘트 작성`;

  return prompt;
}
