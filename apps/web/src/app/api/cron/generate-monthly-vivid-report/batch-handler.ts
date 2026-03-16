import type { SupabaseClient } from "@supabase/supabase-js";
import {
  fetchUserPersonaOptional,
  buildPersonaContextBlock,
} from "@/lib/user-persona";
import { saveMonthlyVivid } from "@/app/api/monthly-vivid/db-service";
import { generateMonthlyVividFromRecordsWithProgress } from "@/app/api/monthly-vivid/ai-service-from-records";
import { fetchRecordsByDateRange } from "@/app/api/monthly-vivid/records-db";
import { fetchTodoItemsByDateRange } from "@/app/api/daily-vivid/db-service";
import { verifySubscription } from "@/lib/subscription-utils";
import { API_ENDPOINTS } from "@/constants";
import { logCronFailureAsync } from "@/lib/ai-usage-logger";
import type { MonthlyVivid } from "@/types/monthly-vivid";
import type { WithTracking } from "@/app/api/types";
import { removeTrackingFromObject } from "@/app/api/utils/remove-tracking";

function removeTrackingInfo(
  feedback: WithTracking<MonthlyVivid>
): MonthlyVivid {
  const cleaned = { ...feedback } as Record<string, unknown>;

  if ("__tracking" in cleaned) {
    delete cleaned.__tracking;
  }

  if (cleaned.title && typeof cleaned.title === "object" && cleaned.title !== null) {
    const titleObj = cleaned.title as Record<string, unknown> & { __tracking?: unknown; title?: string };
    if (titleObj.title && typeof titleObj.title === "string") {
      cleaned.title = titleObj.title;
    } else {
      cleaned.title = removeTrackingFromObject(titleObj);
    }
  }

  if (cleaned.report && typeof cleaned.report === "object" && cleaned.report !== null) {
    cleaned.report = removeTrackingFromObject(cleaned.report as Record<string, unknown>);
  }

  if (cleaned.trend && typeof cleaned.trend === "object" && cleaned.trend !== null) {
    cleaned.trend = removeTrackingFromObject(cleaned.trend as Record<string, unknown>);
  }

  return cleaned as MonthlyVivid;
}

export type MonthlyReportResult = {
  userId: string;
  status: "updated" | "skipped";
  reason?: string;
};

export async function generateMonthlyReportForUser(
  supabase: SupabaseClient,
  userId: string,
  month: string,
  startDate: string,
  endDate: string
): Promise<MonthlyReportResult> {
  const traceId = `monthly-cron-${userId}-${month}-${Date.now()}`;
  const runStartMs = Date.now();
  const modelName = "gemini-3.1-pro-preview";
  const { isPro } = await verifySubscription(userId);
  if (!isPro) {
    return { userId, status: "skipped", reason: "not_pro" };
  }

  // 이미 해당 월의 monthly_vivid가 있는지 확인 (is_ai_generated: true)
  const { data: existing } = await supabase
    .from(API_ENDPOINTS.MONTHLY_VIVID)
    .select("id")
    .eq("user_id", userId)
    .eq("month", month)
    .eq("is_ai_generated", true)
    .maybeSingle();

  if (existing) {
    return { userId, status: "skipped", reason: "already_exists" };
  }

  let records = [] as Awaited<ReturnType<typeof fetchRecordsByDateRange>>;
  try {
    records = await fetchRecordsByDateRange(
      supabase,
      userId,
      startDate,
      endDate
    );
  } catch (error) {
    logCronFailureAsync({
      userId,
      requestType: "monthly_vivid",
      flow: "monthly_vivid",
      status: "failed",
      reasonCode: "UNEXPECTED_ERROR",
      failedStep: "data_fetch",
      periodStart: startDate,
      periodEnd: endDate,
      isProSnapshot: true,
      model: modelName,
      durationMs: Date.now() - runStartMs,
      inputCount: 0,
      auxCount: null,
      traceId,
      error,
    });
    return { userId, status: "skipped", reason: "records_fetch_failed" };
  }

  if (records.length === 0) {
    logCronFailureAsync({
      userId,
      requestType: "monthly_vivid",
      flow: "monthly_vivid",
      status: "skipped",
      reasonCode: "NO_DATA",
      failedStep: "data_fetch",
      periodStart: startDate,
      periodEnd: endDate,
      isProSnapshot: true,
      model: modelName,
      durationMs: Date.now() - runStartMs,
      inputCount: 0,
      auxCount: null,
      traceId,
      error: "No records found for monthly range",
    });
    return { userId, status: "skipped", reason: "no_records" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", userId)
    .single();
  const userName = profile?.name || undefined;

  let personaContext = "";
  try {
    const persona = await fetchUserPersonaOptional(supabase, userId);
    personaContext = buildPersonaContextBlock(persona);
  } catch {
    // ignore
  }

  const dateRange = { start_date: startDate, end_date: endDate };

  let todoData = null as Awaited<ReturnType<typeof fetchTodoItemsByDateRange>> | null;
  try {
    todoData = await fetchTodoItemsByDateRange(
      supabase,
      userId,
      startDate,
      endDate
    );
  } catch (error) {
    logCronFailureAsync({
      userId,
      requestType: "monthly_vivid",
      flow: "monthly_vivid",
      status: "failed",
      reasonCode: "UNEXPECTED_ERROR",
      failedStep: "data_fetch",
      periodStart: startDate,
      periodEnd: endDate,
      isProSnapshot: true,
      model: modelName,
      durationMs: Date.now() - runStartMs,
      inputCount: records.length,
      auxCount: null,
      traceId,
      error,
    });
    return { userId, status: "skipped", reason: "todo_fetch_failed" };
  }

  let monthlyVivid = null as Awaited<
    ReturnType<typeof generateMonthlyVividFromRecordsWithProgress>
  > | null;
  try {
    monthlyVivid = await generateMonthlyVividFromRecordsWithProgress(
      records,
      month,
      dateRange,
      isPro,
      userId,
      userName,
      personaContext,
      todoData || undefined
    );
  } catch (error) {
    logCronFailureAsync({
      userId,
      requestType: "monthly_vivid",
      flow: "monthly_vivid",
      status: "failed",
      reasonCode: "AI_GENERATION_FAILED",
      failedStep: "ai_generate",
      periodStart: startDate,
      periodEnd: endDate,
      isProSnapshot: true,
      model: modelName,
      durationMs: Date.now() - runStartMs,
      inputCount: records.length,
      auxCount: todoData?.items?.length ?? null,
      traceId,
      error,
    });
    return { userId, status: "skipped", reason: "monthly_generation_failed" };
  }

  if (!monthlyVivid.month_label) {
    const [year, monthNum] = month.split("-");
    monthlyVivid.month_label = `${year}년 ${monthNum}월`;
  }
  if (!monthlyVivid.date_range) {
    monthlyVivid.date_range = dateRange;
  }

  const cleanedFeedback = removeTrackingInfo(monthlyVivid);
  try {
    await saveMonthlyVivid(supabase, userId, cleanedFeedback);
  } catch (error) {
    logCronFailureAsync({
      userId,
      requestType: "monthly_vivid",
      flow: "monthly_vivid",
      status: "failed",
      reasonCode: "DB_SAVE_FAILED",
      failedStep: "save_result",
      periodStart: startDate,
      periodEnd: endDate,
      isProSnapshot: true,
      model: modelName,
      durationMs: Date.now() - runStartMs,
      inputCount: records.length,
      auxCount: todoData?.items?.length ?? null,
      traceId,
      error,
    });
    return { userId, status: "skipped", reason: "monthly_save_failed" };
  }

  return { userId, status: "updated" };
}
