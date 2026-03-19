import { GoogleGenerativeAI } from "@google/generative-ai";
import type { SupabaseClient } from "@supabase/supabase-js";
import { encryptJsonbFields, type JsonbValue } from "@/lib/jsonb-encryption";
import { logAIRequest } from "@/lib/ai-usage-logger";
import { fetchRecentWeeklyVivids } from "@/app/api/weekly-vivid/db-service";
import { API_ENDPOINTS } from "@/constants";
import { GEMINI_MODELS } from "../../utils/gemini-model";
import { withGeminiRetry } from "../../utils/gemini-retry";

// ============================================================
// Types
// ============================================================

export type FocusPatternData = {
  insight: string;
  rising: Array<{ category: string; delta: string }>;
  declining: Array<{ category: string; delta: string }>;
  trend_by_week: Array<{
    week_label: string;
    breakdown: Array<{ category: string; pct: number }>;
  }>;
};

export type KeywordTrendData = {
  insight: string;
  keywords_by_week: Array<{ week_label: string; keywords: string[] }>;
  rising: string[];
  declining: string[];
};

export type InvestmentTrendPayload = {
  focus_pattern: FocusPatternData;
  keyword_trend: KeywordTrendData;
  based_on_weeks: number;
};

export type UserInvestmentTrendResult = {
  userId: string;
  status: "updated" | "skipped";
  reason?: string;
};

// ============================================================
// Helpers
// ============================================================

/** "YYYY-MM-DD" → "MM월N주차" */
function formatWeekLabel(weekStart: string): string {
  const match = String(weekStart).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return weekStart;
  const month = match[2];
  const day = parseInt(match[3], 10);
  const weekNum = Math.ceil(day / 7);
  return `${month}월${weekNum}주차`;
}

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is required");
  return new GoogleGenerativeAI(apiKey);
}

/** 카테고리별 4주 % 배열 → 가장 큰 변화 카테고리들 */
function computeFocusPattern(
  weeklyBreakdowns: Array<{
    week_label: string;
    breakdown: Array<{ category: string; percentage: number }>;
  }>
): Omit<FocusPatternData, "insight"> {
  // 모든 카테고리 수집
  const allCategories = new Set<string>();
  for (const w of weeklyBreakdowns) {
    for (const b of w.breakdown) allCategories.add(b.category);
  }

  // 카테고리별 주차별 % 맵
  const categoryMap = new Map<string, number[]>();
  for (const cat of allCategories) {
    categoryMap.set(
      cat,
      weeklyBreakdowns.map((w) => w.breakdown.find((b) => b.category === cat)?.percentage ?? 0)
    );
  }

  // 변화량 계산 (마지막 주 - 첫 번째 주)
  const rising: Array<{ category: string; delta: string }> = [];
  const declining: Array<{ category: string; delta: string }> = [];

  for (const [cat, pcts] of categoryMap.entries()) {
    if (pcts.length < 2) continue;
    const delta = pcts[pcts.length - 1] - pcts[0];
    if (delta >= 3) {
      rising.push({ category: cat, delta: `+${Math.round(delta)}%` });
    } else if (delta <= -3) {
      declining.push({ category: cat, delta: `${Math.round(delta)}%` });
    }
  }

  rising.sort((a, b) => parseFloat(b.delta) - parseFloat(a.delta));
  declining.sort((a, b) => parseFloat(a.delta) - parseFloat(b.delta));

  const trend_by_week = weeklyBreakdowns.map((w) => ({
    week_label: w.week_label,
    breakdown: w.breakdown.map((b) => ({ category: b.category, pct: b.percentage })),
  }));

  return { rising, declining, trend_by_week };
}

/** 주차별 키워드 → rising/declining 계산 */
function computeKeywordTrend(
  keywordsByWeek: Array<{ week_label: string; keywords: string[] }>
): Omit<KeywordTrendData, "insight"> {
  if (keywordsByWeek.length < 2) {
    return { keywords_by_week: keywordsByWeek, rising: [], declining: [] };
  }

  const half = Math.ceil(keywordsByWeek.length / 2);
  const recent = new Set(keywordsByWeek.slice(half).flatMap((w) => w.keywords));
  const older = new Set(keywordsByWeek.slice(0, half).flatMap((w) => w.keywords));

  const rising = Array.from(recent).filter((k) => !older.has(k)).slice(0, 5);
  const declining = Array.from(older).filter((k) => !recent.has(k)).slice(0, 5);

  return { keywords_by_week: keywordsByWeek, rising, declining };
}

async function generateInsights(
  focusData: Omit<FocusPatternData, "insight">,
  keywordData: Omit<KeywordTrendData, "insight">,
  userId: string
): Promise<{ focusInsight: string; keywordInsight: string }> {
  const geminiClient = getGeminiClient();
  const modelName = GEMINI_MODELS.flash;
  const startTime = Date.now();

  const risingCats = focusData.rising.map((r) => `${r.category}(${r.delta})`).join(", ") || "없음";
  const decliningCats = focusData.declining.map((d) => `${d.category}(${d.delta})`).join(", ") || "없음";
  const risingKws = keywordData.rising.join(", ") || "없음";
  const decliningKws = keywordData.declining.join(", ") || "없음";
  const weekCount = focusData.trend_by_week.length;

  const prompt = `사용자의 최근 ${weekCount}주간 데이터 분석 결과입니다.

[시간 투자 변화]
- 비중이 증가한 카테고리: ${risingCats}
- 비중이 감소한 카테고리: ${decliningCats}

[관심사 키워드 변화]
- 최근 늘어난 키워드: ${risingKws}
- 최근 줄어든 키워드: ${decliningKws}

위 데이터를 바탕으로 아래 두 가지 자연어 인사이트를 JSON 형식으로 생성해주세요.
- focus_insight: 시간 투자 비중 변화를 한국어 자연어 1문장으로 (예: "최근 2주간 '업무'에 투자하는 시간 비중이 점점 커지고 있어요")
- keyword_insight: 관심사 키워드 변화를 한국어 자연어 1문장으로 (예: "최근엔 '개발'과 '디자인' 관련 내용이 늘고 있어요")

JSON만 출력: {"focus_insight": "...", "keyword_insight": "..."}`;

  const model = geminiClient.getGenerativeModel({
    model: modelName,
    systemInstruction:
      "당신은 사용자의 시간 투자 및 관심사 변화를 분석해 친근한 한국어로 인사이트를 제공하는 어시스턴트입니다.",
  });

  try {
    const result = await withGeminiRetry(() =>
      model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      })
    );

    const content = result.response.text();
    const duration_ms = Date.now() - startTime;
    const usageMetadata = result.response?.usageMetadata as
      | { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number }
      | undefined;
    const usage = usageMetadata
      ? {
          prompt_tokens: usageMetadata.promptTokenCount ?? 0,
          completion_tokens: usageMetadata.candidatesTokenCount ?? 0,
          total_tokens: usageMetadata.totalTokenCount ?? 0,
          cached_tokens: 0,
        }
      : { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    await logAIRequest({
      userId,
      model: modelName,
      requestType: "user_trends_weekly",
      sectionName: "investment_trend",
      usage,
      duration_ms,
      success: true,
    });

    const parsed = JSON.parse(content || "{}") as {
      focus_insight?: string;
      keyword_insight?: string;
    };

    return {
      focusInsight: parsed.focus_insight || "시간 투자 변화를 분석했어요.",
      keywordInsight: parsed.keyword_insight || "관심사 키워드 변화를 분석했어요.",
    };
  } catch (error) {
    await logAIRequest({
      userId,
      model: modelName,
      requestType: "user_trends_weekly",
      sectionName: "investment_trend",
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      duration_ms: Date.now() - startTime,
      success: false,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    return {
      focusInsight: "시간 투자 변화를 분석했어요.",
      keywordInsight: "관심사 키워드 변화를 분석했어요.",
    };
  }
}

// ============================================================
// Main export
// ============================================================

export async function updateInvestmentTrendsForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<UserInvestmentTrendResult> {
  // 최근 4개 주간 vivid 조회
  const weeklyVivids = await fetchRecentWeeklyVivids(supabase, userId, 4);
  if (weeklyVivids.length < 2) {
    return { userId, status: "skipped", reason: "not_enough_vivids" };
  }

  // 시간순 정렬 (오래된 것 → 최신)
  const sorted = [...weeklyVivids].sort((a, b) =>
    a.week_range.start.localeCompare(b.week_range.start)
  );

  // 카테고리별 breakdown 추출
  const weeklyBreakdowns = sorted
    .map((wv) => ({
      week_label: formatWeekLabel(wv.week_range.start),
      breakdown: wv.report?.completed_todos_insights?.time_investment_breakdown ?? [],
    }))
    .filter((w) => w.breakdown.length > 0);

  // 키워드 추출 (vision_keywords_trend에서)
  const keywordsByWeek = sorted.map((wv) => ({
    week_label: formatWeekLabel(wv.week_range.start),
    keywords: (wv.report?.weekly_keywords_analysis?.vision_keywords_trend ?? [])
      .map((k) => k.keyword)
      .slice(0, 6),
  }));

  const hasBreakdownData = weeklyBreakdowns.length >= 2;

  const focusData = hasBreakdownData
    ? computeFocusPattern(weeklyBreakdowns)
    : { rising: [], declining: [], trend_by_week: [] };

  const keywordData = computeKeywordTrend(keywordsByWeek);

  const { focusInsight, keywordInsight } = await generateInsights(focusData, keywordData, userId);

  const trendPayload: InvestmentTrendPayload = {
    focus_pattern: { ...focusData, insight: focusInsight },
    keyword_trend: { ...keywordData, insight: keywordInsight },
    based_on_weeks: sorted.length,
  };

  const trendEncrypted = encryptJsonbFields(
    trendPayload as unknown as JsonbValue
  ) as Record<string, unknown>;

  const now = new Date().toISOString();
  const periodStart = sorted[0].week_range.start;
  const periodEnd = sorted[sorted.length - 1].week_range.end;

  const { error } = await supabase.from(API_ENDPOINTS.USER_TRENDS).upsert(
    {
      user_id: userId,
      type: "weekly_investment_trend",
      period_start: periodStart,
      period_end: periodEnd,
      trend: trendEncrypted,
      generated_at: now,
      updated_at: now,
    },
    { onConflict: "user_id,type,period_start,period_end" }
  );

  if (error) {
    throw new Error(`Failed to upsert investment trend: ${error.message}`);
  }

  return { userId, status: "updated" };
}
