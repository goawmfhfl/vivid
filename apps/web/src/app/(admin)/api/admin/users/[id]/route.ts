import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";
import type { UserDetail } from "@/types/admin";

/**
 * GET /api/admin/users/[id]
 * 유저 상세 정보 조회 (프라이버시 보호: 내용 필드 제외)
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

    // 프로필 정보 조회
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "유저를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 구독 정보 조회
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    // 통계 조회 (개수만, 내용은 조회하지 않음)
    const [
      recordsCount,
      dailyVividCount,
      weeklyVividCount,
      monthlyVividCount,
    ] = await Promise.all([
      supabase
        .from("records")
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

    const user: UserDetail = {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      phone: profile.phone,
      birth_year: profile.birth_year,
      gender: profile.gender,
      role: profile.role as "user" | "admin" | "moderator",
      is_active: profile.is_active,
      created_at: profile.created_at,
      last_login_at: profile.last_login_at,
      subscription: subscription
        ? {
            plan: subscription.plan as "free" | "pro",
            status: subscription.status as
              | "active"
              | "canceled"
              | "expired"
              | "past_due",
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

    return NextResponse.json(user);
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
 * 유저 정보 수정 (프라이버시 보호: 내용 필드 수정 불가)
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
    const { name, phone, role, is_active } = body;

    const supabase = getServiceSupabase();

    const updateData: {
      name?: string;
      phone?: string;
      role?: string;
      is_active?: boolean;
    } = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) {
      if (!["user", "admin", "moderator"].includes(role)) {
        return NextResponse.json(
          { error: "유효하지 않은 역할입니다." },
          { status: 400 }
        );
      }
      updateData.role = role;
    }
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("유저 정보 수정 실패:", error);
      return NextResponse.json(
        { error: "유저 정보를 수정하는데 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("유저 정보 수정 실패:", error);
    return NextResponse.json(
      { error: "유저 정보를 수정하는데 실패했습니다." },
      { status: 500 }
    );
  }
}
