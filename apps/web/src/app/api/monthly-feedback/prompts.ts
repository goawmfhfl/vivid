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

  prompt += `\n\n위 데이터를 종합하여 월간 리포트를 생성하세요. 전체 한 달의 패턴과 트렌드를 분석하여 summary_report, emotion_report, insight_report, execution_report, vision_report, closing_report를 작성하세요.\n`;

  // 월간 흐름 생성 지시 추가
  prompt += `\n\n=== 월간 흐름 (monthly_trends) 생성 ===\n`;
  prompt += `이번 달(${monthLabel})의 데이터를 분석하여 다음 5가지 질문에 대한 인사이트를 생성하세요.\n`;
  prompt += `각 질문에 대해 해당 월의 데이터를 기반으로 1-2줄의 인사이트를 작성하고, month 필드에는 "${month}" 형식으로 저장하세요.\n\n`;
  prompt += `질문 리스트:\n`;
  prompt += `1. breakdown_moments: 나는 어떤 순간에서 가장 무너지는가\n`;
  prompt += `2. recovery_moments: 나는 어떤 순간에서 가장 회복되는가\n`;
  prompt += `3. energy_sources: 내가 실제로 에너지를 얻는 방향\n`;
  prompt += `4. missing_future_elements: 내가 미래를 그릴 때 빠뜨리는 요소\n`;
  prompt += `5. top_keywords: 이 달에서 가장 자주 등장하는 키워드 5가지\n\n`;
  prompt += `각 질문에 대해:\n`;
  prompt += `- insight: 질문 내용 (위의 질문 텍스트 그대로)\n`;
  prompt += `- answers: 배열 형태로, month는 "${month}", answer는 1-2줄의 인사이트\n`;
  prompt += `- answer는 실제 데이터를 기반으로 작성하며, 구체적이고 실행 가능한 인사이트여야 합니다.\n`;
  prompt += `- top_keywords의 경우, 이 달에 가장 자주 등장한 키워드 5가지를 나열하세요.\n\n`;

  return prompt;
}
