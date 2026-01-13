import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { decryptJsonbFields, type JsonbValue } from "@/lib/jsonb-encryption";
import { API_ENDPOINTS } from "@/constants";
import {
  RECENT_TRENDS_REVALIDATE,
  getCacheControlHeader,
} from "@/constants/cache";
import type { MonthlyTrendsResponse } from "@/types/monthly-feedback-new";

/**
 * GET 핸들러: 최근 4달간의 monthly-feedback monthly_trends 데이터 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 최근 4달간의 monthly-feedback 데이터 조회 (vivid_report의 monthly_trends만 선택)
    const { data, error } = await supabase
      .from(API_ENDPOINTS.MONTHLY_FEEDBACK)
      .select("month, vivid_report")
      .eq("user_id", userId)
      .not("vivid_report", "is", null)
      .order("month", { ascending: false })
      .limit(4);

    if (error) {
      throw new Error(`Failed to fetch monthly feedback trends: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return NextResponse.json<MonthlyTrendsResponse>(
        {
          breakdown_moments: [],
          recovery_moments: [],
          energy_sources: [],
          missing_future_elements: [],
          top_keywords: [],
        },
        { status: 200 }
      );
    }

    // monthly_trends 데이터 추출 및 복호화
    // 각 질문별로 그룹화하여 월별 답변을 모음
    // 각 질문은 하나의 항목만 있고, 여러 달의 답변이 answers 배열에 쌓임
    const breakdownMomentsAnswers: Array<{ month: string; answer: string }> = [];
    const recoveryMomentsAnswers: Array<{ month: string; answer: string }> = [];
    const energySourcesAnswers: Array<{ month: string; answer: string }> = [];
    const missingFutureElementsAnswers: Array<{ month: string; answer: string }> = [];
    const topKeywordsAnswers: Array<{ month: string; answer: string }> = [];

    // 각 질문의 insight 텍스트 (고정값)
    const breakdownInsight = "나는 어떤 순간에서 가장 무너지는가";
    const recoveryInsight = "나는 어떤 순간에서 가장 회복되는가";
    const energyInsight = "내가 실제로 에너지를 얻는 방향";
    const missingInsight = "내가 미래를 그릴 때 빠뜨리는 요소";
    const keywordsInsight = "이 달에서 가장 자주 등장하는 키워드 5가지";

    for (const item of data) {
      if (item.vivid_report) {
        // vivid_report 복호화
        const decryptedVividReport = decryptJsonbFields(
          item.vivid_report as JsonbValue
        ) as { monthly_trends?: {
          breakdown_moments?: MonthlyTrendsResponse["breakdown_moments"];
          recovery_moments?: MonthlyTrendsResponse["recovery_moments"];
          energy_sources?: MonthlyTrendsResponse["energy_sources"];
          missing_future_elements?: MonthlyTrendsResponse["missing_future_elements"];
          top_keywords?: MonthlyTrendsResponse["top_keywords"];
        } } | null;

        if (decryptedVividReport && typeof decryptedVividReport === "object" && decryptedVividReport.monthly_trends) {
          const trends = decryptedVividReport.monthly_trends;
          const month = item.month;

          // breakdown_moments 처리
          if (trends.breakdown_moments && Array.isArray(trends.breakdown_moments)) {
            trends.breakdown_moments.forEach((trend) => {
              trend.answers.forEach((answer) => {
                breakdownMomentsAnswers.push({
                  month: answer.month || month,
                  answer: answer.answer,
                });
              });
            });
          }

          // recovery_moments 처리
          if (trends.recovery_moments && Array.isArray(trends.recovery_moments)) {
            trends.recovery_moments.forEach((trend) => {
              trend.answers.forEach((answer) => {
                recoveryMomentsAnswers.push({
                  month: answer.month || month,
                  answer: answer.answer,
                });
              });
            });
          }

          // energy_sources 처리
          if (trends.energy_sources && Array.isArray(trends.energy_sources)) {
            trends.energy_sources.forEach((trend) => {
              trend.answers.forEach((answer) => {
                energySourcesAnswers.push({
                  month: answer.month || month,
                  answer: answer.answer,
                });
              });
            });
          }

          // missing_future_elements 처리
          if (trends.missing_future_elements && Array.isArray(trends.missing_future_elements)) {
            trends.missing_future_elements.forEach((trend) => {
              trend.answers.forEach((answer) => {
                missingFutureElementsAnswers.push({
                  month: answer.month || month,
                  answer: answer.answer,
                });
              });
            });
          }

          // top_keywords 처리
          if (trends.top_keywords && Array.isArray(trends.top_keywords)) {
            trends.top_keywords.forEach((trend) => {
              trend.answers.forEach((answer) => {
                topKeywordsAnswers.push({
                  month: answer.month || month,
                  answer: answer.answer,
                });
              });
            });
          }
        }
      }
    }

    // 각 질문별로 하나의 항목만 생성하고, 여러 달의 답변을 answers 배열에 모음
    const breakdownMomentsList: MonthlyTrendsResponse["breakdown_moments"] = breakdownMomentsAnswers.length > 0
      ? [{ insight: breakdownInsight, answers: breakdownMomentsAnswers }]
      : [];

    const recoveryMomentsList: MonthlyTrendsResponse["recovery_moments"] = recoveryMomentsAnswers.length > 0
      ? [{ insight: recoveryInsight, answers: recoveryMomentsAnswers }]
      : [];

    const energySourcesList: MonthlyTrendsResponse["energy_sources"] = energySourcesAnswers.length > 0
      ? [{ insight: energyInsight, answers: energySourcesAnswers }]
      : [];

    const missingFutureElementsList: MonthlyTrendsResponse["missing_future_elements"] = missingFutureElementsAnswers.length > 0
      ? [{ insight: missingInsight, answers: missingFutureElementsAnswers }]
      : [];

    const topKeywordsList: MonthlyTrendsResponse["top_keywords"] = topKeywordsAnswers.length > 0
      ? [{ insight: keywordsInsight, answers: topKeywordsAnswers }]
      : [];

    const response: MonthlyTrendsResponse = {
      breakdown_moments: breakdownMomentsList,
      recovery_moments: recoveryMomentsList,
      energy_sources: energySourcesList,
      missing_future_elements: missingFutureElementsList,
      top_keywords: topKeywordsList,
    };

    return NextResponse.json<MonthlyTrendsResponse>(
      response,
      {
        status: 200,
        headers: {
          "Cache-Control": getCacheControlHeader(RECENT_TRENDS_REVALIDATE),
        },
      }
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
