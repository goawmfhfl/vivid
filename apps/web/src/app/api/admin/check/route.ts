import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserIdFromCookie } from "../../utils/auth";
import { isAdmin } from "../../utils/admin-auth";

/**
 * GET /api/admin/check
 * 현재 사용자의 관리자 권한 확인
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserIdFromCookie();
    const adminStatus = await isAdmin(userId);

    return NextResponse.json({ isAdmin: adminStatus });
  } catch (error) {
    return NextResponse.json({ isAdmin: false });
  }
}
