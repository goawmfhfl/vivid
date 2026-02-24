import { NextRequest, NextResponse } from "next/server";
import { Client } from "@upstash/qstash";
import { getServiceSupabase } from "@/lib/supabase-service";
import { isProFromMetadata, verifySubscription } from "@/lib/subscription-utils";
import {
  getKstDateRange,
  getKstDateRangeFromBase,
  isValidDateString,
  updatePersonaForUser,
} from "./helpers";

export const maxDuration = 180;

type PersonaBatchPayload = {
  userIds: string[];
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
  const fallback = parseInt(process.env.PERSONA_BATCH_SIZE || "25", 10);
  const parsed = parseInt(value || String(fallback), 10);
  return Math.min(Math.max(parsed, 1), 100);
}

function isAuthorizedCron(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isSecretValid = !!cronSecret && authHeader === `Bearer ${cronSecret}`;
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";
  return isSecretValid || isVercelCron;
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const supabase = getServiceSupabase();

    if (baseDate && !isValidDateString(baseDate)) {
      return NextResponse.json(
        { error: "Invalid baseDate format (YYYY-MM-DD required)" },
        { status: 400 }
      );
    }

    const { startDate, endDate } = baseDate
      ? getKstDateRangeFromBase(baseDate, 7)
      : getKstDateRange(7);

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
          message: "Target user is not Pro; persona cron runs for Pro only.",
        });
      }
      users = [{ id: targetUserId }];

      // sync=1: 단일 유저 동기 실행 (테스트용, 즉시 결과 반환)
      if (sync) {
        const result = await updatePersonaForUser(
          supabase,
          targetUserId,
          startDate,
          endDate
        );
        return NextResponse.json({
          ok: true,
          sync: true,
          userId: targetUserId,
          status: result.status,
          reason: result.reason,
          startDate,
          endDate,
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
      users = allUsers.filter((u) =>
        isProFromMetadata(u.user_metadata as Record<string, unknown> | undefined)
      );

      // sync=1: 전체 유저 배치를 QStash 대신 현재 서버에서 동기 실행 (todo_analysis 포함)
      // QStash 콜백이 프로덕션을 가리키면 배치는 이전 코드로 실행되므로, sync 시 직접 실행
      if (sync && users.length > 0) {
        const userIds = users.map((u) => u.id);
        const batchPayloads: PersonaBatchPayload[] = [];
        for (let i = 0; i < userIds.length; i += batchSize) {
          batchPayloads.push({
            userIds: userIds.slice(i, i + batchSize),
            startDate,
            endDate,
          });
        }
        const results: Array<{ userId: string; status: string; reason?: string }> = [];
        for (const payload of batchPayloads) {
          for (const uid of payload.userIds) {
            try {
              const r = await updatePersonaForUser(
                supabase,
                uid,
                payload.startDate,
                payload.endDate
              );
              results.push({
                userId: uid,
                status: r.status,
                ...(r.reason && { reason: r.reason }),
              });
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              results.push({ userId: uid, status: "skipped", reason: msg });
            }
          }
        }
        return NextResponse.json({
          ok: true,
          sync: true,
          startDate,
          endDate,
          processed: results.length,
          updated: results.filter((r) => r.status === "updated").length,
          skipped: results.filter((r) => r.status === "skipped").length,
          results,
        });
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
        const nextUrl = new URL(`${baseUrl}/api/cron/update-persona`);
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

    const baseUrl = process.env.QSTASH_CALLBACK_URL || request.nextUrl.origin;
    const batchUrl = `${baseUrl}/api/cron/update-persona/batch`;
    const qstash = getQstashClient();

    const userIds = users.map((user) => user.id);
    const batches: PersonaBatchPayload[] = [];
    for (let i = 0; i < userIds.length; i += batchSize) {
      batches.push({
        userIds: userIds.slice(i, i + batchSize),
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

    let nextPageScheduled = false;
    if (nextPage) {
      const cronSecret = process.env.CRON_SECRET;
      const nextUrl = new URL(`${baseUrl}/api/cron/update-persona`);
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
      users: users.length,
      batches: batches.length,
      nextPage,
      ...(nextPageScheduled && { nextPageScheduled: true }),
    });
  } catch (error) {
    console.error("Cron update-persona error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
