import type { WeeklyFeedback } from "@/types/weekly-feedback";
import type { ProgressCallback } from "../types";
import { getSectionSchema } from "../schema-helpers";
import { generateSection } from "../ai-helpers";
import { SYSTEM_PROMPT_EXECUTION } from "../system-prompts";
import { generateCacheKey } from "../../utils/cache";
import { buildExecutionReportPrompt } from "../prompts/execution";

/**
 * Execution Report 생성
 */
export async function generateExecutionReport(
  weeklyFeedbacks: WeeklyFeedback[],
  month: string,
  dateRange: { start_date: string; end_date: string },
  isPro: boolean,
  progressCallback?: ProgressCallback,
  step: number = 6
): Promise<any> {
  if (progressCallback) {
    progressCallback(step, 7, "execution_report");
  }

  const schema = getSectionSchema("execution_report");
  const userPrompt = buildExecutionReportPrompt(
    weeklyFeedbacks,
    month,
    dateRange
  );
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_EXECUTION, userPrompt);

  return generateSection<any>(
    SYSTEM_PROMPT_EXECUTION,
    userPrompt,
    schema,
    cacheKey,
    isPro,
    "execution_report"
  );
}
