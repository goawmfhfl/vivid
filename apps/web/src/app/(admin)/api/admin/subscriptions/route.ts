import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";
import { upsertSubscription } from "@/lib/subscription-utils";

/**
 * GET /api/admin/subscriptions
 * 구독 목록 조회 (user_metadata에서 조회)
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
    
    // 모든 사용자 조회 (user_metadata에서 구독 정보 추출)
    const { data: { users }, error: listUsersError } = await supabase.auth.admin.listUsers();

    if (listUsersError) {
      console.error("사용자 목록 조회 실패:", listUsersError);
      return NextResponse.json(
        { error: "구독 목록을 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    // user_metadata에서 구독 정보 추출 및 필터링
    let subscriptions = users
      .map((user) => {
        const subscription = user.user_metadata?.subscription;
        if (!subscription) {
          return null;
        }

        return {
          user_id: user.id,
          user: {
            id: user.id,
            email: user.email || "",
            name: (user.user_metadata?.name as string) || "",
          },
          plan: subscription.plan || "free",
          status: subscription.status || "none",
          expires_at: subscription.expires_at || null,
          started_at: subscription.started_at || null,
          updated_at: subscription.updated_at || null,
        };
      })
      .filter((sub) => {
        if (!sub) return false;
        if (plan && sub.plan !== plan) return false;
        if (status && sub.status !== status) return false;
        return true;
      }) as Array<{
      user_id: string;
      user: { id: string; email: string; name: string };
      plan: string;
      status: string;
      expires_at: string | null;
      started_at: string | null;
      updated_at: string | null;
    }>;

    // 정렬 (updated_at 기준 내림차순)
    subscriptions.sort((a, b) => {
      const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return bTime - aTime;
    });

    // 페이지네이션
    const total = subscriptions.length;
    const offset = (page - 1) * limit;
    const paginatedSubscriptions = subscriptions.slice(offset, offset + limit);

    return NextResponse.json({
      subscriptions: paginatedSubscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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
    const {
      userId,
      plan,
      status,
      expires_at,
      current_period_start,
      cancel_at_period_end,
    } = body;

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

    if (status && !["none", "active", "canceled"].includes(status)) {
      return NextResponse.json(
        { error: "유효하지 않은 status입니다. (none, active, canceled만 가능)" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();
    
    await upsertSubscription(userId, {
      plan: plan as "free" | "pro",
      status: (status as "none" | "active" | "canceled") || "active",
      expires_at: expires_at || null,
      started_at: current_period_start || null,
    });

    // 업데이트된 구독 정보 조회
    const { data: { user: updatedUser } } = await supabase.auth.admin.getUserById(userId);
    const subscription = updatedUser?.user_metadata?.subscription || null;

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
 * 구독 상태 변경 (user_metadata에서 업데이트)
 */
export async function PATCH(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const {
      userId,
      plan,
      status,
      expires_at,
      started_at,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId는 필수입니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 기존 사용자 정보 조회
    const { data: { user }, error: getUserError } =
      await supabase.auth.admin.getUserById(userId);

    if (getUserError || !user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 기존 구독 정보 가져오기
    const currentMetadata = user.user_metadata || {};
    const currentSubscription = currentMetadata.subscription || {};

    // 업데이트할 데이터 준비
    const updateData: {
      plan?: "free" | "pro";
      status?: "none" | "active" | "canceled";
      expires_at?: string | null;
      started_at?: string | null;
    } = {};

    if (plan) {
      if (!["free", "pro"].includes(plan)) {
        return NextResponse.json(
          { error: "plan은 'free' 또는 'pro'여야 합니다." },
          { status: 400 }
        );
      }
      updateData.plan = plan as "free" | "pro";
    }

    if (status) {
      if (!["none", "active", "canceled"].includes(status)) {
        return NextResponse.json(
          { error: "유효하지 않은 status입니다." },
          { status: 400 }
        );
      }
      updateData.status = status as "none" | "active" | "canceled";
    }

    if (expires_at !== undefined) {
      updateData.expires_at = expires_at;
    }

    if (started_at !== undefined) {
      updateData.started_at = started_at;
    }

    // user_metadata 업데이트
    await upsertSubscription(userId, {
      plan: updateData.plan || (currentSubscription.plan as "free" | "pro") || "free",
      status: updateData.status || (currentSubscription.status as "none" | "active" | "canceled") || "none",
      expires_at: updateData.expires_at ?? currentSubscription.expires_at ?? null,
      started_at: updateData.started_at ?? currentSubscription.started_at ?? null,
    });

    return NextResponse.json({
      message: "구독이 성공적으로 수정되었습니다.",
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
