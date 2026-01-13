import type { DailyFeedbackRow } from "@/types/daily-feedback";

/**
 * 월간 피드백 생성을 위한 일일 피드백 타입
 * (vivid_report와 emotion_report만 포함)
 */
export type DailyFeedbackForMonthly = Pick<
  DailyFeedbackRow,
  "report_date" | "day_of_week" | "vivid_report" | "emotion_report"
>[];

/**
 * 월간 피드백 생성을 위한 프롬프트 생성
 */
export function buildMonthlyFeedbackPrompt(
  dailyFeedbacks: DailyFeedbackForMonthly,
  month: string, // "YYYY-MM"
  dateRange: { start_date: string; end_date: string },
  categorizedRecords?: Map<
    string,
    {
      insights: string[];
      feedbacks: string[];
      visualizings: string[];
      emotions: string[];
    }
  >
): string {
  const [year, monthNum] = month.split("-");
  const monthLabel = `${year}년 ${monthNum}월`;

  let prompt = `아래는 ${monthLabel} (${dateRange.start_date} ~ ${dateRange.end_date}) 한 달간의 일일 피드백 데이터입니다. 위 스키마에 따라 월간 리포트를 생성하여 JSON만 출력하세요.\n\n`;

  // 기본 정보 계산
  const totalDays =
    Math.ceil(
      (new Date(dateRange.end_date).getTime() -
        new Date(dateRange.start_date).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;
  const recordedDays = dailyFeedbacks.length;
  const recordCoverageRate =
    totalDays > 0 ? Math.round((recordedDays / totalDays) * 100) / 100 : 0;

  prompt += `=== 기본 정보 ===\n`;
  prompt += `- target_month: ${month}\n`;
  prompt += `- month_label: ${monthLabel}\n`;
  prompt += `- date_range: ${dateRange.start_date} ~ ${dateRange.end_date}\n`;
  prompt += `- total_days: ${totalDays}\n`;
  prompt += `- recorded_days: ${recordedDays}\n`;
  prompt += `- record_coverage_rate (summary_report에 포함): ${recordCoverageRate}\n\n`;

  // 일별 피드백 데이터 정리
  prompt += `=== 일별 피드백 데이터 ===\n`;

  const feedbacksByDate = new Map<string, DailyFeedbackForMonthly>();
  dailyFeedbacks.forEach((feedback: DailyFeedbackForMonthly[number]) => {
    const date = feedback.report_date;
    if (!feedbacksByDate.has(date)) {
      feedbacksByDate.set(date, []);
    }
    feedbacksByDate.get(date)!.push(feedback);
  });

  // 날짜 순서대로 정리
  const sortedDates = Array.from(feedbacksByDate.keys()).sort();

  sortedDates.forEach((date) => {
    const dayFeedbacks = feedbacksByDate.get(date) || [];
    const dateObj = new Date(date);
    const weekday = dateObj.toLocaleDateString("ko-KR", {
      weekday: "long",
      timeZone: "Asia/Seoul",
    });

    prompt += `\n--- ${date} (${weekday}) ---\n`;

    dayFeedbacks.forEach(
      (feedback: DailyFeedbackForMonthly[number], idx: number) => {
        prompt += `\n[일일 피드백 ${idx + 1}]\n`;

        // vivid_report와 emotion_report만 사용
        if (feedback.vivid_report) {
          const vivid = feedback.vivid_report;
          if (vivid.current_summary) {
            prompt += `오늘의 비비드 요약: ${vivid.current_summary}\n`;
          }
          if (vivid.future_summary) {
            prompt += `기대하는 모습 요약: ${vivid.future_summary}\n`;
          }
          if (
            Array.isArray(vivid.current_keywords) &&
            vivid.current_keywords.length > 0
          ) {
            prompt += `오늘의 비비드 키워드: ${vivid.current_keywords.join(", ")}\n`;
          }
          if (
            Array.isArray(vivid.future_keywords) &&
            vivid.future_keywords.length > 0
          ) {
            prompt += `기대하는 모습 키워드: ${vivid.future_keywords.join(", ")}\n`;
          }
          if (vivid.alignment_score !== null && vivid.alignment_score !== undefined) {
            prompt += `일치도 점수: ${vivid.alignment_score}\n`;
          }
        }

        // emotion_report
        if (feedback.emotion_report) {
          const emotion = feedback.emotion_report;
          if (emotion.ai_mood_valence !== null && emotion.ai_mood_valence !== undefined) {
            prompt += `감정 쾌-불쾌: ${emotion.ai_mood_valence}\n`;
          }
          if (emotion.ai_mood_arousal !== null && emotion.ai_mood_arousal !== undefined) {
            prompt += `감정 각성-에너지: ${emotion.ai_mood_arousal}\n`;
          }
          if (emotion.emotion_quadrant) {
            prompt += `감정 사분면: ${emotion.emotion_quadrant}\n`;
          }
          if (emotion.dominant_emotion) {
            prompt += `대표 감정: ${emotion.dominant_emotion}\n`;
          }
          if (
            Array.isArray(emotion.emotion_curve) &&
            emotion.emotion_curve.length > 0
          ) {
            prompt += `감정 곡선: ${emotion.emotion_curve.join(" → ")}\n`;
          }
        }
      }
    );
  });

  // 카테고리화된 레코드 정보 (있는 경우)
  if (categorizedRecords && categorizedRecords.size > 0) {
    prompt += `\n\n=== 카테고리화된 레코드 요약 ===\n`;
    prompt += `각 날짜별로 insights, feedbacks, visualizings, emotions로 분류된 레코드 정보입니다.\n`;

    categorizedRecords.forEach((records, date) => {
      prompt += `\n${date}:\n`;
      if (Array.isArray(records.insights) && records.insights.length > 0) {
        prompt += `- 인사이트: ${records.insights.slice(0, 3).join(", ")}${
          records.insights.length > 3 ? "..." : ""
        }\n`;
      }
      if (Array.isArray(records.feedbacks) && records.feedbacks.length > 0) {
        prompt += `- 피드백: ${records.feedbacks.slice(0, 3).join(", ")}${
          records.feedbacks.length > 3 ? "..." : ""
        }\n`;
      }
      if (
        Array.isArray(records.visualizings) &&
        records.visualizings.length > 0
      ) {
        prompt += `- 시각화: ${records.visualizings.slice(0, 3).join(", ")}${
          records.visualizings.length > 3 ? "..." : ""
        }\n`;
      }
      if (Array.isArray(records.emotions) && records.emotions.length > 0) {
        prompt += `- 감정: ${records.emotions.slice(0, 3).join(", ")}${
          records.emotions.length > 3 ? "..." : ""
        }\n`;
      }
    });
  }

  prompt += `\n\n위 데이터를 종합하여 월간 리포트를 생성하세요. 전체 한 달의 패턴과 트렌드를 분석하여 vivid_report를 작성하세요.\n`;

  return prompt;
}

import type { VividReport } from "@/types/monthly-feedback-new";

/**
 * 월간 흐름 데이터(trend) 생성 프롬프트
 * vivid_report 분석 결과를 바탕으로 월간 흐름 데이터 생성
 */
export function buildMonthlyTrendPrompt(
  vividReport: VividReport,
  month: string,
  monthLabel: string,
  userName?: string
): string {
  const prompt = `${userName ? `${userName}님의 ` : ""}${monthLabel} 월간 비비드 리포트를 분석하여, 이번 달의 흐름을 나타내는 5가지 인사이트를 생성해주세요.

**분석 결과 요약:**

**비전 진화:**
${vividReport.vision_evolution?.core_visions?.slice(0, 3).map((v: { vision: string }) => `- ${v.vision}`).join("\n") || ""}

**일치도 분석:**
${vividReport.alignment_analysis?.gap_analysis?.biggest_gaps?.slice(0, 2).map((g: { gap_description: string }) => `- ${g.gap_description}`).join("\n") || ""}

**하루 패턴:**
${vividReport.daily_life_patterns?.recurring_patterns?.slice(0, 3).map((p: { pattern: string }) => `- ${p.pattern}`).join("\n") || ""}

**특성 변화:**
${vividReport.identity_alignment?.trait_evolution?.strengthened?.slice(0, 2).map((t: { trait: string }) => `- ${t.trait}`).join("\n") || ""}

위 분석 결과를 바탕으로, 이번 달의 가장 핵심적인 특징을 담은 5가지 인사이트를 생성해주세요.
각 필드는 1줄의 자연스러운 인사이트로 작성하되, "~패턴이 반복됨", "~데이터가 확인됨" 같은 기계적인 표현을 사용하지 마세요.
실제 데이터를 바탕으로 자연스럽고 인간적인 말투로 작성하세요.
JSON 형식으로 {"breakdown_moments": "...", "recovery_moments": "...", "energy_sources": "...", "missing_future_elements": "...", "top_keywords": "..."}만 출력해주세요.`;
  
  return prompt;
}
