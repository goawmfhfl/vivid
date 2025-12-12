import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";
import type { AdminStats } from "@/types/admin";

/**
 * GET /api/admin/stats
 * 관리자 대시보드 통계 조회
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { userId: _adminId } = authResult;

  try {
    const supabase = getServiceSupabase();

    // 오늘 날짜 (KST 기준)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // 1. 총 유저 수
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // 2. 활성 유저 수
    const { count: activeUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    // 3. Pro 멤버십 수
    const { count: proUsers } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("plan", "pro")
      .eq("status", "active");

    // 4. 오늘 AI 요청 수 및 비용
    const { data: todayAIRequests, error: aiError } = await supabase
      .from("ai_requests")
      .select("cost_usd, cost_krw")
      .gte("created_at", todayISO);

    if (aiError) {
      console.error("AI 요청 통계 조회 실패:", aiError);
    }

    const todayAIRequestsCount = todayAIRequests?.length || 0;
    const todayAICost = {
      usd:
        todayAIRequests?.reduce(
          (sum, req) => sum + Number(req.cost_usd || 0),
          0
        ) || 0,
      krw:
        todayAIRequests?.reduce(
          (sum, req) => sum + Number(req.cost_krw || 0),
          0
        ) || 0,
    };

    const stats: AdminStats = {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      proUsers: proUsers || 0,
      todayAIRequests: todayAIRequestsCount,
      todayAICost,
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
