import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../utils/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";
import type { AIUsageStats } from "@/types/admin";

/**
 * GET /api/admin/users/[id]/stats
 * 유저별 AI 사용량 통계
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id: userId } = await params;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);

    const supabase = getServiceSupabase();

    // 기간 계산
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateISO = startDate.toISOString();

    // 전체 통계
    const { data: allRequests, error: allError } = await supabase
      .from("ai_requests")
      .select("*")
      .eq("user_id", userId);

    if (allError) {
      console.error("AI 사용량 조회 실패:", allError);
      return NextResponse.json(
        { error: "AI 사용량을 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    // 기간 내 통계
    const { data: periodRequests } = await supabase
      .from("ai_requests")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", startDateISO);

    const requests = periodRequests || [];

    interface ModelStats {
      model: string;
      requests: number;
      tokens: number;
      cost_usd: number;
      cost_krw: number;
    }

    interface TypeStats {
      request_type: string;
      requests: number;
      tokens: number;
      cost_usd: number;
      cost_krw: number;
    }

    interface DailyStats {
      date: string;
      requests: number;
      tokens: number;
      cost_usd: number;
      cost_krw: number;
    }

    // 모델별 집계
    const modelMap = new Map<string, ModelStats>();
    requests.forEach((req) => {
      const model = req.model;
      if (!modelMap.has(model)) {
        modelMap.set(model, {
          model,
          requests: 0,
          tokens: 0,
          cost_usd: 0,
          cost_krw: 0,
        });
      }
      const stats = modelMap.get(model)!;
      stats.requests += 1;
      stats.tokens += Number(req.total_tokens || 0);
      stats.cost_usd += Number(req.cost_usd || 0);
      stats.cost_krw += Number(req.cost_krw || 0);
    });

    // 타입별 집계
    const typeMap = new Map<string, TypeStats>();
    requests.forEach((req) => {
      const type = req.request_type;
      if (!typeMap.has(type)) {
        typeMap.set(type, {
          request_type: type,
          requests: 0,
          tokens: 0,
          cost_usd: 0,
          cost_krw: 0,
        });
      }
      const stats = typeMap.get(type)!;
      stats.requests += 1;
      stats.tokens += Number(req.total_tokens || 0);
      stats.cost_usd += Number(req.cost_usd || 0);
      stats.cost_krw += Number(req.cost_krw || 0);
    });

    // 일별 트렌드
    const dailyMap = new Map<string, DailyStats>();
    requests.forEach((req) => {
      const date = new Date(req.created_at).toISOString().split("T")[0];
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          requests: 0,
          tokens: 0,
          cost_usd: 0,
          cost_krw: 0,
        });
      }
      const stats = dailyMap.get(date);
      stats.requests += 1;
      stats.tokens += Number(req.total_tokens || 0);
      stats.cost_usd += Number(req.cost_usd || 0);
      stats.cost_krw += Number(req.cost_krw || 0);
    });

    const stats: AIUsageStats = {
      total_requests: allRequests?.length || 0,
      total_tokens:
        allRequests?.reduce(
          (sum, req) => sum + Number(req.total_tokens || 0),
          0
        ) || 0,
      total_cost_usd:
        allRequests?.reduce((sum, req) => sum + Number(req.cost_usd || 0), 0) ||
        0,
      total_cost_krw:
        allRequests?.reduce((sum, req) => sum + Number(req.cost_krw || 0), 0) ||
        0,
      by_model: Array.from(modelMap.values()).sort(
        (a, b) => b.cost_usd - a.cost_usd
      ),
      by_type: Array.from(typeMap.values()).sort(
        (a, b) => b.cost_usd - a.cost_usd
      ),
      daily_trend: Array.from(dailyMap.values())
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-days),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("유저 AI 사용량 통계 조회 실패:", error);
    return NextResponse.json(
      { error: "AI 사용량 통계를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
