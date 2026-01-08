import type {
  EmotionReport,
  MonthlyMoodTimelineItem,
} from "@/types/monthly-feedback-new";
import type { ProgressCallback, DailyFeedbackForMonthly } from "../types";
import { getSectionSchema } from "../schema-helpers";
import { generateSection } from "../ai-helpers";
import { SYSTEM_PROMPT_EMOTION } from "../system-prompts";
import { buildEmotionReportPrompt } from "../prompts/emotion";
import { generateCacheKey } from "../../utils/cache";
import { getKSTDate, getKSTWeekday } from "@/lib/date-utils";

/**
 * monthly_mood_timeline 생성 (daily-feedback 데이터에서 추출)
 */
function generateMonthlyMoodTimeline(
  dailyFeedbacks: DailyFeedbackForMonthly[]
): MonthlyMoodTimelineItem[] {
  const timeline: MonthlyMoodTimelineItem[] = [];

  dailyFeedbacks.forEach((df) => {
    const er = df.emotion_report;
    if (er) {
      const date = new Date(df.report_date);
      const kstDate = getKSTDate(date);
      const weekday = getKSTWeekday(kstDate);

      timeline.push({
        date: df.report_date,
        weekday,
        ai_mood_arousal: er.ai_mood_arousal ?? null,
        ai_mood_valence: er.ai_mood_valence ?? null,
        dominant_emotion: er.dominant_emotion ?? null,
      });
    }
  });

  // 날짜순으로 정렬
  return timeline.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Emotion Report 생성
 */
export async function generateEmotionReport(
  dailyFeedbacks: DailyFeedbackForMonthly[],
  month: string,
  dateRange: { start_date: string; end_date: string },
  isPro: boolean,
  progressCallback?: ProgressCallback,
  step: number = 3,
  userId?: string
): Promise<EmotionReport> {
  if (progressCallback) {
    progressCallback(step, 7, "emotion_report");
  }

  const schema = getSectionSchema("emotion_report", isPro);
  const userPrompt = buildEmotionReportPrompt(dailyFeedbacks, month, dateRange);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_EMOTION, userPrompt);

  // AI로 생성된 리포트 가져오기
  const aiReport = await generateSection<EmotionReport>(
    SYSTEM_PROMPT_EMOTION,
    userPrompt,
    schema,
    cacheKey,
    isPro,
    "emotion_report",
    userId,
    "monthly_feedback"
  );

  // monthly_mood_timeline은 daily-feedback 데이터에서 직접 생성
  const monthlyMoodTimeline = generateMonthlyMoodTimeline(dailyFeedbacks);

  return {
    ...aiReport,
    monthly_mood_timeline: monthlyMoodTimeline,
  };
}
