import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServiceSupabase } from "@/lib/supabase-service";
import {
  generateAllReportsWithProgress,
  generateReviewReport,
} from "./ai-service-stream";
import {
  fetchRecordsByDate,
  fetchRecordsByDateOptional,
  saveDailyReport,
  fetchTodoListForReview,
  checkRegenerationEligibility,
} from "./db-service";
import { verifySubscription } from "@/lib/subscription-utils";
import { fetchUserPersonaOptional, formatPersonaTraitsForReview } from "@/lib/user-persona";
import { API_ENDPOINTS } from "@/constants";
import { removeTrackingFromObject } from "../utils/remove-tracking";
import type { Report, ReviewReport } from "@/types/daily-vivid";
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

function replace당신InReviewReport(
  report: ReviewReport | null,
  userName: string
): ReviewReport | null {
  if (!report) return report;
  return {
    ...report,
    retrospective_summary: replace당신(report.retrospective_summary, userName),
    retrospective_evaluation: replace당신(report.retrospective_evaluation, userName),
    todo_feedback: (report.todo_feedback ?? []).map((s) =>
      replace당신(s, userName)
    ),
    suggested_todos_for_tomorrow: report.suggested_todos_for_tomorrow
      ? {
          reason: replace당신(report.suggested_todos_for_tomorrow.reason, userName),
          items: report.suggested_todos_for_tomorrow.items.map((s) =>
            replace당신(s, userName)
          ),
        }
      : undefined,
  };
}

function replace당신InReport(report: Report | null, userName: string): Report | null {
  if (!report) return report;
  return {
    ...report,
    current_summary: replace당신(report.current_summary, userName),
    current_evaluation: replace당신(report.current_evaluation, userName),
    future_summary: replace당신(report.future_summary, userName),
    future_evaluation: replace당신(report.future_evaluation, userName),
    retrospective_summary: null,
    retrospective_evaluation: null,
    alignment_analysis_points: (report.alignment_analysis_points ?? []).map(
      (s) => replace당신(s, userName)
    ),
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
    let records: Awaited<ReturnType<typeof fetchRecordsByDate>>;
    if (generationType === "review") {
      records = await fetchRecordsByDateOptional(supabase, userId, date);
      const hasQ3 = records.some((r) =>
        /Q3\.\s*오늘의 나는 어떤 하루를 보냈을까\?/i.test(r.content || "")
      );
      if (!hasQ3) {
        return NextResponse.json(
          {
            error:
              "오늘의 회고를 생성하려면 Q3(오늘의 나는 어떤 하루를 보냈을까?)를 입력해 주세요.",
          },
          { status: 400 }
        );
      }
    } else {
      records = await fetchRecordsByDate(supabase, userId, date);
    }

    const hasReview = records.some((r) => r.type === "review");

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

    // 4️⃣ 타입별 리포트 생성
    let reportData: Report | ReviewReport | null;

    if (generationType === "review") {
      // 회고 전용: Q3 + 투두 + persona 기반
      const todoItems = (await fetchTodoListForReview(supabase, userId, date)) ?? [];
      const persona = await fetchUserPersonaOptional(supabase, userId);
      const personaTraitsBlock = formatPersonaTraitsForReview(persona);

      reportData = await generateReviewReport(
        records,
        date,
        dayOfWeek,
        todoItems,
        personaTraitsBlock,
        isPro,
        userId,
        userName
      );

      if (reportData) {
        reportData = replace당신InReviewReport(reportData, userName);
      }
    } else {
      // 비비드: Q1+Q2+Q3 통합 리포트 (실행력 분석은 생성하지 않음, review 전용)
      let allReports = await generateAllReportsWithProgress(
        records,
        date,
        dayOfWeek,
        isPro,
        userId,
        userName,
        personaContext,
        undefined,
        hasIdealSelfInPersonaFlag
      );

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
          },
        };
      }

      reportData = allReports.report;
    }

    if (!reportData) {
      return NextResponse.json(
        {
          error:
            generationType === "review"
              ? "회고 인사이트 생성에 실패했습니다. 잠시 후 다시 시도해 주세요."
              : "리포트 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        },
        { status: 500 }
      );
    }

    // __tracking(디버깅 메타데이터) 제거 후 DB 저장
    const reportToSave = removeTrackingFromObject(
      reportData as unknown as Record<string, unknown>
    ) as unknown as Report | ReviewReport;

    // DailyReportResponse 형식으로 변환 (trend는 user_persona에서 관리하므로 null)
    const report: DailyReportResponse = {
      date,
      day_of_week: dayOfWeek,
      report: reportToSave,
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
