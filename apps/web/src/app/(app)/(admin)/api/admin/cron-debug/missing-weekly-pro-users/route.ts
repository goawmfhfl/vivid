import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../util/admin-auth";
import { isValidDateString } from "@/app/api/cron/update-persona/helpers";
import { queryMissingWeeklyProUsers } from "@/lib/admin/cron-debug";

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = parseInt(value || `${fallback}`, 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return parsed;
}

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const baseDate = (searchParams.get("baseDate") || "").trim();
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = Math.min(parsePositiveInt(searchParams.get("limit"), 20), 100);

    if (baseDate && !isValidDateString(baseDate)) {
      return NextResponse.json(
        { error: "Invalid baseDate format (YYYY-MM-DD required)" },
        { status: 400 }
      );
    }

    const result = await queryMissingWeeklyProUsers({
      baseDate: baseDate || undefined,
      page,
      limit,
    });

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error("[Admin Cron Debug] missing-weekly-pro-users error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "미생성 Pro 유저 조회 중 오류가 발생했습니다.", details: message },
      { status: 500 }
    );
  }
}
