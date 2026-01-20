import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";

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
    const { data: dailyVividRows, count: dailyCount } = await supabase
      .from("daily_vivid")
      .select(
        "id, report_date, day_of_week, created_at, updated_at, is_ai_generated",
        { count: "exact" }
      )
      .eq("user_id", userId)
      .order("report_date", { ascending: false })
      .range(dailyOffset, dailyOffset + dailyLimit - 1);

    // Weekly Vivid 목록 (메타데이터만)
    const { data: weeklyVividList } = await supabase
      .from("weekly_vivid")
      .select(
        "id, week_start, week_end, created_at, updated_at, is_ai_generated"
      )
      .eq("user_id", userId)
      .order("week_start", { ascending: false });

    // Monthly Vivid 목록 (메타데이터만)
    const { data: monthlyVividList } = await supabase
      .from("monthly_vivid")
      .select(
        "id, month, month_label, date_range, created_at, updated_at, is_ai_generated"
      )
      .eq("user_id", userId)
      .order("month", { ascending: false });

    return NextResponse.json({
      daily: (dailyVividRows || []).map((fb) => ({
        id: fb.id,
        type: "daily" as const,
        date: fb.report_date,
        day_of_week: fb.day_of_week,
        created_at: fb.created_at,
        updated_at: fb.updated_at,
        is_ai_generated: fb.is_ai_generated,
      })),
      dailyPagination: {
        page: dailyPage,
        limit: dailyLimit,
        total: dailyCount || 0,
        totalPages: Math.ceil((dailyCount || 0) / dailyLimit),
      },
      weekly: (weeklyVividList || []).map((fb) => ({
        id: fb.id,
        type: "weekly" as const,
        week_start: fb.week_start,
        week_end: fb.week_end,
        created_at: fb.created_at,
        updated_at: fb.updated_at,
        is_ai_generated: fb.is_ai_generated,
      })),
      monthly: (monthlyVividList || []).map((fb) => ({
        id: fb.id,
        type: "monthly" as const,
        month: fb.month,
        month_label: fb.month_label,
        date_range: fb.date_range,
        created_at: fb.created_at,
        updated_at: fb.updated_at,
        is_ai_generated: fb.is_ai_generated,
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
