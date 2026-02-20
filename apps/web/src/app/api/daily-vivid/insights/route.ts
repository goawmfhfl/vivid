import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { decryptDailyVivid } from "@/lib/jsonb-encryption";
import { getAuthenticatedUserIdFromRequest } from "@/app/api/utils/auth";
import { API_ENDPOINTS } from "@/constants";
import { FEEDBACK_REVALIDATE, getCacheControlHeader } from "@/constants/cache";
import type { DailyVividRow } from "@/types/daily-vivid";
import { getDailyVividType, isVividReport, isReviewReport } from "@/types/daily-vivid";

function isValidScore(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** 꿈 일치도: vivid만. 실행력: review만. 날짜별로 병합 */
function mergeByDate(entries: DailyVividRow[]): Array<{ report_date: string; alignment_score?: number; execution_score?: number }> {
  const byDate = new Map<string, { alignment_score?: number; execution_score?: number }>();
  for (const entry of entries) {
    const report = entry.report;
    if (!report) continue;
    const rowType = getDailyVividType(entry);
    const date = entry.report_date;
    const existing = byDate.get(date) ?? {};

    if (rowType === "vivid" && isVividReport(report) && isValidScore(report.alignment_score)) {
      existing.alignment_score = report.alignment_score;
    }
    if (rowType === "review" && isReviewReport(report) && isValidScore(report.execution_score)) {
      existing.execution_score = report.execution_score;
    }
    byDate.set(date, existing);
  }
  return Array.from(byDate.entries())
    .filter(([, v]) => v.alignment_score != null || v.execution_score != null)
    .map(([report_date, v]) => ({ report_date, ...v }))
    .sort((a, b) => b.report_date.localeCompare(a.report_date));
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const force = searchParams.get("force") === "1";
    const mode = searchParams.get("mode") || "latest";
    const countParam = Number(searchParams.get("count") || "7");
    const count = Number.isFinite(countParam)
      ? Math.min(Math.max(countParam, 1), 30)
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

    // type별 필터: 꿈 일치도=vivid만, 실행력=review만. 날짜별 병합
    const merged = mergeByDate(decrypted);
    const mergedAsRows = merged.map((m) => ({
      report_date: m.report_date,
      report: {
        alignment_score: m.alignment_score,
        execution_score: m.execution_score ?? null,
      },
    })) as DailyVividRow[];

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
