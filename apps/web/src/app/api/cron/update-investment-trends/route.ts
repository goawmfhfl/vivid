import { NextRequest, NextResponse } from "next/server";
import { Client } from "@upstash/qstash";
import { getServiceSupabase } from "@/lib/supabase-service";
import { isProFromMetadata, verifySubscription } from "@/lib/subscription-utils";
import { CRON_BATCH } from "@/constants/cron";
import { updateInvestmentTrendsForUser } from "./helpers";

export const dynamic = "force-dynamic";
export const maxDuration = 180;

const REQUIRED_ENV = [
  "CRON_SECRET",
  "QSTASH_TOKEN",
  "QSTASH_CURRENT_SIGNING_KEY",
  "QSTASH_NEXT_SIGNING_KEY",
] as const;

type BatchPayload = {
  userIds: string[];
};

function getQstashClient(): Client {
  const token = process.env.QSTASH_TOKEN;
  if (!token) throw new Error("QSTASH_TOKEN is required");
  return new Client({ token });
}

function getBatchSize(value: string | null): number {
  const fallback = CRON_BATCH.USER_TRENDS_WEEKLY;
  const parsed = parseInt(value || String(fallback), 10);
  return Math.min(Math.max(parsed, 5), 100);
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
    console.error("[cron] update-investment-trends missing env:", missingEnv);
    return NextResponse.json(
      { error: "Configuration error", missing: missingEnv },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "100", 10), 1), 100);
    const batchSize = getBatchSize(searchParams.get("batchSize"));
    const concurrencyParam = searchParams.get("concurrency");
    const targetUserId = searchParams.get("userId");
    const sync = searchParams.get("sync") === "1";

    console.log("[cron] update-investment-trends invoked", { page, limit, targetUserId });

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
          message: "Target user is not Pro; investment trend cron runs for Pro only.",
        });
      }
      users = [{ id: targetUserId }];

      if (sync) {
        const result = await updateInvestmentTrendsForUser(supabase, targetUserId);
        return NextResponse.json({
          ok: true,
          mode: "sync",
          userId: targetUserId,
          result,
        });
      }
    } else {
      const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({
        page,
        perPage: limit,
      });
      if (usersError) throw new Error(`Failed to list users: ${usersError.message}`);
      const allUsers = usersData?.users || [];
      authPageFull = allUsers.length === limit;
      users = allUsers.filter((user) =>
        isProFromMetadata(user.user_metadata as Record<string, unknown> | undefined)
      );
      console.log("[cron] update-investment-trends Pro users:", users.length);
    }

    const hasMoreAuthPages = !targetUserId && authPageFull;
    const nextPage = hasMoreAuthPages ? page + 1 : null;

    const baseUrl = process.env.QSTASH_CALLBACK_URL || request.nextUrl.origin;
    const qstash = getQstashClient();

    if (!users.length) {
      if (nextPage) {
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret) {
          const nextUrl = new URL(`${baseUrl}/api/cron/update-investment-trends`);
          nextUrl.searchParams.set("page", String(nextPage));
          nextUrl.searchParams.set("limit", String(limit));
          nextUrl.searchParams.set("batchSize", String(batchSize));
          if (concurrencyParam) nextUrl.searchParams.set("concurrency", concurrencyParam);
          await qstash.publishJSON({
            url: nextUrl.toString(),
            body: {},
            method: "GET",
            headers: { Authorization: `Bearer ${cronSecret}` },
            delay: "10s",
          });
        }
      }
      return NextResponse.json({ ok: true, page, limit, batchSize, users: 0, batches: 0, nextPage });
    }

    const batchUrlBase = `${baseUrl}/api/cron/update-investment-trends/batch`;
    const batchUrl =
      concurrencyParam != null && concurrencyParam !== ""
        ? `${batchUrlBase}?concurrency=${encodeURIComponent(concurrencyParam)}`
        : batchUrlBase;

    const userIds = users.map((u) => u.id);
    const batches: BatchPayload[] = [];
    for (let i = 0; i < userIds.length; i += batchSize) {
      batches.push({ userIds: userIds.slice(i, i + batchSize) });
    }

    await Promise.all(
      batches.map((payload) => qstash.publishJSON({ url: batchUrl, body: payload }))
    );

    console.log("[cron] update-investment-trends published batches:", batches.length);

    let nextPageScheduled = false;
    if (nextPage) {
      const cronSecret = process.env.CRON_SECRET;
      if (cronSecret) {
        const nextUrl = new URL(`${baseUrl}/api/cron/update-investment-trends`);
        nextUrl.searchParams.set("page", String(nextPage));
        nextUrl.searchParams.set("limit", String(limit));
        nextUrl.searchParams.set("batchSize", String(batchSize));
        if (concurrencyParam) nextUrl.searchParams.set("concurrency", concurrencyParam);
        await qstash.publishJSON({
          url: nextUrl.toString(),
          body: {},
          method: "GET",
          headers: { Authorization: `Bearer ${cronSecret}` },
          delay: "10s",
        });
        nextPageScheduled = true;
      }
    }

    return NextResponse.json({
      ok: true,
      page,
      limit,
      batchSize,
      users: users.length,
      batches: batches.length,
      nextPage,
      ...(nextPageScheduled && { nextPageScheduled: true }),
    });
  } catch (error) {
    console.error("Cron update-investment-trends error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
