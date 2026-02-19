import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { requireAdmin } from "../util/admin-auth";
import { API_ENDPOINTS } from "@/constants";
import { SURVEY_SECTIONS, SURVEY_SCORE_QUESTION_IDS } from "@/constants/survey";
import type { SurveySubmission, SurveyStats, QuestionScores } from "@/types/survey";

/** section_scores를 질문별 점수로 정규화 (구/신 형식 모두 지원) */
function normalizeToQuestionScores(raw: unknown): QuestionScores {
  const result: QuestionScores = {};
  if (!raw || typeof raw !== "object") return result;

  const s = raw as Record<string, unknown>;

  // 신 형식: { "1-1": 4, "1-2": 3, ... }
  if (typeof s["1-1"] === "number") {
    for (const id of SURVEY_SCORE_QUESTION_IDS) {
      const v = s[id];
      if (typeof v === "number" && v >= 0 && v <= 5) result[id] = v;
    }
    return result;
  }

  // 구 형식: { "1": [4,3,5,4], "2": [...], ... }
  const sectionToIds: Record<string, string[]> = {};
  for (const sec of SURVEY_SECTIONS) {
    if (sec.id === "5") continue;
    sectionToIds[sec.id] = sec.questions.map((q) => q.id);
  }
  for (const key of ["1", "2", "3", "4"]) {
    const arr = s[key];
    if (!Array.isArray(arr)) continue;
    const ids = sectionToIds[key] || [];
    arr.forEach((v, i) => {
      if (typeof v === "number" && v >= 0 && v <= 5 && ids[i])
        result[ids[i]] = v;
    });
  }
  return result;
}

/**
 * GET /api/admin/survey-results
 * 설문 결과 조회 (관리자 전용)
 * questionAverages: 질문별 평균 점수
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const supabase = getServiceSupabase();

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: submissions, error, count } = await supabase
      .from(API_ENDPOINTS.SURVEY_SUBMISSIONS)
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("설문 결과 조회 오류:", error);
      throw new Error(`Failed to fetch survey results: ${error.message}`);
    }

    const allData = await supabase
      .from(API_ENDPOINTS.SURVEY_SUBMISSIONS)
      .select("section_scores");

    const total = allData.data?.length || 0;
    const questionSums: Record<string, number> = {};
    const questionCounts: Record<string, number> = {};
    const sectionSums: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0 };
    const sectionCounts: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0 };

    for (const row of allData.data || []) {
      const qs = normalizeToQuestionScores(row.section_scores);
      for (const [qId, score] of Object.entries(qs)) {
        questionSums[qId] = (questionSums[qId] || 0) + score;
        questionCounts[qId] = (questionCounts[qId] || 0) + 1;
        const sectionId = qId.split("-")[0];
        if (["1", "2", "3", "4"].includes(sectionId)) {
          sectionSums[sectionId] += score;
          sectionCounts[sectionId] += 1;
        }
      }
    }

    const questionAverages: Record<string, number> = {};
    for (const id of SURVEY_SCORE_QUESTION_IDS) {
      const c = questionCounts[id] || 0;
      questionAverages[id] =
        c > 0 ? Math.round((questionSums[id]! / c) * 100) / 100 : 0;
    }

    const sectionAverages: Record<string, number> = {};
    for (const key of ["1", "2", "3", "4"]) {
      const c = sectionCounts[key] || 0;
      sectionAverages[key] =
        c > 0 ? Math.round((sectionSums[key]! / c) * 100) / 100 : 0;
    }

    const stats: SurveyStats = {
      total,
      sectionAverages,
      questionAverages,
    };

    const normalizedSubmissions = (submissions || []).map((s) => ({
      ...s,
      section_scores: normalizeToQuestionScores(s.section_scores),
    }));

    const response = {
      submissions: normalizedSubmissions as SurveySubmission[],
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
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
