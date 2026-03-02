import { NextRequest, NextResponse } from "next/server";
import { Client } from "@upstash/qstash";
import { getServiceSupabase } from "@/lib/supabase-service";
import { isProFromMetadata, verifySubscription } from "@/lib/subscription-utils";
import { API_ENDPOINTS } from "@/constants";
import { CRON_BATCH } from "@/constants/cron";
import {
  getPreviousMonthKstRange,
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

type MonthlyReportBatchPayload = {
  userIds: string[];
  month: string;
  startDate: string;
  endDate: string;
};

function getQstashClient(): Client {
  const token = process.env.QSTASH_TOKEN;
  if (!token) {
    throw new Error("QSTASH_TOKEN is required");
  }
  return new Client({ token });
}

function getBatchSize(value: string | null): number {
  const parsed = parseInt(value || String(CRON_BATCH.MONTHLY_REPORT), 10);
  return Math.min(Math.max(parsed, 1), 50);
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
    console.error("[cron] generate-monthly-vivid-report missing env:", missingEnv);
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

    console.log("[cron] generate-monthly-vivid-report invoked", { page, limit });

    // 자동 크론( baseDate 없음)인 경우: 전월 말일 15:00 UTC = 다음 달 1일 00:00 KST에만 실행.
    // 28~31일 15:00 UTC에 호출되므로, "내일이 1일"인 날(즉 말일)에만 실제 생성 수행.
    if (!baseDate) {
      const now = new Date();
      const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
      if (tomorrow.getUTCDate() !== 1) {
        return NextResponse.json({
          ok: true,
          skipped: true,
          reason: "Not last day of month (UTC); run at 15:00 UTC on 28–31 so that KST is next day 00:00.",
        });
      }
    }

    if (baseDate && !isValidDateString(baseDate)) {
      return NextResponse.json(
        { error: "Invalid baseDate format (YYYY-MM-DD required)" },
        { status: 400 }
      );
    }

    const { startDate, endDate, month } =
      getPreviousMonthKstRange(baseDate || undefined);

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
          month,
          message: "Target user is not Pro; monthly report cron runs for Pro only.",
        });
      }
      users = [{ id: targetUserId }];

      if (sync) {
        const { generateMonthlyReportForUser } = await import("./batch-handler");
        const result = await generateMonthlyReportForUser(
          supabase,
          targetUserId,
          month,
          startDate,
          endDate
        );
        return NextResponse.json({
          ok: true,
          mode: "sync",
          userId: targetUserId,
          month,
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
      console.log("[cron] generate-monthly-vivid-report Pro users:", users.length);
    }

    if (users.length > 0) {
      const userIdsBefore = users.map((u) => u.id);
      const { data: recordRows } = await supabase
        .from(API_ENDPOINTS.RECORDS)
        .select("user_id")
        .in("user_id", userIdsBefore)
        .in("type", ["vivid", "dream"])
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
          "[cron] generate-monthly-vivid-report: filtered to users with vivid_records:",
          users.length,
          "of",
          userIdsBefore.length
        );
      }

      // 이미 monthly_vivid가 있는 유저 제외
      if (users.length > 0) {
        const { data: existingRows } = await supabase
          .from(API_ENDPOINTS.MONTHLY_VIVID)
          .select("user_id")
          .in("user_id", users.map((u) => u.id))
          .eq("month", month)
          .eq("is_ai_generated", true);

        const hasMonthlyByUser = new Set(
          (existingRows || []).map((r) => (r as { user_id: string }).user_id)
        );
        const beforeFilter = users.length;
        users = users.filter((u) => !hasMonthlyByUser.has(u.id));
        if (users.length < beforeFilter) {
          console.log(
            "[cron] generate-monthly-vivid-report: filtered out users with existing monthly_vivid:",
            users.length,
            "of",
            beforeFilter
          );
        }
      }
    }

    const hasMoreAuthPages = !targetUserId && authPageFull;
    const nextPage = hasMoreAuthPages ? page + 1 : null;

    if (!users.length) {
      let nextPageScheduled = false;
      if (nextPage) {
        const baseUrl = process.env.QSTASH_CALLBACK_URL || request.nextUrl.origin;
        const cronSecret = process.env.CRON_SECRET;
        const qstash = getQstashClient();
        const nextPath = `${baseUrl}/api/cron/generate-monthly-vivid-report`;
        const nextUrl = new URL(nextPath);
        nextUrl.searchParams.set("page", String(nextPage));
        nextUrl.searchParams.set("limit", String(limit));
        nextUrl.searchParams.set("batchSize", String(batchSize));
        if (concurrencyParam != null && concurrencyParam !== "")
          nextUrl.searchParams.set("concurrency", concurrencyParam);
        if (baseDate) nextUrl.searchParams.set("baseDate", baseDate);

        if (cronSecret) {
          await qstash.publishJSON({
            url: nextUrl.toString(),
            body: {},
            method: "GET",
            headers: { Authorization: `Bearer ${cronSecret}` },
            delay: "60s",
          });
          nextPageScheduled = true;
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
        month,
        startDate,
        endDate,
      });
    }

    const baseUrl = process.env.QSTASH_CALLBACK_URL || request.nextUrl.origin;
    const batchUrlBase = `${baseUrl}/api/cron/generate-monthly-vivid-report/batch`;
    const batchUrl =
      concurrencyParam != null && concurrencyParam !== ""
        ? `${batchUrlBase}?concurrency=${encodeURIComponent(concurrencyParam)}`
        : batchUrlBase;
    const qstash = getQstashClient();
    const userIds = users.map((user) => user.id);
    const batches: MonthlyReportBatchPayload[] = [];
    for (let idx = 0; idx < userIds.length; idx += batchSize) {
      batches.push({
        userIds: userIds.slice(idx, idx + batchSize),
        month,
        startDate,
        endDate,
      });
    }

    await Promise.all(
      batches.map((payload) =>
        qstash.publishJSON({
          url: batchUrl,
          body: payload,
        })
      )
    );

    console.log("[cron] generate-monthly-vivid-report published batches:", batches.length);

    let nextPageScheduled = false;
    if (nextPage) {
      const cronSecret = process.env.CRON_SECRET;
      const nextPath = `${baseUrl}/api/cron/generate-monthly-vivid-report`;
      const nextUrl = new URL(nextPath);
      nextUrl.searchParams.set("page", String(nextPage));
      nextUrl.searchParams.set("limit", String(limit));
      nextUrl.searchParams.set("batchSize", String(batchSize));
      if (concurrencyParam != null && concurrencyParam !== "")
        nextUrl.searchParams.set("concurrency", concurrencyParam);
      if (baseDate) nextUrl.searchParams.set("baseDate", baseDate);

      if (cronSecret) {
        await qstash.publishJSON({
          url: nextUrl.toString(),
          body: {},
          method: "GET",
          headers: { Authorization: `Bearer ${cronSecret}` },
          delay: "60s",
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
      month,
      startDate,
      endDate,
    });
  } catch (error) {
    console.error("Cron generate-monthly-vivid-report error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
