import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { getAuthenticatedUserIdFromRequest } from "@/app/api/utils/auth";
import { decryptJsonbFields } from "@/lib/jsonb-encryption";
import type { JsonbValue } from "@/lib/jsonb-encryption";

export interface UserPersonaInsightsResponse {
  trend: {
    aspired_self: string;
    interest: string;
    immersion_moment: string;
    personality_trait: string;
  } | null;
  growth_insights: {
    self_clarity_index: number;
    pattern_balance_score: number;
    vision_consistency_score: number;
    self_clarity_rationale?: string;
    pattern_balance_rationale?: string;
    vision_consistency_rationale?: string;
  } | null;
  identity: Record<string, unknown> | null;
  patterns: Record<string, unknown> | null;
  context: Record<string, unknown> | null;
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
    const trend = (persona.trend as UserPersonaInsightsResponse["trend"]) ?? null;
    const growth_insights =
      (persona.growth_insights as UserPersonaInsightsResponse["growth_insights"]) ?? null;
    const identity = (persona.identity as Record<string, unknown>) ?? null;
    const patterns = (persona.patterns as Record<string, unknown>) ?? null;
    const context = (persona.context as Record<string, unknown>) ?? null;

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
