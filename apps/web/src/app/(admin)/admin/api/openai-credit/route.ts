import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../utils/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";

/**
 * GET /api/admin/openai-credit
 * OpenAI 크레딧 및 사용량 정보 조회
 * 주의: 일반 API 키로는 billing API에 접근할 수 없으므로,
 * 우리가 추적한 ai_requests 데이터를 기반으로 정보를 제공합니다.
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API 키가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const supabase = getServiceSupabase();

    // 오늘 날짜
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // 이번 달 시작일
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);
    const monthStartISO = monthStart.toISOString();

    // 이번 주 시작일
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekStartISO = weekStart.toISOString();

    // 전체 통계 (모든 기간)
    const { data: allRequests } = await supabase
      .from("ai_requests")
      .select("cost_usd, cost_krw, total_tokens, created_at");

    // 오늘 통계
    const { data: todayRequests } = await supabase
      .from("ai_requests")
      .select("cost_usd, cost_krw, total_tokens")
      .gte("created_at", todayISO);

    // 이번 주 통계
    const { data: weekRequests } = await supabase
      .from("ai_requests")
      .select("cost_usd, cost_krw, total_tokens")
      .gte("created_at", weekStartISO);

    // 이번 달 통계
    const { data: monthRequests } = await supabase
      .from("ai_requests")
      .select("cost_usd, cost_krw, total_tokens")
      .gte("created_at", monthStartISO);

    // 비용 계산
    interface RequestRow {
      cost_usd?: number | string | null;
      cost_krw?: number | string | null;
      total_tokens?: number | string | null;
    }

    interface TotalStats {
      cost_usd: number;
      cost_krw: number;
      tokens: number;
    }

    const calculateTotal = (requests: RequestRow[]): TotalStats => {
      return requests.reduce<TotalStats>(
        (acc, req) => ({
          cost_usd: acc.cost_usd + Number(req.cost_usd || 0),
          cost_krw: acc.cost_krw + Number(req.cost_krw || 0),
          tokens: acc.tokens + Number(req.total_tokens || 0),
        }),
        { cost_usd: 0, cost_krw: 0, tokens: 0 }
      );
    };

    const allStats = calculateTotal(allRequests || []);
    const todayStats = calculateTotal(todayRequests || []);
    const weekStats = calculateTotal(weekRequests || []);
    const monthStats = calculateTotal(monthRequests || []);

    // 일별 트렌드 (최근 30일)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { data: recentRequests } = await supabase
      .from("ai_requests")
      .select("cost_usd, created_at")
      .gte("created_at", thirtyDaysAgo.toISOString());

    const dailyMap = new Map<string, number>();
    recentRequests?.forEach((req) => {
      const date = new Date(req.created_at).toISOString().split("T")[0];
      const current = dailyMap.get(date) || 0;
      dailyMap.set(date, current + Number(req.cost_usd || 0));
    });

    const dailyTrend = Array.from(dailyMap.entries())
      .map(([date, cost]) => ({ date, cost_usd: cost }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      // 우리가 추적한 데이터 기반 정보
      trackedUsage: {
        total: {
          cost_usd: allStats.cost_usd,
          cost_krw: allStats.cost_krw,
          tokens: allStats.tokens,
          requests: allRequests?.length || 0,
        },
        today: {
          cost_usd: todayStats.cost_usd,
          cost_krw: todayStats.cost_krw,
          tokens: todayStats.tokens,
          requests: todayRequests?.length || 0,
        },
        thisWeek: {
          cost_usd: weekStats.cost_usd,
          cost_krw: weekStats.cost_krw,
          tokens: weekStats.tokens,
          requests: weekRequests?.length || 0,
        },
        thisMonth: {
          cost_usd: monthStats.cost_usd,
          cost_krw: monthStats.cost_krw,
          tokens: monthStats.tokens,
          requests: monthRequests?.length || 0,
        },
        dailyTrend,
      },
      // OpenAI API 직접 조회는 일반 API 키로는 불가능
      openaiApiAccess: {
        available: false,
        reason:
          "일반 API 키(sk-proj-*)로는 billing API에 접근할 수 없습니다. Organization API 키(sk-admin-*)가 필요하며, session key를 사용해야 합니다.",
        note: "실제 크레딧 잔액은 OpenAI Dashboard에서 확인하세요: https://platform.openai.com/usage",
      },
      apiKeyConfigured: true,
      apiKeyPrefix: apiKey.substring(0, 7) + "...",
    });
  } catch (error) {
    console.error("크레딧 정보 조회 실패:", error);
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `크레딧 조회 실패: ${errorMessage}` },
      { status: 500 }
    );
  }
}
