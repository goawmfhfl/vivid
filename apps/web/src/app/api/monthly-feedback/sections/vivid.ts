import type { VividReport } from "@/types/monthly-feedback-new";
import type { DailyFeedbackForMonthly } from "../types";
import { getSectionSchema } from "../schema-helpers";
import { generateSection } from "../ai-helpers";
import { SYSTEM_PROMPT_VIVID } from "../system-prompts";
import { buildVividReportPrompt } from "../prompts/vivid";
import { generateCacheKey } from "../../utils/cache";

/**
 * Vivid Report 생성
 */
export async function generateVividReport(
  dailyFeedbacks: DailyFeedbackForMonthly[],
  month: string,
  dateRange: { start_date: string; end_date: string },
  isPro: boolean,
  userId?: string
): Promise<VividReport> {
  const schema = getSectionSchema("vivid_report", isPro);
  const userPrompt = buildVividReportPrompt(dailyFeedbacks, month, dateRange);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_VIVID, userPrompt);

  return generateSection<VividReport>(
    SYSTEM_PROMPT_VIVID,
    userPrompt,
    schema,
    cacheKey,
    isPro,
    "vivid_report",
    userId,
    "monthly_feedback"
  );
}
