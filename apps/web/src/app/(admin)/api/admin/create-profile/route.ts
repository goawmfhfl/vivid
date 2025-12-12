import { NextRequest, NextResponse } from "next/server";
import {
  getAuthenticatedUserId,
  getAuthenticatedUserIdFromCookie,
} from "../../../../api/utils/auth";
import { getServiceSupabase } from "@/lib/supabase-service";

/**
 * POST /api/admin/create-profile
 * 현재 로그인한 사용자의 프로필을 생성하는 API
 * (기존 계정이 profile 테이블에 없을 때 사용)
 */
export async function POST(request: NextRequest) {
  try {
    // 현재 로그인한 사용자 ID 가져오기
    // Authorization 헤더가 있으면 우선 사용, 없으면 쿠키에서 가져오기
    let userId: string;
    try {
      userId = await getAuthenticatedUserId(request);
    } catch {
      // Authorization 헤더가 없으면 쿠키에서 시도
      userId = await getAuthenticatedUserIdFromCookie();
    }
    const supabase = getServiceSupabase();

    // 사용자 정보 가져오기
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.admin.getUserById(userId);

    if (userError || !user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 이미 프로필이 있는지 확인
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: "이미 프로필이 존재합니다.", profile: existingProfile },
        { status: 409 }
      );
    }

    // 프로필 생성
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email: user.email || "",
        name: user.user_metadata?.name || user.email?.split("@")[0] || "사용자",
        phone: user.user_metadata?.phone || null,
        birth_year: user.user_metadata?.birthYear || null,
        gender: user.user_metadata?.gender || null,
        agree_terms: user.user_metadata?.agreeTerms || true,
        agree_ai: user.user_metadata?.agreeAI || true,
        agree_marketing: user.user_metadata?.agreeMarketing || false,
        role: "admin", // 관리자 권한으로 생성
        is_active: true,
      })
      .select()
      .single();

    if (profileError) {
      console.error("프로필 생성 실패:", profileError);
      return NextResponse.json(
        { error: "프로필 생성에 실패했습니다.", details: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "프로필이 성공적으로 생성되었습니다.",
      profile,
    });
  } catch (error) {
    console.error("프로필 생성 중 오류:", error);
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `프로필 생성 실패: ${errorMessage}` },
      { status: 500 }
    );
  }
}
