import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { decryptJsonbFields, type JsonbValue } from "@/lib/jsonb-encryption";
import {
  RECENT_TRENDS_REVALIDATE,
  getCacheControlHeader,
} from "@/constants/cache";
import { API_ENDPOINTS } from "@/constants";

interface WeeklyTrendsResponse {
  direction: string[];
  core_value: string[];
  driving_force: string[];
  current_self: string[];
}

/** period_start (YYYY-MM-DD) → "[04월1주차]" 형식 */
function formatWeekLabel(periodStart: string): string {
  const match = String(periodStart).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  const month = match[2]; // "01", "02", ... "12"
  const day = parseInt(match[3], 10);
  const weekNum = Math.ceil(day / 7);
  return `[${month}월${weekNum}주차]`;
}

/**
 * GET 핸들러: user_trends에서 최근 4주 trend 조회
 * 각 항목은 [04월1주차]: 텍스트 형식으로 반환
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
      .select("trend, period_start, period_end")
      .eq("user_id", userId)
      .eq("type", "weekly")
      .order("period_end", { ascending: false })
      .limit(4);

    if (error) {
      throw new Error(`Failed to fetch user_trends: ${error.message}`);
    }

    const rows = (data || []) as Array<{
      trend: JsonbValue;
      period_start: string;
      period_end: string;
    }>;
    const direction: string[] = [];
    const core_value: string[] = [];
    const driving_force: string[] = [];
    const current_self: string[] = [];

    for (const row of rows) {
      const decoded = decryptJsonbFields(row.trend || {}) as Record<
        string,
        unknown
      >;
      const weekLabel = formatWeekLabel(row.period_start || "");
      if (!weekLabel) continue;

      const prefix = `${weekLabel}: `;

      const d = decoded.direction;
      const c = decoded.core_value;
      const df = decoded.driving_force;
      const cs = decoded.current_self;
      if (typeof d === "string" && d.trim()) direction.push(`${prefix}${d.trim()}`);
      if (typeof c === "string" && c.trim()) core_value.push(`${prefix}${c.trim()}`);
      if (typeof df === "string" && df.trim()) driving_force.push(`${prefix}${df.trim()}`);
      if (typeof cs === "string" && cs.trim()) current_self.push(`${prefix}${cs.trim()}`);
    }

    const response: WeeklyTrendsResponse = {
      direction: direction.slice(0, 4),
      core_value: core_value.slice(0, 4),
      driving_force: driving_force.slice(0, 4),
      current_self: current_self.slice(0, 4),
    };

    return NextResponse.json<WeeklyTrendsResponse>(response, {
      status: 200,
      headers: {
        "Cache-Control": force
          ? "no-store, max-age=0"
          : getCacheControlHeader(RECENT_TRENDS_REVALIDATE),
      },
    });
  } catch (error) {
    console.error("API error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
