import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { categorizeRecords, generateDailyReport } from "./ai-service";
import { fetchRecordsByDate, saveDailyReport } from "./db-service";
import type { DailyFeedbackRequest } from "./types";

/**
 * POST 핸들러: 일일 리포트 생성
 *
 * 플로우:
 * 1. Records 조회
 * 2. AI 카테고리화
 * 3. AI 리포트 생성
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

    // 2️⃣ AI 요청 #1: 기록 카테고리화
    const categorized = await categorizeRecords(records, date);

    // 3️⃣ AI 요청 #2: daily-report 생성 (레코드 시간 정보 포함)
    const report = await generateDailyReport(categorized, date, records);

    // 4️⃣ Supabase daily_feedback 테이블에 저장
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
