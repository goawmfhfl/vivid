import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { getServiceSupabase } from "@/lib/supabase-service";
import {
  updateUserTrendsForUser,
  updateUserTrendsMonthlyForUser,
  type UserTrendResult,
} from "../helpers";

export const maxDuration = 180;

type UserTrendsBatchPayload = {
  userIds: string[];
  startDate: string;
  endDate: string;
  type?: "weekly" | "monthly";
  month?: string; // "YYYY-MM", required when type=monthly
};

function getQstashReceiver(): Receiver {
  const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;
  if (!currentSigningKey || !nextSigningKey) {
    throw new Error("QSTASH signing keys are required");
  }
  return new Receiver({
    currentSigningKey,
    nextSigningKey,
  });
}

function isCronSecretAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  return !!cronSecret && authHeader === `Bearer ${cronSecret}`;
}

function getConcurrency(value: string | null): number {
  const fallback = parseInt(process.env.USER_TRENDS_BATCH_CONCURRENCY || "3", 10);
  const parsed = parseInt(value || String(fallback), 10);
  return Math.min(Math.max(parsed, 1), 10);
}

function getSignatureVerificationUrl(request: NextRequest): string {
  const baseUrl = process.env.QSTASH_CALLBACK_URL;
  if (baseUrl) {
    const path = request.nextUrl.pathname + request.nextUrl.search;
    return `${baseUrl.replace(/\/$/, "")}${path}`;
  }
  return request.url;
}

async function parseQstashPayload(request: NextRequest): Promise<UserTrendsBatchPayload> {
  const receiver = getQstashReceiver();
  const signature = request.headers.get("upstash-signature") || "";
  const body = await request.text();
  const verificationUrl = getSignatureVerificationUrl(request);

  const isValid = await receiver.verify({
    signature,
    body,
    url: verificationUrl,
  });

  if (!isValid) {
    throw new Error("Invalid QStash signature");
  }

  return JSON.parse(body) as UserTrendsBatchPayload;
}

async function processWithConcurrency(
  userIds: string[],
  concurrency: number,
  handler: (userId: string) => Promise<UserTrendResult>
): Promise<UserTrendResult[]> {
  const results = new Array<UserTrendResult>(userIds.length);
  let index = 0;

  const workers = Array.from(
    { length: Math.min(concurrency, userIds.length) },
    async () => {
      while (true) {
        const current = index;
        index += 1;
        if (current >= userIds.length) {
          break;
        }
        results[current] = await handler(userIds[current]);
      }
    }
  );

  await Promise.all(workers);
  return results;
}

export async function POST(request: NextRequest) {
  try {
    let payload: UserTrendsBatchPayload;

    if (isCronSecretAuthorized(request)) {
      payload = (await request.json()) as UserTrendsBatchPayload;
    } else {
      payload = await parseQstashPayload(request);
    }

    if (!payload?.userIds?.length) {
      return NextResponse.json({ ok: true, processed: 0, updated: 0, skipped: 0 });
    }

    const { startDate, endDate, userIds, type = "weekly", month } = payload;
    const concurrency = getConcurrency(request.nextUrl.searchParams.get("concurrency"));
    const supabase = getServiceSupabase();
    const isMonthly = type === "monthly";
    const monthForMonthly = isMonthly ? month || "" : "";

    const results = await processWithConcurrency(userIds, concurrency, async (userId) => {
      try {
        if (isMonthly && monthForMonthly) {
          return await updateUserTrendsMonthlyForUser(
            supabase,
            userId,
            monthForMonthly,
            startDate,
            endDate
          );
        }
        return await updateUserTrendsForUser(supabase, userId, startDate, endDate);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[update-user-trends] user ${userId} failed:`, message);
        return { userId, status: "skipped", reason: message };
      }
    });

    const updatedCount = results.filter((result) => result.status === "updated").length;
    const skippedCount = results.length - updatedCount;

    return NextResponse.json({
      ok: true,
      processed: results.length,
      updated: updatedCount,
      skipped: skippedCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Cron update-user-trends batch error:", error);
    const status = message === "Invalid QStash signature" ? 401 : 500;
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status }
    );
  }
}
