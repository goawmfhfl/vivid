import { GoogleGenerativeAI, type GenerateContentRequest } from "@google/generative-ai";
import type { SupabaseClient } from "@supabase/supabase-js";
import { decrypt } from "@/lib/encryption";
import {
  decryptDailyVivid,
  decryptJsonbFields,
  encryptJsonbFields,
  type JsonbValue,
} from "@/lib/jsonb-encryption";
import { logAIRequest } from "@/lib/ai-usage-logger";
import type { Report } from "@/types/daily-vivid";
import type {
  WeeklyUserTrendDataQuality,
  WeeklyUserTrendInsights,
  WeeklyUserTrendMetrics,
} from "@/types/user-trends";
import { API_ENDPOINTS } from "@/constants";
import {
  SYSTEM_PROMPT_WEEKLY_TREND,
  WeeklyTrendDataSchema,
} from "./schema";
import { withGeminiRetry } from "../../utils/gemini-retry";

type VividRecordRow = {
  kst_date: string;
  type: string;
  content: string;
};

type DailyScoreRow = {
  report_date: string;
  report: Report | null;
};

type WeeklyTrendRow = {
  period_start: string;
  period_end: string;
  source_count: number;
  metrics: WeeklyUserTrendMetrics;
};

type WeeklyTrendData = {
  direction: string;
  core_value: string;
  driving_force: string;
  current_self: string;
};

type RecordEvidenceContextParams = {
  records: VividRecordRow[];
  dailyRows: DailyScoreRow[];
  startDate: string;
  endDate: string;
};

export type UserTrendResult = {
  userId: string;
  status: "updated" | "skipped";
  reason?: string;
};

function cleanSchemaRecursive(schemaObj: unknown): unknown {
  if (typeof schemaObj !== "object" || schemaObj === null) {
    return schemaObj;
  }
  if (Array.isArray(schemaObj)) {
    return schemaObj.map(cleanSchemaRecursive);
  }
  const obj = schemaObj as Record<string, unknown>;
  const cleaned: Record<string, unknown> = {};
  const allowedFields = new Set(["type", "properties", "required", "items", "enum"]);

  for (const [key, value] of Object.entries(obj)) {
    if (!allowedFields.has(key)) continue;
    if (key === "properties" && value && typeof value === "object" && !Array.isArray(value)) {
      const propertiesObj = value as Record<string, unknown>;
      const cleanedProperties: Record<string, unknown> = {};
      for (const [propKey, propValue] of Object.entries(propertiesObj)) {
        const cleanedProp = cleanSchemaRecursive(propValue);
        if (cleanedProp != null) {
          cleanedProperties[propKey] = cleanedProp;
        }
      }
      if (Object.keys(cleanedProperties).length > 0) {
        cleaned[key] = cleanedProperties;
      }
      continue;
    }
    if (key === "items" && value && typeof value === "object" && !Array.isArray(value)) {
      cleaned[key] = cleanSchemaRecursive(value);
      continue;
    }
    cleaned[key] = value;
  }

  return cleaned;
}

function clampToPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function isValidScore(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function normalizePhrase(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function _average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, item) => sum + item, 0) / values.length;
}

function safeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function computeIdentityCoherence(reports: Report[]): number {
  const actualSet = new Set<string>();
  const desiredSet = new Set<string>();

  for (const report of reports) {
    safeStringArray(report.current_keywords).forEach((item) =>
      actualSet.add(normalizePhrase(item))
    );
    safeStringArray(report.user_characteristics).forEach((item) =>
      actualSet.add(normalizePhrase(item))
    );
    safeStringArray(report.future_keywords).forEach((item) =>
      desiredSet.add(normalizePhrase(item))
    );
    safeStringArray(report.aspired_traits).forEach((item) =>
      desiredSet.add(normalizePhrase(item))
    );
  }

  const actual = Array.from(actualSet).filter(Boolean);
  const desired = Array.from(desiredSet).filter(Boolean);
  if (actual.length === 0 || desired.length === 0) return 0;
  const union = new Set([...actual, ...desired]);
  const intersectionCount = actual.filter((item) => desiredSet.has(item)).length;
  return clampToPercent((intersectionCount / union.size) * 100);
}

function computeWeeklyMetrics(
  dailyRows: DailyScoreRow[]
): WeeklyUserTrendMetrics {
  const reports = dailyRows
    .map((row) => row.report)
    .filter((report): report is Report => report != null);
  const _combinedScores = reports
    .map((report) => {
      if (!isValidScore(report.alignment_score) || !isValidScore(report.execution_score)) {
        return null;
      }
      return (report.alignment_score + report.execution_score) / 2;
    })
    .filter((score): score is number => score != null);

  const uniqueDates = unique(dailyRows.map((row) => row.report_date));
  const reflectiveDates = unique(
    dailyRows
      .filter((row) => isValidScore(row.report?.execution_score))
      .map((row) => row.report_date)
  );
  const reflectionContinuity =
    uniqueDates.length > 0
      ? clampToPercent((reflectiveDates.length / uniqueDates.length) * 100)
      : 0;

  return {
    reflection_continuity: reflectionContinuity,
    identity_coherence: computeIdentityCoherence(reports),
  };
}

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required");
  }
  return new GoogleGenerativeAI(apiKey);
}

function buildWeeklyTrendContext({
  records,
  dailyRows,
  startDate,
  endDate,
}: RecordEvidenceContextParams): string {
  const summaries = dailyRows
    .filter((r) => r.report?.current_summary)
    .map((r) => `- ${r.report_date}: ${(r.report!.current_summary || "").slice(0, 120)}...`)
    .join("\n");
  const futureSummaries = dailyRows
    .filter((r) => r.report?.future_summary)
    .map((r) => `- ${r.report_date}: ${(r.report!.future_summary || "").slice(0, 100)}...`)
    .join("\n");
  const allKeywords = dailyRows.flatMap((r) => r.report?.current_keywords || []);
  const allFutureKeywords = dailyRows.flatMap((r) => r.report?.future_keywords || []);
  const allTraits = dailyRows.flatMap((r) => r.report?.aspired_traits || []);
  const allChars = dailyRows.flatMap((r) => r.report?.user_characteristics || []);
  const sampleRecords = records
    .slice(0, 5)
    .map((r) => `- ${r.kst_date} [${r.type}]: ${r.content.replace(/\s+/g, " ").trim().slice(0, 80)}...`)
    .join("\n");

  return [
    `기간: ${startDate} ~ ${endDate}`,
    `[일별 오늘의 비비드 요약]\n${summaries || "없음"}`,
    `[일별 앞으로의 모습 요약]\n${futureSummaries || "없음"}`,
    `[자주 등장한 키워드] ${[...new Set(allKeywords)].slice(0, 10).join(", ") || "없음"}`,
    `[지향하는 모습 키워드] ${[...new Set(allFutureKeywords)].slice(0, 8).join(", ") || "없음"}`,
    `[사용자 특성] ${[...new Set(allChars)].slice(0, 5).join(", ") || "없음"}`,
    `[지향하는 모습] ${[...new Set(allTraits)].slice(0, 5).join(", ") || "없음"}`,
    `[기록 샘플]\n${sampleRecords || "없음"}`,
  ].join("\n\n");
}

async function generateWeeklyTrendFromDailyData(
  records: VividRecordRow[],
  dailyRows: DailyScoreRow[],
  startDate: string,
  endDate: string,
  userId: string
): Promise<WeeklyTrendData | null> {
  const context = buildWeeklyTrendContext({ records, dailyRows, startDate, endDate });
  const prompt = `다음은 사용자의 ${startDate} ~ ${endDate} 주간 기록 분석입니다.\n\n${context}\n\n위 내용을 바탕으로 direction, core_value, driving_force, current_self 4가지 필드를 생성해주세요. JSON 형식으로 {"direction": "...", "core_value": "...", "driving_force": "...", "current_self": "..."}만 출력해주세요.`;

  const geminiClient = getGeminiClient();
  // cron 인사이트: 항상 Flash (rate limit·비용 고려)
  const modelName = "gemini-3-flash-preview";
  const startTime = Date.now();
  const model = geminiClient.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_PROMPT_WEEKLY_TREND,
  });

  const cleanedSchema = cleanSchemaRecursive(WeeklyTrendDataSchema.schema) as {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };

  const request = {
    contents: [{ role: "user" as const, parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: cleanedSchema.properties,
        ...(cleanedSchema.required && { required: cleanedSchema.required }),
      },
    },
  } as unknown as GenerateContentRequest;

  try {
    const result = await withGeminiRetry(() => model.generateContent(request));
    const content = result.response.text();
    const duration_ms = Date.now() - startTime;
    const usageMetadata = result.response?.usageMetadata as
      | { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number }
      | undefined;
    const usage = usageMetadata
      ? {
          prompt_tokens: usageMetadata.promptTokenCount ?? 0,
          completion_tokens: usageMetadata.candidatesTokenCount ?? 0,
          total_tokens:
            usageMetadata.totalTokenCount ??
            (usageMetadata.promptTokenCount ?? 0) + (usageMetadata.candidatesTokenCount ?? 0),
          cached_tokens: 0,
        }
      : { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    await logAIRequest({
      userId,
      model: modelName,
      requestType: "user_trends_weekly",
      sectionName: "weekly_trend",
      usage,
      duration_ms,
      success: true,
    });

    const parsed = JSON.parse(content || "{}") as Partial<WeeklyTrendData>;
    if (
      typeof parsed.direction !== "string" ||
      typeof parsed.core_value !== "string" ||
      typeof parsed.driving_force !== "string" ||
      typeof parsed.current_self !== "string"
    ) {
      throw new Error("Invalid weekly trend response");
    }
    return parsed as WeeklyTrendData;
  } catch (error) {
    await logAIRequest({
      userId,
      model: modelName,
      requestType: "user_trends_weekly",
      sectionName: "weekly_trend",
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      duration_ms: Date.now() - startTime,
      success: false,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

async function fetchVividRecords(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<VividRecordRow[]> {
  const { data, error } = await supabase
    .from("vivid_records")
    .select("kst_date, type, content")
    .eq("user_id", userId)
    .in("type", ["vivid", "dream", "review"])
    .gte("kst_date", startDate)
    .lte("kst_date", endDate)
    .order("kst_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch vivid_records: ${error.message}`);
  }

  return (data || []).map((row) => ({
    kst_date: row.kst_date,
    type: row.type,
    content: decrypt(row.content),
  }));
}

async function fetchDailyScores(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailyScoreRow[]> {
  const { data, error } = await supabase
    .from(API_ENDPOINTS.DAILY_VIVID)
    .select("*")
    .eq("user_id", userId)
    .gte("report_date", startDate)
    .lte("report_date", endDate)
    .order("report_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch daily_vivid: ${error.message}`);
  }

  const decryptedRows = (data || []).map((item) =>
    decryptDailyVivid(item as unknown as Record<string, unknown>)
  ) as Array<{ report_date?: string; report?: Report | null }>;

  return decryptedRows
    .filter((row): row is { report_date: string; report: Report | null } => !!row.report_date)
    .map((row) => ({ report_date: row.report_date, report: row.report ?? null }));
}

type RawHistoryRow = {
  period_start: string;
  period_end: string;
  trend: JsonbValue | null;
};

/** trend JSONB에서 metrics, source_count 추출 (기존 스키마 호환) */
function parseTrendForHistory(trend: JsonbValue | null): {
  metrics: WeeklyUserTrendMetrics;
  source_count: number;
} {
  const decoded = trend ? decryptJsonbFields(trend) : {};
  const obj = (typeof decoded === "object" && decoded !== null ? decoded : {}) as Record<
    string,
    unknown
  >;
  const m = (obj.metrics as Record<string, unknown>) || {};
  return {
    metrics: {
      reflection_continuity: clampToPercent(Number(m.reflection_continuity) || 0),
      identity_coherence: clampToPercent(Number(m.identity_coherence) || 0),
    },
    source_count: Number(obj.source_count) || 0,
  };
}

async function fetchRecentHistory(
  supabase: SupabaseClient,
  userId: string,
  limit = 3
): Promise<WeeklyTrendRow[]> {
  const { data, error } = await supabase
    .from(API_ENDPOINTS.USER_TRENDS)
    .select("period_start, period_end, trend")
    .eq("user_id", userId)
    .eq("type", "weekly")
    .order("period_end", { ascending: false })
    .limit(limit);

  if (error) {
    // 스키마 불일치 시(예: trend만 있는 테이블) 빈 배열 반환하여 1주차로 처리
    console.warn(`[fetchRecentHistory] ${userId} skip: ${error.message}`);
    return [];
  }

  return ((data || []) as RawHistoryRow[])
    .map((row) => {
      const { metrics, source_count } = parseTrendForHistory(row.trend);
      return {
        period_start: row.period_start,
        period_end: row.period_end,
        source_count,
        metrics,
      };
    })
    .reverse();
}

async function upsertWeeklyTrend(
  supabase: SupabaseClient,
  payload: {
    user_id: string;
    type: "weekly";
    period_start: string;
    period_end: string;
    trend: Record<string, unknown>;
    generated_at: string;
    updated_at: string;
  }
): Promise<void> {
  const { error } = await supabase.from(API_ENDPOINTS.USER_TRENDS).upsert(payload, {
    onConflict: "user_id,type,period_start,period_end",
  });
  if (error) {
    throw new Error(`Failed to upsert user_trends: ${error.message}`);
  }
}

export async function updateUserTrendsForUser(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<UserTrendResult> {
  const records = await fetchVividRecords(supabase, userId, startDate, endDate);
  if (records.length === 0) {
    return { userId, status: "skipped", reason: "no_records" };
  }

  const dailyRows = await fetchDailyScores(supabase, userId, startDate, endDate);
  if (dailyRows.length === 0) {
    return { userId, status: "skipped", reason: "no_daily_scores" };
  }

  const currentMetrics = computeWeeklyMetrics(dailyRows);
  const previousWeeks = await fetchRecentHistory(supabase, userId, 3);
  const allWeeks = [...previousWeeks, {
    period_start: startDate,
    period_end: endDate,
    source_count: records.length,
    metrics: currentMetrics,
  }];
  const validWeeks = allWeeks.length;

  const weeklyTrend = await generateWeeklyTrendFromDailyData(
    records,
    dailyRows,
    startDate,
    endDate,
    userId
  );

  const insights: WeeklyUserTrendInsights = {
    overall_summary: "",
    insufficient_data_note:
      validWeeks < 2 ? `최근 ${validWeeks}주 데이터로는 산정이 어렵습니다.` : null,
  };
  const dataQuality: WeeklyUserTrendDataQuality = {
    valid_weeks: validWeeks,
    valid_records: records.length,
    is_partial: validWeeks < 4,
  };

  const now = new Date().toISOString();
  // 기존 user_trends 스키마에 맞춤: 모든 주간 데이터를 trend JSONB에 통합 저장
  const trendPayload: Record<string, unknown> = {
    ...(weeklyTrend || {}),
    metrics: currentMetrics,
    insights,
    debug: {
      previous_periods: previousWeeks.map((week) => ({
        period_start: week.period_start,
        period_end: week.period_end,
      })),
    },
    data_quality: dataQuality,
    source_count: records.length,
  };
  const trendEncrypted = encryptJsonbFields(trendPayload as unknown as JsonbValue) as Record<
    string,
    unknown
  >;

  await upsertWeeklyTrend(supabase, {
    user_id: userId,
    type: "weekly",
    period_start: startDate,
    period_end: endDate,
    trend: trendEncrypted,
    generated_at: now,
    updated_at: now,
  });

  return { userId, status: "updated" };
}

/**
 * 월간 user_trends 생성 (성장 인사이트)
 * monthly_vivid가 있으면 report 활용, 없으면 records에서 report 생성 후 trend 생성
 */
export async function updateUserTrendsMonthlyForUser(
  supabase: SupabaseClient,
  userId: string,
  month: string, // "YYYY-MM"
  startDate: string,
  endDate: string
): Promise<UserTrendResult> {
  const { generateMonthlyTrend } = await import(
    "@/app/api/monthly-vivid/sections/trend"
  );
  const { fetchMonthlyVividByMonth } = await import(
    "@/app/api/monthly-vivid/monthly-vivid-db"
  );
  const { generateVividReportFromRecords } = await import(
    "@/app/api/monthly-vivid/sections/vivid-from-records"
  );
  const { verifySubscription } = await import("@/lib/subscription-utils");

  const { isPro } = await verifySubscription(userId);
  const [year, monthNum] = month.split("-");
  const monthLabel = `${year}년 ${monthNum}월`;

  let report: import("@/types/monthly-vivid").MonthlyReport | null = null;
  let userName: string | undefined;

  const monthlyVivid = await fetchMonthlyVividByMonth(supabase, userId, month);
  if (monthlyVivid?.report) {
    report = monthlyVivid.report;
  }

  if (!report) {
    const { fetchRecordsByDateRange } = await import(
      "@/app/api/monthly-vivid/records-db"
    );
    const records = await fetchRecordsByDateRange(
      supabase,
      userId,
      startDate,
      endDate
    );
    if (records.length === 0) {
      return { userId, status: "skipped", reason: "no_records" };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", userId)
      .single();
    userName = profile?.name || undefined;

    const dateRange = { start_date: startDate, end_date: endDate };
    report = await generateVividReportFromRecords(
      records,
      month,
      dateRange,
      isPro,
      userId,
      userName,
      ""
    );
  } else if (monthlyVivid?.month_label) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", userId)
      .single();
    userName = profile?.name || undefined;
  }

  if (!report) {
    return { userId, status: "skipped", reason: "no_report" };
  }

  const trend = await generateMonthlyTrend(
    report,
    month,
    monthLabel,
    isPro,
    userId,
    userName,
    "user_trends_monthly"
  );

  if (!trend) {
    return { userId, status: "skipped", reason: "trend_generation_failed" };
  }

  const encryptedTrend = encryptJsonbFields(
    trend as unknown as JsonbValue
  ) as Record<string, unknown>;
  const now = new Date().toISOString();

  const { error } = await supabase.from(API_ENDPOINTS.USER_TRENDS).upsert(
    {
      user_id: userId,
      type: "monthly",
      period_start: startDate,
      period_end: endDate,
      trend: encryptedTrend,
      generated_at: now,
      created_at: now,
      updated_at: now,
    },
    { onConflict: "user_id,type,period_start,period_end" }
  );

  if (error) {
    throw new Error(`Failed to upsert monthly user_trends: ${error.message}`);
  }

  return { userId, status: "updated" };
}
