import type { WeeklyFeedback } from "@/types/weekly-feedback";

/**
 * Daily Life Report용 프롬프트 생성
 */
export function buildDailyLifeReportPrompt(
  weeklyFeedbacks: WeeklyFeedback[],
  month: string,
  dateRange: { start_date: string; end_date: string }
): string {
  const [year, monthNum] = month.split("-");
  const monthLabel = `${year}년 ${monthNum}월`;

  let prompt = `아래는 ${monthLabel} (${dateRange.start_date} ~ ${dateRange.end_date}) 한 달간의 주간 피드백의 일상 데이터입니다. 
주간 daily_life_report들을 종합하여 월간 일상 리포트(daily_life_report)를 생성하여 JSON만 출력하세요.\n\n`;

  weeklyFeedbacks.forEach((wf, idx) => {
    prompt += `[주간 피드백 ${idx + 1} - ${wf.week_range.start} ~ ${
      wf.week_range.end
    }]\n`;

    const dlr = wf.daily_life_report;
    if (dlr) {
      if (dlr.summary) {
        prompt += `일상 요약: ${dlr.summary}\n`;
      }

      // Daily Summaries Trend
      if (dlr.daily_summaries_trend?.overall_narrative) {
        prompt += `전체 서사: ${dlr.daily_summaries_trend.overall_narrative}\n`;
      }
      if (
        Array.isArray(dlr.daily_summaries_trend?.key_highlights) &&
        dlr.daily_summaries_trend.key_highlights.length > 0
      ) {
        prompt += `주요 하이라이트: ${dlr.daily_summaries_trend.key_highlights.join(
          ", "
        )}\n`;
      }

      // Events Pattern
      if (
        Array.isArray(dlr.events_pattern?.most_frequent_events) &&
        dlr.events_pattern.most_frequent_events.length > 0
      ) {
        prompt += `가장 빈번한 이벤트: ${dlr.events_pattern.most_frequent_events
          .map((e) => `${e.event} (${e.frequency}회)`)
          .join(", ")}\n`;
      }

      // Emotion Triggers Analysis
      if (dlr.emotion_triggers_analysis) {
        const triggers = dlr.emotion_triggers_analysis;
        if (triggers.summary) {
          prompt += `감정 트리거 분석: ${triggers.summary}\n`;
        }
        const categories = triggers.category_distribution;
        if (categories.self.top_triggers.length > 0) {
          prompt += `자기 관련 트리거: ${categories.self.top_triggers.join(
            ", "
          )}\n`;
        }
        if (categories.work.top_triggers.length > 0) {
          prompt += `업무 관련 트리거: ${categories.work.top_triggers.join(
            ", "
          )}\n`;
        }
        if (categories.people.top_triggers.length > 0) {
          prompt += `사람 관련 트리거: ${categories.people.top_triggers.join(
            ", "
          )}\n`;
        }
        if (categories.environment.top_triggers.length > 0) {
          prompt += `환경 관련 트리거: ${categories.environment.top_triggers.join(
            ", "
          )}\n`;
        }
      }

      // Behavioral Patterns
      if (dlr.behavioral_patterns) {
        const bp = dlr.behavioral_patterns;
        if (bp.summary) {
          prompt += `행동 패턴 요약: ${bp.summary}\n`;
        }
        const patterns = bp.pattern_distribution;
        if (patterns.planned.examples.length > 0) {
          prompt += `계획적 행동 예시: ${patterns.planned.examples.join(
            ", "
          )}\n`;
        }
        if (patterns.impulsive.examples.length > 0) {
          prompt += `즉흥 행동 예시: ${patterns.impulsive.examples.join(
            ", "
          )}\n`;
        }
        if (patterns.routine_attempt.examples.length > 0) {
          prompt += `루틴 시도 예시: ${patterns.routine_attempt.examples.join(
            ", "
          )}\n`;
        }
        if (patterns.avoidance.examples.length > 0) {
          prompt += `회피 행동 예시: ${patterns.avoidance.examples.join(
            ", "
          )}\n`;
        }
        if (patterns.routine_failure.examples.length > 0) {
          prompt += `루틴 실패 예시: ${patterns.routine_failure.examples.join(
            ", "
          )}\n`;
        }
      }

      // Keywords Analysis
      if (
        Array.isArray(dlr.keywords_analysis?.top_keywords) &&
        dlr.keywords_analysis.top_keywords.length > 0
      ) {
        prompt += `주요 키워드: ${dlr.keywords_analysis.top_keywords
          .map((k) => `${k.keyword} (${k.frequency}회)`)
          .join(", ")}\n`;
      }

      // AI Comments Insights
      if (
        Array.isArray(dlr.ai_comments_insights?.common_themes) &&
        dlr.ai_comments_insights.common_themes.length > 0
      ) {
        prompt += `공통 테마: ${dlr.ai_comments_insights.common_themes
          .map((t) => `${t.theme} (${t.frequency}회)`)
          .join(", ")}\n`;
      }
    }

    prompt += `\n`;
  });

  prompt += `\n위 주간 일상 리포트들을 종합하여 월간 일상 리포트(daily_life_report)를 생성하세요.
주간 패턴들을 분석하여 월간 트렌드와 패턴을 발견하고, 반복되는 이벤트, 감정 트리거, 행동 패턴을 종합하세요.`;

  return prompt;
}
