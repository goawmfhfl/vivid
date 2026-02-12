import type { DailyVividForMonthly } from "./types";

/**
 * 월간 비비드 생성을 위한 프롬프트 생성
 */
export function buildMonthlyVividPrompt(
  dailyVivid: DailyVividForMonthly[],
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
  const recordedDays = dailyVivid.length;
  const recordCoverageRate =
    totalDays > 0 ? Math.round((recordedDays / totalDays) * 100) / 100 : 0;

  prompt += `=== 기본 정보 ===\n`;
  prompt += `- target_month: ${month}\n`;
  prompt += `- month_label: ${monthLabel}\n`;
  prompt += `- date_range: ${dateRange.start_date} ~ ${dateRange.end_date}\n`;
  prompt += `- total_days: ${totalDays}\n`;
  prompt += `- recorded_days: ${recordedDays}\n`;
  prompt += `- record_coverage_rate: ${recordCoverageRate}\n\n`;

  // 일별 피드백 데이터 정리
  prompt += `=== 일별 피드백 데이터 ===\n`;

  const feedbacksByDate = new Map<string, DailyVividForMonthly[]>();
  dailyVivid.forEach((feedback: DailyVividForMonthly) => {
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

    dayFeedbacks.forEach((feedback: DailyVividForMonthly, idx: number) => {
        prompt += `\n[일일 피드백 ${idx + 1}]\n`;

        if (feedback.report) {
          const report = feedback.report;
          if (report.current_summary) {
            prompt += `오늘의 비비드 요약: ${report.current_summary}\n`;
          }
          if (report.future_summary) {
            prompt += `기대하는 모습 요약: ${report.future_summary}\n`;
          }
          if (
            Array.isArray(report.current_keywords) &&
            report.current_keywords.length > 0
          ) {
            prompt += `오늘의 비비드 키워드: ${report.current_keywords.join(", ")}\n`;
          }
          if (
            Array.isArray(report.future_keywords) &&
            report.future_keywords.length > 0
          ) {
            prompt += `기대하는 모습 키워드: ${report.future_keywords.join(", ")}\n`;
          }
          if (
            report.alignment_score !== null &&
            report.alignment_score !== undefined
          ) {
            prompt += `일치도 점수: ${report.alignment_score}\n`;
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

  prompt += `\n\n위 데이터를 종합하여 월간 리포트를 생성하세요. 전체 한 달의 패턴과 트렌드를 분석하여 report를 작성하세요.\n`;

  return prompt;
}

import type { MonthlyReport } from "@/types/monthly-vivid";

/**
 * 월간 흐름 데이터(trend) 생성 프롬프트
 * report 분석 결과를 바탕으로 월간 흐름 데이터 생성
 */
export function buildMonthlyTrendPrompt(
  report: MonthlyReport,
  month: string,
  monthLabel: string,
  userName?: string
): string {
  const prompt = `${userName ? `${userName}님의 ` : ""}${monthLabel} 월간 비비드 리포트를 분석하여, 아래 4가지 흐름을 생성해주세요.

**분석 결과 요약:**

**비전 진화:**
${report.vision_evolution?.core_visions?.slice(0, 3).map((v: { vision: string }) => `- ${v.vision}`).join("\n") || ""}

**일치도 분석:**
${report.alignment_analysis?.gap_analysis?.biggest_gaps?.slice(0, 2).map((g: { gap_description: string }) => `- ${g.gap_description}`).join("\n") || ""}

**하루 패턴:**
${report.daily_life_patterns?.recurring_patterns?.slice(0, 3).map((p: { pattern: string }) => `- ${p.pattern}`).join("\n") || ""}

**특성 변화:**
${report.identity_alignment?.trait_evolution?.strengthened?.slice(0, 2).map((t: { trait: string }) => `- ${t.trait}`).join("\n") || ""}

위 분석 결과를 바탕으로, 아래 4가지 필드를 한 문장씩 생성해주세요:
- recurring_self: 가장 자주 드러나는 나의 모습
- effort_to_keep: 지키기 위해서 노력했던 것
- most_meaningful: 내게 가장 의미가 있었던 것
- biggest_change: 발생한 가장 큰 변화

각 필드는 1줄의 자연스러운 인사이트로 작성하세요.
JSON 형식으로 {"recurring_self": "...", "effort_to_keep": "...", "most_meaningful": "...", "biggest_change": "..."}만 출력해주세요.`;
  
  return prompt;
}
