import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/profiles
 * 프로필 생성 API (더 이상 사용하지 않음 - user_metadata에 직접 저장)
 * 하위 호환성을 위해 유지하되 빈 응답 반환
 */
export async function POST(_request: NextRequest) {
  // profiles 테이블 제거로 인해 더 이상 사용하지 않음
  // 회원가입 시 user_metadata에 직접 저장됨
  return NextResponse.json(
    { message: "프로필 정보는 user_metadata에 저장됩니다." },
    { status: 200 }
  );
}

/**
 * GET /api/profiles
 * 현재 사용자의 프로필 조회 (더 이상 사용하지 않음 - user_metadata에 직접 저장)
 * 하위 호환성을 위해 유지하되 빈 응답 반환
 */
export async function GET(_request: NextRequest) {
  // profiles 테이블 제거로 인해 더 이상 사용하지 않음
  // 클라이언트에서 user_metadata를 통해 직접 조회
  return NextResponse.json(
    { message: "프로필 정보는 user_metadata에서 조회하세요." },
    { status: 200 }
  );
}
