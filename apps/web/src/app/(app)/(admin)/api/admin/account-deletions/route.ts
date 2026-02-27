import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { requireAdmin } from "../util/admin-auth";

/**
 * GET /api/admin/account-deletions
 * 탈퇴 사유 목록 조회 (관리자 전용)
 */
export async function GET(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const reason = searchParams.get("reason"); // 특정 탈퇴 사유 필터
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const supabase = getServiceSupabase();
    const offset = (page - 1) * limit;

    // 기본 쿼리 구성
    let query = supabase
      .from("account_deletions")
      .select("*", { count: "exact" })
      .order("deleted_at", { ascending: false });

    // 날짜 필터 적용
    if (startDate) {
      query = query.gte("deleted_at", startDate);
    }

    if (endDate) {
      // endDate의 하루 끝까지 포함
      const endDatePlusOne = new Date(endDate);
      endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
      query = query.lt("deleted_at", endDatePlusOne.toISOString());
    }

    // 탈퇴 사유 필터 적용
    if (reason) {
      query = query.contains("reasons", [reason]);
    }

    // 페이지네이션
    query = query.range(offset, offset + limit - 1);

    const { data: deletions, error, count } = await query;

    if (error) {
      console.error("탈퇴 사유 목록 조회 실패:", error);
      return NextResponse.json(
        { error: "탈퇴 사유 목록을 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      deletions: deletions || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("탈퇴 사유 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "탈퇴 사유 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
