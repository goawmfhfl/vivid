import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";

/**
 * POST /api/auth/check-email
 * 회원가입 시 이메일 중복 여부 확인. body: { "email": "..." }
 * 반환: { "available": boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json(
        { error: "이메일을 입력해주세요.", available: false },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();
    const { data: { users }, error } = await supabase.auth.admin.listUsers({
      perPage: 1000,
      page: 1,
    });

    if (error) {
      console.error("[check-email] listUsers error:", error);
      return NextResponse.json(
        { error: "확인 중 오류가 발생했습니다.", available: false },
        { status: 500 }
      );
    }

    const exists = users.some(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    return NextResponse.json({ available: !exists });
  } catch (err) {
    console.error("[check-email] error:", err);
    return NextResponse.json(
      {
        error: "확인 중 오류가 발생했습니다.",
        available: false,
      },
      { status: 500 }
    );
  }
}
