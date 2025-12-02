import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import type { CreateProfileRequest } from "@/types/profile";

/**
 * POST /api/profiles
 * 프로필 생성 (회원가입 시 사용)
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateProfileRequest = await request.json();
    const {
      id,
      email,
      name,
      phone,
      birthYear,
      gender,
      agreeTerms,
      agreeAI,
      agreeMarketing,
      role = "user",
    } = body;

    // 필수 필드 검증
    if (!id || !email || !name) {
      return NextResponse.json(
        { error: "id, email, name은 필수 필드입니다." },
        { status: 400 }
      );
    }

    if (agreeTerms === undefined || agreeAI === undefined) {
      return NextResponse.json(
        { error: "agreeTerms, agreeAI는 필수 필드입니다." },
        { status: 400 }
      );
    }

    // role 검증
    const validRoles = ["user", "admin", "moderator"];
    const userRole = role || "user";
    if (!validRoles.includes(userRole)) {
      return NextResponse.json(
        { error: "유효하지 않은 role입니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 프로필 데이터 삽입
    const { data: profile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id,
        email,
        name,
        phone: phone || null,
        birth_year: birthYear || null,
        gender: gender || null,
        agree_terms: agreeTerms,
        agree_ai: agreeAI,
        agree_marketing: agreeMarketing || false,
        role: userRole,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error("프로필 생성 오류:", insertError);

      // 중복 키 오류 처리
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "이미 존재하는 프로필입니다." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "프로필 생성에 실패했습니다.", details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "프로필이 성공적으로 생성되었습니다.", profile },
      { status: 201 }
    );
  } catch (error) {
    console.error("프로필 생성 중 예상치 못한 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/profiles
 * 현재 사용자의 프로필 조회
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceSupabase();

    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 토큰에서 사용자 ID 추출 (실제로는 JWT를 검증해야 함)
    // 여기서는 간단히 서비스 롤을 사용하거나, 클라이언트에서 호출하는 경우를 고려해야 함
    // 실제 구현에서는 클라이언트에서 직접 Supabase를 통해 조회하는 것이 더 안전합니다.

    return NextResponse.json(
      { error: "GET 메서드는 클라이언트에서 직접 Supabase를 통해 조회하세요." },
      { status: 400 }
    );
  } catch (error) {
    console.error("프로필 조회 중 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
