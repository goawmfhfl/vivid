import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { generateAllReports } from "@/app/api/daily-feedback/ai-service";
import {
  fetchRecordsByDate,
  saveDailyReport,
} from "@/app/api/daily-feedback/db-service";
import { getKSTDateString } from "@/lib/date-utils";

/**
 * 테스트용 Daily Feedback 일괄 생성 API
 * 개발 환경에서만 사용 가능
 */
export async function POST(request: NextRequest) {
  // 개발 환경 체크
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { userId, month }: { userId: string; month: string } = body;

    if (!userId || !month) {
      return NextResponse.json(
        { error: "userId and month are required" },
        { status: 400 }
      );
    }

    // 월 형식 검증
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: "month must be in YYYY-MM format" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 월의 시작일과 종료일 계산
    const [year, monthNum] = month.split("-").map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0); // 다음 달 0일 = 이번 달 마지막 날

    const startDateStr = getKSTDateString(startDate);
    const endDateStr = getKSTDateString(endDate);

    // 해당 월의 모든 날짜에 대해 daily feedback 생성
    const results = [];
    const errors = [];

    // 날짜별로 순회
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = getKSTDateString(currentDate);

      try {
        // 해당 날짜의 records 조회
        const records = await fetchRecordsByDate(supabase, userId, dateStr);

        if (records.length === 0) {
          // records가 없으면 건너뛰기
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }

        // 요일 계산
        const dateObj = new Date(`${dateStr}T00:00:00+09:00`);
        const dayOfWeek = dateObj.toLocaleDateString("ko-KR", {
          weekday: "long",
          timeZone: "Asia/Seoul",
        });

        // AI 리포트 생성
        const allReports = await generateAllReports(
          records,
          dateStr,
          dayOfWeek,
          false // isPro는 기본값 false로 설정
        );

        // DailyReportResponse 형식으로 변환
        const report = {
          date: dateStr,
          day_of_week: dayOfWeek,
          ...allReports,
        };

        // DB 저장
        const savedFeedback = await saveDailyReport(supabase, userId, report);

        results.push({
          date: dateStr,
          id: savedFeedback.id,
          success: true,
        });

        // API 호출 제한을 고려하여 약간의 딜레이 추가
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        errors.push({
          date: dateStr,
          error: errorMessage,
        });
        console.error(`Failed to generate feedback for ${dateStr}:`, error);
      }

      // 다음 날로 이동
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json(
      {
        message: "Daily feedbacks generated",
        month,
        dateRange: {
          start_date: startDateStr,
          end_date: endDateStr,
        },
        totalDays:
          Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1,
        successCount: results.length,
        errorCount: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 200 }
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
