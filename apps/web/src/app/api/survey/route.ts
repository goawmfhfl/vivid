import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { getAuthenticatedUserIdFromRequest } from "@/app/api/utils/auth";
import { API_ENDPOINTS } from "@/constants";
import { SURVEY_SCORE_QUESTION_IDS } from "@/constants/survey";
import type { SubmitSurveyRequest } from "@/types/survey";

function validateQuestionScores(
  questionScores: unknown
): questionScores is Record<string, number> {
  if (!questionScores || typeof questionScores !== "object") return false;
  const s = questionScores as Record<string, unknown>;
  for (const id of SURVEY_SCORE_QUESTION_IDS) {
    const v = s[id];
    if (typeof v !== "number" || v < 0 || v > 5) return false;
  }
  return true;
}

/**
 * POST /api/survey
 * 설문 제출 (로그인 필수, 1인 1회)
 * questionScores: { "1-1": 4, "1-2": 3, ... } 질문별 점수
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserIdFromRequest(request);
    const supabase = getServiceSupabase();

    const { data: existing } = await supabase
      .from(API_ENDPOINTS.SURVEY_SUBMISSIONS)
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "이미 설문에 참여하셨습니다. 재참여는 불가능합니다." },
        { status: 409 }
      );
    }

    const body: SubmitSurveyRequest = await request.json();
    const { questionScores, freeComment, phone } = body;

    if (!validateQuestionScores(questionScores)) {
      return NextResponse.json(
        {
          error:
            "questionScores는 모든 질문(1-1~4-4)에 대한 0~5점이어야 합니다.",
        },
        { status: 400 }
      );
    }

    const trimmedComment =
      typeof freeComment === "string" ? freeComment.trim() : "";
    if (trimmedComment.length > 2000) {
      return NextResponse.json(
        { error: "자유의견은 2000자 이내로 작성해주세요." },
        { status: 400 }
      );
    }

    const trimmedPhone =
      typeof phone === "string" ? phone.trim() : null;
    if (trimmedPhone && trimmedPhone.length > 20) {
      return NextResponse.json(
        { error: "전화번호 형식이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from(API_ENDPOINTS.SURVEY_SUBMISSIONS)
      .insert({
        user_id: userId,
        section_scores: questionScores,
        free_comment: trimmedComment || null,
        phone: trimmedPhone || null,
      })
      .select("id, created_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "이미 설문에 참여하셨습니다. 재참여는 불가능합니다." },
          { status: 409 }
        );
      }
      console.error("설문 제출 오류:", error);
      throw new Error(`Failed to save survey: ${error.message}`);
    }

    return NextResponse.json(
      {
        message: "설문이 성공적으로 제출되었습니다.",
        data: { id: data.id, createdAt: data.created_at },
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    const status = errorMessage.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: errorMessage }, { status });
  }
}
