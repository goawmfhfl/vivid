import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../utils/admin-auth";
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
    const supabase = getServiceSupabase();

    // Daily Feedback 목록 (메타데이터만)
    const { data: dailyFeedbacks } = await supabase
      .from("daily_feedback")
      .select(
        "id, report_date, day_of_week, created_at, updated_at, is_ai_generated"
      )
      .eq("user_id", userId)
      .order("report_date", { ascending: false });

    // Weekly Feedback 목록 (메타데이터만)
    const { data: weeklyFeedbacks } = await supabase
      .from("weekly_feedback")
      .select(
        "id, week_start, week_end, created_at, updated_at, is_ai_generated"
      )
      .eq("user_id", userId)
      .order("week_start", { ascending: false });

    // Monthly Feedback 목록 (메타데이터만)
    const { data: monthlyFeedbacks } = await supabase
      .from("monthly_feedback")
      .select(
        "id, month, month_label, date_range, created_at, updated_at, is_ai_generated"
      )
      .eq("user_id", userId)
      .order("month", { ascending: false });

    return NextResponse.json({
      daily: (dailyFeedbacks || []).map((fb) => ({
        id: fb.id,
        type: "daily" as const,
        date: fb.report_date,
        day_of_week: fb.day_of_week,
        created_at: fb.created_at,
        updated_at: fb.updated_at,
        is_ai_generated: fb.is_ai_generated,
      })),
      weekly: (weeklyFeedbacks || []).map((fb) => ({
        id: fb.id,
        type: "weekly" as const,
        week_start: fb.week_start,
        week_end: fb.week_end,
        created_at: fb.created_at,
        updated_at: fb.updated_at,
        is_ai_generated: fb.is_ai_generated,
      })),
      monthly: (monthlyFeedbacks || []).map((fb) => ({
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
