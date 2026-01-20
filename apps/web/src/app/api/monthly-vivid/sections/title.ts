import type { DailyVividForMonthly } from "../types";
import type { MonthlyReport } from "@/types/monthly-vivid";
import { getSectionSchema } from "../schema-helpers";
import { generateSection } from "../ai-helpers";
import { SYSTEM_PROMPT_TITLE } from "../system-prompts";
import { buildTitlePrompt } from "../prompts/title";
import { generateCacheKey } from "../../utils/cache";

/**
 * Title 생성
 */
export async function generateTitle(
  dailyVivid: DailyVividForMonthly[],
  report: MonthlyReport,
  month: string,
  dateRange: { start_date: string; end_date: string },
  isPro: boolean,
  userId?: string
): Promise<string> {
  const schema = getSectionSchema("title", isPro);
  const userPrompt = buildTitlePrompt(dailyVivid, report, month, dateRange);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_TITLE, userPrompt);

  const result = await generateSection<{ title: string }>(
    SYSTEM_PROMPT_TITLE,
    userPrompt,
    schema,
    cacheKey,
    isPro,
    "title",
    userId,
    "monthly_vivid"
  );

  // result가 직접 문자열인 경우와 객체인 경우 모두 처리
  if (typeof result === "string") {
    return result;
  }

  if (result && typeof result === "object" && "title" in result) {
    return result.title;
  }

  // __tracking이 포함된 경우 제거
  if (result && typeof result === "object") {
    const { __tracking: _, ...rest } = result as { title?: string; __tracking?: unknown };
    if (rest.title) {
      return rest.title;
    }
  }

  throw new Error("Failed to extract title from result");
}
