import type { MonthlyReport } from "@/types/monthly-vivid";
import type { Record } from "../../daily-vivid/types";
import { getSectionSchema } from "../schema-helpers";
import { generateSection } from "../ai-helpers";
import { SYSTEM_PROMPT_VIVID } from "../system-prompts";
import { buildVividReportPromptFromRecords } from "../prompts/vivid-from-records";
import { generateCacheKey } from "../../utils/cache";

/**
 * Monthly Report 생성 (vivid-records 기반)
 */
export async function generateVividReportFromRecords(
  records: Record[],
  month: string,
  dateRange: { start_date: string; end_date: string },
  isPro: boolean,
  userId?: string,
  userName?: string
): Promise<MonthlyReport> {
  const schema = getSectionSchema("report", isPro);
  const userPrompt = buildVividReportPromptFromRecords(
    records,
    month,
    dateRange,
    userName
  );
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
