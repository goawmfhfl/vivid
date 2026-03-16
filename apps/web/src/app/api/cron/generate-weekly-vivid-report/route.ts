import { NextRequest, NextResponse } from "next/server";
import { Client } from "@upstash/qstash";
import { createHash } from "node:crypto";
import { getServiceSupabase } from "@/lib/supabase-service";
import { isProFromMetadata, verifySubscription } from "@/lib/subscription-utils";
import { API_ENDPOINTS } from "@/constants";
import { CRON_BATCH } from "@/constants/cron";
import {
  getWeekSunToSatKstRange,
  isValidDateString,
} from "../update-persona/helpers";

export const dynamic = "force-dynamic";
export const maxDuration = 180;

const REQUIRED_ENV = [
  "CRON_SECRET",
  "QSTASH_TOKEN",
  "QSTASH_CURRENT_SIGNING_KEY",
  "QSTASH_NEXT_SIGNING_KEY",
] as const;

type WeeklyReportBatchPayload = {
  userIds: string[];
  startDate: string;
  endDate: string;
};

function hashForDedup(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 20);
}

function getBatchDeduplicationId(payload: WeeklyReportBatchPayload): string {
  const idsHash = hashForDedup(payload.userIds.join(","));
  return [
    "weekly-report-batch",
    payload.startDate,
    payload.endDate,
    idsHash,
    String(payload.userIds.length),
  ].join("_");
}

function getNextPageDeduplicationId(
  startDate: string,
  endDate: string,
  nextPage: number,
  limit: number
): string {
  return [
    "weekly-report-next-page",
    startDate,
    endDate,
    String(nextPage),
    String(limit),
  ].join("_");
}

function getQstashClient(): Client {
  const token = process.env.QSTASH_TOKEN;
  if (!token) {
    throw new Error("QSTASH_TOKEN is required");
  }
  return new Client({ token });
}

function getBatchSize(value: string | null): number {
  const parsed = parseInt(value || String(CRON_BATCH.WEEKLY_REPORT), 10);
  return Math.min(Math.max(parsed, 1), 100);
}

function isAuthorizedCron(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isSecretValid = !!cronSecret && authHeader === `Bearer ${cronSecret}`;
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";

  const isDevSecret =
    process.env.NODE_ENV === "development" &&
    !!cronSecret &&
    new URL(request.url).searchParams.get("secret") === cronSecret;

  return isSecretValid || isVercelCron || isDevSecret;
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const missingEnv = REQUIRED_ENV.filter((k) => !process.env[k]);
  if (missingEnv.length) {
    console.error("[cron] generate-weekly-vivid-report missing env:", missingEnv);
    return NextResponse.json(
      { error: "Configuration error", missing: missingEnv },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "100", 10), 1),
      100
    );
    const batchSize = getBatchSize(searchParams.get("batchSize"));
    const concurrencyParam = searchParams.get("concurrency");
    const baseDate = searchParams.get("baseDate");
    const targetUserId = searchParams.get("userId");
    const sync = searchParams.get("sync") === "1";

    console.log("[cron] generate-weekly-vivid-report invoked", { page, limit });

    if (baseDate && !isValidDateString(baseDate)) {
      return NextResponse.json(
        { error: "Invalid baseDate format (YYYY-MM-DD required)" },
        { status: 400 }
      );
    }

    const { startDate, endDate } = getWeekSunToSatKstRange(baseDate || undefined);

    const supabase = getServiceSupabase();

    let users: Array<{ id: string }> = [];
    let authPageFull = false;

    if (targetUserId) {
      const { isPro } = await verifySubscription(targetUserId);
      if (!isPro) {
        return NextResponse.json({
          ok: true,
          page: 1,
          limit,
          batchSize,
          users: 0,
          batches: 0,
          nextPage: null,
          message: "Target user is not Pro; weekly report cron runs for Pro only.",
        });
      }
      users = [{ id: targetUserId }];

      if (sync) {
        const { generateWeeklyReportForUser } = await import("./batch-handler");
        const result = await generateWeeklyReportForUser(
          supabase,
          targetUserId,
          startDate,
          endDate
        );
        return NextResponse.json({
          ok: true,
          mode: "sync",
          userId: targetUserId,
          startDate,
          endDate,
          result,
        });
      }
    } else {
      const { data: usersData, error: usersError } =
        await supabase.auth.admin.listUsers({
          page,
          perPage: limit,
        });
      if (usersError) {
        throw new Error(`Failed to list users: ${usersError.message}`);
      }
      const allUsers = usersData?.users || [];
      authPageFull = allUsers.length === limit;
      users = allUsers.filter((user) =>
        isProFromMetadata(user.user_metadata as Record<string, unknown> | undefined)
      );
      console.log("[cron] generate-weekly-vivid-report Pro users:", users.length);
    }

    if (users.length > 0) {
      const userIdsBefore = users.map((u) => u.id);
      const { data: recordRows } = await supabase
        .from(API_ENDPOINTS.RECORDS)
        .select("user_id")
        .in("user_id", userIdsBefore)
        .gte("kst_date", startDate)
        .lte("kst_date", endDate);

      const hasRecordsByUser = new Set<string>();
      for (const row of recordRows || []) {
        const uid = (row as { user_id?: string }).user_id;
        if (uid) hasRecordsByUser.add(uid);
      }

      users = users.filter((u) => hasRecordsByUser.has(u.id));
      if (users.length < userIdsBefore.length) {
        console.log(
          "[cron] generate-weekly-vivid-report: filtered to users with vivid_records:",
          users.length,
          "of",
          userIdsBefore.length
        );
      }
    }

    const hasMoreAuthPages = !targetUserId && authPageFull;
    const nextPage = hasMoreAuthPages ? page + 1 : null;

    if (!users.length) {
      let nextPageScheduled = false;
      let nextPageScheduleError: string | null = null;
      if (nextPage) {
        const baseUrl = process.env.QSTASH_CALLBACK_URL || request.nextUrl.origin;
        const cronSecret = process.env.CRON_SECRET;
        const qstash = getQstashClient();
        const nextPath = `${baseUrl}/api/cron/generate-weekly-vivid-report`;
        const nextUrl = new URL(nextPath);
        nextUrl.searchParams.set("page", String(nextPage));
        nextUrl.searchParams.set("limit", String(limit));
        nextUrl.searchParams.set("batchSize", String(batchSize));
        if (concurrencyParam != null && concurrencyParam !== "")
          nextUrl.searchParams.set("concurrency", concurrencyParam);
        if (baseDate) nextUrl.searchParams.set("baseDate", baseDate);

        if (cronSecret) {
          try {
            await qstash.publishJSON({
              url: nextUrl.toString(),
              body: {},
              method: "GET",
              headers: { Authorization: `Bearer ${cronSecret}` },
              delay: "30s",
              deduplicationId: getNextPageDeduplicationId(
                startDate,
                endDate,
                nextPage,
                limit
              ),
            });
            nextPageScheduled = true;
          } catch (error) {
            nextPageScheduleError =
              error instanceof Error ? error.message : String(error);
            console.error(
              "[cron] generate-weekly-vivid-report failed to schedule next page:",
              {
                nextPage,
                limit,
                startDate,
                endDate,
                error: nextPageScheduleError,
              }
            );
          }
        }
      }
      return NextResponse.json({
        ok: true,
        page,
        limit,
        batchSize,
        users: 0,
        batches: 0,
        nextPage,
        ...(nextPageScheduled && { nextPageScheduled: true }),
        ...(nextPageScheduleError && { nextPageScheduleError }),
        startDate,
        endDate,
      });
    }

    const baseUrl = process.env.QSTASH_CALLBACK_URL || request.nextUrl.origin;
    const batchUrlBase = `${baseUrl}/api/cron/generate-weekly-vivid-report/batch`;
    const batchUrl =
      concurrencyParam != null && concurrencyParam !== ""
        ? `${batchUrlBase}?concurrency=${encodeURIComponent(concurrencyParam)}`
        : batchUrlBase;
    const qstash = getQstashClient();
    const userIds = users.map((user) => user.id);
    const batches: WeeklyReportBatchPayload[] = [];
    for (let idx = 0; idx < userIds.length; idx += batchSize) {
      batches.push({
        userIds: userIds.slice(idx, idx + batchSize),
        startDate,
        endDate,
      });
    }

    const publishResults = await Promise.allSettled(
      batches.map((payload, index) =>
        qstash.publishJSON({
          url: batchUrl,
          body: payload,
          deduplicationId: getBatchDeduplicationId(payload),
        }).then(() => ({
          index,
          size: payload.userIds.length,
          firstUserId: payload.userIds[0] || "none",
          lastUserId: payload.userIds[payload.userIds.length - 1] || "none",
          deduplicationId: getBatchDeduplicationId(payload),
        }))
      )
    );

    const publishedBatches = publishResults.filter(
      (result) => result.status === "fulfilled"
    ).length;
    const failedBatchDetails = publishResults
      .map((result, index) => {
        if (result.status === "fulfilled") return null;
        const payload = batches[index];
        const reason =
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason);
        return {
          index,
          size: payload.userIds.length,
          firstUserId: payload.userIds[0] || "none",
          lastUserId: payload.userIds[payload.userIds.length - 1] || "none",
          deduplicationId: getBatchDeduplicationId(payload),
          reason,
        };
      })
      .filter(
        (
          value
        ): value is {
          index: number;
          size: number;
          firstUserId: string;
          lastUserId: string;
          deduplicationId: string;
          reason: string;
        } => value !== null
      );

    console.log("[cron] generate-weekly-vivid-report published batches:", {
      attemptedBatches: batches.length,
      publishedBatches,
      failedBatches: failedBatchDetails.length,
      failedBatchDetails,
    });

    let nextPageScheduled = false;
    let nextPageScheduleError: string | null = null;
    if (nextPage) {
      const cronSecret = process.env.CRON_SECRET;
      const nextPath = `${baseUrl}/api/cron/generate-weekly-vivid-report`;
      const nextUrl = new URL(nextPath);
      nextUrl.searchParams.set("page", String(nextPage));
      nextUrl.searchParams.set("limit", String(limit));
      nextUrl.searchParams.set("batchSize", String(batchSize));
      if (concurrencyParam != null && concurrencyParam !== "")
        nextUrl.searchParams.set("concurrency", concurrencyParam);
      if (baseDate) nextUrl.searchParams.set("baseDate", baseDate);

      if (cronSecret) {
        try {
          await qstash.publishJSON({
            url: nextUrl.toString(),
            body: {},
            method: "GET",
            headers: { Authorization: `Bearer ${cronSecret}` },
            delay: "30s",
            deduplicationId: getNextPageDeduplicationId(
              startDate,
              endDate,
              nextPage,
              limit
            ),
          });
          nextPageScheduled = true;
        } catch (error) {
          nextPageScheduleError =
            error instanceof Error ? error.message : String(error);
          console.error(
            "[cron] generate-weekly-vivid-report failed to schedule next page:",
            {
              nextPage,
              limit,
              startDate,
              endDate,
              error: nextPageScheduleError,
            }
          );
        }
      }
    }

    return NextResponse.json({
      ok: true,
      page,
      limit,
      batchSize,
      users: users.length,
      batches: batches.length,
      publishedBatches,
      failedBatches: failedBatchDetails.length,
      failedBatchDetails,
      nextPage,
      ...(nextPageScheduled && { nextPageScheduled: true }),
      ...(nextPageScheduleError && { nextPageScheduleError }),
      startDate,
      endDate,
    });
  } catch (error) {
    console.error("Cron generate-weekly-vivid-report error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
