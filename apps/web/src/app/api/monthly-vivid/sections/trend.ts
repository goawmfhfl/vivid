import type { MonthlyReport, MonthlyTrendData } from "@/types/monthly-vivid";
import { generateSection } from "../ai-helpers";
import { SYSTEM_PROMPT_MONTHLY_TREND, MonthlyTrendDataSchema } from "../schema";
import { buildMonthlyTrendPrompt } from "../prompts";
import { generateCacheKey } from "../../utils/cache";

/**
 * Monthly Trend 생성
 */
export async function generateMonthlyTrend(
  report: MonthlyReport,
  month: string,
  monthLabel: string,
  isPro: boolean,
  userId?: string,
  userName?: string
): Promise<MonthlyTrendData | null> {
  const prompt = buildMonthlyTrendPrompt(report, month, monthLabel, userName);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_MONTHLY_TREND, prompt);

  try {
    const response = await generateSection<MonthlyTrendData>(
      SYSTEM_PROMPT_MONTHLY_TREND,
      prompt,
      MonthlyTrendDataSchema,
      cacheKey,
      isPro,
      "monthly_trend",
      userId,
      "monthly_vivid"
    );

    if (!response ||
        !response.recurring_self ||
        !response.effort_to_keep ||
        !response.most_meaningful ||
        !response.biggest_change) {
      console.error("[generateMonthlyTrend] trend 데이터 생성 실패: 필수 필드 누락");
      return null;
    }

    return response;
  } catch (error) {
    console.error("[generateMonthlyTrend] trend 생성 실패:", error);
    return null;
  }
}
