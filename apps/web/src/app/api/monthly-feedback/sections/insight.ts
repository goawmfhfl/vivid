import type { DailyFeedbackRow } from "@/types/daily-feedback";
import type { InsightReport } from "@/types/monthly-feedback-new";
import type { ProgressCallback } from "../types";
import { getSectionSchema } from "../schema-helpers";
import { generateSection } from "../ai-helpers";
import { SYSTEM_PROMPT_INSIGHT } from "../system-prompts";
import { buildInsightReportPrompt } from "../prompts/insight";
import { generateCacheKey } from "../../utils/cache";

/**
 * Insight Report 생성
 */
export async function generateInsightReport(
  dailyFeedbacks: DailyFeedbackRow[],
  month: string,
  dateRange: { start_date: string; end_date: string },
  isPro: boolean,
  progressCallback?: ProgressCallback,
  step: number = 5
): Promise<InsightReport> {
  if (progressCallback) {
    progressCallback(step, 7, "insight_report");
  }

  const schema = getSectionSchema("insight_report", isPro);
  const userPrompt = buildInsightReportPrompt(dailyFeedbacks, month, dateRange);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_INSIGHT, userPrompt);

  return generateSection<InsightReport>(
    SYSTEM_PROMPT_INSIGHT,
    userPrompt,
    schema,
    cacheKey,
    isPro,
    "insight_report"
  );
}
