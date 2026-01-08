import type { DailyFeedbackForWeekly } from "./types";

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
위 스키마에 따라 주간 피드백의 모든 섹션(summary_report, daily_life_report, emotion_report, vivid_report, insight_report, execution_report, closing_report)을 한 번에 생성하여 JSON만 출력하세요.\n\n`;

  // 일일 피드백 데이터를 종합하여 제공 (vivid_report와 emotion_report만 사용)
  dailyFeedbacks.forEach((feedback, idx) => {
    prompt += `\n[일일 피드백 ${idx + 1} - ${feedback.report_date}]\n`;

    // Emotion Report 데이터
    if (feedback.emotion_report) {
      const emotion = feedback.emotion_report;
      if (emotion.ai_mood_valence !== null) {
        prompt += `[감정 쾌-불쾌] ${emotion.ai_mood_valence}\n`;
      }
      if (emotion.ai_mood_arousal !== null) {
        prompt += `[감정 각성-에너지] ${emotion.ai_mood_arousal}\n`;
      }
      if (
        Array.isArray(emotion.emotion_curve) &&
        emotion.emotion_curve.length > 0
      ) {
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
      if (
        Array.isArray(emotion.emotion_timeline) &&
        emotion.emotion_timeline.length > 0
      ) {
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

    // Vivid Report 데이터
    if (feedback.vivid_report) {
      const dream = feedback.vivid_report;
      
      // 오늘의 VIVID (현재 모습)
      if (dream.current_summary) {
        prompt += `[오늘의 비비드 요약] ${dream.current_summary}\n`;
      }
      if (dream.current_evaluation) {
        prompt += `[오늘의 비비드 평가] ${dream.current_evaluation}\n`;
      }
      if (
        Array.isArray(dream.current_keywords) &&
        dream.current_keywords.length > 0
      ) {
        prompt += `[오늘의 비비드 키워드] ${dream.current_keywords.join(", ")}\n`;
      }

      // 앞으로의 나의 모습 (미래 비전)
      if (dream.future_summary) {
        prompt += `[기대하는 모습 요약] ${dream.future_summary}\n`;
      }
      if (dream.future_evaluation) {
        prompt += `[기대하는 모습 평가] ${dream.future_evaluation}\n`;
      }
      if (
        Array.isArray(dream.future_keywords) &&
        dream.future_keywords.length > 0
      ) {
        prompt += `[기대하는 모습 키워드] ${dream.future_keywords.join(", ")}\n`;
      }

      // 일치도 분석
      if (dream.alignment_score !== null && dream.alignment_score !== undefined) {
        prompt += `[일치도 점수] ${dream.alignment_score}\n`;
      }

      // 사용자 특성 분석
      if (
        Array.isArray(dream.user_characteristics) &&
        dream.user_characteristics.length > 0
      ) {
        prompt += `[기록을 쓰는 사람의 특징] ${dream.user_characteristics.join(", ")}\n`;
      }
      if (
        Array.isArray(dream.aspired_traits) &&
        dream.aspired_traits.length > 0
      ) {
        prompt += `[지향하는 모습] ${dream.aspired_traits.join(", ")}\n`;
      }
    }

    prompt += `\n`;
  });

  prompt += `\n위 데이터를 종합하여 주간 피드백의 모든 섹션을 생성하세요:

**중요 지시사항:**
1. Pro 멤버십이 아닌 경우, Pro 전용 필드는 모두 null로 출력하세요.
2. Free 멤버에게 제공하는 데이터는 간략하게 작성하세요 (토큰 사용량 최소화).
3. 날짜 표현 시 "2일차", "3일차" 같은 표현을 사용하지 말고, 정확한 날짜와 요일을 함께 언급하세요 (예: "2025년 1월 15일 (수요일)").
4. emotion_report의 daily_emotions에는 기록이 있는 날짜의 데이터만 포함하세요 (데이터가 없는 요일은 제외).
5. valence_triggers, arousal_triggers의 각 요소에는 날짜와 요일을 포함하세요 (예: "가족/이사 등의 큰 변화로 인한 기대와 불안의 공존(2025년 1월 15일 수요일)").
6. anxious_triggers, engaged_triggers, sad_triggers, calm_triggers의 각 요소는 현재보다 2배 길이로 상세하게 작성하세요.
7. summary_report의 Pro 버전은 현재 길이의 2/3로 간결하게 작성하세요.

**섹션별 요구사항:**
1. summary_report: 이번 주 전체를 요약한 핵심 내용 (Pro는 배열 구조로 재구성)
2. daily_life_report: 일주일간의 일상 패턴과 트렌드 분석 (Pro는 daily_life_characteristics 5개 추가)
3. emotion_report: 일주일간의 감정 흐름과 패턴 분석 (ai_mood_valence와 ai_mood_arousal은 일별 값들의 평균 계산, 날짜 형식 주의)
4. vivid_report: 일주일간의 비비드 분석 - 8개 섹션 모두 포함 (주간 비비드 요약, 평가, 키워드 분석, 앞으로의 모습 분석, 일치도 트렌드, 사용자 특징 분석, 지향하는 모습 분석, 주간 인사이트)
5. insight_report: 일주일간의 인사이트와 패턴 발견 (growth_insights와 next_week_focus 분리)
6. execution_report: 일주일간의 실행과 행동에 대한 분석 (positives_top3, improvements_top3, core_feedback_themes 제거, ai_feedback_summary가 가장 먼저 표시)
7. closing_report: 이번 주를 마무리하는 종합 리포트 (identity_evolution 제거)

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

    // vivid_report와 emotion_report 데이터만 사용
    if (feedback.vivid_report) {
      const vivid = feedback.vivid_report;
      if (vivid.current_summary) {
        prompt += `오늘의 비비드 요약: ${vivid.current_summary}\n`;
      }
      if (vivid.future_summary) {
        prompt += `기대하는 모습 요약: ${vivid.future_summary}\n`;
      }
    }

    if (feedback.emotion_report) {
      const emotion = feedback.emotion_report;
      if (emotion.ai_mood_valence !== null) {
        prompt += `감정 쾌-불쾌: ${emotion.ai_mood_valence}\n`;
      }
      if (emotion.ai_mood_arousal !== null) {
        prompt += `감정 각성-에너지: ${emotion.ai_mood_arousal}\n`;
      }
      if (emotion.dominant_emotion) {
        prompt += `대표 감정: ${emotion.dominant_emotion}\n`;
      }
    }
  });

  prompt += `\n\n위 데이터를 종합하여 주간 전체 요약(summary_report)을 생성하세요.

**중요**: title 필드는 이번 주의 핵심을 '~~했던 한 주' 형식으로 작성하세요. 예를 들어:
- "데이터 손실과 회복을 경험했던 한 주"
- "새로운 도전을 시작했던 한 주"
- "스트레스 속에서도 성장을 발견했던 한 주"

'~~한 여정'이라는 표현은 절대 사용하지 말고, 반드시 '~~했던 한 주'로 표현하세요.`;
  return prompt;
}

export function buildDailyLifePrompt(
  dailyFeedbacks: DailyFeedbackForWeekly,
  weekRange: { start: string; end: string; timezone: string }
): string {
  let prompt = `아래는 ${weekRange.start}부터 ${weekRange.end}까지의 일주일간 일일 피드백의 "오늘의 일상" 데이터입니다. 위 스키마에 따라 주간 일상 리포트(daily_life_report)를 생성하여 JSON만 출력하세요.\n\n`;

  dailyFeedbacks.forEach((feedback, idx) => {
    prompt += `\n[일일 피드백 ${idx + 1} - ${feedback.report_date}]\n`;

    // vivid_report와 emotion_report 데이터만 사용
    if (feedback.vivid_report) {
      const vivid = feedback.vivid_report;
      if (vivid.current_summary) {
        prompt += `오늘의 비비드 요약: ${vivid.current_summary}\n`;
      }
      if (
        Array.isArray(vivid.current_keywords) &&
        vivid.current_keywords.length > 0
      ) {
        prompt += `오늘의 비비드 키워드: ${vivid.current_keywords.join(", ")}\n`;
      }
    }

    if (feedback.emotion_report) {
      const emotion = feedback.emotion_report;
      if (emotion.dominant_emotion) {
        prompt += `대표 감정: ${emotion.dominant_emotion}\n`;
      }
      if (emotion.emotion_quadrant) {
        prompt += `감정 사분면: ${emotion.emotion_quadrant}\n`;
      }
    }
  });

  prompt += `\n\n위 데이터를 종합하여 주간 일상 리포트(daily_life_report)를 생성하세요. 패턴을 발견하고 트렌드 분석을 포함하세요.

**중요**: summary 필드에서 날짜를 언급할 때는 반드시 요일 정보를 포함하세요. 예: "이번 주(월요일(12/01)–일요일(12/07))" 또는 "12/01(월)–12/07(일)" 형식으로 작성하세요.`;
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
      if (
        Array.isArray(emotion.emotion_curve) &&
        emotion.emotion_curve.length > 0
      ) {
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
      if (
        Array.isArray(emotion.emotion_timeline) &&
        emotion.emotion_timeline.length > 0
      ) {
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

export function buildVividPrompt(
  dailyFeedbacks: DailyFeedbackForWeekly,
  weekRange: { start: string; end: string; timezone: string }
): string {
  let prompt = `아래는 ${weekRange.start}부터 ${weekRange.end}까지의 일주일간 일일 피드백의 "오늘의 비비드" 데이터입니다. 위 스키마에 따라 주간 비비드 리포트(vivid_report)를 생성하여 JSON만 출력하세요.\n\n`;

  dailyFeedbacks.forEach((feedback, idx) => {
    prompt += `\n[일일 피드백 ${idx + 1} - ${feedback.report_date}]\n`;

    if (feedback.vivid_report) {
      const vivid = feedback.vivid_report;
      
      // 오늘의 VIVID (현재 모습)
      if (vivid.current_summary) {
        prompt += `오늘의 비비드 요약: ${vivid.current_summary}\n`;
      }
      if (vivid.current_evaluation) {
        prompt += `오늘의 비비드 평가: ${vivid.current_evaluation}\n`;
      }
      if (
        Array.isArray(vivid.current_keywords) &&
        vivid.current_keywords.length > 0
      ) {
        prompt += `오늘의 비비드 키워드: ${vivid.current_keywords.join(", ")}\n`;
      }

      // 앞으로의 나의 모습 (미래 비전)
      if (vivid.future_summary) {
        prompt += `기대하는 모습 요약: ${vivid.future_summary}\n`;
      }
      if (vivid.future_evaluation) {
        prompt += `기대하는 모습 평가: ${vivid.future_evaluation}\n`;
      }
      if (
        Array.isArray(vivid.future_keywords) &&
        vivid.future_keywords.length > 0
      ) {
        prompt += `기대하는 모습 키워드: ${vivid.future_keywords.join(", ")}\n`;
      }

      // 일치도 분석
      if (vivid.alignment_score !== null && vivid.alignment_score !== undefined) {
        prompt += `일치도 점수: ${vivid.alignment_score}\n`;
      }

      // 사용자 특성 분석
      if (
        Array.isArray(vivid.user_characteristics) &&
        vivid.user_characteristics.length > 0
      ) {
        prompt += `기록을 쓰는 사람의 특징: ${vivid.user_characteristics.join(", ")}\n`;
      }
      if (
        Array.isArray(vivid.aspired_traits) &&
        vivid.aspired_traits.length > 0
      ) {
        prompt += `지향하는 모습: ${vivid.aspired_traits.join(", ")}\n`;
      }
    }
  });

  prompt += `\n\n위 데이터를 종합하여 주간 비비드 리포트(vivid_report)의 8개 섹션을 모두 생성하세요:

**섹션별 상세 요구사항:**

1. **weekly_vivid_summary (주간 비비드 요약)**
   - 7일간의 비비드 기록을 종합하여 300자 내외로 요약
   - key_points: 핵심 포인트를 날짜와 함께 표시 (예: "집 꾸리기·이사 실무 집중: 배송·설치·다이소 쇼핑·실내자전거 이동 등 구체적 행동이 반복됨(2025-12-17, 2025-12-18, 2025-12-21)")
   - next_week_vision_key_points: 다음주 비전의 핵심 포인트 포함

2. **weekly_vivid_evaluation (주간 비비드 평가)**
   - daily_evaluation_trend: 7일간의 current_evaluation 점수 추이 (점수가 텍스트인 경우 숫자로 변환 필요)
   - weekly_average_score: 주간 평균 평가 점수 계산
   - highest_day/lowest_day: 가장 높았던/낮았던 날과 그 이유

3. **weekly_keywords_analysis (주간 키워드 분석)**
   - vision_keywords_trend: 기존 vision_keywords_trend와 동일한 구조 (keyword, days, context, related_keywords), 최대 8개, 홀수 개수(4, 6, 8개)
   - top_10_keywords: 7일간 가장 자주 등장한 키워드 Top 10 (frequency와 dates 포함)

4. **future_vision_analysis (앞으로의 모습 종합 분석)**
   - integrated_summary: 7일간의 "앞으로의 모습" 요약 통합
   - consistency_analysis: 일관성 있는 비전 vs 변화하는 비전 분석
   - evaluation_trend: 주간 비전 평가 점수 추이 (future_evaluation 점수 추이)

5. **alignment_trend_analysis (일치도 트렌드 분석)**
   - daily_alignment_scores: 7일간 일치도 점수 변화 (alignment_score 추이)
   - average_alignment_score: 평균 일치도 점수
   - highest_alignment_day/lowest_alignment_day: 일치도가 높았던/낮았던 날의 패턴
   - trend: "improving" | "declining" | "stable" 중 하나

6. **user_characteristics_analysis (사용자 특징 심화 분석)**
   - consistency_summary: 7일간 특징의 일관성 요약
   - top_5_characteristics: 가장 자주 언급된 특징 Top 5 (frequency와 dates 포함)
   - change_patterns: 새로 나타난 특징, 사라진 특징 분석

7. **aspired_traits_analysis (지향하는 모습 심화 분석)**
   - consistency_summary: 7일간 지향하는 모습의 일관성 요약
   - average_score: 지향하는 모습 점수 평균
   - top_5_aspired_traits: 가장 자주 언급된 지향 모습 Top 5 (frequency와 dates 포함)
   - evolution_process: 지향 모습의 진화 과정 (stages 배열)

8. **weekly_insights (주간 인사이트)**
   - patterns: 7일간의 기록에서 발견한 패턴 (pattern, description, evidence)
   - unexpected_connections: 예상치 못한 연결점 (connection, description, significance)

모든 섹션을 스키마에 맞게 완전히 작성해주세요.`;
  return prompt;
}

export function buildInsightPrompt(
  dailyFeedbacks: DailyFeedbackForWeekly,
  weekRange: { start: string; end: string; timezone: string }
): string {
  let prompt = `아래는 ${weekRange.start}부터 ${weekRange.end}까지의 일주일간 일일 피드백의 인사이트 데이터입니다. 위 스키마에 따라 주간 인사이트 리포트(insight_report)를 생성하여 JSON만 출력하세요.\n\n`;

  dailyFeedbacks.forEach((feedback, idx) => {
    prompt += `\n[일일 피드백 ${idx + 1} - ${feedback.report_date}]\n`;

    // vivid_report와 emotion_report 데이터만 사용
    if (feedback.vivid_report) {
      const vivid = feedback.vivid_report;
      if (vivid.current_summary) {
        prompt += `오늘의 비비드 요약: ${vivid.current_summary}\n`;
      }
      if (vivid.future_summary) {
        prompt += `기대하는 모습 요약: ${vivid.future_summary}\n`;
      }
    }

    if (feedback.emotion_report) {
      const emotion = feedback.emotion_report;
      if (emotion.dominant_emotion) {
        prompt += `대표 감정: ${emotion.dominant_emotion}\n`;
      }
      if (emotion.emotion_quadrant) {
        prompt += `감정 사분면: ${emotion.emotion_quadrant}\n`;
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

    // vivid_report와 emotion_report 데이터만 사용
    if (feedback.vivid_report) {
      const vivid = feedback.vivid_report;
      if (vivid.current_summary) {
        prompt += `오늘의 비비드 요약: ${vivid.current_summary}\n`;
      }
      if (vivid.future_summary) {
        prompt += `기대하는 모습 요약: ${vivid.future_summary}\n`;
      }
    }

    if (feedback.emotion_report) {
      const emotion = feedback.emotion_report;
      if (emotion.dominant_emotion) {
        prompt += `대표 감정: ${emotion.dominant_emotion}\n`;
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

    // vivid_report와 emotion_report 데이터만 사용
    if (feedback.vivid_report) {
      const vivid = feedback.vivid_report;
      if (vivid.current_summary) {
        prompt += `오늘의 비비드 요약: ${vivid.current_summary}\n`;
      }
      if (vivid.future_summary) {
        prompt += `기대하는 모습 요약: ${vivid.future_summary}\n`;
      }
    }

    if (feedback.emotion_report) {
      const emotion = feedback.emotion_report;
      if (emotion.dominant_emotion) {
        prompt += `대표 감정: ${emotion.dominant_emotion}\n`;
      }
    }
  });

  prompt += `\n\n위 데이터를 종합하여 이번 주를 마무리하는 종합 리포트(closing_report)를 생성하세요.`;
  return prompt;
}
