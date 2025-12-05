import type { WeeklyFeedback } from "@/types/weekly-feedback";

/**
 * Emotion Report용 프롬프트 생성
 */
export function buildEmotionReportPrompt(
  weeklyFeedbacks: WeeklyFeedback[],
  month: string,
  dateRange: { start_date: string; end_date: string }
): string {
  const [year, monthNum] = month.split("-");
  const monthLabel = `${year}년 ${monthNum}월`;

  let prompt = `아래는 ${monthLabel} (${dateRange.start_date} ~ ${dateRange.end_date}) 한 달간의 주간 피드백의 감정 데이터입니다. 
주간 emotion_report들을 종합하여 월간 감정 리포트(emotion_report)를 생성하여 JSON만 출력하세요.\n\n`;

  // 주간 감정 데이터 수집
  const valenceValues: number[] = [];
  const arousalValues: number[] = [];

  weeklyFeedbacks.forEach((wf, idx) => {
    prompt += `[주간 피드백 ${idx + 1} - ${wf.week_range.start} ~ ${
      wf.week_range.end
    }]\n`;

    const er = wf.emotion_report;
    if (er) {
      if (er.ai_mood_valence !== null) {
        prompt += `감정 가치감: ${er.ai_mood_valence}\n`;
        valenceValues.push(er.ai_mood_valence);
      }
      if (er.ai_mood_arousal !== null) {
        prompt += `감정 각성도: ${er.ai_mood_arousal}\n`;
        arousalValues.push(er.ai_mood_arousal);
      }
      if (er.dominant_emotion) {
        prompt += `주요 감정: ${er.dominant_emotion}\n`;
      }
      if (er.valence_explanation) {
        prompt += `가치감 설명: ${er.valence_explanation}\n`;
      }
      if (er.arousal_explanation) {
        prompt += `각성도 설명: ${er.arousal_explanation}\n`;
      }
      if (er.valence_patterns.length > 0) {
        prompt += `가치감 패턴: ${er.valence_patterns.join(", ")}\n`;
      }
      if (er.arousal_patterns.length > 0) {
        prompt += `각성도 패턴: ${er.arousal_patterns.join(", ")}\n`;
      }
      if (er.valence_triggers.length > 0) {
        prompt += `가치감 트리거: ${er.valence_triggers.join(", ")}\n`;
      }
      if (er.arousal_triggers.length > 0) {
        prompt += `각성도 트리거: ${er.arousal_triggers.join(", ")}\n`;
      }
      if (er.anxious_triggers.length > 0) {
        prompt += `불안 트리거: ${er.anxious_triggers.join(", ")}\n`;
      }
      if (er.engaged_triggers.length > 0) {
        prompt += `몰입 트리거: ${er.engaged_triggers.join(", ")}\n`;
      }
      if (er.sad_triggers.length > 0) {
        prompt += `슬픔 트리거: ${er.sad_triggers.join(", ")}\n`;
      }
      if (er.calm_triggers.length > 0) {
        prompt += `평온 트리거: ${er.calm_triggers.join(", ")}\n`;
      }
      if (er.daily_emotions.length > 0) {
        prompt += `일별 감정: ${er.daily_emotions.length}일\n`;
      }
    }

    prompt += `\n`;
  });

  // 평균 계산
  const avgValence =
    valenceValues.length > 0
      ? valenceValues.reduce((a, b) => a + b, 0) / valenceValues.length
      : null;
  const avgArousal =
    arousalValues.length > 0
      ? arousalValues.reduce((a, b) => a + b, 0) / arousalValues.length
      : null;

  prompt += `\n=== 계산된 평균값 ===\n`;
  prompt += `- monthly_ai_mood_valence_avg: ${avgValence ?? "null"}\n`;
  prompt += `- monthly_ai_mood_arousal_avg: ${avgArousal ?? "null"}\n\n`;

  prompt += `위 주간 감정 리포트들을 종합하여 월간 감정 리포트(emotion_report)를 생성하세요.
- monthly_ai_mood_valence_avg, monthly_ai_mood_arousal_avg: 위에서 계산된 평균값 사용
- emotion_quadrant_dominant: 주간 피드백들에서 가장 많이 등장한 사분면 선택
- emotion_quadrant_distribution: 4개 사분면 모두 포함하여 비율 계산 (각 사분면에 explanation 필드 포함)
- emotion_quadrant_analysis_summary: 4개 사분면 분포를 종합적으로 분석한 피드백 (300자 이내)
- emotion_pattern_summary: 이 달 동안 감정이 어떻게 반복되었는지 설명 (400자 이내)
- positive_triggers, negative_triggers: 반복적으로 긍정/부정 감정을 만들어낸 행동/상황을 각각 최대 10개까지 정리
- emotion_stability_score: 감정 곡선의 출렁임 정도를 0~10 점으로 평가 (그 이유와 가이드라인 포함)
- emotion_ai_comment: 왜 이런 감정 패턴이 만들어졌는지, 다음 달을 위해 어떤 감정 전략이 도움이 될지 부드럽게 정리`;

  return prompt;
}
