import { NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { requireAdmin } from "../util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";
import type { UserListItem } from "@/types/admin";
import type { SubscriptionMetadata } from "@/types/subscription";

/**
 * GET /api/admin/users
 * 유저 목록 조회 (user_metadata 기반)
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const currentAdminId = authResult.userId;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "20", 10), 1),
      100
    );
    const search = (searchParams.get("search") || "").trim();
    const role = searchParams.get("role") || "";
    const isActiveParam = searchParams.get("is_active") || "";

    const supabase = getServiceSupabase();

    // Supabase listUsers는 페이지 단위로만 반환하므로, 검색/필터 시 전체 유저를 페칭 후 필터링
    const PER_PAGE = 1000;
    let allUsers: User[] = [];
    let currentPage = 1;
    let hasMore = true;

    while (hasMore) {
      const { data: chunk, error: listError } =
        await supabase.auth.admin.listUsers({
          page: currentPage,
          perPage: PER_PAGE,
        });

      if (listError) {
        console.error("유저 목록 조회 실패:", listError);
        return NextResponse.json(
          { error: "유저 목록을 불러오는데 실패했습니다." },
          { status: 500 }
        );
      }

      const users = chunk.users || [];
      allUsers = allUsers.concat(users);
      hasMore = users.length === PER_PAGE;
      currentPage += 1;
    }

    let filteredUsers = allUsers;

    // 검색 필터 (이메일, 이름, username)
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter((user) => {
        const email = user.email?.toLowerCase() ?? "";
        const name = (user.user_metadata?.name as string)?.toLowerCase() ?? "";
        const username =
          (user.user_metadata?.username as string)?.toLowerCase() ?? "";
        return (
          email.includes(searchLower) ||
          name.includes(searchLower) ||
          username.includes(searchLower)
        );
      });
    }

    // 역할 필터
    if (role) {
      filteredUsers = filteredUsers.filter(
        (user) => (user.user_metadata?.role as string) === role
      );
    }

    // is_active 필터 (user_metadata.is_active)
    if (isActiveParam === "true" || isActiveParam === "false") {
      const active = isActiveParam === "true";
      filteredUsers = filteredUsers.filter((user) => {
        const meta = user.user_metadata as Record<string, unknown> | undefined;
        const isActive =
          meta?.is_active === undefined ? true : meta?.is_active === true;
        return isActive === active;
      });
    }

    // 현재 로그인한 관리자가 목록에 없으면 항상 포함 (본인 데이터 접근 가능)
    const adminInList = filteredUsers.some((u) => u.id === currentAdminId);
    if (!adminInList) {
      const {
        data: { user: adminUser },
      } = await supabase.auth.admin.getUserById(currentAdminId);
      if (adminUser) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          !search ||
          adminUser.email?.toLowerCase().includes(searchLower) ||
          (adminUser.user_metadata?.name as string)
            ?.toLowerCase()
            .includes(searchLower) ||
          (adminUser.user_metadata?.username as string)
            ?.toLowerCase()
            .includes(searchLower);
        const matchesRole =
          !role || (adminUser.user_metadata?.role as string) === role;
        const matchesActive =
          !isActiveParam ||
          (isActiveParam === "true" &&
            (adminUser.user_metadata as Record<string, unknown>)?.is_active !==
              false) ||
          (isActiveParam === "false" &&
            (adminUser.user_metadata as Record<string, unknown>)?.is_active ===
              false);
        if (matchesSearch && matchesRole && matchesActive) {
          filteredUsers = [adminUser, ...filteredUsers];
        }
      }
    }

    // 총 개수 계산 (필터링 후)
    const totalCount = filteredUsers.length;

    // 페이지네이션 적용
    const offset = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);

    // AI 사용량 조회
    const userIds = paginatedUsers.map((u) => u.id);
    const aiUsageResult = await supabase
      .from("ai_requests")
      .select("user_id, total_tokens, cost_usd, cost_krw")
      .in("user_id", userIds);

    const aiRequests = aiUsageResult.data || [];

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
      if (usage) {
        usage.total_requests += 1;
        usage.total_tokens += Number(req.total_tokens || 0);
        usage.total_cost_usd += Number(req.cost_usd || 0);
        usage.total_cost_krw += Number(req.cost_krw || 0);
      }
    });

    // 결과 조합
    const users: UserListItem[] = paginatedUsers.map((user) => {
      const metadata = user.user_metadata || {};
      const subscription = metadata.subscription as SubscriptionMetadata | undefined;
      const userRole = (metadata.role as string) || "user";

      const isActive =
        metadata.is_active === undefined ? true : metadata.is_active === true;

      return {
        id: user.id,
        email: user.email || "",
        name: (metadata.name as string) || "",
        role: userRole as "user" | "admin",
        is_active: isActive,
        created_at: user.created_at,
        last_login_at: (metadata.last_login_at as string) || null,
        subscription:
          subscription && subscription.status !== "none"
          ? {
              plan: subscription.plan,
              status: subscription.status,
              started_at: subscription.started_at || null,
              expires_at: subscription.expires_at,
              updated_at: subscription.updated_at || null,
              store: subscription.store ?? null,
              product_id: subscription.product_id ?? null,
              last_event_timestamp_ms: subscription.last_event_timestamp_ms ?? null,
            }
          : undefined,
        aiUsage: aiUsageMap.get(user.id),
      };
    });

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
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
