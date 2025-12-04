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
 * Weekly Overview 프롬프트 생성
 */
export function buildWeeklyOverviewPrompt(
  dailyFeedbacks: DailyFeedbackForWeekly,
  weekRange: { start: string; end: string; timezone: string }
): string {
  let prompt = `아래는 ${weekRange.start}부터 ${weekRange.end}까지의 일주일간 일일 피드백 데이터입니다. 위 스키마에 따라 주간 전체 요약(weekly_overview)을 생성하여 JSON만 출력하세요.\n\n`;

  dailyFeedbacks.forEach((feedback, idx) => {
    prompt += `\n[일일 피드백 ${idx + 1} - ${feedback.report_date}]\n`;

    if (feedback.narrative_overview?.narrative_summary) {
      prompt += `요약: ${feedback.narrative_overview.narrative_summary}\n`;
    }
    if (
      feedback.narrative_overview?.keywords &&
      feedback.narrative_overview.keywords.length > 0
    ) {
      prompt += `키워드: ${feedback.narrative_overview.keywords.join(", ")}\n`;
    }
    if (feedback.narrative_overview?.narrative) {
      prompt += `이야기: ${feedback.narrative_overview.narrative}\n`;
    }
  });

  prompt += `\n\n위 데이터를 종합하여 주간 전체 요약을 생성하세요.`;
  return prompt;
}

/**
 * Daily Life Report 프롬프트 생성
 */
export function buildDailyLifePrompt(
  dailyFeedbacks: DailyFeedbackForWeekly,
  weekRange: { start: string; end: string; timezone: string }
): string {
  let prompt = `아래는 ${weekRange.start}부터 ${weekRange.end}까지의 일주일간 일일 피드백의 "오늘의 일상" 데이터입니다. 위 스키마에 따라 주간 일상 리포트(daily_life_report)를 생성하여 JSON만 출력하세요.\n\n`;

  dailyFeedbacks.forEach((feedback, idx) => {
    prompt += `\n[일일 피드백 ${idx + 1} - ${feedback.report_date}]\n`;

    // Daily Report 데이터
    if (feedback.daily_report?.summary) {
      prompt += `일상 요약: ${feedback.daily_report.summary}\n`;
    }
    if (
      feedback.daily_report?.daily_events &&
      feedback.daily_report.daily_events.length > 0
    ) {
      prompt += `일상 이벤트: ${feedback.daily_report.daily_events.join(
        ", "
      )}\n`;
    }
    if (
      feedback.daily_report?.keywords &&
      feedback.daily_report.keywords.length > 0
    ) {
      prompt += `키워드: ${feedback.daily_report.keywords.join(", ")}\n`;
    }
    if (feedback.daily_report?.ai_comment) {
      prompt += `AI 코멘트: ${feedback.daily_report.ai_comment}\n`;
    }
    if (feedback.daily_report?.emotion_triggers) {
      const triggers = feedback.daily_report.emotion_triggers;
      if (triggers.self && triggers.self.length > 0) {
        prompt += `감정 트리거 (자기): ${triggers.self.join(", ")}\n`;
      }
      if (triggers.work && triggers.work.length > 0) {
        prompt += `감정 트리거 (업무): ${triggers.work.join(", ")}\n`;
      }
      if (triggers.people && triggers.people.length > 0) {
        prompt += `감정 트리거 (사람): ${triggers.people.join(", ")}\n`;
      }
      if (triggers.environment && triggers.environment.length > 0) {
        prompt += `감정 트리거 (환경): ${triggers.environment.join(", ")}\n`;
      }
    }
    if (feedback.daily_report?.behavioral_clues) {
      const clues = feedback.daily_report.behavioral_clues;
      if (clues.planned && clues.planned.length > 0) {
        prompt += `행동 단서 (계획적): ${clues.planned.join(", ")}\n`;
      }
      if (clues.impulsive && clues.impulsive.length > 0) {
        prompt += `행동 단서 (즉흥적): ${clues.impulsive.join(", ")}\n`;
      }
      if (clues.routine_attempt && clues.routine_attempt.length > 0) {
        prompt += `행동 단서 (루틴 시도): ${clues.routine_attempt.join(
          ", "
        )}\n`;
      }
      if (clues.avoidance && clues.avoidance.length > 0) {
        prompt += `행동 단서 (회피): ${clues.avoidance.join(", ")}\n`;
      }
      if (clues.routine_failure && clues.routine_failure.length > 0) {
        prompt += `행동 단서 (루틴 실패): ${clues.routine_failure.join(
          ", "
        )}\n`;
      }
    }
  });

  prompt += `\n\n위 데이터를 종합하여 주간 일상 리포트를 생성하세요. 패턴을 발견하고 시각화 데이터를 포함하세요.`;
  return prompt;
}

/**
 * Emotion Overview 프롬프트 생성
 */
export function buildEmotionPrompt(
  dailyFeedbacks: DailyFeedbackForWeekly,
  weekRange: { start: string; end: string; timezone: string }
): string {
  let prompt = `아래는 ${weekRange.start}부터 ${weekRange.end}까지의 일주일간 일일 피드백의 감정 데이터입니다. 위 스키마에 따라 주간 감정 리포트(emotion_report)를 생성하여 JSON만 출력하세요.\n\n`;

  dailyFeedbacks.forEach((feedback, idx) => {
    prompt += `\n[일일 피드백 ${idx + 1} - ${feedback.report_date}]\n`;

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
      if (emotion.emotion_quadrant) {
        prompt += `감정 사분면: ${emotion.emotion_quadrant}\n`;
      }
      if (emotion.emotion_quadrant_explanation) {
        prompt += `감정 사분면 설명: ${emotion.emotion_quadrant_explanation}\n`;
      }
      if (emotion.emotion_timeline && emotion.emotion_timeline.length > 0) {
        prompt += `감정 타임라인: ${emotion.emotion_timeline.join(", ")}\n`;
      }
      // emotion_report의 emotion_events는 Pro 전용이므로 별도로 처리
    }

    // Emotion Report 데이터 (Pro 전용 필드)
    if (
      feedback.emotion_report?.emotion_events &&
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
- daily_emotions의 date 형식은 "11/24월" 형식으로 작성하세요 (예: ${formatDateForEmotion(
    weekRange.start
  )})`;
  return prompt;
}

/**
 * Vision Report 프롬프트 생성
 */
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
      if (dream.vision_keywords && dream.vision_keywords.length > 0) {
        prompt += `비전 키워드: ${dream.vision_keywords.join(", ")}\n`;
      }
      if (dream.vision_ai_feedback) {
        prompt += `비전 AI 피드백: ${dream.vision_ai_feedback}\n`;
      }
      if (dream.dream_goals && dream.dream_goals.length > 0) {
        prompt += `꿈 목표: ${dream.dream_goals.join(", ")}\n`;
      }
      if (dream.dreamer_traits && dream.dreamer_traits.length > 0) {
        prompt += `꿈꾸는 사람의 특징: ${dream.dreamer_traits.join(", ")}\n`;
      }
    }
  });

  prompt += `\n\n위 데이터를 종합하여 주간 비전 리포트를 생성하세요. 패턴을 발견하고 시각화 데이터를 포함하세요.`;
  return prompt;
}

/**
 * Insight Report 프롬프트 생성
 */
export function buildInsightPrompt(
  dailyFeedbacks: DailyFeedbackForWeekly,
  weekRange: { start: string; end: string; timezone: string }
): string {
  let prompt = `아래는 ${weekRange.start}부터 ${weekRange.end}까지의 일주일간 일일 피드백의 "오늘의 깨달음" 데이터입니다. 위 스키마에 따라 주간 인사이트 리포트(insight_report)를 생성하여 JSON만 출력하세요.\n\n`;

  dailyFeedbacks.forEach((feedback, idx) => {
    prompt += `\n[일일 피드백 ${idx + 1} - ${feedback.report_date}]\n`;

    if (feedback.insight_report) {
      const insight = feedback.insight_report;
      if (insight.core_insights && insight.core_insights.length > 0) {
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
        insight.insight_next_actions &&
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

  prompt += `\n\n위 데이터를 종합하여 주간 인사이트 리포트를 생성하세요. 패턴을 발견하고 시각화 데이터를 포함하세요.`;
  return prompt;
}

/**
 * Execution Report 프롬프트 생성
 */
export function buildExecutionPrompt(
  dailyFeedbacks: DailyFeedbackForWeekly,
  weekRange: { start: string; end: string; timezone: string }
): string {
  let prompt = `아래는 ${weekRange.start}부터 ${weekRange.end}까지의 일주일간 일일 피드백의 "오늘의 피드백" 데이터입니다. 위 스키마에 따라 주간 실행 리포트(execution_report)를 생성하여 JSON만 출력하세요.\n\n`;

  dailyFeedbacks.forEach((feedback, idx) => {
    prompt += `\n[일일 피드백 ${idx + 1} - ${feedback.report_date}]\n`;

    if (feedback.feedback_report) {
      const fb = feedback.feedback_report;
      if (fb.core_feedback) {
        prompt += `핵심 피드백: ${fb.core_feedback}\n`;
      }
      if (fb.positives && fb.positives.length > 0) {
        prompt += `긍정적 측면: ${fb.positives.join(", ")}\n`;
      }
      if (fb.improvements && fb.improvements.length > 0) {
        prompt += `개선점: ${fb.improvements.join(", ")}\n`;
      }
      if (fb.ai_message) {
        prompt += `AI 메시지: ${fb.ai_message}\n`;
      }
      if (fb.feedback_person_traits && fb.feedback_person_traits.length > 0) {
        prompt += `피드백 정체성: ${fb.feedback_person_traits.join(", ")}\n`;
      }
    }
  });

  prompt += `\n\n위 데이터를 종합하여 주간 실행 성찰 리포트를 생성하세요. 패턴을 발견하고 시각화 데이터를 포함하세요.`;
  return prompt;
}

/**
 * Closing Report 프롬프트 생성
 */
export function buildClosingPrompt(
  dailyFeedbacks: DailyFeedbackForWeekly,
  weekRange: { start: string; end: string; timezone: string }
): string {
  let prompt = `아래는 ${weekRange.start}부터 ${weekRange.end}까지의 일주일간 일일 피드백의 "오늘의 마무리" 데이터입니다. 위 스키마에 따라 주간 마무리 리포트(closing_report)를 생성하여 JSON만 출력하세요.\n\n`;

  prompt += `중요: "이번 주의 나는 어떤 특징을 가진 사람이었는지"를 중심으로 작성해주세요.\n\n`;

  dailyFeedbacks.forEach((feedback, idx) => {
    prompt += `\n[일일 피드백 ${idx + 1} - ${feedback.report_date}]\n`;

    if (feedback.final_report) {
      const final = feedback.final_report;
      if (final.closing_message) {
        prompt += `마무리 메시지: ${final.closing_message}\n`;
      }
      if (final.tomorrow_focus) {
        prompt += `내일 집중: ${final.tomorrow_focus}\n`;
      }
      if (final.growth_points && final.growth_points.length > 0) {
        prompt += `성장 포인트: ${final.growth_points.join(", ")}\n`;
      }
      if (final.adjustment_points && final.adjustment_points.length > 0) {
        prompt += `조정 포인트: ${final.adjustment_points.join(", ")}\n`;
      }
    }
  });

  prompt += `\n\n위 데이터를 종합하여 주간 마무리 리포트를 생성하세요. 이번 주의 정체성과 다음 주의 의도를 중심으로 작성하세요. 시각화 데이터를 포함하세요.`;
  return prompt;
}
