import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";

/**
 * POST 핸들러: 이메일 찾기
 *
 * 추가 정보(이름, 전화번호 등)를 입력받아 이메일을 찾습니다.
 * 보안상 이메일은 마스킹하여 반환합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone } = body;

    // 입력 데이터 검증
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "이름을 입력해주세요." },
        { status: 400 }
      );
    }

    if (!phone || phone.trim() === "") {
      return NextResponse.json(
        { error: "전화번호를 입력해주세요." },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Supabase Auth 사용자 목록 조회
    // 주의: 서비스 역할 키를 사용해야 합니다.
    const {
      data: { users },
      error,
    } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("사용자 조회 에러:", error);
      return NextResponse.json(
        { error: "사용자 조회 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 사용자 메타데이터에서 이름과 전화번호가 모두 일치하는 사용자 필터링
    const matchedUsers = users.filter((user) => {
      const metadata = user.user_metadata || {};

      // 이름과 전화번호가 모두 있어야 함
      if (!metadata.name || !metadata.phone) {
        return false;
      }

      // 이름 검증 (대소문자 무시, 공백 제거)
      const userName = String(metadata.name).toLowerCase().trim();
      const searchName = String(name).toLowerCase().trim();
      if (userName !== searchName) {
        return false;
      }

      // 전화번호 검증 (하이픈/공백 제거 후 비교)
      const userPhone = String(metadata.phone).replace(/[-\s]/g, "");
      const searchPhone = String(phone).replace(/[-\s]/g, "");
      if (userPhone !== searchPhone) {
        return false;
      }

      return true;
    });

    // 이메일 마스킹 함수
    const maskEmail = (email: string): string => {
      const [localPart, domain] = email.split("@");
      if (!domain) return email;

      const visibleLength = Math.min(5, localPart.length);
      const maskedLocal =
        localPart.slice(0, visibleLength) +
        "*".repeat(Math.max(0, localPart.length - visibleLength));

      return `${maskedLocal}@${domain}`;
    };

    // 매칭된 사용자의 이메일을 마스킹하여 반환
    const maskedEmails = matchedUsers
      .map((user) => user.email)
      .filter((email): email is string => email !== null && email !== undefined)
      .map(maskEmail);

    // 보안상 사용자가 존재하지 않아도 성공 응답 반환
    // (실제 존재 여부를 노출하지 않기 위함)
    return NextResponse.json(
      {
        success: true,
        emails: maskedEmails,
        count: maskedEmails.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("이메일 찾기 API 에러:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "이메일 찾기 중 오류가 발생했습니다.", details: errorMessage },
      { status: 500 }
    );
  }
}
