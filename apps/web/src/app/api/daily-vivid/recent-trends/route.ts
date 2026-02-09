import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { type JsonbValue } from "@/lib/jsonb-encryption";
import { getAuthenticatedUserIdFromRequest } from "@/app/api/utils/auth";
import {
  RECENT_TRENDS_REVALIDATE,
  getCacheControlHeader,
} from "@/constants/cache";

interface RecentTrendsResponse {
  aspired_self: string[];
  interests: string[];
  immersion_moments: string[];
  personality_traits: string[];
}

/**
 * GET: 최근 흐름 데이터 (user_persona 기반)
 * 인증된 사용자의 user_persona.trend를 동일한 응답 형태로 반환.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const force = searchParams.get("force") === "1";

    let userId: string;
    try {
      userId = await getAuthenticatedUserIdFromRequest(request);
    } catch {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from("user_persona")
      .select("persona")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json<RecentTrendsResponse>(
          {
            aspired_self: [],
            interests: [],
            immersion_moments: [],
            personality_traits: [],
          },
          {
            status: 200,
            headers: {
              "Cache-Control": force
                ? "no-store, max-age=0"
                : getCacheControlHeader(RECENT_TRENDS_REVALIDATE),
            },
          }
        );
      }
      throw new Error(`Failed to fetch user_persona: ${error.message}`);
    }

    if (!data?.persona) {
      return NextResponse.json<RecentTrendsResponse>(
        {
          aspired_self: [],
          interests: [],
          immersion_moments: [],
          personality_traits: [],
        },
        {
          status: 200,
          headers: {
            "Cache-Control": force
              ? "no-store, max-age=0"
              : getCacheControlHeader(RECENT_TRENDS_REVALIDATE),
          },
        }
      );
    }

    const { decryptJsonbFields } = await import("@/lib/jsonb-encryption");
    const persona = decryptJsonbFields(data.persona as JsonbValue) as Record<
      string,
      unknown
    >;
    const trend = persona?.trend as
      | {
          aspired_self?: string;
          interest?: string;
          immersion_moment?: string;
          personality_trait?: string;
        }
      | null
      | undefined;

    const response: RecentTrendsResponse = {
      aspired_self: trend?.aspired_self ? [trend.aspired_self] : [],
      interests: trend?.interest ? [trend.interest] : [],
      immersion_moments: trend?.immersion_moment ? [trend.immersion_moment] : [],
      personality_traits: trend?.personality_trait ? [trend.personality_trait] : [],
    };

    return NextResponse.json<RecentTrendsResponse>(response, {
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
