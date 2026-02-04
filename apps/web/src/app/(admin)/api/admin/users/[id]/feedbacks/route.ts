import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";
import { API_ENDPOINTS } from "@/constants";

/**
 * GET /api/admin/users/[id]/feedbacks
 * 유저의 피드백 목록 조회 (메타데이터만, 내용 제외)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id: userId } = await params;
    const { searchParams } = new URL(request.url);
    const supabase = getServiceSupabase();

    // 페이지네이션 파라미터
    const dailyPage = parseInt(searchParams.get("dailyPage") || "1", 10);
    const dailyLimit = parseInt(searchParams.get("dailyLimit") || "10", 10);
    const dailyOffset = (dailyPage - 1) * dailyLimit;

    // Daily Vivid 목록 (메타데이터만, 페이지네이션)
    const { data: dailyVividRows, count: dailyCount, error: dailyError } = await supabase
      .from(API_ENDPOINTS.DAILY_VIVID)
      .select(
        "id, report_date, day_of_week, created_at, updated_at, is_vivid_ai_generated, is_review_ai_generated, generation_duration_seconds",
        { count: "exact" }
      )
      .eq("user_id", userId)
      .order("report_date", { ascending: false })
      .range(dailyOffset, dailyOffset + dailyLimit - 1);

    if (dailyError) {
      console.error("[Admin Feedbacks API] Daily Vivid 조회 실패:", dailyError);
    }

    // Weekly Vivid 목록 (메타데이터만)
    // 주의: weekly_vivid 테이블에는 updated_at 컬럼이 없으므로 제외
    const { data: weeklyVividList, error: weeklyError } = await supabase
      .from(API_ENDPOINTS.WEEKLY_VIVID)
      .select(
        "id, week_start, week_end, created_at, is_ai_generated, generation_duration_seconds"
      )
      .eq("user_id", userId)
      .order("week_start", { ascending: false });

    if (weeklyError) {
      console.error("[Admin Feedbacks API] Weekly Vivid 조회 실패:", {
        error: weeklyError,
        message: weeklyError.message,
        code: weeklyError.code,
        details: weeklyError.details,
        hint: weeklyError.hint,
        userId,
        tableName: API_ENDPOINTS.WEEKLY_VIVID,
      });
      // 에러가 발생해도 다른 데이터는 반환하도록 빈 배열 사용
    }

    // Monthly Vivid 목록 (메타데이터만)
    const { data: monthlyVividList, error: monthlyError } = await supabase
      .from(API_ENDPOINTS.MONTHLY_VIVID)
      .select(
        "id, month, month_label, date_range, created_at, updated_at, is_ai_generated, generation_duration_seconds"
      )
      .eq("user_id", userId)
      .order("month", { ascending: false });

    if (monthlyError) {
      console.error("[Admin Feedbacks API] Monthly Vivid 조회 실패:", monthlyError);
      // 에러가 발생해도 다른 데이터는 반환하도록 빈 배열 사용
    }

    // 응답 데이터 준비
    const weeklyData = (weeklyVividList || []).map((fb) => ({
      id: fb.id,
      type: "weekly" as const,
      week_start: fb.week_start,
      week_end: fb.week_end,
      created_at: fb.created_at,
      updated_at: fb.created_at, // updated_at이 없으므로 created_at 사용
      is_ai_generated: fb.is_ai_generated,
      generation_duration_seconds: fb.generation_duration_seconds ?? null,
    }));


    return NextResponse.json({
      daily: (dailyVividRows || []).map((fb) => ({
        id: fb.id,
        type: "daily" as const,
        date: fb.report_date,
        day_of_week: fb.day_of_week,
        created_at: fb.created_at,
        updated_at: fb.updated_at,
        is_ai_generated:
          (fb as { is_vivid_ai_generated?: boolean; is_review_ai_generated?: boolean }).is_vivid_ai_generated === true ||
          (fb as { is_vivid_ai_generated?: boolean; is_review_ai_generated?: boolean }).is_review_ai_generated === true,
        generation_duration_seconds: fb.generation_duration_seconds ?? null,
      })),
      dailyPagination: {
        page: dailyPage,
        limit: dailyLimit,
        total: dailyCount || 0,
        totalPages: Math.ceil((dailyCount || 0) / dailyLimit),
      },
      weekly: weeklyData,
      monthly: (monthlyVividList || []).map((fb) => ({
        id: fb.id,
        type: "monthly" as const,
        month: fb.month,
        month_label: fb.month_label,
        date_range: fb.date_range,
        created_at: fb.created_at,
        updated_at: fb.updated_at,
        is_ai_generated: fb.is_ai_generated,
        generation_duration_seconds: fb.generation_duration_seconds ?? null,
      })),
    });
  } catch (error) {
    console.error("피드백 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "피드백 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
