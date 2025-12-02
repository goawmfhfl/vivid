import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import type { UpdateProfileRequest } from "@/types/profile";

/**
 * PATCH /api/profiles/[id]
 * 프로필 업데이트
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateProfileRequest = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "프로필 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 업데이트할 데이터 구성
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.birthYear !== undefined) updateData.birth_year = body.birthYear;
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.agreeMarketing !== undefined)
      updateData.agree_marketing = body.agreeMarketing;
    if (body.role !== undefined) {
      // role 검증
      const validRoles = ["user", "admin", "moderator"];
      if (!validRoles.includes(body.role)) {
        return NextResponse.json(
          { error: "유효하지 않은 role입니다." },
          { status: 400 }
        );
      }
      updateData.role = body.role;
    }
    if (body.isActive !== undefined) updateData.is_active = body.isActive;

    // last_login_at 업데이트 (로그인 시)
    if (body.lastLoginAt) {
      updateData.last_login_at = body.lastLoginAt;
    }

    const { data: profile, error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("프로필 업데이트 오류:", updateError);
      return NextResponse.json(
        {
          error: "프로필 업데이트에 실패했습니다.",
          details: updateError.message,
        },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: "프로필을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "프로필이 성공적으로 업데이트되었습니다.", profile },
      { status: 200 }
    );
  } catch (error) {
    console.error("프로필 업데이트 중 예상치 못한 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/profiles/[id]
 * 특정 프로필 조회 (관리자용)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "프로필 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("프로필 조회 오류:", fetchError);
      return NextResponse.json(
        { error: "프로필 조회에 실패했습니다.", details: fetchError.message },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: "프로필을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error("프로필 조회 중 예상치 못한 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
