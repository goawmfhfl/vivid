import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";
import type { UserDetail } from "@/types/admin";
import type { SubscriptionMetadata } from "@/types/subscription";

/**
 * GET /api/admin/users/[id]
 * 유저 상세 정보 조회 (user_metadata 기반)
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
    const supabase = getServiceSupabase();

    // 사용자 정보 조회 (user_metadata 기반)
    const { data: { user }, error: getUserError } = await supabase.auth.admin.getUserById(
      userId
    );

    if (getUserError || !user) {
      return NextResponse.json(
        { error: "유저를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const metadata = user.user_metadata || {};
    const subscription = metadata.subscription as SubscriptionMetadata | undefined;

    // 통계 조회 (개수만, 내용은 조회하지 않음)
    const [
      recordsCount,
      dailyVividCount,
      weeklyVividCount,
      monthlyVividCount,
    ] = await Promise.all([
      supabase
        .from("vivid_records")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("daily_vivid")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("weekly_vivid")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("monthly_vivid")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

    const userDetail: UserDetail = {
      id: user.id,
      email: user.email || "",
      name: (metadata.name as string) || "",
      phone: (metadata.phone as string) || null,
      birth_year: (metadata.birthYear as string) || null,
      gender: (metadata.gender as string) || null,
      role: ((metadata.role as string) || "user") as "user" | "admin",
      is_active: true, // user_metadata에 is_active가 없으면 기본값 true
      created_at: user.created_at,
      last_login_at: (metadata.last_login_at as string) || null,
      subscription: subscription
        ? {
            plan: subscription.plan,
            status: subscription.status === "none" ? "active" : subscription.status,
            expires_at: subscription.expires_at,
          }
        : undefined,
      stats: {
        records_count: recordsCount.count || 0,
        daily_vivid_count: dailyVividCount.count || 0,
        weekly_vivid_count: weeklyVividCount.count || 0,
        monthly_vivid_count: monthlyVividCount.count || 0,
      },
    };

    return NextResponse.json(userDetail);
  } catch (error) {
    console.error("유저 상세 조회 실패:", error);
    return NextResponse.json(
      { error: "유저 정보를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users/[id]
 * 유저 정보 수정 (user_metadata 기반)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id: userId } = await params;
    const body = await request.json();
    const { name, phone, role, is_active: _is_active } = body;

    const supabase = getServiceSupabase();

    // 기존 user_metadata 가져오기
    const { data: { user }, error: getUserError } = await supabase.auth.admin.getUserById(
      userId
    );

    if (getUserError || !user) {
      return NextResponse.json(
        { error: "유저를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const currentMetadata = user.user_metadata || {};

    // 업데이트할 데이터 구성
    const updatedMetadata: Record<string, unknown> = {
      ...currentMetadata,
    };

    if (name !== undefined) updatedMetadata.name = name;
    if (phone !== undefined) updatedMetadata.phone = phone;
    if (role !== undefined) {
      if (!["user", "admin"].includes(role)) {
        return NextResponse.json(
          { error: "유효하지 않은 역할입니다." },
          { status: 400 }
        );
      }
      updatedMetadata.role = role;
    }
    // is_active는 user_metadata에 저장하지 않음 (필요시 추가 가능)

    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: updatedMetadata,
      }
    );

    if (updateError) {
      console.error("유저 정보 수정 실패:", updateError);
      return NextResponse.json(
        { error: "유저 정보를 수정하는데 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: updatedUser.user.id,
      email: updatedUser.user.email,
      name: updatedUser.user.user_metadata?.name,
      phone: updatedUser.user.user_metadata?.phone,
      role: updatedUser.user.user_metadata?.role,
    });
  } catch (error) {
    console.error("유저 정보 수정 실패:", error);
    return NextResponse.json(
      { error: "유저 정보를 수정하는데 실패했습니다." },
      { status: 500 }
    );
  }
}
