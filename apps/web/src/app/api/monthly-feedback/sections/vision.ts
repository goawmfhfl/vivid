import type { VisionReport } from "@/types/monthly-feedback-new";
import type { ProgressCallback, DailyFeedbackForMonthly } from "../types";
import { getSectionSchema } from "../schema-helpers";
import { generateSection } from "../ai-helpers";
import { SYSTEM_PROMPT_VISION } from "../system-prompts";
import { buildVisionReportPrompt } from "../prompts/vision";
import { generateCacheKey } from "../../utils/cache";

/**
 * Vision Report 생성
 */
export async function generateVisionReport(
  dailyFeedbacks: DailyFeedbackForMonthly[],
  month: string,
  dateRange: { start_date: string; end_date: string },
  isPro: boolean,
  progressCallback?: ProgressCallback,
  step: number = 4,
  userId?: string
): Promise<VisionReport> {
  if (progressCallback) {
    progressCallback(step, 7, "vision_report");
  }

  const schema = getSectionSchema("vision_report", isPro);
  const userPrompt = buildVisionReportPrompt(dailyFeedbacks, month, dateRange);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_VISION, userPrompt);

  return generateSection<VisionReport>(
    SYSTEM_PROMPT_VISION,
    userPrompt,
    schema,
    cacheKey,
    isPro,
    "vision_report",
    userId,
    "monthly_feedback"
  );
}
