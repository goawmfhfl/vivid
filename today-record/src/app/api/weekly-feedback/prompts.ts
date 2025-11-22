import type { DailyFeedbackForWeekly } from "./types";

/**
 * 주간 피드백 생성을 위한 프롬프트 생성
 */
export function buildWeeklyFeedbackPrompt(
  dailyFeedbacks: DailyFeedbackForWeekly,
  weekRange: { start: string; end: string; timezone: string }
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
        if (
          feedback.emotion_overview?.emotion_curve &&
          feedback.emotion_overview.emotion_curve.length > 0
        ) {
          prompt += `감정 곡선: ${feedback.emotion_overview.emotion_curve.join(
            " → "
          )}\n`;
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

  prompt += `\n\n위 데이터를 종합하여 주간 리포트를 생성하세요. 각 날짜별로 by_day 배열에 항목을 추가하고, 전체 주간의 패턴과 트렌드를 분석하여 weekly_overview, growth_trends, insight_replay, vision_visualization_report, execution_reflection, closing_section을 작성하세요.`;

  return prompt;
}
