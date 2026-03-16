import type { SupabaseClient } from "@supabase/supabase-js";
import {
  fetchUserPersonaOptional,
  buildPersonaContextBlock,
} from "@/lib/user-persona";
import { fetchRecordsByDateRange, saveWeeklyVivid } from "@/app/api/weekly-vivid/db-service";
import { fetchTodoItemsByDateRange } from "@/app/api/daily-vivid/db-service";
import { generateWeeklyVividFromRecordsWithProgress } from "@/app/api/weekly-vivid/ai-service-stream";
import { verifySubscription } from "@/lib/subscription-utils";
import { API_ENDPOINTS } from "@/constants";
import { logCronFailureAsync } from "@/lib/ai-usage-logger";
import type { WeeklyVivid } from "@/types/weekly-vivid";
import type { WithTracking } from "@/app/api/types";
import { removeTrackingFromObject } from "@/app/api/utils/remove-tracking";

function removeTrackingInfo(
  feedback: WithTracking<WeeklyVivid>
): WeeklyVivid {
  const cleaned = { ...feedback } as Record<string, unknown>;

  if ("__tracking" in cleaned) {
    delete cleaned.__tracking;
  }

  const sections = ["report"];
  for (const key of sections) {
    if (cleaned[key] && typeof cleaned[key] === "object") {
      cleaned[key] = removeTrackingFromObject(cleaned[key] as Record<string, unknown>);
    }
  }

  return cleaned as WeeklyVivid;
}

export type WeeklyReportResult = {
  userId: string;
  status: "updated" | "skipped";
  reason?: string;
};

export async function generateWeeklyReportForUser(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<WeeklyReportResult> {
  const traceId = `weekly-cron-${userId}-${startDate}-${Date.now()}`;
  const runStartMs = Date.now();
  const modelName = "gemini-3.1-pro-preview";
  const { isPro } = await verifySubscription(userId);
  if (!isPro) {
    return { userId, status: "skipped", reason: "not_pro" };
  }

  const { data: existingWeekly } = await supabase
    .from(API_ENDPOINTS.WEEKLY_VIVID)
    .select("id")
    .eq("user_id", userId)
    .eq("week_start", startDate)
    .maybeSingle();
  if (existingWeekly) {
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
      requestType: "weekly_vivid",
      flow: "weekly_vivid",
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
      requestType: "weekly_vivid",
      flow: "weekly_vivid",
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
      error: "No records found for weekly range",
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

  const range = {
    start: startDate,
    end: endDate,
    timezone: "Asia/Seoul",
  };

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
      requestType: "weekly_vivid",
      flow: "weekly_vivid",
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

  let weeklyVivid = null as Awaited<
    ReturnType<typeof generateWeeklyVividFromRecordsWithProgress>
  > | null;
  try {
    weeklyVivid = await generateWeeklyVividFromRecordsWithProgress(
      records,
      range,
      isPro,
      userId,
      userName,
      personaContext,
      todoData || undefined
    );
  } catch (error) {
    logCronFailureAsync({
      userId,
      requestType: "weekly_vivid",
      flow: "weekly_vivid",
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
    return { userId, status: "skipped", reason: "weekly_generation_failed" };
  }

  const cleanedFeedback = removeTrackingInfo(weeklyVivid);
  try {
    await saveWeeklyVivid(supabase, userId, cleanedFeedback);
  } catch (error) {
    logCronFailureAsync({
      userId,
      requestType: "weekly_vivid",
      flow: "weekly_vivid",
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
    return { userId, status: "skipped", reason: "weekly_save_failed" };
  }

  return { userId, status: "updated" };
}
