import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { decryptJsonbFields, type JsonbValue } from "@/lib/jsonb-encryption";
import { API_ENDPOINTS } from "@/constants";
import {
  RECENT_TRENDS_REVALIDATE,
  getCacheControlHeader,
} from "@/constants/cache";
import type { MonthlyTrendsResponse } from "@/types/monthly-vivid";

/** period_end (YYYY-MM-DD) → "26년01월" 형식 (월 2자리 유지) */
function formatMonthLabel(periodEnd: string): string {
  const match = String(periodEnd).match(/^(\d{4})-(\d{2})/);
  if (!match) return "";
  const year = match[1].slice(2); // "2026" → "26"
  const month = match[2]; // "01", "02", ... "12" (0 패딩 유지)
  return `${year}년${month}월`;
}

/**
 * GET 핸들러: user_trends에서 최근 4달 monthly trend 조회
 * 각 항목은 [26년1월]: 텍스트 형식으로 반환
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const force = searchParams.get("force") === "1";

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from(API_ENDPOINTS.USER_TRENDS)
      .select("trend, period_end")
      .eq("user_id", userId)
      .eq("type", "monthly")
      .order("period_end", { ascending: false })
      .limit(4);

    if (error) {
      throw new Error(`Failed to fetch user_trends: ${error.message}`);
    }

    const rows = (data || []) as Array<{ trend: JsonbValue; period_end: string }>;
    const recurring_self: string[] = [];
    const effort_to_keep: string[] = [];
    const most_meaningful: string[] = [];
    const biggest_change: string[] = [];

    for (const row of rows) {
      const decoded = decryptJsonbFields(row.trend || {}) as Record<
        string,
        unknown
      >;
      const monthLabel = formatMonthLabel(row.period_end || "");
      if (!monthLabel) continue;

      const prefix = `[${monthLabel}]: `;

      const rs = decoded.recurring_self;
      const etk = decoded.effort_to_keep;
      const mm = decoded.most_meaningful;
      const bc = decoded.biggest_change;

      if (typeof rs === "string" && rs.trim()) {
        recurring_self.push(`${prefix}${rs.trim()}`);
      }
      if (typeof etk === "string" && etk.trim()) {
        effort_to_keep.push(`${prefix}${etk.trim()}`);
      }
      if (typeof mm === "string" && mm.trim()) {
        most_meaningful.push(`${prefix}${mm.trim()}`);
      }
      if (typeof bc === "string" && bc.trim()) {
        biggest_change.push(`${prefix}${bc.trim()}`);
      }
    }

    const response: MonthlyTrendsResponse = {
      recurring_self: recurring_self.slice(0, 4),
      effort_to_keep: effort_to_keep.slice(0, 4),
      most_meaningful: most_meaningful.slice(0, 4),
      biggest_change: biggest_change.slice(0, 4),
    };

    return NextResponse.json<MonthlyTrendsResponse>(
      response,
      {
        status: 200,
        headers: {
          "Cache-Control": force
            ? "no-store, max-age=0"
            : getCacheControlHeader(RECENT_TRENDS_REVALIDATE),
        },
      }
    );
  } catch (error) {
    console.error("API error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
