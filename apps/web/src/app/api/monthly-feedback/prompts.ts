import type {
  NarrativeOverview,
  EmotionOverview,
  InsightOverview,
  VisionOverview,
  FeedbackOverview,
  MetaOverview,
} from "@/types/daily-feedback";

/**
 * 월간 피드백 생성을 위한 일일 피드백 타입
 * (weekly feedback에서 변환된 형태 또는 확장된 형태)
 */
export type DailyFeedbackForMonthly = Array<{
  report_date: string;
  narrative_overview?: NarrativeOverview | null;
  emotion_overview?: EmotionOverview | null;
  insight_overview?: InsightOverview | null;
  vision_overview?:
    | (VisionOverview & { reminder_sentence?: string | null })
    | null;
  feedback_overview?: FeedbackOverview | null;
  meta_overview?:
    | (MetaOverview & {
        growth_point?: string | null;
        adjustment_point?: string | null;
      })
    | null;
}>;

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

        // integrity_score
        if (
          feedback.narrative_overview?.integrity_score !== null &&
          feedback.narrative_overview?.integrity_score !== undefined
        ) {
          prompt += `통합 점수: ${feedback.narrative_overview.integrity_score}/10\n`;
        }

        // narrative_overview
        if (feedback.narrative_overview) {
          const narrative = feedback.narrative_overview as {
            narrative_summary?: string;
            narrative?: string;
            keywords?: string[];
          };
          if (narrative.narrative_summary) {
            prompt += `요약: ${narrative.narrative_summary}\n`;
          }
          if (narrative.narrative) {
            prompt += `이야기: ${narrative.narrative.substring(0, 200)}...\n`;
          }
          if (
            Array.isArray(narrative.keywords) &&
            narrative.keywords.length > 0
          ) {
            prompt += `키워드: ${narrative.keywords.join(", ")}\n`;
          }
        }

        // emotion_overview
        if (feedback.emotion_overview) {
          const emotion = feedback.emotion_overview as {
            ai_mood_valence?: number | null;
            ai_mood_arousal?: number | null;
            emotion_quadrant?: string;
            dominant_emotion?: string;
          };
          if (
            emotion.ai_mood_valence !== null &&
            emotion.ai_mood_valence !== undefined
          ) {
            prompt += `감정 쾌-불쾌: ${emotion.ai_mood_valence}\n`;
          }
          if (
            emotion.ai_mood_arousal !== null &&
            emotion.ai_mood_arousal !== undefined
          ) {
            prompt += `감정 각성-에너지: ${emotion.ai_mood_arousal}\n`;
          }
          if (emotion.emotion_quadrant) {
            prompt += `감정 사분면: ${emotion.emotion_quadrant}\n`;
          }
          if (emotion.dominant_emotion) {
            prompt += `대표 감정: ${emotion.dominant_emotion}\n`;
          }
        }

        // insight_overview
        if (feedback.insight_overview) {
          const insight = feedback.insight_overview as {
            core_insight?: string;
            meta_question?: string;
          };
          if (insight.core_insight) {
            prompt += `핵심 인사이트: ${insight.core_insight}\n`;
          }
          if (insight.meta_question) {
            prompt += `메타 질문: ${insight.meta_question}\n`;
          }
        }

        // vision_overview
        if (feedback.vision_overview) {
          const vision = feedback.vision_overview as {
            vision_summary?: string;
            vision_keywords?: string[];
            reminder_sentence?: string;
          };
          if (vision.vision_summary) {
            prompt += `시각화 요약: ${vision.vision_summary.substring(
              0,
              150
            )}...\n`;
          }
          if (
            Array.isArray(vision.vision_keywords) &&
            vision.vision_keywords.length > 0
          ) {
            prompt += `시각화 키워드: ${vision.vision_keywords.join(", ")}\n`;
          }
          if (vision.reminder_sentence) {
            prompt += `리마인더: ${vision.reminder_sentence}\n`;
          }
        }

        // feedback_overview
        if (feedback.feedback_overview) {
          const feedbackData = feedback.feedback_overview as {
            core_feedback?: string;
            positives?: string[];
            improvements?: string[];
          };
          if (feedbackData.core_feedback) {
            prompt += `핵심 피드백: ${feedbackData.core_feedback}\n`;
          }
          if (
            Array.isArray(feedbackData.positives) &&
            feedbackData.positives.length > 0
          ) {
            prompt += `긍정적 측면: ${feedbackData.positives.join(", ")}\n`;
          }
          if (
            Array.isArray(feedbackData.improvements) &&
            feedbackData.improvements.length > 0
          ) {
            prompt += `개선점: ${feedbackData.improvements.join(", ")}\n`;
          }
        }

        // meta_overview
        if (feedback.meta_overview) {
          const meta = feedback.meta_overview as {
            growth_point?: string;
            adjustment_point?: string;
          };
          if (meta.growth_point) {
            prompt += `성장 포인트: ${meta.growth_point}\n`;
          }
          if (meta.adjustment_point) {
            prompt += `조정 포인트: ${meta.adjustment_point}\n`;
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

  return prompt;
}
