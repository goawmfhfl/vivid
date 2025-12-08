import type { DailyFeedbackRow } from "@/types/daily-feedback";

/**
 * Daily Life Report용 프롬프트 생성
 */
export function buildDailyLifeReportPrompt(
  dailyFeedbacks: DailyFeedbackRow[],
  month: string,
  dateRange: { start_date: string; end_date: string }
): string {
  const [year, monthNum] = month.split("-");
  const monthLabel = `${year}년 ${monthNum}월`;

  let prompt = `아래는 ${monthLabel} (${dateRange.start_date} ~ ${dateRange.end_date}) 한 달간의 일일 피드백의 일상 데이터입니다. 
일일 daily_report들을 종합하여 월간 일상 리포트(daily_life_report)를 생성하여 JSON만 출력하세요.\n\n`;

  dailyFeedbacks.forEach((df, idx) => {
    prompt += `[일일 피드백 ${idx + 1} - ${df.report_date}]\n`;

    const dr = df.daily_report;
    if (dr) {
      if (dr.summary) {
        prompt += `일상 요약: ${dr.summary}\n`;
      }
      if (Array.isArray(dr.daily_events) && dr.daily_events.length > 0) {
        prompt += `오늘 있었던 일: ${dr.daily_events.join(", ")}\n`;
      }
      if (Array.isArray(dr.keywords) && dr.keywords.length > 0) {
        prompt += `키워드: ${dr.keywords.join(", ")}\n`;
      }
      if (dr.ai_comment) {
        prompt += `AI 코멘트: ${dr.ai_comment}\n`;
      }
      // Pro 전용 필드
      if (dr.emotion_triggers) {
        if (
          Array.isArray(dr.emotion_triggers.self) &&
          dr.emotion_triggers.self.length > 0
        ) {
          prompt += `자기 관련 트리거: ${dr.emotion_triggers.self.join(
            ", "
          )}\n`;
        }
        if (
          Array.isArray(dr.emotion_triggers.work) &&
          dr.emotion_triggers.work.length > 0
        ) {
          prompt += `업무 관련 트리거: ${dr.emotion_triggers.work.join(
            ", "
          )}\n`;
        }
        if (
          Array.isArray(dr.emotion_triggers.people) &&
          dr.emotion_triggers.people.length > 0
        ) {
          prompt += `사람 관련 트리거: ${dr.emotion_triggers.people.join(
            ", "
          )}\n`;
        }
        if (
          Array.isArray(dr.emotion_triggers.environment) &&
          dr.emotion_triggers.environment.length > 0
        ) {
          prompt += `환경 관련 트리거: ${dr.emotion_triggers.environment.join(
            ", "
          )}\n`;
        }
      }
      if (dr.behavioral_clues) {
        if (
          Array.isArray(dr.behavioral_clues.avoidance) &&
          dr.behavioral_clues.avoidance.length > 0
        ) {
          prompt += `회피 행동: ${dr.behavioral_clues.avoidance.join(", ")}\n`;
        }
        if (
          Array.isArray(dr.behavioral_clues.routine_attempt) &&
          dr.behavioral_clues.routine_attempt.length > 0
        ) {
          prompt += `루틴 시도: ${dr.behavioral_clues.routine_attempt.join(
            ", "
          )}\n`;
        }
        if (
          Array.isArray(dr.behavioral_clues.routine_failure) &&
          dr.behavioral_clues.routine_failure.length > 0
        ) {
          prompt += `루틴 실패: ${dr.behavioral_clues.routine_failure.join(
            ", "
          )}\n`;
        }
        if (
          Array.isArray(dr.behavioral_clues.impulsive) &&
          dr.behavioral_clues.impulsive.length > 0
        ) {
          prompt += `즉흥 행동: ${dr.behavioral_clues.impulsive.join(", ")}\n`;
        }
        if (
          Array.isArray(dr.behavioral_clues.planned) &&
          dr.behavioral_clues.planned.length > 0
        ) {
          prompt += `계획적 행동: ${dr.behavioral_clues.planned.join(", ")}\n`;
        }
      }
    }

    prompt += `\n`;
  });

  prompt += `\n위 일일 일상 리포트들을 종합하여 월간 일상 리포트(daily_life_report)를 생성하세요.
일일 패턴들을 분석하여 월간 트렌드와 패턴을 발견하고, 반복되는 이벤트, 감정 트리거, 행동 패턴을 종합하세요.`;

  return prompt;
}
