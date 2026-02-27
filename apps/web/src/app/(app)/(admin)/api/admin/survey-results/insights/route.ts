import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { requireAdmin } from "../../util/admin-auth";
import { API_ENDPOINTS } from "@/constants";
import { SURVEY_SECTIONS, SURVEY_SCORE_QUESTION_IDS } from "@/constants/survey";
import { GoogleGenerativeAI } from "@google/generative-ai";

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenerativeAI(apiKey);
}

function normalizeToQuestionScores(raw: unknown): Record<string, number> {
  const result: Record<string, number> = {};
  if (!raw || typeof raw !== "object") return result;
  const s = raw as Record<string, unknown>;

  if (typeof s["1-1"] === "number") {
    for (const id of SURVEY_SCORE_QUESTION_IDS) {
      const v = s[id];
      if (typeof v === "number" && v >= 0 && v <= 5) result[id] = v;
    }
    return result;
  }

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
 * POST /api/admin/survey-results/insights
 * 설문 데이터 기반 AI 인사이트 (질문별 점수 반영)
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const supabase = getServiceSupabase();

    const { data: submissions, error } = await supabase
      .from(API_ENDPOINTS.SURVEY_SUBMISSIONS)
      .select("section_scores, free_comment, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      throw new Error(`Failed to fetch survey data: ${error.message}`);
    }

    const total = submissions?.length || 0;
    if (total === 0) {
      return NextResponse.json({
        insights:
          "아직 설문 응답이 없습니다. 응답이 쌓이면 인사이트를 생성할 수 있습니다.",
      });
    }

    const questionSums: Record<string, number> = {};
    const questionCounts: Record<string, number> = {};
    for (const row of submissions || []) {
      const qs = normalizeToQuestionScores(row.section_scores);
      for (const [qId, score] of Object.entries(qs)) {
        questionSums[qId] = (questionSums[qId] || 0) + score;
        questionCounts[qId] = (questionCounts[qId] || 0) + 1;
      }
    }

    const questionAverages: { id: string; text: string; avg: number }[] = [];
    for (const sec of SURVEY_SECTIONS) {
      if (sec.id === "5") continue;
      for (const q of sec.questions) {
        const c = questionCounts[q.id] || 0;
        const avg =
          c > 0 ? Math.round((questionSums[q.id]! / c) * 100) / 100 : 0;
        questionAverages.push({ id: q.id, text: q.text, avg });
      }
    }

    const sortedByAvg = [...questionAverages].sort((a, b) => b.avg - a.avg);
    const strengths = sortedByAvg.slice(0, 5).filter((x) => x.avg >= 3.5);
    const weaknesses = sortedByAvg.slice(-5).filter((x) => x.avg < 3.5).reverse();

    const questionLines = questionAverages.map(
      (x) => `- [${x.id}] ${x.text.slice(0, 60)}... : ${x.avg}점`
    );

    const freeComments = (submissions || [])
      .map((s) => s.free_comment)
      .filter(Boolean) as string[];

    const prompt = `
다음은 VIVID 앱 사용자 설문 결과입니다. JSON 형식으로만 응답해주세요. 다른 텍스트는 포함하지 마세요.

## 응답 형식 (반드시 이 JSON 구조를 따르세요)
{
  "strengths": ["강점1 (구체적 질문/영역)", "강점2", ...],
  "weaknesses": ["취약점1 (구체적 질문/영역)", "취약점2", ...],
  "keyInsights": ["핵심 인사이트1 (실행 가능한 개선 방향)", "핵심 인사이트2", ...]
}

## 규칙
- strengths: 평균 점수가 높은 상위 질문/영역(4점 이상)을 기반으로 사용자가 잘 느끼는 강점 3~5개
- weaknesses: 평균 점수가 낮은 하위 질문/영역(3.5점 미만)을 기반으로 개선이 필요한 취약점 3~5개
- keyInsights: 전체 데이터를 종합한 핵심 인사이트 3~5개. 실행 가능한 개선 방향, 우선순위 제안 포함
- 자유의견이 있으면 keyInsights에 반영
- 한국어로 작성

## 참여자 수: ${total}명

## 질문별 평균 점수 (0~5)
${questionLines.join("\n")}

## 상위 점수 영역 (강점 후보)
${strengths.map((x) => `- [${x.id}] ${x.text.slice(0, 50)}... : ${x.avg}점`).join("\n") || "(없음)"}

## 하위 점수 영역 (취약점 후보)
${weaknesses.map((x) => `- [${x.id}] ${x.text.slice(0, 50)}... : ${x.avg}점`).join("\n") || "(없음)"}

## 자유의견 (${freeComments.length}건)
${freeComments.slice(0, 20).map((c) => `- "${c}"`).join("\n") || "(없음)"}
`;

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(prompt);
    const text = result.response.text()?.trim() || "";

    let insights: {
      strengths: string[];
      weaknesses: string[];
      keyInsights: string[];
    } | null = null;

    let jsonStr = text;
    const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlock) jsonStr = codeBlock[1].trim();
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as {
          strengths?: string[];
          weaknesses?: string[];
          keyInsights?: string[];
        };
        insights = {
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
          weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
          keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
        };
      } catch {
        // fallback
      }
    }

    if (!insights) {
      return NextResponse.json({
        insights: null,
        rawText: text || "인사이트를 생성할 수 없습니다.",
      });
    }

    return NextResponse.json({
      insights,
      rawText: null,
    });
  } catch (error) {
    console.error("Survey insights API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
