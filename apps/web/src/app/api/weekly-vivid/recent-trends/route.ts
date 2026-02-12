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

/**
 * GET 핸들러: user_trends에서 최근 4주 trend 조회
 * weekly_vivid trend가 user_trends로 마이그레이션됨
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
      .select("trend")
      .eq("user_id", userId)
      .eq("type", "weekly")
      .order("period_end", { ascending: false })
      .limit(4);

    if (error) {
      throw new Error(`Failed to fetch user_trends: ${error.message}`);
    }

    const rows = (data || []) as Array<{ trend: JsonbValue }>;
    const direction: string[] = [];
    const core_value: string[] = [];
    const driving_force: string[] = [];
    const current_self: string[] = [];

    for (const row of rows) {
      const decoded = decryptJsonbFields(row.trend || {}) as Record<
        string,
        unknown
      >;
      const d = decoded.direction;
      const c = decoded.core_value;
      const df = decoded.driving_force;
      const cs = decoded.current_self;
      if (typeof d === "string" && d.trim()) direction.push(d);
      if (typeof c === "string" && c.trim()) core_value.push(c);
      if (typeof df === "string" && df.trim()) driving_force.push(df);
      if (typeof cs === "string" && cs.trim()) current_self.push(cs);
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
