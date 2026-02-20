import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { decryptDailyVivid } from "@/lib/jsonb-encryption";
import { getAuthenticatedUserIdFromRequest } from "@/app/api/utils/auth";
import { API_ENDPOINTS } from "@/constants";
import { FEEDBACK_REVALIDATE, getCacheControlHeader } from "@/constants/cache";
import type { DailyVividRow } from "@/types/daily-vivid";
import { getDailyVividType, isVividReport } from "@/types/daily-vivid";

function isValidScore(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** 꿈 일치도: type=vivid만. 날짜별 추출 */
function extractAlignmentByDate(entries: DailyVividRow[]): Map<string, number | undefined> {
  const byDate = new Map<string, number | undefined>();
  for (const entry of entries) {
    const report = entry.report;
    if (!report) continue;
    const rowType = getDailyVividType(entry);
    const date = entry.report_date;

    if (rowType === "vivid" && isVividReport(report) && isValidScore(report.alignment_score)) {
      byDate.set(date, report.alignment_score);
    }
  }
  return byDate;
}

/** todo_list_items에서 날짜별 달성률 계산 (당일 할 일 목록: 네이티브+스케줄된 항목, id 기준 중복 제거) */
async function fetchTodoCompletionByDateRange(
  supabase: ReturnType<typeof getServiceSupabase>,
  userId: string,
  dates: string[]
): Promise<Map<string, number>> {
  if (dates.length === 0) return new Map();

  const { data: vividRows } = await supabase
    .from(API_ENDPOINTS.DAILY_VIVID)
    .select("id, report_date")
    .eq("user_id", userId)
    .eq("type", "vivid")
    .in("report_date", dates);

  const vividIdByDate = new Map<string, string>();
  for (const r of vividRows ?? []) {
    vividIdByDate.set(r.report_date, r.id);
  }

  const vividIds = Array.from(vividIdByDate.values());
  const byDate = new Map<string, { checked: number; total: number; seen: Set<string> }>();
  for (const d of dates) byDate.set(d, { checked: 0, total: 0, seen: new Set() });

  if (vividIds.length > 0) {
    const { data: nativeItems } = await supabase
      .from("todo_list_items")
      .select("id, daily_vivid_id, is_checked")
      .in("daily_vivid_id", vividIds);
    for (const row of nativeItems ?? []) {
      const date = [...vividIdByDate.entries()].find(([, id]) => id === row.daily_vivid_id)?.[0];
      if (date && byDate.has(date)) {
        const m = byDate.get(date)!;
        if (m.seen.has(row.id)) continue;
        m.seen.add(row.id);
        m.total++;
        if (row.is_checked) m.checked++;
      }
    }
  }

  const { data: scheduledItems } = await supabase
    .from("todo_list_items")
    .select("id, scheduled_at, is_checked")
    .eq("user_id", userId)
    .in("scheduled_at", dates);
  for (const row of scheduledItems ?? []) {
    const d = row.scheduled_at;
    if (d && byDate.has(d)) {
      const m = byDate.get(d)!;
      if (m.seen.has(row.id)) continue;
      m.seen.add(row.id);
      m.total++;
      if (row.is_checked) m.checked++;
    }
  }

  const out = new Map<string, number>();
  for (const [d, m] of byDate) {
    if (m.total > 0) out.set(d, Math.round((m.checked / m.total) * 100));
  }
  return out;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const force = searchParams.get("force") === "1";
    const mode = searchParams.get("mode") || "latest";
    const countParam = Number(searchParams.get("count") || "7");
    const count = Number.isFinite(countParam)
      ? Math.min(Math.max(countParam, 1), 120)
      : 7;

    let userId: string;
    try {
      userId = await getAuthenticatedUserIdFromRequest(request);
    } catch {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from(API_ENDPOINTS.DAILY_VIVID)
      .select("*")
      .eq("user_id", userId)
      .order("report_date", { ascending: mode !== "latest" })
      .order("created_at", { ascending: mode !== "latest" })
      .limit(120);

    if (error) {
      throw new Error(`Failed to fetch daily vivid insights: ${error.message}`);
    }

    const decrypted = (data || []).map(
      (item) =>
        decryptDailyVivid(
          item as unknown as { [key: string]: unknown }
        ) as unknown as DailyVividRow
    );

    const alignmentByDate = extractAlignmentByDate(decrypted);
    const allDates = [...new Set(decrypted.map((r) => r.report_date))];
    const todoCompletionMap = await fetchTodoCompletionByDateRange(supabase, userId, allDates);

    const allDatesSet = new Set([...alignmentByDate.keys(), ...todoCompletionMap.keys()]);
    const mergedAsRows = Array.from(allDatesSet)
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 120)
      .map((report_date) => ({
        report_date,
        report: {
          alignment_score: alignmentByDate.get(report_date) ?? null,
          todo_completion_score: todoCompletionMap.get(report_date) ?? null,
        },
      })) as unknown as DailyVividRow[];

    if (mode === "latest") {
      const latestCount = mergedAsRows.slice(0, count)
        .sort((a, b) => a.report_date.localeCompare(b.report_date));

      return NextResponse.json(
        { data: latestCount },
        {
          status: 200,
          headers: {
            "Cache-Control": force
              ? "no-store, max-age=0"
              : getCacheControlHeader(FEEDBACK_REVALIDATE),
          },
        }
      );
    }

    return NextResponse.json(
      { data: mergedAsRows },
      {
        status: 200,
        headers: {
          "Cache-Control": force
            ? "no-store, max-age=0"
            : getCacheControlHeader(FEEDBACK_REVALIDATE),
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
