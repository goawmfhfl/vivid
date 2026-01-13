import type { VividReport, MonthlyTrendData } from "@/types/monthly-feedback-new";
import { generateSection } from "../ai-helpers";
import { SYSTEM_PROMPT_MONTHLY_TREND, MonthlyTrendDataSchema } from "../schema";
import { buildMonthlyTrendPrompt } from "../prompts";
import { generateCacheKey } from "../../utils/cache";

/**
 * Monthly Trend 생성
 */
export async function generateMonthlyTrend(
  vividReport: VividReport,
  month: string,
  monthLabel: string,
  isPro: boolean,
  userId?: string,
  userName?: string
): Promise<MonthlyTrendData | null> {
  const prompt = buildMonthlyTrendPrompt(vividReport, month, monthLabel, userName);
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
      "monthly_feedback"
    );

    if (!response || 
        !response.breakdown_moments || 
        !response.recovery_moments || 
        !response.energy_sources || 
        !response.missing_future_elements || 
        !response.top_keywords) {
      console.error("[generateMonthlyTrend] trend 데이터 생성 실패: 필수 필드 누락");
      return null;
    }

    return response;
  } catch (error) {
    console.error("[generateMonthlyTrend] trend 생성 실패:", error);
    return null;
  }
}
