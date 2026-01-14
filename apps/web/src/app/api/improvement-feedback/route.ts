import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "../utils/auth";
import { getServiceSupabase } from "@/lib/supabase-service";
import { requireAdmin } from "@/app/(admin)/api/admin/util/admin-auth";
import type { VividFeedback } from "@/types/vivid-feedback";

/**
 * POST /api/improvement-feedback
 * 개선점 피드백 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json(
        { error: "내용을 입력해주세요." },
        { status: 400 }
      );
    }

    // 현재 로그인한 사용자 ID 가져오기
    const userId = await getAuthenticatedUserId(request);

    const supabase = getServiceSupabase();

    // 개선점 피드백 생성 (user_feedbacks 테이블 사용)
    const { data: feedback, error } = await supabase
      .from("user_feedbacks")
      .insert({
        user_id: userId,
        page_type: "improvement",
        rating: null,
        comment: content.trim(),
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("개선점 피드백 생성 실패:", error);
      return NextResponse.json(
        { error: "피드백을 저장하는데 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "피드백이 성공적으로 제출되었습니다.",
        feedback: feedback as VividFeedback,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("개선점 피드백 생성 실패:", error);
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `피드백 제출 실패: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * GET /api/improvement-feedback
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
    const feedbacksWithUser = (feedbacks || []).map((feedback: any) => ({
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
    }));

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
