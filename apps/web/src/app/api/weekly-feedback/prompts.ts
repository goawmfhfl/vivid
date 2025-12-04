import type { DailyFeedbackForWeekly } from "./types";
import { getKSTDateString } from "@/lib/date-utils";

/**
 * 날짜 포맷 변환: YYYY-MM-DD -> 11/24월 형식
 */
function formatDateForEmotion(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00+09:00");
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[date.getDay()];
  return `${month}/${day}${weekday}`;
}

/**
 * 모든 섹션을 포함하는 통합 프롬프트 생성
 * 단 한 번의 요청으로 모든 주간 피드백 섹션을 생성하기 위한 프롬프트
 */
export function buildUnifiedWeeklyFeedbackPrompt(
  dailyFeedbacks: DailyFeedbackForWeekly,
  weekRange: { start: string; end: string; timezone: string }
): string {
  let prompt = `아래는 ${weekRange.start}부터 ${weekRange.end}까지의 일주일간 일일 피드백 데이터입니다. 
위 스키마에 따라 주간 피드백의 모든 섹션(summary_report, daily_life_report, emotion_report, vision_report, insight_report, execution_report, closing_report)을 한 번에 생성하여 JSON만 출력하세요.\n\n`;

  // 일일 피드백 데이터를 종합하여 제공
  dailyFeedbacks.forEach((feedback, idx) => {
    prompt += `\n[일일 피드백 ${idx + 1} - ${feedback.report_date}]\n`;

    // Summary Report 데이터
    if (feedback.summary_report?.summary) {
      prompt += `[요약] ${feedback.summary_report.summary}\n`;
    }
    if (
      Array.isArray(feedback.summary_report?.key_points) &&
      feedback.summary_report.key_points.length > 0
    ) {
      prompt += `[핵심 포인트] ${feedback.summary_report.key_points.join(
        ", "
      )}\n`;
    }
    if (feedback.summary_report?.trend_analysis) {
      prompt += `[트렌드 분석] ${feedback.summary_report.trend_analysis}\n`;
    }

    // Daily Report 데이터
    if (feedback.daily_report?.summary) {
      prompt += `[일상 요약] ${feedback.daily_report.summary}\n`;
    }
    if (
      Array.isArray(feedback.daily_report?.daily_events) &&
      feedback.daily_report.daily_events.length > 0
    ) {
      prompt += `[일상 이벤트] ${feedback.daily_report.daily_events.join(
        ", "
      )}\n`;
    }
    if (
      Array.isArray(feedback.daily_report?.keywords) &&
      feedback.daily_report.keywords.length > 0
    ) {
      prompt += `[키워드] ${feedback.daily_report.keywords.join(", ")}\n`;
    }
    if (feedback.daily_report?.ai_comment) {
      prompt += `[AI 코멘트] ${feedback.daily_report.ai_comment}\n`;
    }
    if (feedback.daily_report?.emotion_triggers) {
      const triggers = feedback.daily_report.emotion_triggers;
      if (Array.isArray(triggers.self) && triggers.self.length > 0) {
        prompt += `[감정 트리거-자기] ${triggers.self.join(", ")}\n`;
      }
      if (Array.isArray(triggers.work) && triggers.work.length > 0) {
        prompt += `[감정 트리거-업무] ${triggers.work.join(", ")}\n`;
      }
      if (Array.isArray(triggers.people) && triggers.people.length > 0) {
        prompt += `[감정 트리거-사람] ${triggers.people.join(", ")}\n`;
      }
      if (Array.isArray(triggers.environment) && triggers.environment.length > 0) {
        prompt += `[감정 트리거-환경] ${triggers.environment.join(", ")}\n`;
      }
    }
    if (feedback.daily_report?.behavioral_clues) {
      const clues = feedback.daily_report.behavioral_clues;
      if (Array.isArray(clues.avoidance) && clues.avoidance.length > 0) {
        prompt += `[회피 행동] ${clues.avoidance.join(", ")}\n`;
      }
      if (Array.isArray(clues.routine_attempt) && clues.routine_attempt.length > 0) {
        prompt += `[루틴 시도] ${clues.routine_attempt.join(", ")}\n`;
      }
      if (Array.isArray(clues.routine_failure) && clues.routine_failure.length > 0) {
        prompt += `[루틴 실패] ${clues.routine_failure.join(", ")}\n`;
      }
      if (Array.isArray(clues.impulsive) && clues.impulsive.length > 0) {
        prompt += `[즉흥 충동] ${clues.impulsive.join(", ")}\n`;
      }
      if (Array.isArray(clues.planned) && clues.planned.length > 0) {
        prompt += `[계획적 행동] ${clues.planned.join(", ")}\n`;
      }
    }

    // Emotion Overview 데이터
    if (feedback.emotion_overview) {
      const emotion = feedback.emotion_overview;
      if (emotion.ai_mood_valence !== null) {
        prompt += `[감정 쾌-불쾌] ${emotion.ai_mood_valence}\n`;
      }
      if (emotion.ai_mood_arousal !== null) {
        prompt += `[감정 각성-에너지] ${emotion.ai_mood_arousal}\n`;
      }
      if (Array.isArray(emotion.emotion_curve) && emotion.emotion_curve.length > 0) {
        prompt += `[감정 곡선] ${emotion.emotion_curve.join(" → ")}\n`;
      }
      if (emotion.dominant_emotion) {
        prompt += `[대표 감정] ${emotion.dominant_emotion}\n`;
      }
      if (emotion.emotion_quadrant) {
        prompt += `[감정 사분면] ${emotion.emotion_quadrant}\n`;
      }
      if (emotion.emotion_quadrant_explanation) {
        prompt += `[감정 사분면 설명] ${emotion.emotion_quadrant_explanation}\n`;
      }
      if (Array.isArray(emotion.emotion_timeline) && emotion.emotion_timeline.length > 0) {
        prompt += `[감정 타임라인] ${emotion.emotion_timeline.join(", ")}\n`;
      }
    }

    // Emotion Report 데이터 (Pro 전용)
    if (
      Array.isArray(feedback.emotion_report?.emotion_events) &&
      feedback.emotion_report.emotion_events.length > 0
    ) {
      prompt += `[감정 이벤트]\n`;
      feedback.emotion_report.emotion_events.forEach((event, i) => {
        prompt += `  ${i + 1}. ${event.event} (감정: ${event.emotion}${
          event.reason ? `, 이유: ${event.reason}` : ""
        })\n`;
      });
    }

    // Dream Report 데이터
    if (feedback.dream_report) {
      const dream = feedback.dream_report;
      if (dream.summary) {
        prompt += `[비전 요약] ${dream.summary}\n`;
      }
      if (dream.vision_self) {
        prompt += `[비전 자기] ${dream.vision_self}\n`;
      }
      if (Array.isArray(dream.vision_keywords) && dream.vision_keywords.length > 0) {
        prompt += `[비전 키워드] ${dream.vision_keywords.join(", ")}\n`;
      }
      if (dream.vision_ai_feedback) {
        prompt += `[비전 AI 피드백] ${dream.vision_ai_feedback}\n`;
      }
      if (Array.isArray(dream.dream_goals) && dream.dream_goals.length > 0) {
        prompt += `[꿈 목표] ${dream.dream_goals.join(", ")}\n`;
      }
      if (Array.isArray(dream.dreamer_traits) && dream.dreamer_traits.length > 0) {
        prompt += `[꿈꾸는 사람의 특징] ${dream.dreamer_traits.join(", ")}\n`;
      }
    }

    // Insight Report 데이터
    if (feedback.insight_report) {
      const insight = feedback.insight_report;
      if (Array.isArray(insight.core_insights) && insight.core_insights.length > 0) {
        prompt += `[핵심 인사이트]\n`;
        insight.core_insights.forEach((item, i) => {
          prompt += `  ${i + 1}. ${item.insight} (출처: ${item.source})\n`;
        });
      }
      if (insight.meta_question) {
        prompt += `[메타 질문] ${insight.meta_question}\n`;
      }
      if (insight.insight_ai_comment) {
        prompt += `[인사이트 AI 코멘트] ${insight.insight_ai_comment}\n`;
      }
      if (
        Array.isArray(insight.insight_next_actions) &&
        insight.insight_next_actions.length > 0
      ) {
        prompt += `[다음 액션]\n`;
        insight.insight_next_actions.forEach((action, i) => {
          prompt += `  ${i + 1}. ${action.label} (난이도: ${
            action.difficulty
          }, 예상 시간: ${action.estimated_minutes}분)\n`;
        });
      }
    }

    // Feedback Report 데이터
    if (feedback.feedback_report) {
      const feedbackData = feedback.feedback_report;
      if (feedbackData.core_feedback) {
        prompt += `[핵심 피드백] ${feedbackData.core_feedback}\n`;
      }
      if (Array.isArray(feedbackData.positives) && feedbackData.positives.length > 0) {
        prompt += `[긍정적 측면] ${feedbackData.positives.join(", ")}\n`;
      }
      if (Array.isArray(feedbackData.improvements) && feedbackData.improvements.length > 0) {
        prompt += `[개선점] ${feedbackData.improvements.join(", ")}\n`;
      }
      if (feedbackData.ai_message) {
        prompt += `[AI 메시지] ${feedbackData.ai_message}\n`;
      }
      if (
        Array.isArray(feedbackData.feedback_person_traits) &&
        feedbackData.feedback_person_traits.length > 0
      ) {
        prompt += `[피드백 정체성] ${feedbackData.feedback_person_traits.join(
          ", "
        )}\n`;
      }
    }

    prompt += `\n`;
  });

  prompt += `\n위 데이터를 종합하여 주간 피드백의 모든 섹션을 생성하세요:
1. summary_report: 이번 주 전체를 요약한 핵심 내용
2. daily_life_report: 일주일간의 일상 패턴과 트렌드 분석
3. emotion_report: 일주일간의 감정 흐름과 패턴 분석 (ai_mood_valence와 ai_mood_arousal은 일별 값들의 평균 계산)
4. vision_report: 일주일간의 비전과 꿈에 대한 통합 분석
5. insight_report: 일주일간의 인사이트와 패턴 발견
6. execution_report: 일주일간의 실행과 행동에 대한 분석
7. closing_report: 이번 주를 마무리하는 종합 리포트

모든 섹션을 스키마에 맞게 완전히 작성해주세요.`;

  return prompt;
}

// 기존 함수들은 하위 호환성을 위해 유지 (사용되지 않을 수 있음)
export function buildSummaryReportPrompt(
  dailyFeedbacks: DailyFeedbackForWeekly,
  weekRange: { start: string; end: string; timezone: string }
): string {
  let prompt = `아래는 ${weekRange.start}부터 ${weekRange.end}까지의 일주일간 일일 피드백 데이터입니다. 위 스키마에 따라 주간 전체 요약(summary_report)을 생성하여 JSON만 출력하세요.\n\n`;

  dailyFeedbacks.forEach((feedback, idx) => {
    prompt += `\n[일일 피드백 ${idx + 1} - ${feedback.report_date}]\n`;

    if (feedback.summary_report?.summary) {
      prompt += `요약: ${feedback.summary_report.summary}\n`;
    }
    if (
      Array.isArray(feedback.summary_report?.key_points) &&
      feedback.summary_report.key_points.length > 0
    ) {
      prompt += `핵심 포인트: ${feedback.summary_report.key_points.join(
        ", "
      )}\n`;
    }
    if (feedback.summary_report?.trend_analysis) {
      prompt += `트렌드 분석: ${feedback.summary_report.trend_analysis}\n`;
    }
  });

  prompt += `\n\n위 데이터를 종합하여 주간 전체 요약(summary_report)을 생성하세요.`;
  return prompt;
}

export function buildDailyLifePrompt(
  dailyFeedbacks: DailyFeedbackForWeekly,
  weekRange: { start: string; end: string; timezone: string }
): string {
  let prompt = `아래는 ${weekRange.start}부터 ${weekRange.end}까지의 일주일간 일일 피드백의 "오늘의 일상" 데이터입니다. 위 스키마에 따라 주간 일상 리포트(daily_life_report)를 생성하여 JSON만 출력하세요.\n\n`;

  dailyFeedbacks.forEach((feedback, idx) => {
    prompt += `\n[일일 피드백 ${idx + 1} - ${feedback.report_date}]\n`;

    if (feedback.daily_report?.summary) {
      prompt += `일상 요약: ${feedback.daily_report.summary}\n`;
    }
    if (
      Array.isArray(feedback.daily_report?.daily_events) &&
      feedback.daily_report.daily_events.length > 0
    ) {
      prompt += `일상 이벤트: ${feedback.daily_report.daily_events.join(
        ", "
      )}\n`;
    }
    if (
      Array.isArray(feedback.daily_report?.keywords) &&
      feedback.daily_report.keywords.length > 0
    ) {
      prompt += `키워드: ${feedback.daily_report.keywords.join(", ")}\n`;
    }
    if (feedback.daily_report?.ai_comment) {
      prompt += `AI 코멘트: ${feedback.daily_report.ai_comment}\n`;
    }
    if (feedback.daily_report?.emotion_triggers) {
      const triggers = feedback.daily_report.emotion_triggers;
      if (Array.isArray(triggers.self) && triggers.self.length > 0) {
        prompt += `감정 트리거 (자기): ${triggers.self.join(", ")}\n`;
      }
      if (Array.isArray(triggers.work) && triggers.work.length > 0) {
        prompt += `감정 트리거 (업무): ${triggers.work.join(", ")}\n`;
      }
      if (Array.isArray(triggers.people) && triggers.people.length > 0) {
        prompt += `감정 트리거 (사람): ${triggers.people.join(", ")}\n`;
      }
      if (Array.isArray(triggers.environment) && triggers.environment.length > 0) {
        prompt += `감정 트리거 (환경): ${triggers.environment.join(", ")}\n`;
      }
    }
    if (feedback.daily_report?.behavioral_clues) {
      const clues = feedback.daily_report.behavioral_clues;
      if (Array.isArray(clues.avoidance) && clues.avoidance.length > 0) {
        prompt += `회피 행동: ${clues.avoidance.join(", ")}\n`;
      }
      if (Array.isArray(clues.routine_attempt) && clues.routine_attempt.length > 0) {
        prompt += `루틴 시도: ${clues.routine_attempt.join(", ")}\n`;
      }
      if (Array.isArray(clues.routine_failure) && clues.routine_failure.length > 0) {
        prompt += `루틴 실패: ${clues.routine_failure.join(", ")}\n`;
      }
      if (Array.isArray(clues.impulsive) && clues.impulsive.length > 0) {
        prompt += `즉흥 충동: ${clues.impulsive.join(", ")}\n`;
      }
      if (Array.isArray(clues.planned) && clues.planned.length > 0) {
        prompt += `계획적 행동: ${clues.planned.join(", ")}\n`;
      }
    }
  });

  prompt += `\n\n위 데이터를 종합하여 주간 일상 리포트(daily_life_report)를 생성하세요. 패턴을 발견하고 트렌드 분석을 포함하세요.`;
  return prompt;
}

export function buildEmotionPrompt(
  dailyFeedbacks: DailyFeedbackForWeekly,
  weekRange: { start: string; end: string; timezone: string }
): string {
  let prompt = `아래는 ${weekRange.start}부터 ${weekRange.end}까지의 일주일간 일일 피드백의 감정 데이터입니다. 위 스키마에 따라 주간 감정 리포트(emotion_report)를 생성하여 JSON만 출력하세요.\n\n`;

  dailyFeedbacks.forEach((feedback, idx) => {
    prompt += `\n[일일 피드백 ${idx + 1} - ${feedback.report_date}]\n`;

    if (feedback.emotion_report) {
      const emotion = feedback.emotion_report;
      if (emotion.ai_mood_valence !== null) {
        prompt += `감정 쾌-불쾌 (Valence): ${emotion.ai_mood_valence}\n`;
      }
      if (emotion.ai_mood_arousal !== null) {
        prompt += `감정 각성-에너지 (Arousal): ${emotion.ai_mood_arousal}\n`;
      }
      if (Array.isArray(emotion.emotion_curve) && emotion.emotion_curve.length > 0) {
        prompt += `감정 곡선: ${emotion.emotion_curve.join(" → ")}\n`;
      }
      if (emotion.dominant_emotion) {
        prompt += `대표 감정: ${emotion.dominant_emotion}\n`;
      }
      if (emotion.emotion_quadrant) {
        prompt += `감정 사분면: ${emotion.emotion_quadrant}\n`;
      }
      if (emotion.emotion_quadrant_explanation) {
        prompt += `감정 사분면 설명: ${emotion.emotion_quadrant_explanation}\n`;
      }
      if (Array.isArray(emotion.emotion_timeline) && emotion.emotion_timeline.length > 0) {
        prompt += `감정 타임라인: ${emotion.emotion_timeline.join(", ")}\n`;
      }
    }

    if (
      Array.isArray(feedback.emotion_report?.emotion_events) &&
      feedback.emotion_report.emotion_events.length > 0
    ) {
      prompt += `감정 이벤트:\n`;
      feedback.emotion_report.emotion_events.forEach((event, i) => {
        prompt += `  ${i + 1}. ${event.event} (감정: ${event.emotion}${
          event.reason ? `, 이유: ${event.reason}` : ""
        })\n`;
      });
    }
  });

  prompt += `\n\n위 데이터를 종합하여 주간 감정 리포트(emotion_report)를 생성하세요.
- ai_mood_valence: 일별 ai_mood_valence 값들의 평균을 계산하세요 (null이 아닌 값들만 평균 계산)
- ai_mood_arousal: 일별 ai_mood_arousal 값들의 평균을 계산하세요 (null이 아닌 값들만 평균 계산)
- dominant_emotion: 이번 주를 대표하는 가장 핵심적인 감정을 한 단어 또는 짧은 구로 작성하세요
${formatDateForEmotion(weekRange.start)})`;
  return prompt;
}

export function buildVisionPrompt(
  dailyFeedbacks: DailyFeedbackForWeekly,
  weekRange: { start: string; end: string; timezone: string }
): string {
  let prompt = `아래는 ${weekRange.start}부터 ${weekRange.end}까지의 일주일간 일일 피드백의 "오늘의 비전" 데이터입니다. 위 스키마에 따라 주간 비전 리포트(vision_report)를 생성하여 JSON만 출력하세요.\n\n`;

  dailyFeedbacks.forEach((feedback, idx) => {
    prompt += `\n[일일 피드백 ${idx + 1} - ${feedback.report_date}]\n`;

    if (feedback.dream_report) {
      const dream = feedback.dream_report;
      if (dream.summary) {
        prompt += `비전 요약: ${dream.summary}\n`;
      }
      if (dream.vision_self) {
        prompt += `비전 자기: ${dream.vision_self}\n`;
      }
      if (Array.isArray(dream.vision_keywords) && dream.vision_keywords.length > 0) {
        prompt += `비전 키워드: ${dream.vision_keywords.join(", ")}\n`;
      }
      if (dream.vision_ai_feedback) {
        prompt += `비전 AI 피드백: ${dream.vision_ai_feedback}\n`;
      }
      if (Array.isArray(dream.dream_goals) && dream.dream_goals.length > 0) {
        prompt += `꿈 목표: ${dream.dream_goals.join(", ")}\n`;
      }
      if (Array.isArray(dream.dreamer_traits) && dream.dreamer_traits.length > 0) {
        prompt += `꿈꾸는 사람의 특징: ${dream.dreamer_traits.join(", ")}\n`;
      }
    }
  });

  prompt += `\n\n위 데이터를 종합하여 주간 비전 리포트를 생성하세요. 패턴을 발견하고 시각화 데이터를 포함하세요.`;
  return prompt;
}

export function buildInsightPrompt(
  dailyFeedbacks: DailyFeedbackForWeekly,
  weekRange: { start: string; end: string; timezone: string }
): string {
  let prompt = `아래는 ${weekRange.start}부터 ${weekRange.end}까지의 일주일간 일일 피드백의 인사이트 데이터입니다. 위 스키마에 따라 주간 인사이트 리포트(insight_report)를 생성하여 JSON만 출력하세요.\n\n`;

  dailyFeedbacks.forEach((feedback, idx) => {
    prompt += `\n[일일 피드백 ${idx + 1} - ${feedback.report_date}]\n`;

    if (feedback.insight_report) {
      const insight = feedback.insight_report;
      if (Array.isArray(insight.core_insights) && insight.core_insights.length > 0) {
        prompt += `핵심 인사이트:\n`;
        insight.core_insights.forEach((item, i) => {
          prompt += `  ${i + 1}. ${item.insight} (출처: ${item.source})\n`;
        });
      }
      if (insight.meta_question) {
        prompt += `메타 질문: ${insight.meta_question}\n`;
      }
      if (insight.insight_ai_comment) {
        prompt += `인사이트 AI 코멘트: ${insight.insight_ai_comment}\n`;
      }
      if (
        Array.isArray(insight.insight_next_actions) &&
        insight.insight_next_actions.length > 0
      ) {
        prompt += `다음 액션:\n`;
        insight.insight_next_actions.forEach((action, i) => {
          prompt += `  ${i + 1}. ${action.label} (난이도: ${
            action.difficulty
          }, 예상 시간: ${action.estimated_minutes}분)\n`;
        });
      }
    }
  });

  prompt += `\n\n위 데이터를 종합하여 주간 인사이트 리포트(insight_report)를 생성하세요.`;
  return prompt;
}

export function buildExecutionPrompt(
  dailyFeedbacks: DailyFeedbackForWeekly,
  weekRange: { start: string; end: string; timezone: string }
): string {
  let prompt = `아래는 ${weekRange.start}부터 ${weekRange.end}까지의 일주일간 일일 피드백의 실행 데이터입니다. 위 스키마에 따라 주간 실행 리포트(execution_report)를 생성하여 JSON만 출력하세요.\n\n`;

  dailyFeedbacks.forEach((feedback, idx) => {
    prompt += `\n[일일 피드백 ${idx + 1} - ${feedback.report_date}]\n`;

    if (feedback.feedback_report) {
      const feedbackData = feedback.feedback_report;
      if (feedbackData.core_feedback) {
        prompt += `핵심 피드백: ${feedbackData.core_feedback}\n`;
      }
      if (Array.isArray(feedbackData.positives) && feedbackData.positives.length > 0) {
        prompt += `긍정적 측면: ${feedbackData.positives.join(", ")}\n`;
      }
      if (Array.isArray(feedbackData.improvements) && feedbackData.improvements.length > 0) {
        prompt += `개선점: ${feedbackData.improvements.join(", ")}\n`;
      }
      if (feedbackData.ai_message) {
        prompt += `AI 메시지: ${feedbackData.ai_message}\n`;
      }
      if (
        Array.isArray(feedbackData.feedback_person_traits) &&
        feedbackData.feedback_person_traits.length > 0
      ) {
        prompt += `피드백 정체성: ${feedbackData.feedback_person_traits.join(
          ", "
        )}\n`;
      }
    }
  });

  prompt += `\n\n위 데이터를 종합하여 주간 실행 리포트(execution_report)를 생성하세요.`;
  return prompt;
}

export function buildClosingPrompt(
  dailyFeedbacks: DailyFeedbackForWeekly,
  weekRange: { start: string; end: string; timezone: string }
): string {
  let prompt = `아래는 ${weekRange.start}부터 ${weekRange.end}까지의 일주일간 일일 피드백 데이터입니다. 위 스키마에 따라 주간 마무리 리포트(closing_report)를 생성하여 JSON만 출력하세요.\n\n`;

  dailyFeedbacks.forEach((feedback, idx) => {
    prompt += `\n[일일 피드백 ${idx + 1} - ${feedback.report_date}]\n`;
    // 모든 섹션의 요약 정보를 포함
    if (feedback.summary_report?.summary) {
      prompt += `요약: ${feedback.summary_report.summary}\n`;
    }
  });

  prompt += `\n\n위 데이터를 종합하여 이번 주를 마무리하는 종합 리포트(closing_report)를 생성하세요.`;
  return prompt;
}
