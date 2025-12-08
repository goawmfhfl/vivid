import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import {
  getAuthenticatedUserId,
  getAuthenticatedUserIdFromCookie,
} from "./auth";

/**
 * 관리자 권한 확인 함수
 * @param userId 사용자 ID
 * @returns 관리자 여부
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = getServiceSupabase();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return false;
  }

  return profile.role === "admin";
}

/**
 * 관리자 권한이 있는 사용자만 접근 가능한 API 미들웨어
 * @param request NextRequest
 * @returns 관리자 사용자 ID 또는 에러 응답
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ userId: string } | NextResponse> {
  try {
    // Authorization 헤더가 있으면 우선 사용, 없으면 쿠키에서 가져오기
    let userId: string;
    try {
      userId = await getAuthenticatedUserId(request);
    } catch {
      // Authorization 헤더가 없으면 쿠키에서 시도
      userId = await getAuthenticatedUserIdFromCookie();
    }

    const adminStatus = await isAdmin(userId);
    if (!adminStatus) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    return { userId };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unauthorized";
    return NextResponse.json(
      { error: `Unauthorized: ${errorMessage}` },
      { status: 401 }
    );
  }
}
