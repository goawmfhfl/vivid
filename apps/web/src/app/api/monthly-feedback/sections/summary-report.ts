import type { DailyFeedbackRow } from "@/types/daily-feedback";
import type { SummaryReport } from "@/types/monthly-feedback-new";
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
  dailyFeedbacks: DailyFeedbackRow[],
  month: string,
  dateRange: { start_date: string; end_date: string },
  totalDays: number,
  recordedDays: number,
  isPro: boolean,
  progressCallback?: ProgressCallback,
  step: number = 1,
  userId?: string
): Promise<SummaryReport> {
  if (progressCallback) {
    progressCallback(step, 7, "summary_report");
  }

  const schema = getSectionSchema("summary_report", isPro);
  const userPrompt = buildSummaryReportPrompt(
    dailyFeedbacks,
    month,
    dateRange,
    totalDays,
    recordedDays
  );
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_SUMMARY_REPORT, userPrompt);

  return generateSection<SummaryReport>(
    SYSTEM_PROMPT_SUMMARY_REPORT,
    userPrompt,
    schema,
    cacheKey,
    isPro,
    "summary_report",
    userId,
    "monthly_feedback"
  );
}
