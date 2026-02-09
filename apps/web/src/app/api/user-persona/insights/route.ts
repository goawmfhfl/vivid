import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { getAuthenticatedUserIdFromRequest } from "@/app/api/utils/auth";
import { decryptJsonbFields } from "@/lib/jsonb-encryption";
import type { JsonbValue } from "@/lib/jsonb-encryption";
import type {
  UserPersonaTrend,
  UserPersonaGrowthInsights,
  UserPersonaIdentity,
  UserPersonaPatterns,
  UserPersonaContext,
} from "@/types/user-persona";

export interface UserPersonaInsightsResponse {
  trend: UserPersonaTrend | null;
  growth_insights: UserPersonaGrowthInsights | null;
  identity: UserPersonaIdentity | null;
  patterns: UserPersonaPatterns | null;
  context: UserPersonaContext | null;
  source_start: string | null;
  source_end: string | null;
}

/**
 * GET /api/user-persona/insights
 * 현재 유저의 user_persona 조회 (trend, growth_insights, identity, patterns, context)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserIdFromRequest(request);
    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from("user_persona")
      .select("persona, source_start, source_end")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json<UserPersonaInsightsResponse>({
          trend: null,
          growth_insights: null,
          identity: null,
          patterns: null,
          context: null,
          source_start: null,
          source_end: null,
        });
      }
      throw new Error(`Failed to fetch user_persona: ${error.message}`);
    }

    if (!data?.persona) {
      return NextResponse.json<UserPersonaInsightsResponse>({
        trend: null,
        growth_insights: null,
        identity: null,
        patterns: null,
        context: null,
        source_start: data?.source_start ?? null,
        source_end: data?.source_end ?? null,
      });
    }

    const persona = decryptJsonbFields(data.persona as JsonbValue) as Record<
      string,
      unknown
    >;
    const trend = (persona.trend as UserPersonaTrend) ?? null;
    const growth_insights =
      (persona.growth_insights as UserPersonaGrowthInsights) ?? null;
    const identity = (persona.identity as UserPersonaIdentity) ?? null;
    const patterns = (persona.patterns as UserPersonaPatterns) ?? null;
    const context = (persona.context as UserPersonaContext) ?? null;

    return NextResponse.json<UserPersonaInsightsResponse>({
      trend,
      growth_insights,
      identity,
      patterns,
      context,
      source_start: data.source_start ?? null,
      source_end: data.source_end ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    console.error("API user-persona/insights error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
