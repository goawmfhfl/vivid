import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { requireAdmin } from "../util/admin-auth";
import type {
  VividFeedback,
  FeedbackStats,
  FeedbackListResponse,
} from "@/types/vivid-feedback";

/**
 * GET /api/admin/feedback
 * 피드백 목록 조회 (관리자 전용)
 */
export async function GET(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const pageType = searchParams.get("pageType");
    const rating = searchParams.get("rating");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const supabase = getServiceSupabase();

    // 기본 쿼리 구성
    let query = supabase.from("user_feedbacks").select("*", { count: "exact" });

    // 필터 적용
    if (pageType && ["daily", "weekly", "monthly"].includes(pageType)) {
      query = query.eq("page_type", pageType);
    }

    if (rating) {
      const ratingNum = parseInt(rating, 10);
      if (ratingNum >= 1 && ratingNum <= 5) {
        query = query.eq("rating", ratingNum);
      }
    }

    if (startDate) {
      query = query.gte("created_at", startDate);
    }

    if (endDate) {
      // endDate의 하루 끝까지 포함
      const endDatePlusOne = new Date(endDate);
      endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
      query = query.lt("created_at", endDatePlusOne.toISOString());
    }

    // 정렬 (최신순)
    query = query.order("created_at", { ascending: false });

    // 페이지네이션
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: feedbacks, error, count } = await query;

    if (error) {
      console.error("피드백 조회 오류:", error);
      throw new Error(`Failed to fetch feedbacks: ${error.message}`);
    }

    // 통계 조회
    const statsQuery = supabase
      .from("user_feedbacks")
      .select("page_type, rating");

    // 통계에도 동일한 필터 적용
    if (startDate) {
      statsQuery.gte("created_at", startDate);
    }
    if (endDate) {
      const endDatePlusOne = new Date(endDate);
      endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
      statsQuery.lt("created_at", endDatePlusOne.toISOString());
    }

    const { data: allFeedbacks } = await statsQuery;

    // 통계 계산
    const stats: FeedbackStats = {
      total: allFeedbacks?.length || 0,
      byPageType: {
        daily: allFeedbacks?.filter((f) => f.page_type === "daily").length || 0,
        weekly:
          allFeedbacks?.filter((f) => f.page_type === "weekly").length || 0,
        monthly:
          allFeedbacks?.filter((f) => f.page_type === "monthly").length || 0,
      },
      byRating: {
        1: allFeedbacks?.filter((f) => f.rating === 1).length || 0,
        2: allFeedbacks?.filter((f) => f.rating === 2).length || 0,
        3: allFeedbacks?.filter((f) => f.rating === 3).length || 0,
        4: allFeedbacks?.filter((f) => f.rating === 4).length || 0,
        5: allFeedbacks?.filter((f) => f.rating === 5).length || 0,
      },
      averageRating:
        allFeedbacks && allFeedbacks.length > 0
          ? Number(
              (
                allFeedbacks.reduce((sum, f) => sum + f.rating, 0) /
                allFeedbacks.length
              ).toFixed(2)
            )
          : 0,
    };

    const response: FeedbackListResponse = {
      feedbacks: (feedbacks as VividFeedback[]) || [],
      stats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("API error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
