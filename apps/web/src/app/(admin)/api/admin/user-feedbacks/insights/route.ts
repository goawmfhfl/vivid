import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { requireAdmin } from "../../util/admin-auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenerativeAI(apiKey);
}

const PAGE_TYPE_LABELS: Record<string, string> = {
  daily: "Daily Vivid",
  weekly: "Weekly Vivid",
  monthly: "Monthly Vivid",
};

/**
 * POST /api/admin/user-feedbacks/insights
 * 기간별 피드백 AI 분석 - 개선·개발 방향 제안
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json().catch(() => ({}));
    const startDate = body.startDate as string | undefined;
    const endDate = body.endDate as string | undefined;
    const pageType = body.pageType as string | undefined;

    const supabase = getServiceSupabase();

    let query = supabase
      .from("user_feedbacks")
      .select("page_type, rating, comment, created_at")
      .in("page_type", ["daily", "weekly", "monthly"])
      .order("created_at", { ascending: false })
      .limit(200);

    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      query = query.lt("created_at", end.toISOString());
    }
    if (pageType && ["daily", "weekly", "monthly"].includes(pageType)) {
      query = query.eq("page_type", pageType);
    }

    const { data: feedbacks, error } = await query;

    if (error) {
      throw new Error(`피드백 조회 실패: ${error.message}`);
    }

    const total = feedbacks?.length || 0;
    if (total === 0) {
      return NextResponse.json({
        insights: null,
        rawText: "선택한 기간에 피드백이 없습니다. 기간을 넓혀보세요.",
      });
    }

    const byPageType = {
      daily: feedbacks?.filter((f) => f.page_type === "daily").length || 0,
      weekly: feedbacks?.filter((f) => f.page_type === "weekly").length || 0,
      monthly: feedbacks?.filter((f) => f.page_type === "monthly").length || 0,
    };
    const byRating = {
      1: feedbacks?.filter((f) => f.rating === 1).length || 0,
      2: feedbacks?.filter((f) => f.rating === 2).length || 0,
      3: feedbacks?.filter((f) => f.rating === 3).length || 0,
      4: feedbacks?.filter((f) => f.rating === 4).length || 0,
      5: feedbacks?.filter((f) => f.rating === 5).length || 0,
    };
    const avgRating =
      feedbacks?.reduce((sum, f) => sum + (f.rating || 0), 0) / total || 0;
    const comments = feedbacks
      ?.filter((f) => f.comment && f.comment.trim().length > 0)
      .map((f) => ({
        pageType: PAGE_TYPE_LABELS[f.page_type] || f.page_type,
        rating: f.rating,
        comment: (f.comment || "").slice(0, 300),
      })) || [];

    const prompt = `
다음은 VIVID 앱 사용자 피드백입니다. 관리자가 개선·개발 방향을 파악할 수 있도록 JSON 형식으로만 응답해주세요.

## 응답 형식 (반드시 이 JSON 구조를 따르세요)
{
  "improvements": ["개선이 필요한 영역 1 (구체적)", "개선이 필요한 영역 2", ...],
  "developmentPriorities": ["개발 우선순위 1 (실행 가능한 방향)", "개발 우선순위 2", ...],
  "keyRecommendations": ["핵심 권장사항 1 (어떤 부분을 어떻게 개선하면 좋을지)", "핵심 권장사항 2", ...]
}

## 규칙
- improvements: 평점이 낮은 피드백, 반복되는 불만을 기반으로 개선이 필요한 영역 3~5개
- developmentPriorities: 피드백을 바탕으로 개발해 나아가야 할 우선순위 3~5개 (실행 가능하게)
- keyRecommendations: 전체 피드백을 종합한 핵심 권장사항 3~5개. 구체적이고 실행 가능하게
- 한국어로 작성
- Daily/Weekly/Monthly Vivid 각 영역별로 구체적으로 언급

## 기간: ${startDate || "전체"} ~ ${endDate || "현재"}
## 분석 대상: ${pageType ? PAGE_TYPE_LABELS[pageType] : "전체"}
## 총 피드백: ${total}건
## 평균 평점: ${avgRating.toFixed(2)}점
## 페이지별: Daily ${byPageType.daily}건, Weekly ${byPageType.weekly}건, Monthly ${byPageType.monthly}건
## 평점 분포: 5점 ${byRating[5]}건, 4점 ${byRating[4]}건, 3점 ${byRating[3]}건, 2점 ${byRating[2]}건, 1점 ${byRating[1]}건

## 코멘트가 있는 피드백 (${comments.length}건)
${comments.slice(0, 50).map((c) => `- [${c.pageType}] ${c.rating}점: "${c.comment}"`).join("\n") || "(없음)"}
`;

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(prompt);
    const text = result.response.text()?.trim() || "";

    let insights: {
      improvements: string[];
      developmentPriorities: string[];
      keyRecommendations: string[];
    } | null = null;

    let jsonStr = text;
    const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlock) jsonStr = codeBlock[1].trim();
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as {
          improvements?: string[];
          developmentPriorities?: string[];
          keyRecommendations?: string[];
        };
        insights = {
          improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
          developmentPriorities: Array.isArray(parsed.developmentPriorities)
            ? parsed.developmentPriorities
            : [],
          keyRecommendations: Array.isArray(parsed.keyRecommendations)
            ? parsed.keyRecommendations
            : [],
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
      meta: {
        total,
        startDate: startDate || null,
        endDate: endDate || null,
        pageType: pageType || "all",
      },
    });
  } catch (error) {
    console.error("Feedback insights API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
