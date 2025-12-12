import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";

type PeriodType = "day" | "week" | "month";

interface ContentStatsResponse {
  daily_feedback: {
    by_day: Array<{ date: string; count: number }>;
    by_week: Array<{ week: string; count: number }>;
    by_month: Array<{ month: string; count: number }>;
  };
  weekly_feedback: {
    by_week: Array<{ week: string; count: number }>;
    by_month: Array<{ month: string; count: number }>;
  };
  monthly_feedback: {
    by_month: Array<{ month: string; count: number }>;
  };
}

/**
 * GET /api/admin/content-stats
 * 콘텐츠 통계 조회
 * Query params: period (day|week|month), days (기본값: 30)
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);
    const _period = (searchParams.get("period") || "day") as PeriodType;

    const supabase = getServiceSupabase();

    // 시작 날짜 계산
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Daily Feedback 통계
    const { data: dailyFeedbacks } = await supabase
      .from("daily_feedback")
      .select("report_date, created_at")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("report_date", { ascending: true });

    // Weekly Feedback 통계
    const { data: weeklyFeedbacks } = await supabase
      .from("weekly_feedback")
      .select("week_start, week_end, created_at")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("week_start", { ascending: true });

    // Monthly Feedback 통계
    const { data: monthlyFeedbacks } = await supabase
      .from("monthly_feedback")
      .select("month, created_at")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("month", { ascending: true });

    // Daily Feedback 집계
    const dailyByDay = new Map<string, number>();
    const dailyByWeek = new Map<string, number>();
    const dailyByMonth = new Map<string, number>();

    dailyFeedbacks?.forEach((fb) => {
      const date = new Date(fb.report_date);
      const dayKey = date.toISOString().split("T")[0];
      const weekKey = getWeekKey(date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      dailyByDay.set(dayKey, (dailyByDay.get(dayKey) || 0) + 1);
      dailyByWeek.set(weekKey, (dailyByWeek.get(weekKey) || 0) + 1);
      dailyByMonth.set(monthKey, (dailyByMonth.get(monthKey) || 0) + 1);
    });

    // Weekly Feedback 집계
    const weeklyByWeek = new Map<string, number>();
    const weeklyByMonth = new Map<string, number>();

    weeklyFeedbacks?.forEach((fb) => {
      const weekStart = new Date(fb.week_start);
      const weekKey = getWeekKey(weekStart);
      const monthKey = `${weekStart.getFullYear()}-${String(
        weekStart.getMonth() + 1
      ).padStart(2, "0")}`;

      weeklyByWeek.set(weekKey, (weeklyByWeek.get(weekKey) || 0) + 1);
      weeklyByMonth.set(monthKey, (weeklyByMonth.get(monthKey) || 0) + 1);
    });

    // Monthly Feedback 집계
    const monthlyByMonth = new Map<string, number>();

    monthlyFeedbacks?.forEach((fb) => {
      monthlyByMonth.set(fb.month, (monthlyByMonth.get(fb.month) || 0) + 1);
    });

    // 결과 포맷팅
    const stats: ContentStatsResponse = {
      daily_feedback: {
        by_day: Array.from(dailyByDay.entries())
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date)),
        by_week: Array.from(dailyByWeek.entries())
          .map(([week, count]) => ({ week, count }))
          .sort((a, b) => a.week.localeCompare(b.week)),
        by_month: Array.from(dailyByMonth.entries())
          .map(([month, count]) => ({ month, count }))
          .sort((a, b) => a.month.localeCompare(b.month)),
      },
      weekly_feedback: {
        by_week: Array.from(weeklyByWeek.entries())
          .map(([week, count]) => ({ week, count }))
          .sort((a, b) => a.week.localeCompare(b.week)),
        by_month: Array.from(weeklyByMonth.entries())
          .map(([month, count]) => ({ month, count }))
          .sort((a, b) => a.month.localeCompare(b.month)),
      },
      monthly_feedback: {
        by_month: Array.from(monthlyByMonth.entries())
          .map(([month, count]) => ({ month, count }))
          .sort((a, b) => a.month.localeCompare(b.month)),
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("콘텐츠 통계 조회 실패:", error);
    return NextResponse.json(
      { error: "통계를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

/**
 * 주의 시작일(월요일)을 기준으로 주 키 생성 (YYYY-MM-DD 형식)
 */
function getWeekKey(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 월요일로 조정
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split("T")[0];
}
