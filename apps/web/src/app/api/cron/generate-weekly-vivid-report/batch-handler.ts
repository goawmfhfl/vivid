import type { SupabaseClient } from "@supabase/supabase-js";
import {
  fetchUserPersonaOptional,
  buildPersonaContextBlock,
} from "@/lib/user-persona";
import { fetchRecordsByDateRange, saveWeeklyVivid } from "@/app/api/weekly-vivid/db-service";
import { generateWeeklyVividFromRecordsWithProgress } from "@/app/api/weekly-vivid/ai-service-stream";
import { verifySubscription } from "@/lib/subscription-utils";
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
  const { isPro } = await verifySubscription(userId);
  if (!isPro) {
    return { userId, status: "skipped", reason: "not_pro" };
  }

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

  const weeklyVivid = await generateWeeklyVividFromRecordsWithProgress(
    records,
    range,
    isPro,
    userId,
    userName,
    personaContext
  );

  const cleanedFeedback = removeTrackingInfo(weeklyVivid);
  await saveWeeklyVivid(supabase, userId, cleanedFeedback);

  return { userId, status: "updated" };
}
