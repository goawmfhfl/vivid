import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import {
  fetchWeeklyFeedbackDetail,
  fetchDailyFeedbacksByRange,
} from "../db-service";

/**
 * GET 핸들러: 주간 피드백 상세 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const feedback = await fetchWeeklyFeedbackDetail(supabase, userId, id);

    if (!feedback) {
      return NextResponse.json(
        { error: "Weekly feedback not found" },
        { status: 404 }
      );
    }

    // 일별 정합도 점수 데이터 가져오기
    const dailyFeedbacks = await fetchDailyFeedbacksByRange(
      supabase,
      userId,
      feedback.week_range.start,
      feedback.week_range.end
    );

    // 일별 정합도 점수 배열 생성 (기록이 있는 날짜만)
    const dailyIntegrityScores = dailyFeedbacks
      .filter((df) => df.integrity_score !== null)
      .map((df) => {
        const date = new Date(df.report_date);
        const weekday = date.toLocaleDateString("ko-KR", { weekday: "long" });
        return {
          date: df.report_date.replace(/-/g, "."),
          weekday,
          score: df.integrity_score!,
        };
      });

    // feedback 객체에 daily_integrity_scores 추가
    const feedbackWithDailyScores = {
      ...feedback,
      daily_integrity_scores: dailyIntegrityScores,
    };

    return NextResponse.json(
      { data: feedbackWithDailyScores },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
