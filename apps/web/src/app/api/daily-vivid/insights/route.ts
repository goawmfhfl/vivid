import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { decryptDailyVivid } from "@/lib/jsonb-encryption";
import { getAuthenticatedUserIdFromRequest } from "@/app/api/utils/auth";
import { API_ENDPOINTS } from "@/constants";
import { FEEDBACK_REVALIDATE, getCacheControlHeader } from "@/constants/cache";
import type { DailyVividRow } from "@/types/daily-vivid";

function isValidScore(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
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

    // 꿈 일치도(alignment_score)만 있으면 포함. execution_score는 회고(Q3) 있을 때만 있음
    const filtered = decrypted.filter((entry) => {
      const report = entry.report;
      return report != null && isValidScore(report.alignment_score);
    });

    if (mode === "latest") {
      // 최근 생성 데이터 기준으로 날짜별 1개만 선택
      const perDateMap = new Map<string, DailyVividRow>();
      for (const entry of filtered) {
        if (!perDateMap.has(entry.report_date)) {
          perDateMap.set(entry.report_date, entry);
        }
      }

      // UI 그래프는 오래된 날짜 -> 최신 날짜 순서가 자연스러움
      const latestCount = Array.from(perDateMap.values())
        .slice(0, count)
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
      { data: filtered },
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
