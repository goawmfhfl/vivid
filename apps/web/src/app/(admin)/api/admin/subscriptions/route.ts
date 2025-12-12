import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";
import { upsertSubscription } from "@/lib/subscription-utils";

/**
 * GET /api/admin/subscriptions
 * 구독 목록 조회
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
    const plan = searchParams.get("plan") || "";
    const status = searchParams.get("status") || "";

    const supabase = getServiceSupabase();
    const offset = (page - 1) * limit;

    // 구독 목록 조회
    let query = supabase
      .from("subscriptions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (plan) {
      query = query.eq("plan", plan);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data: subscriptions, error, count } = await query;

    if (error) {
      console.error("구독 목록 조회 실패:", error);
      return NextResponse.json(
        { error: "구독 목록을 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    // 프로필 정보 별도 조회
    const userIds = subscriptions?.map((sub) => sub.user_id) || [];
    const userMap = new Map();

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, name")
        .in("id", userIds);

      profiles?.forEach((profile) => {
        userMap.set(profile.id, profile);
      });
    }

    return NextResponse.json({
      subscriptions:
        subscriptions?.map((sub) => {
          const profile = userMap.get(sub.user_id);
          return {
            id: sub.id,
            user_id: sub.user_id,
            user: profile
              ? {
                  id: profile.id,
                  email: profile.email,
                  name: profile.name,
                }
              : null,
            plan: sub.plan,
            status: sub.status,
            expires_at: sub.expires_at,
            started_at: sub.started_at,
            canceled_at: sub.canceled_at,
            created_at: sub.created_at,
            updated_at: sub.updated_at,
          };
        }) || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("구독 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "구독 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/subscriptions
 * 구독 생성 또는 수정
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { userId, plan, status, expires_at } = body;

    if (!userId || !plan) {
      return NextResponse.json(
        { error: "userId와 plan은 필수입니다." },
        { status: 400 }
      );
    }

    if (!["free", "pro"].includes(plan)) {
      return NextResponse.json(
        { error: "plan은 'free' 또는 'pro'여야 합니다." },
        { status: 400 }
      );
    }

    if (
      status &&
      !["active", "canceled", "expired", "past_due"].includes(status)
    ) {
      return NextResponse.json(
        { error: "유효하지 않은 status입니다." },
        { status: 400 }
      );
    }

    const subscription = await upsertSubscription(userId, {
      plan: plan as "free" | "pro",
      status:
        (status as "active" | "canceled" | "expired" | "past_due") || "active",
      expires_at: expires_at || null,
    });

    return NextResponse.json({
      message: "구독이 성공적으로 저장되었습니다.",
      subscription,
    });
  } catch (error) {
    console.error("구독 저장 실패:", error);
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `구독 저장 실패: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/subscriptions
 * 구독 상태 변경
 */
export async function PATCH(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { userId, plan, status, expires_at } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId는 필수입니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 기존 구독 조회
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: "구독을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const updateData: {
      plan?: string;
      status?: string;
      expires_at?: string | null;
      canceled_at?: string;
    } = {};
    if (plan) {
      if (!["free", "pro"].includes(plan)) {
        return NextResponse.json(
          { error: "plan은 'free' 또는 'pro'여야 합니다." },
          { status: 400 }
        );
      }
      updateData.plan = plan;
    }
    if (status) {
      if (!["active", "canceled", "expired", "past_due"].includes(status)) {
        return NextResponse.json(
          { error: "유효하지 않은 status입니다." },
          { status: 400 }
        );
      }
      updateData.status = status;
      if (status === "canceled" && !existing.canceled_at) {
        updateData.canceled_at = new Date().toISOString();
      }
    }
    if (expires_at !== undefined) {
      updateData.expires_at = expires_at;
    }

    const { data: updated, error } = await supabase
      .from("subscriptions")
      .update(updateData)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("구독 수정 실패:", error);
      return NextResponse.json(
        { error: "구독을 수정하는데 실패했습니다." },
        { status: 500 }
      );
    }

    // user_metadata 동기화
    await upsertSubscription(userId, {
      plan: updated.plan as "free" | "pro",
      status: updated.status as "active" | "canceled" | "expired" | "past_due",
      expires_at: updated.expires_at,
    });

    return NextResponse.json({
      message: "구독이 성공적으로 수정되었습니다.",
      subscription: updated,
    });
  } catch (error) {
    console.error("구독 수정 실패:", error);
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `구독 수정 실패: ${errorMessage}` },
      { status: 500 }
    );
  }
}
