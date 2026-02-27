import { NextRequest, NextResponse } from "next/server";
import { Client } from "@upstash/qstash";
import { getServiceSupabase } from "@/lib/supabase-service";
import { isProFromMetadata, verifySubscription } from "@/lib/subscription-utils";
import { API_ENDPOINTS } from "@/constants";
import {
  updateUserTrendsForUser,
  updateUserTrendsMonthlyForUser,
} from "../helpers";
import {
  getKstDateRangeFromBase,
  getPreviousWeekKstRange,
  getPreviousMonthKstRange,
  isValidDateString,
} from "../../update-persona/helpers";

export const dynamic = "force-dynamic";
export const maxDuration = 180;

const REQUIRED_ENV = [
  "CRON_SECRET",
  "QSTASH_TOKEN",
  "QSTASH_CURRENT_SIGNING_KEY",
  "QSTASH_NEXT_SIGNING_KEY",
] as const;

type UserTrendsBatchPayload = {
  userIds: string[];
  startDate: string;
  endDate: string;
  type?: "weekly" | "monthly";
  month?: string; // "YYYY-MM", required when type=monthly
};

function getQstashClient(): Client {
  const token = process.env.QSTASH_TOKEN;
  if (!token) {
    throw new Error("QSTASH_TOKEN is required");
  }
  return new Client({ token });
}

function getBatchSize(value: string | null): number {
  const fallback = parseInt(process.env.USER_TRENDS_BATCH_SIZE || "25", 10);
  const parsed = parseInt(value || String(fallback), 10);
  return Math.min(Math.max(parsed, 1), 100);
}

function isAuthorizedCron(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isSecretValid = !!cronSecret && authHeader === `Bearer ${cronSecret}`;
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";

  // 로컬 개발: query param secret 허용 (NODE_ENV=development만)
  const isDevSecret =
    process.env.NODE_ENV === "development" &&
    !!cronSecret &&
    new URL(request.url).searchParams.get("secret") === cronSecret;

  return isSecretValid || isVercelCron || isDevSecret;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ type: string }> }
) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type: typeParam } = await context.params;
  const type = typeParam as "weekly" | "monthly";

  if (type !== "weekly" && type !== "monthly") {
    return NextResponse.json(
      { error: "Invalid type. Use /weekly or /monthly" },
      { status: 404 }
    );
  }

  const missingEnv = REQUIRED_ENV.filter((k) => !process.env[k]);
  if (missingEnv.length) {
    console.error("[cron] update-user-trends missing env:", missingEnv);
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
    const baseDate = searchParams.get("baseDate");
    const targetUserId = searchParams.get("userId");
    const sync = searchParams.get("sync") === "1";

    console.log("[cron] update-user-trends invoked", { type, page, limit });

    if (baseDate && !isValidDateString(baseDate)) {
      return NextResponse.json(
        { error: "Invalid baseDate format (YYYY-MM-DD required)" },
        { status: 400 }
      );
    }

    const { startDate, endDate } =
      type === "monthly"
        ? (() => {
            const r = getPreviousMonthKstRange(baseDate || undefined);
            return { startDate: r.startDate, endDate: r.endDate };
          })()
        : baseDate
          ? getKstDateRangeFromBase(baseDate, 7)
          : getPreviousWeekKstRange(baseDate || undefined);

    const supabase = getServiceSupabase();

    let users: Array<{ id: string }> = [];
    let authPageFull = false; // auth에서 full page 수신 여부 (다음 페이지 체이닝용)
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
          message: "Target user is not Pro; user_trends cron runs for Pro only.",
        });
      }
      users = [{ id: targetUserId }];

      if (sync) {
        const month =
          type === "monthly"
            ? getPreviousMonthKstRange(baseDate || undefined).month
            : undefined;

        const result =
          type === "monthly"
            ? await updateUserTrendsMonthlyForUser(
                supabase,
                targetUserId,
                month!,
                startDate,
                endDate
              )
            : await updateUserTrendsForUser(
                supabase,
                targetUserId,
                startDate,
                endDate
              );

        const { data: latestRow } = await supabase
          .from(API_ENDPOINTS.USER_TRENDS)
          .select("id, period_start, period_end, trend, generated_at")
          .eq("user_id", targetUserId)
          .eq("type", type)
          .order("period_end", { ascending: false })
          .limit(1)
          .maybeSingle();

        return NextResponse.json({
          ok: true,
          mode: "sync",
          type,
          userId: targetUserId,
          startDate,
          endDate,
          ...(type === "monthly" && { month }),
          result,
          latest: latestRow
            ? {
                id: latestRow.id,
                period_start: latestRow.period_start,
                period_end: latestRow.period_end,
                generated_at: latestRow.generated_at,
                ...(type === "monthly" && {
                  has_trend: !!latestRow.trend,
                }),
              }
            : null,
        });
      }
    } else {
      const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({
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
      console.log("[cron] update-user-trends Pro users:", users.length);
    }

    // 다음 페이지 존재 여부: auth에서 full page를 받았으면 더 있을 수 있음
    const hasMoreAuthPages = !targetUserId && authPageFull;
    const nextPage = hasMoreAuthPages ? page + 1 : null;

    if (!users.length) {
      let nextPageScheduled = false;
      if (nextPage) {
        const baseUrl = process.env.QSTASH_CALLBACK_URL || request.nextUrl.origin;
        const cronSecret = process.env.CRON_SECRET;
        const qstash = getQstashClient();
        const nextPath = `${baseUrl}/api/cron/update-user-trends/${type}`;
        const nextUrl = new URL(nextPath);
        nextUrl.searchParams.set("page", String(nextPage));
        nextUrl.searchParams.set("limit", String(limit));
        nextUrl.searchParams.set("batchSize", String(batchSize));
        if (baseDate) nextUrl.searchParams.set("baseDate", baseDate);

        if (cronSecret) {
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
        users: 0,
        batches: 0,
        nextPage,
        ...(nextPageScheduled && { nextPageScheduled: true }),
      });
    }

    const month = type === "monthly" ? getPreviousMonthKstRange(baseDate || undefined).month : undefined;

    const baseUrl = process.env.QSTASH_CALLBACK_URL || request.nextUrl.origin;
    const batchUrl = `${baseUrl}/api/cron/update-user-trends/batch`;
    const qstash = getQstashClient();
    const userIds = users.map((user) => user.id);
    const batches: UserTrendsBatchPayload[] = [];
    for (let idx = 0; idx < userIds.length; idx += batchSize) {
      batches.push({
        userIds: userIds.slice(idx, idx + batchSize),
        startDate,
        endDate,
        type,
        ...(type === "monthly" && month && { month }),
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

    console.log("[cron] update-user-trends published batches:", batches.length);

    // 다음 페이지가 있으면 QStash로 체이닝 (모든 Pro 유저 처리)
    let nextPageScheduled = false;
    if (nextPage) {
      const cronSecret = process.env.CRON_SECRET;
      const nextPath = `${baseUrl}/api/cron/update-user-trends/${type}`;
      const nextUrl = new URL(nextPath);
      nextUrl.searchParams.set("page", String(nextPage));
      nextUrl.searchParams.set("limit", String(limit));
      nextUrl.searchParams.set("batchSize", String(batchSize));
      if (baseDate) nextUrl.searchParams.set("baseDate", baseDate);

      if (cronSecret) {
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
      type,
      users: users.length,
      batches: batches.length,
      nextPage,
      ...(nextPageScheduled && { nextPageScheduled: true }),
      startDate,
      endDate,
      ...(type === "monthly" && month && { month }),
    });
  } catch (error) {
    console.error("Cron update-user-trends error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
