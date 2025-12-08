import type { WeeklyFeedback } from "@/types/weekly-feedback";
import type { EmotionReport } from "@/types/monthly-feedback-new";
import type { ProgressCallback } from "../types";
import { getSectionSchema } from "../schema-helpers";
import { generateSection } from "../ai-helpers";
import { SYSTEM_PROMPT_EMOTION } from "../system-prompts";
import { buildEmotionReportPrompt } from "../prompts/emotion";
import { generateCacheKey } from "../../utils/cache";

/**
 * Emotion Report 생성
 */
export async function generateEmotionReport(
  weeklyFeedbacks: WeeklyFeedback[],
  month: string,
  dateRange: { start_date: string; end_date: string },
  isPro: boolean,
  progressCallback?: ProgressCallback,
  step: number = 3
): Promise<EmotionReport> {
  if (progressCallback) {
    progressCallback(step, 7, "emotion_report");
  }

  const schema = getSectionSchema("emotion_report");
  const userPrompt = buildEmotionReportPrompt(
    weeklyFeedbacks,
    month,
    dateRange
  );
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_EMOTION, userPrompt);

  return generateSection<EmotionReport>(
    SYSTEM_PROMPT_EMOTION,
    userPrompt,
    schema,
    cacheKey,
    isPro,
    "emotion_report"
  );
}
