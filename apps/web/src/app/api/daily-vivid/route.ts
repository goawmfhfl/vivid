import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServiceSupabase } from "@/lib/supabase-service";
import { generateAllReportsWithProgress } from "./ai-service-stream";
import { fetchRecordsByDate, saveDailyReport } from "./db-service";
import { verifySubscription } from "@/lib/subscription-utils";
import { API_ENDPOINTS } from "@/constants";
import type { DailyVividRequest, DailyReportResponse } from "./types";
import type { Report, TrendData } from "@/types/daily-vivid";

/** 응답 텍스트에서 "당신"을 호칭으로 치환 (userName님) */
function replace당신(str: string, userName: string): string {
  if (!str || !str.includes("당신")) return str;
  return str.replace(/당신/g, `${userName}님`);
}

function replace당신InReport(report: Report, userName: string): Report {
  return {
    ...report,
    current_summary: replace당신(report.current_summary, userName),
    current_evaluation: replace당신(report.current_evaluation, userName),
    future_summary: replace당신(report.future_summary, userName),
    future_evaluation: replace당신(report.future_evaluation, userName),
    retrospective_summary: report.retrospective_summary
      ? replace당신(report.retrospective_summary, userName)
      : null,
    retrospective_evaluation: report.retrospective_evaluation
      ? replace당신(report.retrospective_evaluation, userName)
      : null,
    alignment_analysis_points: report.alignment_analysis_points.map((s) =>
      replace당신(s, userName)
    ),
    execution_analysis_points: report.execution_analysis_points
      ? report.execution_analysis_points.map((s) => replace당신(s, userName))
      : null,
    user_characteristics: report.user_characteristics.map((s) =>
      replace당신(s, userName)
    ),
    aspired_traits: report.aspired_traits.map((s) =>
      replace당신(s, userName)
    ),
  };
}

function replace당신InTrend(trend: TrendData, userName: string): TrendData {
  return {
    aspired_self: replace당신(trend.aspired_self, userName),
    interest: replace당신(trend.interest, userName),
    immersion_moment: replace당신(trend.immersion_moment, userName),
    personality_trait: replace당신(trend.personality_trait, userName),
  };
}

/**
 * POST 핸들러: 일일 리포트 생성
 *
 * 플로우:
 * 1. Records 조회
 * 2. 타입별 리포트 생성 (병렬 처리)
 * 3. 최종 리포트 생성
 * 4. DB 저장
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      date,
      generation_duration_seconds,
      generation_mode,
      generation_type: requestGenerationType,
    }: DailyVividRequest = body;

    const generationType = requestGenerationType === "review" ? "review" : "vivid";

    if (!userId || !date) {
      return NextResponse.json(
        { error: "userId and date are required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 1️⃣ Records 데이터 조회
    const records = await fetchRecordsByDate(supabase, userId, date);

    // 리뷰 생성 시: 오늘 기록에 type=vivid(dream) 1개 이상 + type=review 1개 이상 필요
    if (generationType === "review") {
      const hasVivid = records.some(
        (r) => r.type === "vivid" || r.type === "dream"
      );
      const hasReview = records.some((r) => r.type === "review");
      if (!hasVivid || !hasReview) {
        return NextResponse.json(
          {
            error:
              "오늘의 회고를 생성하려면 Q1·Q2(비비드)와 Q3(회고)를 모두 입력해 주세요.",
          },
          { status: 400 }
        );
      }
    }

    // 2️⃣ 요일 계산
    const dateObj = new Date(`${date}T00:00:00+09:00`);
    const dayOfWeek = dateObj.toLocaleDateString("ko-KR", {
      weekday: "long",
      timeZone: "Asia/Seoul",
    });

    // 3️⃣ 구독 정보 확인 (서버 사이드 검증)
    const { isPro } = await verifySubscription(userId);

    // 3.5️⃣ 사용자 이름 조회 (호칭: "당신" 대신 "userName님" 사용)
    const { data: profile } = await supabase
      .from(API_ENDPOINTS.PROFILES)
      .select("name")
      .eq("id", userId)
      .maybeSingle();
    const userName = profile?.name?.trim() || "회원";

    // 4️⃣ 타입별 리포트 생성 (병렬 처리, 멤버십 정보 전달)
    const generationMode = generation_mode === "reasoned" ? "reasoned" : "fast";

    let allReports = await generateAllReportsWithProgress(
      records,
      date,
      dayOfWeek,
      isPro,
      userId, // AI 사용량 로깅을 위한 userId 전달
      generationMode,
      userName
    );

    // 4.5️⃣ 응답 텍스트에서 "당신" → "userName님" 후처리
    if (allReports.report) {
      allReports = {
        ...allReports,
        report: replace당신InReport(allReports.report, userName),
      };
    }
    if (allReports.trend) {
      allReports = {
        ...allReports,
        trend: replace당신InTrend(allReports.trend, userName),
      };
    }

    // 4️⃣ DailyReportResponse 형식으로 변환
    const report: DailyReportResponse = {
      date,
      day_of_week: dayOfWeek,
      report: allReports.report,
      trend: allReports.trend,
    };

    // 5️⃣ Supabase daily_vivid 테이블에 저장
    const savedFeedback = await saveDailyReport(
      supabase,
      userId,
      report,
      generation_duration_seconds,
      generationType
    );

    revalidatePath("/");

    return NextResponse.json(
      {
        message: "Daily report generated and saved successfully",
        data: savedFeedback,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error:", error);

    // 에러 타입에 따른 상태 코드 결정
    const errorMessage = error instanceof Error ? error.message : String(error);
    const statusCode = errorMessage.includes("No records found")
      ? 404
      : errorMessage.includes("No content from Gemini") ||
        errorMessage.includes("No content from Gemini") || errorMessage.includes("No content from OpenAI")
      ? 500
      : errorMessage.includes("Failed to")
      ? 500
      : 500;

    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: statusCode }
    );
  }
}
