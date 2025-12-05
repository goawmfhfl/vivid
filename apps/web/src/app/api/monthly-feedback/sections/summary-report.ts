import type { WeeklyFeedback } from "@/types/weekly-feedback";
import type { ProgressCallback } from "../types";
import { getSectionSchema } from "../schema-helpers";
import { generateSection } from "../ai-helpers";
import { SYSTEM_PROMPT_SUMMARY_REPORT } from "../system-prompts";
import { buildSummaryReportPrompt } from "../prompts/summary-report";
import { generateCacheKey } from "../../utils/cache";

/**
 * Summary Report 생성
 */
export async function generateSummaryReport(
  weeklyFeedbacks: WeeklyFeedback[],
  month: string,
  dateRange: { start_date: string; end_date: string },
  totalDays: number,
  recordedDays: number,
  isPro: boolean,
  progressCallback?: ProgressCallback,
  step: number = 1
): Promise<any> {
  if (progressCallback) {
    progressCallback(step, 7, "summary_report");
  }

  const schema = getSectionSchema("summary_report");
  const userPrompt = buildSummaryReportPrompt(
    weeklyFeedbacks,
    month,
    dateRange,
    totalDays,
    recordedDays
  );
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_SUMMARY_REPORT, userPrompt);

  return generateSection<any>(
    SYSTEM_PROMPT_SUMMARY_REPORT,
    userPrompt,
    schema,
    cacheKey,
    isPro,
    "summary_report"
  );
}
