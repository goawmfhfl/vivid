import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";
import type { AIUsageStats } from "@/types/admin";

/**
 * GET /api/admin/ai-usage
 * 전체 AI 사용량 통계
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);

    const supabase = getServiceSupabase();

    // 기간 계산
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateISO = startDate.toISOString();

    // 오늘 날짜
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // 이번 주 시작일
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekStartISO = weekStart.toISOString();

    // 이번 달 시작일
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);
    const monthStartISO = monthStart.toISOString();

    // 오늘 통계
    const { data: todayRequests } = await supabase
      .from("ai_requests")
      .select("*")
      .gte("created_at", todayISO);

    // 이번 주 통계
    const { data: weekRequests } = await supabase
      .from("ai_requests")
      .select("*")
      .gte("created_at", weekStartISO);

    // 이번 달 통계
    const { data: monthRequests } = await supabase
      .from("ai_requests")
      .select("*")
      .gte("created_at", monthStartISO);

    // 기간 내 통계
    const { data: periodRequests } = await supabase
      .from("ai_requests")
      .select("*")
      .gte("created_at", startDateISO);

    const requests = periodRequests || [];

    interface ModelStats {
      model: string;
      requests: number;
      tokens: number;
      cost_usd: number;
      cost_krw: number;
      avg_duration_ms: number;
    }

    interface TypeStats {
      request_type: string;
      requests: number;
      tokens: number;
      cost_usd: number;
      cost_krw: number;
      avg_duration_ms: number;
    }

    interface DailyStats {
      date: string;
      requests: number;
      tokens: number;
      cost_usd: number;
      cost_krw: number;
      avg_duration_ms: number;
    }

    // 모델별 집계
    const modelMap = new Map<string, ModelStats>();
    const modelDurationMap = new Map<string, number[]>();
    requests.forEach((req) => {
      const model = req.model;
      if (!modelMap.has(model)) {
        modelMap.set(model, {
          model,
          requests: 0,
          tokens: 0,
          cost_usd: 0,
          cost_krw: 0,
          avg_duration_ms: 0,
        });
        modelDurationMap.set(model, []);
      }
      const stats = modelMap.get(model)!;
      stats.requests += 1;
      stats.tokens += Number(req.total_tokens || 0);
      stats.cost_usd += Number(req.cost_usd || 0);
      stats.cost_krw += Number(req.cost_krw || 0);
      if (req.duration_ms) {
        modelDurationMap.get(model)?.push(req.duration_ms);
      }
    });
    // 평균 duration 계산
    modelMap.forEach((stats, model) => {
      const durations = modelDurationMap.get(model) || [];
      if (durations.length > 0) {
        stats.avg_duration_ms =
          durations.reduce((a, b) => a + b, 0) / durations.length;
      }
    });

    // 타입별 집계
    const typeMap = new Map<string, TypeStats>();
    const typeDurationMap = new Map<string, number[]>();
    requests.forEach((req) => {
      const type = req.request_type;
      if (!typeMap.has(type)) {
        typeMap.set(type, {
          request_type: type,
          requests: 0,
          tokens: 0,
          cost_usd: 0,
          cost_krw: 0,
          avg_duration_ms: 0,
        });
        typeDurationMap.set(type, []);
      }
      const stats = typeMap.get(type)!;
      stats.requests += 1;
      stats.tokens += Number(req.total_tokens || 0);
      stats.cost_usd += Number(req.cost_usd || 0);
      stats.cost_krw += Number(req.cost_krw || 0);
      if (req.duration_ms) {
        typeDurationMap.get(type)?.push(req.duration_ms);
      }
    });
    // 평균 duration 계산
    typeMap.forEach((stats, type) => {
      const durations = typeDurationMap.get(type) || [];
      if (durations.length > 0) {
        stats.avg_duration_ms =
          durations.reduce((a, b) => a + b, 0) / durations.length;
      }
    });

    // 일별 트렌드
    const dailyMap = new Map<string, DailyStats>();
    const dailyDurationMap = new Map<string, number[]>();
    requests.forEach((req) => {
      const date = new Date(req.created_at).toISOString().split("T")[0];
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          requests: 0,
          tokens: 0,
          cost_usd: 0,
          cost_krw: 0,
          avg_duration_ms: 0,
        });
        dailyDurationMap.set(date, []);
      }
      const stats = dailyMap.get(date)!;
      stats.requests += 1;
      stats.tokens += Number(req.total_tokens || 0);
      stats.cost_usd += Number(req.cost_usd || 0);
      stats.cost_krw += Number(req.cost_krw || 0);
      if (req.duration_ms) {
        dailyDurationMap.get(date)?.push(req.duration_ms);
      }
    });
    // 평균 duration 계산
    dailyMap.forEach((stats, date) => {
      const durations = dailyDurationMap.get(date) || [];
      if (durations.length > 0) {
        stats.avg_duration_ms =
          durations.reduce((a, b) => a + b, 0) / durations.length;
      }
    });

    // 유저별 비용 상위 10명
    const userCostMap = new Map<string, number>();
    requests.forEach((req) => {
      const userId = req.user_id;
      const currentCost = userCostMap.get(userId) || 0;
      userCostMap.set(userId, currentCost + Number(req.cost_usd || 0));
    });

    const topUsers = Array.from(userCostMap.entries())
      .map(([userId, cost]) => ({ userId, cost }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10);

    // 유저 이름 조회 (Supabase Auth admin API 사용 - user_metadata에서 name 가져오기)
    const userIds = topUsers.map((u) => u.userId);
    
    const userMap = new Map<string, { name: string; email: string }>();
    
    if (userIds.length > 0) {
      const userInfoPromises = userIds.map(async (userId) => {
        try {
          const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);
          if (error || !user) {
            return { id: userId, name: "알 수 없음", email: "" };
          }
          return {
            id: user.id,
            name: (user.user_metadata?.name as string) || "알 수 없음",
            email: user.email || "",
          };
        } catch {
          return { id: userId, name: "알 수 없음", email: "" };
        }
      });
      
      const userInfos = await Promise.all(userInfoPromises);
      userInfos.forEach((info) => userMap.set(info.id, { name: info.name, email: info.email }));
    }

    const topUsersWithNames = topUsers.map((u) => ({
      userId: u.userId,
      name: userMap.get(u.userId)?.name || "알 수 없음",
      email: userMap.get(u.userId)?.email || "",
      cost: u.cost,
    }));

    const stats: AIUsageStats & {
      today: { requests: number; cost_usd: number; cost_krw: number };
      thisWeek: { requests: number; cost_usd: number; cost_krw: number };
      thisMonth: { requests: number; cost_usd: number; cost_krw: number };
      topUsers: Array<{
        userId: string;
        name: string;
        email: string;
        cost: number;
      }>;
    } = {
      total_requests: requests.length,
      total_tokens: requests.reduce(
        (sum, req) => sum + Number(req.total_tokens || 0),
        0
      ),
      total_cost_usd: requests.reduce(
        (sum, req) => sum + Number(req.cost_usd || 0),
        0
      ),
      total_cost_krw: requests.reduce(
        (sum, req) => sum + Number(req.cost_krw || 0),
        0
      ),
      by_model: Array.from(modelMap.values()).sort(
        (a, b) => b.cost_usd - a.cost_usd
      ),
      by_type: Array.from(typeMap.values()).sort(
        (a, b) => b.cost_usd - a.cost_usd
      ),
      daily_trend: Array.from(dailyMap.values())
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-days),
      today: {
        requests: todayRequests?.length || 0,
        cost_usd:
          todayRequests?.reduce(
            (sum, req) => sum + Number(req.cost_usd || 0),
            0
          ) || 0,
        cost_krw:
          todayRequests?.reduce(
            (sum, req) => sum + Number(req.cost_krw || 0),
            0
          ) || 0,
      },
      thisWeek: {
        requests: weekRequests?.length || 0,
        cost_usd:
          weekRequests?.reduce(
            (sum, req) => sum + Number(req.cost_usd || 0),
            0
          ) || 0,
        cost_krw:
          weekRequests?.reduce(
            (sum, req) => sum + Number(req.cost_krw || 0),
            0
          ) || 0,
      },
      thisMonth: {
        requests: monthRequests?.length || 0,
        cost_usd:
          monthRequests?.reduce(
            (sum, req) => sum + Number(req.cost_usd || 0),
            0
          ) || 0,
        cost_krw:
          monthRequests?.reduce(
            (sum, req) => sum + Number(req.cost_krw || 0),
            0
          ) || 0,
      },
      topUsers: topUsersWithNames,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("AI 사용량 통계 조회 실패:", error);
    return NextResponse.json(
      { error: "AI 사용량 통계를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
