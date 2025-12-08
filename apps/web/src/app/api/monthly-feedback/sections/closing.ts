import type { DailyFeedbackRow } from "@/types/daily-feedback";
import type { ClosingReport } from "@/types/monthly-feedback-new";
import type { ProgressCallback } from "../../types";
import { getSectionSchema } from "../schema-helpers";
import { generateSection } from "../ai-helpers";
import { SYSTEM_PROMPT_CLOSING } from "../system-prompts";
import { generateCacheKey } from "../../utils/cache";
import { buildClosingReportPrompt } from "../prompts/closing";

/**
 * Closing Report 생성
 */
export async function generateClosingReport(
  dailyFeedbacks: DailyFeedbackRow[],
  month: string,
  dateRange: { start_date: string; end_date: string },
  isPro: boolean,
  progressCallback?: ProgressCallback,
  step: number = 7
): Promise<ClosingReport> {
  if (progressCallback) {
    progressCallback(step, 7, "closing_report");
  }

  const schema = getSectionSchema("closing_report", isPro);
  const userPrompt = buildClosingReportPrompt(dailyFeedbacks, month, dateRange);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_CLOSING, userPrompt);

  return generateSection<ClosingReport>(
    SYSTEM_PROMPT_CLOSING,
    userPrompt,
    schema,
    cacheKey,
    isPro,
    "closing_report"
  );
}
