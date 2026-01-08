import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { generateAllReportsWithProgress } from "./ai-service-stream";
import { fetchRecordsByDate, saveDailyReport } from "./db-service";
import { verifySubscription } from "@/lib/subscription-utils";
import type { DailyFeedbackRequest, DailyReportResponse } from "./types";

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
    const { userId, date }: DailyFeedbackRequest = body;

    // 요청 검증
    if (!userId || !date) {
      return NextResponse.json(
        { error: "userId and date are required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 1️⃣ Records 데이터 조회
    const records = await fetchRecordsByDate(supabase, userId, date);

    // 2️⃣ 요일 계산
    const dateObj = new Date(`${date}T00:00:00+09:00`);
    const dayOfWeek = dateObj.toLocaleDateString("ko-KR", {
      weekday: "long",
      timeZone: "Asia/Seoul",
    });

    // 3️⃣ 구독 정보 확인 (서버 사이드 검증)
    const { isPro } = await verifySubscription(userId);

    // 4️⃣ 타입별 리포트 생성 (병렬 처리, 멤버십 정보 전달)
    const allReports = await generateAllReportsWithProgress(
      records,
      date,
      dayOfWeek,
      isPro,
      userId // AI 사용량 로깅을 위한 userId 전달
    );

    // 4️⃣ DailyReportResponse 형식으로 변환
    const report: DailyReportResponse = {
      date,
      day_of_week: dayOfWeek,
      emotion_report: allReports.emotion_report,
      vivid_report: allReports.vivid_report,
    };

    // 5️⃣ Supabase daily_feedback 테이블에 저장
    const savedFeedback = await saveDailyReport(supabase, userId, report);

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
      : errorMessage.includes("No content from OpenAI")
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
