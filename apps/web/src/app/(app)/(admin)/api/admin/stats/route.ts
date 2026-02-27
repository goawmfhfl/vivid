import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";
import type { AdminStats } from "@/types/admin";

/**
 * GET /api/admin/stats
 * 관리자 대시보드 통계 조회
 * - profiles 테이블 또는 auth.users 기반
 * - Pro 멤버십: user_metadata.subscription 기반
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const supabase = getServiceSupabase();

    let totalUsers = 0;
    let activeUsers = 0;
    let proUsers = 0;

    // 1. 총 유저 수 & Pro 멤버십: auth.admin.listUsers로 조회
    let page = 1;
    const perPage = 500;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) {
        console.error("유저 목록 조회 실패:", error);
        break;
      }

      const users = data.users || [];
      totalUsers += users.length;

      for (const user of users) {
        const sub = user.user_metadata?.subscription;
        if (sub?.plan === "pro" && (sub?.status === "active" || sub?.status === "none")) {
          proUsers += 1;
        }
        const isActive = user.user_metadata?.is_active;
        if (isActive !== false) activeUsers += 1;
      }

      hasMore = users.length === perPage;
      page += 1;
      if (page > 20) break; // 최대 10,000명
    }

    // 오늘 AI 요청 수 (ai_requests 테이블)
    let todayAIRequests = 0;
    let todayAICostKrw = 0;
    let thisMonthAIUsers = 0;
    let thisMonthAICostKrw = 0;
    let avgCostPerUserPerMonth = 0;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      monthStart.setHours(0, 0, 0, 0);
      const monthStartISO = monthStart.toISOString();

      const { data: todayReqs } = await supabase
        .from("ai_requests")
        .select("cost_krw")
        .gte("created_at", todayISO);
      todayAIRequests = todayReqs?.length || 0;
      todayAICostKrw =
        todayReqs?.reduce((sum, r) => sum + Number(r.cost_krw || 0), 0) || 0;

      const { data: monthReqs } = await supabase
        .from("ai_requests")
        .select("user_id, cost_krw")
        .gte("created_at", monthStartISO);

      const uniqueUsers = new Set<string>();
      monthReqs?.forEach((r) => {
        if (r.user_id) uniqueUsers.add(r.user_id);
        thisMonthAICostKrw += Number(r.cost_krw || 0);
      });
      thisMonthAIUsers = uniqueUsers.size;
      avgCostPerUserPerMonth =
        thisMonthAIUsers > 0
          ? Math.round(thisMonthAICostKrw / thisMonthAIUsers)
          : 0;
    } catch {
      // ai_requests 없으면 무시
    }

    const stats: AdminStats = {
      totalUsers,
      activeUsers: activeUsers || totalUsers,
      proUsers,
      todayAIRequests,
      todayAICostKrw,
      thisMonthAIUsers,
      thisMonthAICostKrw,
      avgCostPerUserPerMonth,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("관리자 통계 조회 실패:", error);
    return NextResponse.json(
      { error: "통계를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
