import type { WeeklyFeedback } from "@/types/weekly-feedback";
import type { ProgressCallback } from "../types";
import { getSectionSchema } from "../schema-helpers";
import { generateSection } from "../ai-helpers";
import { SYSTEM_PROMPT_DAILY_LIFE } from "../system-prompts";
import { buildDailyLifeReportPrompt } from "../prompts/daily-life";
import { generateCacheKey } from "../../utils/cache";

/**
 * Daily Life Report 생성
 */
export async function generateDailyLifeReport(
  weeklyFeedbacks: WeeklyFeedback[],
  month: string,
  dateRange: { start_date: string; end_date: string },
  isPro: boolean,
  progressCallback?: ProgressCallback,
  step: number = 2
): Promise<any> {
  if (progressCallback) {
    progressCallback(step, 7, "daily_life_report");
  }

  const schema = getSectionSchema("daily_life_report");
  const userPrompt = buildDailyLifeReportPrompt(
    weeklyFeedbacks,
    month,
    dateRange
  );
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_DAILY_LIFE, userPrompt);

  return generateSection<any>(
    SYSTEM_PROMPT_DAILY_LIFE,
    userPrompt,
    schema,
    cacheKey,
    isPro,
    "daily_life_report"
  );
}
