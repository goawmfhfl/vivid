import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../utils/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";
import type { AIUsageDetail } from "@/types/admin";

/**
 * GET /api/admin/ai-usage/[userId]
 * 유저별 AI 사용량 상세 내역
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;

    // 필터 파라미터
    const model = searchParams.get("model") || "";
    const requestType = searchParams.get("requestType") || "";
    const sectionName = searchParams.get("sectionName") || "";
    const searchQuery = searchParams.get("search") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const supabase = getServiceSupabase();

    // 유저 정보 조회
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("id, name, email")
      .eq("id", userId)
      .single();

    // 기본 쿼리
    let query = supabase
      .from("ai_requests")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // 필터 적용
    if (model) {
      query = query.eq("model", model);
    }
    if (requestType) {
      query = query.eq("request_type", requestType);
    }
    if (sectionName) {
      query = query.eq("section_name", sectionName);
    }
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    // 검색 필터링 (모델, 타입, 섹션명)
    if (searchQuery) {
      query = query.or(
        `model.ilike.%${searchQuery}%,request_type.ilike.%${searchQuery}%,section_name.ilike.%${searchQuery}%`
      );
    }

    // 페이지네이션
    query = query.range(offset, offset + limit - 1);

    const { data: requests, error, count } = await query;

    if (error) {
      console.error("AI 사용량 상세 조회 실패:", error);
      return NextResponse.json(
        { error: "AI 사용량을 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    // 일간/주간/월간 통계 계산
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);

    // 전체 데이터 조회 (통계용)
    const statsQuery = supabase
      .from("ai_requests")
      .select("*")
      .eq("user_id", userId);

    const { data: allRequests } = await statsQuery;

    const todayRequests =
      allRequests?.filter((r) => new Date(r.created_at) >= today) || [];
    const weekRequests =
      allRequests?.filter((r) => new Date(r.created_at) >= weekStart) || [];
    const monthRequests =
      allRequests?.filter((r) => new Date(r.created_at) >= monthStart) || [];

    // 일간/주간/월간 비용 계산
    const todayCost = todayRequests.reduce(
      (sum, r) => sum + Number(r.cost_krw || 0),
      0
    );
    const weekCost = weekRequests.reduce(
      (sum, r) => sum + Number(r.cost_krw || 0),
      0
    );
    const monthCost = monthRequests.reduce(
      (sum, r) => sum + Number(r.cost_krw || 0),
      0
    );

    // 타입별 통계
    const dailyTypeCost =
      allRequests
        ?.filter((r) => r.request_type === "daily_feedback")
        .reduce((sum, r) => sum + Number(r.cost_krw || 0), 0) || 0;
    const weeklyTypeCost =
      allRequests
        ?.filter((r) => r.request_type === "weekly_feedback")
        .reduce((sum, r) => sum + Number(r.cost_krw || 0), 0) || 0;
    const monthlyTypeCost =
      allRequests
        ?.filter((r) => r.request_type === "monthly_feedback")
        .reduce((sum, r) => sum + Number(r.cost_krw || 0), 0) || 0;

    const details: AIUsageDetail[] =
      requests?.map((req) => ({
        id: req.id,
        model: req.model,
        request_type: req.request_type,
        section_name: req.section_name,
        prompt_tokens: req.prompt_tokens,
        completion_tokens: req.completion_tokens,
        cached_tokens: req.cached_tokens || 0,
        total_tokens: req.total_tokens,
        cost_usd: Number(req.cost_usd || 0),
        cost_krw: Number(req.cost_krw || 0),
        duration_ms: req.duration_ms,
        success: req.success,
        error_message: req.error_message,
        created_at: req.created_at,
      })) || [];

    return NextResponse.json({
      details,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      user: userProfile
        ? {
            id: userProfile.id,
            name: userProfile.name,
            email: userProfile.email,
          }
        : null,
      stats: {
        today: {
          requests: todayRequests.length,
          cost_krw: todayCost,
        },
        thisWeek: {
          requests: weekRequests.length,
          cost_krw: weekCost,
        },
        thisMonth: {
          requests: monthRequests.length,
          cost_krw: monthCost,
        },
        byType: {
          daily: {
            requests:
              allRequests?.filter((r) => r.request_type === "daily_feedback")
                .length || 0,
            cost_krw: dailyTypeCost,
          },
          weekly: {
            requests:
              allRequests?.filter((r) => r.request_type === "weekly_feedback")
                .length || 0,
            cost_krw: weeklyTypeCost,
          },
          monthly: {
            requests:
              allRequests?.filter((r) => r.request_type === "monthly_feedback")
                .length || 0,
            cost_krw: monthlyTypeCost,
          },
        },
      },
    });
  } catch (error) {
    console.error("유저별 AI 사용량 상세 조회 실패:", error);
    return NextResponse.json(
      { error: "AI 사용량을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
