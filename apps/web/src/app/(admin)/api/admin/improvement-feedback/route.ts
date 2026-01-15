import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";
type ImprovementFeedbackRow = {
  id: string;
  user_id: string;
  comment?: string | null;
  content?: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    email: string;
    name: string;
  } | null;
};

/**
 * GET /api/admin/improvement-feedback
 * 개선점 피드백 목록 조회 (관리자 전용)
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

    const supabase = getServiceSupabase();
    const offset = (page - 1) * limit;

    // 개선점 피드백 목록 조회 (user_feedbacks 테이블에서 page_type='improvement'만)
    const { data: feedbacks, error, count } = await supabase
      .from("user_feedbacks")
      .select(
        `
        *,
        profiles:user_id (
          id,
          email,
          name
        )
      `,
        { count: "exact" }
      )
      .eq("page_type", "improvement")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("개선점 피드백 목록 조회 실패:", error);
      return NextResponse.json(
        { error: "피드백 목록을 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    // 프로필 정보 포함하여 반환
    const feedbacksWithUser = (feedbacks || []).map(
      (feedback: ImprovementFeedbackRow) => ({
      id: feedback.id,
      user_id: feedback.user_id,
      content: feedback.comment || feedback.content || "",
      created_at: feedback.created_at,
      updated_at: feedback.updated_at,
      user: feedback.profiles
        ? {
            id: feedback.profiles.id,
            email: feedback.profiles.email,
            name: feedback.profiles.name,
          }
        : null,
      })
    );

    return NextResponse.json({
      feedbacks: feedbacksWithUser,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("개선점 피드백 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "피드백 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/improvement-feedback
 * 개선점 피드백 삭제 (관리자 전용)
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
        { error: "피드백 ID는 필수입니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 피드백 삭제 (user_feedbacks 테이블에서)
    const { error } = await supabase
      .from("user_feedbacks")
      .delete()
      .eq("id", id)
      .eq("page_type", "improvement");

    if (error) {
      console.error("개선점 피드백 삭제 실패:", error);
      return NextResponse.json(
        { error: "피드백을 삭제하는데 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "피드백이 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    console.error("개선점 피드백 삭제 실패:", error);
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `피드백 삭제 실패: ${errorMessage}` },
      { status: 500 }
    );
  }
}
