import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import type { SubmitFeedbackRequest } from "@/types/vivid-feedback";

/**
 * POST /api/vivid-feedback
 * 피드백 제출 (익명, 인증 불필요)
 */
export async function POST(request: NextRequest) {
  try {
    const body: SubmitFeedbackRequest = await request.json();
    const { pageType, vividType, rating, comment } = body;

    // 필수 필드 검증
    if (!pageType || typeof pageType !== "string") {
      return NextResponse.json(
        { error: "pageType is required and must be a string" },
        { status: 400 }
      );
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "rating is required and must be a number between 1 and 5" },
        { status: 400 }
      );
    }

    // pageType 유효성 검증
    const validPageTypes = ["daily", "weekly", "monthly"];
    if (!validPageTypes.includes(pageType)) {
      return NextResponse.json(
        { error: "pageType must be one of: daily, weekly, monthly" },
        { status: 400 }
      );
    }

    // vividType 유효성 (데일리 페이지일 때만)
    if (vividType !== undefined) {
      if (pageType !== "daily") {
        return NextResponse.json(
          { error: "vividType is only valid for daily page" },
          { status: 400 }
        );
      }
      if (!["vivid", "review"].includes(vividType)) {
        return NextResponse.json(
          { error: "vividType must be vivid or review" },
          { status: 400 }
        );
      }
    }

    // comment 길이 제한 (선택사항이지만 있으면 검증)
    if (comment && comment.length > 2000) {
      return NextResponse.json(
        { error: "comment must be less than 2000 characters" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const insertPayload: Record<string, unknown> = {
      page_type: pageType,
      rating: rating,
      comment: comment?.trim() || null,
    };
    if (pageType === "daily" && vividType) {
      insertPayload.vivid_type = vividType;
    }

    // 피드백 저장 (익명, user_id 없음)
    const { data, error } = await supabase
      .from("user_feedbacks")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error("피드백 저장 오류:", error);
      throw new Error(`Failed to save feedback: ${error.message}`);
    }

    return NextResponse.json(
      {
        message: "피드백이 성공적으로 제출되었습니다.",
        data: {
          id: data.id,
          pageType: data.page_type,
          rating: data.rating,
        },
      },
      { status: 201 }
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
