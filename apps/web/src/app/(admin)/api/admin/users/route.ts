import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";
import type { UserListItem } from "@/types/admin";

/**
 * GET /api/admin/users
 * 유저 목록 조회 (프라이버시 보호: 내용 필드 제외)
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const isActive = searchParams.get("is_active");
    const _subscriptionStatus = searchParams.get("subscription_status") || "";

    const supabase = getServiceSupabase();
    const offset = (page - 1) * limit;

    // 기본 쿼리
    let query = supabase
      .from("profiles")
      .select(
        `
        id,
        email,
        name,
        role,
        is_active,
        created_at,
        last_login_at
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // 검색 필터
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // 역할 필터
    if (role) {
      query = query.eq("role", role);
    }

    // 활성 상태 필터
    if (isActive !== null && isActive !== "") {
      query = query.eq("is_active", isActive === "true");
    }

    const { data: profiles, error, count } = await query;

    if (error) {
      console.error("유저 목록 조회 실패:", error);
      return NextResponse.json(
        { error: "유저 목록을 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    // 구독 정보 및 AI 사용량 조회
    const userIds = profiles?.map((p) => p.id) || [];
    const [subscriptionsResult, aiUsageResult] = await Promise.all([
      // 구독 정보 조회
      supabase
        .from("subscriptions")
        .select("user_id, plan, status, expires_at")
        .in("user_id", userIds),
      // AI 사용량 집계
      supabase
        .from("ai_requests")
        .select("user_id, total_tokens, cost_usd, cost_krw")
        .in("user_id", userIds),
    ]);

    const subscriptions = subscriptionsResult.data || [];
    const aiRequests = aiUsageResult.data || [];

    // 구독 정보를 맵으로 변환
    const subscriptionMap = new Map(
      subscriptions.map((sub) => [sub.user_id, sub])
    );

    // AI 사용량 집계
    interface UserAIUsage {
      total_requests: number;
      total_tokens: number;
      total_cost_usd: number;
      total_cost_krw: number;
    }
    const aiUsageMap = new Map<string, UserAIUsage>();
    aiRequests.forEach((req) => {
      const userId = req.user_id;
      if (!aiUsageMap.has(userId)) {
        aiUsageMap.set(userId, {
          total_requests: 0,
          total_tokens: 0,
          total_cost_usd: 0,
          total_cost_krw: 0,
        });
      }
      const usage = aiUsageMap.get(userId);
      if (!usage) {
        // 이론적으로는 발생하지 않아야 하지만, 타입 안전성을 위해 체크
        return;
      }
      usage.total_requests += 1;
      usage.total_tokens += Number(req.total_tokens || 0);
      usage.total_cost_usd += Number(req.cost_usd || 0);
      usage.total_cost_krw += Number(req.cost_krw || 0);
    });

    // 결과 조합
    const users: UserListItem[] =
      profiles?.map((profile) => ({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role as "user" | "admin" | "moderator",
        is_active: profile.is_active,
        created_at: profile.created_at,
        last_login_at: profile.last_login_at,
        subscription: subscriptionMap.get(profile.id)
          ? {
              plan: subscriptionMap.get(profile.id)!.plan as "free" | "pro",
              status: subscriptionMap.get(profile.id)!.status as
                | "active"
                | "canceled"
                | "expired"
                | "past_due",
              expires_at: subscriptionMap.get(profile.id)!.expires_at,
            }
          : undefined,
        aiUsage: aiUsageMap.get(profile.id),
      })) || [];

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("유저 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "유저 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
