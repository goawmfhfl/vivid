import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServiceSupabase } from "@/lib/supabase-service";
import { generateAllReportsWithProgress } from "./ai-service-stream";
import {
  fetchRecordsByDate,
  saveDailyReport,
  fetchTodoCheckSummary,
  checkRegenerationEligibility,
} from "./db-service";
import { verifySubscription } from "@/lib/subscription-utils";
import { API_ENDPOINTS } from "@/constants";
import type { Report } from "@/types/daily-vivid";
import type { DailyVividRequest, DailyReportResponse } from "./types";

/** 응답 텍스트에서 "당신"을 호칭으로 치환 (userName님) */
function replace당신(str: string, userName: string): string {
  if (!str || !str.includes("당신")) return str;
  return str.replace(/당신/g, `${userName}님`);
}

function normalizeUserName(value?: string): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.endsWith("님") ? trimmed.slice(0, -1).trim() : trimmed;
}

function replace당신InReport(report: Report | null, userName: string): Report | null {
  if (!report) return report;
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
    alignment_analysis_points: (report.alignment_analysis_points ?? []).map(
      (s) => replace당신(s, userName)
    ),
    execution_analysis_points: report.execution_analysis_points
      ? report.execution_analysis_points.map((s) => replace당신(s, userName))
      : null,
    user_characteristics: (report.user_characteristics ?? []).map((s) =>
      replace당신(s, userName)
    ),
    aspired_traits: (report.aspired_traits ?? []).map((s) =>
      replace당신(s, userName)
    ),
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
      userName: requestUserName,
      generation_duration_seconds,
      generation_type: requestGenerationType,
      is_regeneration: isRegeneration,
    }: DailyVividRequest = body;

    const generationType = requestGenerationType === "review" ? "review" : "vivid";

    if (!userId || !date) {
      return NextResponse.json(
        { error: "userId and date are required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 0️⃣ 재생성 요청 시: 기존 레코드 확인 및 is_regenerated 검증
    if (isRegeneration) {
      const { eligible, error: regenError } = await checkRegenerationEligibility(
        supabase,
        userId,
        date,
        generationType
      );
      if (!eligible && regenError) {
        return NextResponse.json({ error: regenError }, { status: 400 });
      }
    }

    // 1️⃣ Records 데이터 조회
    const records = await fetchRecordsByDate(supabase, userId, date);
    const hasReview = records.some((r) => r.type === "review");

    // 리뷰 생성 시: 오늘 기록에 type=vivid(dream) 1개 이상 + type=review 1개 이상 필요
    if (generationType === "review") {
      const hasVivid = records.some(
        (r) => r.type === "vivid" || r.type === "dream"
      );
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

    // 3.5️⃣ 사용자 이름 조회 (호칭: "당신" 대신 "사용자명/회원님" 사용)
    let resolvedUserName = normalizeUserName(requestUserName) || null;

    if (!resolvedUserName) {
      const { data: { user } } = await supabase.auth.admin.getUserById(userId);
      const metadata = (user?.user_metadata || {}) as Record<string, unknown>;
      resolvedUserName =
        normalizeUserName(metadata.username as string) ||
        normalizeUserName(metadata.name as string) ||
        normalizeUserName(metadata.full_name as string) ||
        normalizeUserName(metadata.user_name as string) ||
        null;
    }

    if (!resolvedUserName) {
      const { data: profile } = await supabase
        .from(API_ENDPOINTS.PROFILES)
        .select("name")
        .eq("id", userId)
        .maybeSingle();
      resolvedUserName = normalizeUserName(profile?.name);
    }

    const userName = resolvedUserName || "회원";

    // 3.6️⃣ 일치도 분석: 기존 Q1 vs Q2 방식 사용 (persona 기반은 응답 지연 이슈로 비활성화)
    const personaContext = "";
    const hasIdealSelfInPersonaFlag = false;

    // 4️⃣ 타입별 리포트 생성 (병렬 처리, 멤버십 정보 전달)
    // 항상 Flash 모델 사용 (사고모드 제거)

    // 회고 생성 시: 투두 체크 완료율 조회 (execution_score 반영용)
    let todoCheckInfo: { checked: number; total: number } | undefined;
    if (generationType === "review" && isPro) {
      const summary = await fetchTodoCheckSummary(supabase, userId, date);
      if (summary) todoCheckInfo = summary;
    }

    let allReports = await generateAllReportsWithProgress(
      records,
      date,
      dayOfWeek,
      isPro,
      userId, // AI 사용량 로깅을 위한 userId 전달
      userName,
      personaContext,
      todoCheckInfo,
      hasIdealSelfInPersonaFlag
    );

    // 4.5️⃣ 응답 텍스트에서 "당신" → "재영님" 등 친근 호칭으로 후처리
    if (allReports.report) {
      allReports = {
        ...allReports,
        report: replace당신InReport(allReports.report, userName),
      };
    }

    if (allReports.report && !hasReview) {
      allReports = {
        ...allReports,
        report: {
          ...allReports.report,
          retrospective_summary: null,
          retrospective_evaluation: null,
          execution_score: null,
          execution_analysis_points: null,
        },
      };
    }
    // 4️⃣ DailyReportResponse 형식으로 변환 (trend는 user_persona에서 관리하므로 null)
    const report: DailyReportResponse = {
      date,
      day_of_week: dayOfWeek,
      report: allReports.report,
      trend: null,
    };

    // 5️⃣ Supabase daily_vivid 테이블에 저장
    const savedFeedback = await saveDailyReport(
      supabase,
      userId,
      report,
      generation_duration_seconds,
      generationType,
      isRegeneration ?? false
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
