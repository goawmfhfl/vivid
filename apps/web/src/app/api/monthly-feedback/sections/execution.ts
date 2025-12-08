import type { DailyFeedbackRow } from "@/types/daily-feedback";
import type { ExecutionReport } from "@/types/monthly-feedback-new";
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
  dailyFeedbacks: DailyFeedbackRow[],
  month: string,
  dateRange: { start_date: string; end_date: string },
  isPro: boolean,
  progressCallback?: ProgressCallback,
  step: number = 6
): Promise<ExecutionReport> {
  if (progressCallback) {
    progressCallback(step, 7, "execution_report");
  }

  const schema = getSectionSchema("execution_report", isPro);
  const userPrompt = buildExecutionReportPrompt(
    dailyFeedbacks,
    month,
    dateRange
  );
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_EXECUTION, userPrompt);

  return generateSection<ExecutionReport>(
    SYSTEM_PROMPT_EXECUTION,
    userPrompt,
    schema,
    cacheKey,
    isPro,
    "execution_report"
  );
}
