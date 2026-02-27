import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";

interface UserFeedbackRow {
  id: string;
  page_type: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

/**
 * GET /api/admin/user-feedbacks
 * 유저 피드백 목록 조회 (관리자 전용)
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const pageType = searchParams.get("pageType");
    const rating = searchParams.get("rating");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const supabase = getServiceSupabase();
    const offset = (page - 1) * limit;

    // 피드백 목록 조회
    let query = supabase
      .from("user_feedbacks")
      .select("*", { count: "exact" })
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(offset, offset + limit - 1);

    // 필터 적용
    if (pageType) {
      query = query.eq("page_type", pageType);
    }
    if (rating) {
      query = query.eq("rating", parseInt(rating, 10));
    }

    const { data: feedbacks, error, count } = await query;

    if (error) {
      console.error("피드백 목록 조회 실패:", error);
      return NextResponse.json(
        { error: "피드백 목록을 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    // 통계 계산
    const { data: allFeedbacks } = await supabase
      .from("user_feedbacks")
      .select("rating, page_type");

    const stats = {
      total: allFeedbacks?.length || 0,
      averageRating: allFeedbacks?.length
        ? (allFeedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / allFeedbacks.length).toFixed(2)
        : "0",
      byPageType: {
        daily: allFeedbacks?.filter(f => f.page_type === "daily").length || 0,
        weekly: allFeedbacks?.filter(f => f.page_type === "weekly").length || 0,
        monthly: allFeedbacks?.filter(f => f.page_type === "monthly").length || 0,
      },
      byRating: {
        1: allFeedbacks?.filter(f => f.rating === 1).length || 0,
        2: allFeedbacks?.filter(f => f.rating === 2).length || 0,
        3: allFeedbacks?.filter(f => f.rating === 3).length || 0,
        4: allFeedbacks?.filter(f => f.rating === 4).length || 0,
        5: allFeedbacks?.filter(f => f.rating === 5).length || 0,
      },
    };

    // 응답 형식 변환
    const formattedFeedbacks = (feedbacks || []).map((feedback: UserFeedbackRow) => ({
      id: feedback.id,
      pageType: feedback.page_type,
      rating: feedback.rating,
      comment: feedback.comment,
      createdAt: feedback.created_at,
    }));

    return NextResponse.json({
      feedbacks: formattedFeedbacks,
      stats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("피드백 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "피드백 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/user-feedbacks
 * 피드백 삭제 (관리자 전용)
 */
export async function DELETE(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "피드백 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { error } = await supabase
      .from("user_feedbacks")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("피드백 삭제 실패:", error);
      return NextResponse.json(
        { error: "피드백 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "피드백이 삭제되었습니다." });
  } catch (error) {
    console.error("피드백 삭제 실패:", error);
    return NextResponse.json(
      { error: "피드백 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
