import type { WeeklyFeedback } from "@/types/weekly-feedback";
import type { ProgressCallback } from "../types";
import { getSectionSchema } from "../schema-helpers";
import { generateSection } from "../ai-helpers";
import { SYSTEM_PROMPT_VISION } from "../system-prompts";
import { buildVisionReportPrompt } from "../prompts/vision";
import { generateCacheKey } from "../../utils/cache";

/**
 * Vision Report 생성
 */
export async function generateVisionReport(
  weeklyFeedbacks: WeeklyFeedback[],
  month: string,
  dateRange: { start_date: string; end_date: string },
  isPro: boolean,
  progressCallback?: ProgressCallback,
  step: number = 4
): Promise<any> {
  if (progressCallback) {
    progressCallback(step, 7, "vision_report");
  }

  const schema = getSectionSchema("vision_report");
  const userPrompt = buildVisionReportPrompt(weeklyFeedbacks, month, dateRange);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_VISION, userPrompt);

  return generateSection<any>(
    SYSTEM_PROMPT_VISION,
    userPrompt,
    schema,
    cacheKey,
    isPro,
    "vision_report"
  );
}
