import type { MonthlyReport } from "@/types/monthly-vivid";
import type { DailyVividForMonthly } from "../types";
import { getSectionSchema } from "../schema-helpers";
import { generateSection } from "../ai-helpers";
import { SYSTEM_PROMPT_VIVID } from "../system-prompts";
import { buildVividReportPrompt } from "../prompts/vivid";
import { generateCacheKey } from "../../utils/cache";

/**
 * Monthly Report 생성
 */
export async function generateVividReport(
  dailyVivid: DailyVividForMonthly[],
  month: string,
  dateRange: { start_date: string; end_date: string },
  isPro: boolean,
  userId?: string
): Promise<MonthlyReport> {
  const schema = getSectionSchema("report", isPro);
  const userPrompt = buildVividReportPrompt(dailyVivid, month, dateRange);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_VIVID, userPrompt);

  return generateSection<MonthlyReport>(
    SYSTEM_PROMPT_VIVID,
    userPrompt,
    schema,
    cacheKey,
    isPro,
    "report",
    userId,
    "monthly_vivid"
  );
}
