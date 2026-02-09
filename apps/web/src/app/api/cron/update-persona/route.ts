import { NextRequest, NextResponse } from "next/server";
import { Client } from "@upstash/qstash";
import { getServiceSupabase } from "@/lib/supabase-service";
import { isProFromMetadata, verifySubscription } from "@/lib/subscription-utils";
import {
  getKstDateRange,
  getKstDateRangeFromBase,
  isValidDateString,
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
      Math.max(parseInt(searchParams.get("limit") || "25", 10), 1),
      100
    );
    const batchSize = getBatchSize(searchParams.get("batchSize"));
    const baseDate = searchParams.get("baseDate");
    const targetUserId = searchParams.get("userId");

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
      users = allUsers.filter((u) =>
        isProFromMetadata(u.user_metadata as Record<string, unknown> | undefined)
      );
    }

    if (!users.length) {
      return NextResponse.json({
        ok: true,
        page,
        limit,
        batchSize,
        users: 0,
        batches: 0,
        nextPage: null,
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

    return NextResponse.json({
      ok: true,
      page,
      limit,
      batchSize,
      users: users.length,
      batches: batches.length,
      nextPage: users.length === limit ? page + 1 : null,
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
