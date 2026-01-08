import type { DailyFeedbackForMonthly } from "../types";

/**
 * Summary Report용 프롬프트 생성
 */
export function buildSummaryReportPrompt(
  dailyFeedbacks: DailyFeedbackForMonthly[],
  month: string,
  dateRange: { start_date: string; end_date: string },
  totalDays: number,
  recordedDays: number
): string {
  const [year, monthNum] = month.split("-");
  const monthLabel = `${year}년 ${monthNum}월`;

  let prompt = `아래는 ${monthLabel} (${dateRange.start_date} ~ ${dateRange.end_date}) 한 달간의 일일 피드백 데이터입니다. 
일일 피드백들을 종합하여 월간 요약 리포트(summary_report)를 생성하여 JSON만 출력하세요.\n\n`;

  prompt += `=== 기본 정보 ===\n`;
  prompt += `- target_month: ${month}\n`;
  prompt += `- month_label: ${monthLabel}\n`;
  prompt += `- date_range: ${dateRange.start_date} ~ ${dateRange.end_date}\n`;
  prompt += `- total_days: ${totalDays}\n`;
  prompt += `- recorded_days: ${recordedDays} (일일 피드백 개수)\n`;
  prompt += `- record_coverage_rate: ${
    Math.round((recordedDays / totalDays) * 100) / 100
  }\n\n`;

  prompt += `=== 일일 피드백 데이터 ===\n\n`;

  dailyFeedbacks.forEach((df, idx) => {
    prompt += `[일일 피드백 ${idx + 1} - ${df.report_date}]\n`;

    // Summary Report 데이터
    if (df.summary_report?.summary) {
      prompt += `요약: ${df.summary_report.summary}\n`;
    }
    if (
      Array.isArray(df.summary_report?.key_points) &&
      df.summary_report.key_points.length > 0
    ) {
      prompt += `핵심 포인트: ${df.summary_report.key_points.join(", ")}\n`;
    }
    if (df.summary_report?.trend_analysis) {
      prompt += `트렌드 분석: ${df.summary_report.trend_analysis}\n`;
    }

    // Daily Report에서 주요 정보 추출
    if (df.daily_report?.summary) {
      prompt += `일상 요약: ${df.daily_report.summary}\n`;
    }
    if (
      Array.isArray(df.daily_report?.daily_events) &&
      df.daily_report.daily_events.length > 0
    ) {
      prompt += `오늘 있었던 일: ${df.daily_report.daily_events.join(", ")}\n`;
    }
    if (
      Array.isArray(df.daily_report?.keywords) &&
      df.daily_report.keywords.length > 0
    ) {
      prompt += `키워드: ${df.daily_report.keywords.join(", ")}\n`;
    }

    // Emotion Report에서 주요 정보 추출
    if (df.emotion_report) {
      if (df.emotion_report.ai_mood_valence !== null) {
        prompt += `감정 가치감: ${df.emotion_report.ai_mood_valence}\n`;
      }
      if (df.emotion_report.ai_mood_arousal !== null) {
        prompt += `감정 각성도: ${df.emotion_report.ai_mood_arousal}\n`;
      }
      if (df.emotion_report.dominant_emotion) {
        prompt += `주요 감정: ${df.emotion_report.dominant_emotion}\n`;
      }
      if (df.emotion_report.emotion_quadrant) {
        prompt += `감정 사분면: ${df.emotion_report.emotion_quadrant}\n`;
      }
    }

    // Feedback Report에서 주요 정보 추출
    if (df.feedback_report) {
      if (df.feedback_report.core_feedback) {
        prompt += `핵심 피드백: ${df.feedback_report.core_feedback}\n`;
      }
      if (
        Array.isArray(df.feedback_report?.positives) &&
        df.feedback_report.positives.length > 0
      ) {
        prompt += `긍정적 측면: ${df.feedback_report.positives.join(", ")}\n`;
      }
      if (
        Array.isArray(df.feedback_report?.improvements) &&
        df.feedback_report.improvements.length > 0
      ) {
        prompt += `개선점: ${df.feedback_report.improvements.join(", ")}\n`;
      }
    }

    // Final Report에서 주요 정보 추출
    if (df.final_report?.closing_message) {
      prompt += `마무리 메시지: ${df.final_report.closing_message}\n`;
    }

    prompt += `\n`;
  });

  prompt += `\n위 일일 피드백 데이터를 종합하여 월간 요약 리포트(summary_report)를 생성하세요.
- monthly_score: 이 달을 0~100 점으로 평가 (기록 커버리지, 감정 안정성, 실행력 등을 종합적으로 반영)
- summary_title: 한 문장으로 이 달을 한 줄 제목으로 요약
- summary_description: 공백 포함 400자 이내로, 이 달에 있었던 주요 흐름을 서사적으로 정리
- main_themes: 이 달의 키워드를 최대 7개까지 뽑기
- main_themes_reason: main_themes를 7개 이하로 정한 이유 설명
- integrity_trend: 일일 피드백들의 integrity_score 흐름을 기준으로 "상승", "하락", "유지", "불규칙" 중 선택
- 각 점수(life_balance_score, execution_score, rest_score, relationship_score)와 그 이유, 피드백 제공
- summary_ai_comment: 이 달 전체를 "한 사람으로서" 바라보고, 부드러운 코멘트 작성`;

  return prompt;
}
