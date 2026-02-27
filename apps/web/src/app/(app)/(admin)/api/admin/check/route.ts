import { NextRequest, NextResponse } from "next/server";
import {
  getAuthenticatedUserId,
  getAuthenticatedUserIdFromCookie,
} from "@/app/api/utils/auth";
import { isAdmin } from "../util/admin-auth";

/**
 * GET /api/admin/check
 * 현재 사용자의 관리자 권한 확인
 */
export async function GET(request: NextRequest) {
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

    return NextResponse.json({ isAdmin: adminStatus });
  } catch (error) {
    console.error("관리자 권한 확인 실패:", error);
    return NextResponse.json({ isAdmin: false });
  }
}
