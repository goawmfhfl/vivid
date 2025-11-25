import type { DailyFeedbackForWeekly } from "./types";

/**
 * 주간 피드백 생성을 위한 프롬프트 생성
 */
export function buildWeeklyFeedbackPrompt(
  dailyFeedbacks: DailyFeedbackForWeekly,
  weekRange: { start: string; end: string; timezone: string },
  _emotionOverviewData?: {
    daily_emotions: Array<{
      date: string;
      weekday: string;
      ai_mood_valence: number | null;
      ai_mood_arousal: number | null;
      dominant_emotion: string | null;
    }>;
    avg_valence: number | null;
    avg_arousal: number | null;
  }
): string {
  let prompt = `아래는 ${weekRange.start}부터 ${weekRange.end}까지의 일주일간 일일 피드백 데이터입니다. 위 스키마에 따라 주간 리포트를 생성하여 JSON만 출력하세요.\n\n`;

  // 날짜별로 daily feedback 정리
  const feedbacksByDate = new Map<string, typeof dailyFeedbacks>();
  dailyFeedbacks.forEach((feedback) => {
    const date = feedback.report_date;
    if (!feedbacksByDate.has(date)) {
      feedbacksByDate.set(date, []);
    }
    feedbacksByDate.get(date)!.push(feedback);
  });

  // 주간 범위의 모든 날짜 생성
  const startDate = new Date(weekRange.start);
  const endDate = new Date(weekRange.end);
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const dateStr = date.toISOString().split("T")[0];
    const weekday = weekdays[date.getDay()];
    const dayFeedbacks = feedbacksByDate.get(dateStr) || [];

    prompt += `\n=== ${dateStr} (${weekday}) ===\n`;

    if (dayFeedbacks.length === 0) {
      prompt += "(이 날짜에는 일일 피드백이 없습니다.)\n";
    } else {
      dayFeedbacks.forEach((feedback, idx) => {
        prompt += `\n[일일 피드백 ${idx + 1}]\n`;

        // narrative_overview 접근
        if (feedback.narrative_overview?.narrative_summary) {
          prompt += `요약: ${feedback.narrative_overview.narrative_summary}\n`;
        }
        if (feedback.integrity_score !== null) {
          prompt += `통합 점수: ${feedback.integrity_score}/10\n`;
        }
        if (
          feedback.narrative_overview?.keywords &&
          feedback.narrative_overview.keywords.length > 0
        ) {
          prompt += `키워드: ${feedback.narrative_overview.keywords.join(
            ", "
          )}\n`;
        }

        // emotion_overview 접근
        if (feedback.emotion_overview) {
          const emotion = feedback.emotion_overview;
          if (emotion.ai_mood_valence !== null) {
            prompt += `감정 쾌-불쾌 (Valence): ${emotion.ai_mood_valence}\n`;
          }
          if (emotion.ai_mood_arousal !== null) {
            prompt += `감정 각성-에너지 (Arousal): ${emotion.ai_mood_arousal}\n`;
          }
          if (emotion.emotion_curve && emotion.emotion_curve.length > 0) {
            prompt += `감정 곡선: ${emotion.emotion_curve.join(" → ")}\n`;
          }
          if (emotion.dominant_emotion) {
            prompt += `대표 감정: ${emotion.dominant_emotion}\n`;
          }
        }

        // narrative_overview 접근
        if (feedback.narrative_overview?.narrative) {
          prompt += `이야기: ${feedback.narrative_overview.narrative}\n`;
        }
        if (feedback.narrative_overview?.lesson) {
          prompt += `교훈: ${feedback.narrative_overview.lesson}\n`;
        }

        // insight_overview 접근
        if (feedback.insight_overview?.core_insight) {
          prompt += `핵심 인사이트: ${feedback.insight_overview.core_insight}\n`;
        }
        if (feedback.insight_overview?.meta_question) {
          prompt += `메타 질문: ${feedback.insight_overview.meta_question}\n`;
        }

        // vision_overview 접근
        if (feedback.vision_overview?.vision_summary) {
          prompt += `시각화 요약: ${feedback.vision_overview.vision_summary}\n`;
        }
        if (
          feedback.vision_overview?.vision_keywords &&
          feedback.vision_overview.vision_keywords.length > 0
        ) {
          prompt += `시각화 키워드: ${feedback.vision_overview.vision_keywords.join(
            ", "
          )}\n`;
        }
        if (feedback.vision_overview?.reminder_sentence) {
          prompt += `리마인더: ${feedback.vision_overview.reminder_sentence}\n`;
        }

        // feedback_overview 접근
        if (feedback.feedback_overview?.core_feedback) {
          prompt += `핵심 피드백: ${feedback.feedback_overview.core_feedback}\n`;
        }
        if (
          feedback.feedback_overview?.positives &&
          feedback.feedback_overview.positives.length > 0
        ) {
          prompt += `긍정적 측면: ${feedback.feedback_overview.positives.join(
            ", "
          )}\n`;
        }
        if (
          feedback.feedback_overview?.improvements &&
          feedback.feedback_overview.improvements.length > 0
        ) {
          prompt += `개선점: ${feedback.feedback_overview.improvements.join(
            ", "
          )}\n`;
        }

        // meta_overview 접근
        if (feedback.meta_overview?.growth_point) {
          prompt += `성장 포인트: ${feedback.meta_overview.growth_point}\n`;
        }
        if (feedback.meta_overview?.adjustment_point) {
          prompt += `조정 포인트: ${feedback.meta_overview.adjustment_point}\n`;
        }
      });
    }
  }

  prompt += `\n\n위 데이터를 종합하여 주간 리포트를 생성하세요. 전체 주간의 패턴과 트렌드를 분석하여 weekly_overview, emotion_overview, growth_trends, growth_trends, insight_replay, vision_visualization_report, execution_reflection, closing_section을 작성하세요.

중요: emotion_overview는 일별 피드백의 emotion_overview 데이터를 분석하여 작성해야 합니다.
- ai_mood_valence: 일별 ai_mood_valence 값들의 평균을 계산하세요 (null이 아닌 값들만 평균 계산, 기록이 있는 날짜만 포함)
- ai_mood_arousal: 일별 ai_mood_arousal 값들의 평균을 계산하세요 (null이 아닌 값들만 평균 계산, 기록이 있는 날짜만 포함)
- dominant_emotion: 이번 주를 대표하는 가장 핵심적인 감정을 한 단어 또는 짧은 구로 작성하세요
- valence_explanation: 이번 주 일별 데이터를 분석하여 쾌-불쾌를 느끼는 구체적인 패턴과 상황을 설명해주세요. 일반적인 설명은 포함하지 말고 실제 데이터를 기반으로 한 분석만 작성하세요.
- arousal_explanation: 이번 주 일별 데이터를 분석하여 각성-에너지를 느끼는 구체적인 패턴과 상황을 설명해주세요. 일반적인 설명은 포함하지 말고 실제 데이터를 기반으로 한 분석만 작성하세요.
- valence_patterns: 일별 감정 데이터를 분석하여 쾌-불쾌를 느끼는 반복되는 패턴을 찾아 설명하세요. 예: "월요일 아침에 부정적 감정이 높게 나타나는 패턴이 보입니다. 아마도 주말에서 평일로 전환되는 부담감 때문인 것 같아요."
- arousal_patterns: 일별 감정 데이터를 분석하여 각성-에너지를 느끼는 반복되는 패턴을 찾아 설명하세요. 예: "오후 시간대에 각성 수준이 높아지는 패턴이 보입니다. 집중이 필요한 작업을 하는 시간과 일치하는 것 같아요."
- daily_emotions: 기록이 있는 날짜의 일별 감정 데이터만 포함하세요. 기록이 없는 날짜는 제외하세요. 각 항목에는 date, weekday, ai_mood_valence, ai_mood_arousal, dominant_emotion을 포함하세요.`;

  return prompt;
}
