import type { DailyFeedbackForMonthly } from "../types";
import type { VividReport } from "@/types/monthly-feedback-new";
import { getSectionSchema } from "../schema-helpers";
import { generateSection } from "../ai-helpers";
import { SYSTEM_PROMPT_TITLE } from "../system-prompts";
import { buildTitlePrompt } from "../prompts/title";
import { generateCacheKey } from "../../utils/cache";

/**
 * Title 생성
 */
export async function generateTitle(
  dailyFeedbacks: DailyFeedbackForMonthly[],
  vividReport: VividReport,
  month: string,
  dateRange: { start_date: string; end_date: string },
  isPro: boolean,
  userId?: string
): Promise<string> {
  const schema = getSectionSchema("title", isPro);
  const userPrompt = buildTitlePrompt(dailyFeedbacks, vividReport, month, dateRange);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_TITLE, userPrompt);

  const result = await generateSection<string>(
    SYSTEM_PROMPT_TITLE,
    userPrompt,
    schema,
    cacheKey,
    isPro,
    "title",
    userId,
    "monthly_feedback"
  );

  return result;
}
