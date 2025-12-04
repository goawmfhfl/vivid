import { NextRequest } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { fetchRecordsByDate, saveDailyReport } from "../db-service";
import { generateAllReportsWithProgress } from "../ai-service-stream";
import { verifySubscription } from "@/lib/subscription-utils";
import type { DailyFeedbackRequest } from "../types";

// Next.js API Route 타임아웃 설정 (최대 3분)
export const maxDuration = 180;

/**
 * GET 핸들러: 일일 피드백 생성 (SSE 스트리밍)
 *
 * 플로우:
 * 1. Records 조회
 * 2. AI로 Daily Feedback 생성 (각 섹션 생성 시점에 진행 상황 전송)
 * 3. DB 저장
 */
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  // SSE 스트림 생성
  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false;

      const sendProgress = (
        step: number,
        total: number,
        sectionName: string,
        tracking?: any
      ) => {
        // 컨트롤러가 이미 닫혀있으면 무시
        if (isClosed) {
          return;
        }
        try {
          const data = JSON.stringify({
            type: "progress",
            current: step,
            total,
            sectionName,
            tracking, // 추적 정보도 함께 전송
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch (error) {
          // 컨트롤러가 닫혀있으면 무시
          isClosed = true;
          console.warn("Cannot send progress: controller is closed");
        }
      };

      const sendComplete = (data: any & { id: string; tracking?: any[] }) => {
        if (isClosed) return;
        isClosed = true;
        const result = JSON.stringify({
          type: "complete",
          data,
        });
        controller.enqueue(encoder.encode(`data: ${result}\n\n`));
        controller.close();
      };

      const sendError = (error: string) => {
        if (isClosed) return;
        isClosed = true;
        const data = JSON.stringify({
          type: "error",
          error,
        });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        controller.close();
      };

      try {
        // GET 요청에서 쿼리 파라미터로 데이터 받기
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get("userId");
        const date = searchParams.get("date");

        // 요청 검증
        if (!userId || !date) {
          sendError("userId and date are required");
          return;
        }

        const supabase = getServiceSupabase();

        // Pro 멤버십 확인
        const isPro = (await verifySubscription(userId)).isPro;

        // 1️⃣ Records 데이터 조회
        const records = await fetchRecordsByDate(supabase, userId, date);

        if (records.length === 0) {
          sendError("No records found for this date");
          return;
        }

        // 2️⃣ 요일 계산
        const dateObj = new Date(`${date}T00:00:00+09:00`);
        const dayOfWeek = dateObj.toLocaleDateString("ko-KR", {
          weekday: "long",
          timeZone: "Asia/Seoul",
        });

        // 3️⃣ AI 요청: Daily Feedback 생성 (진행 상황 콜백 포함)
        const allReports = await generateAllReportsWithProgress(
          records,
          date,
          dayOfWeek,
          isPro,
          sendProgress // 진행 상황 콜백 전달
        );

        // DailyReportResponse 형식으로 변환
        const report = {
          date,
          day_of_week: dayOfWeek,
          ...allReports,
        };

        // 추적 정보 수집 (테스트 환경에서만)
        const trackingInfo =
          process.env.NODE_ENV === "test" ||
          process.env.NEXT_PUBLIC_NODE_ENV === "test"
            ? extractTrackingInfo(report)
            : undefined;

        // 추적 정보 제거 (DB 저장 전)
        const cleanedReport = removeTrackingInfo(report);

        // 데이터 검증: 필수 필드 확인
        if (!cleanedReport.summary_report) {
          sendError("Summary report가 생성되지 않았습니다.");
          return;
        }

        // 4️⃣ Supabase daily_feedback 테이블에 저장
        const savedFeedback = await saveDailyReport(
          supabase,
          userId,
          cleanedReport
        );

        // 완료 메시지 전송
        sendComplete({
          ...cleanedReport,
          id: savedFeedback.id,
          ...(trackingInfo && { __tracking: trackingInfo }),
        });
        controller.close();
      } catch (error) {
        console.error("API error:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        sendError(errorMessage);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

/**
 * 추적 정보 추출 (테스트 환경에서만)
 */
function extractTrackingInfo(report: any): any[] {
  const tracking: any[] = [];
  const sections = [
    { key: "summary_report", name: "SummaryReport" },
    { key: "daily_report", name: "DailyReport" },
    { key: "emotion_report", name: "EmotionReport" },
    { key: "dream_report", name: "DreamReport" },
    { key: "insight_report", name: "InsightReport" },
    { key: "feedback_report", name: "FeedbackReport" },
    { key: "final_report", name: "FinalReport" },
  ];

  for (const section of sections) {
    const sectionData = report[section.key];
    if (sectionData?.__tracking) {
      tracking.push({
        name: sectionData.__tracking.name || section.name,
        model: sectionData.__tracking.model,
        duration_ms: sectionData.__tracking.duration_ms,
        usage: sectionData.__tracking.usage,
      });
    }
  }
  return tracking;
}

/**
 * 추적 정보 제거 (DB 저장 전)
 */
function removeTrackingInfo(report: any): any {
  const cleaned = { ...report };

  const sections = [
    "summary_report",
    "daily_report",
    "emotion_report",
    "dream_report",
    "insight_report",
    "feedback_report",
    "final_report",
  ];

  for (const key of sections) {
    if (
      cleaned[key] &&
      typeof cleaned[key] === "object" &&
      cleaned[key] !== null
    ) {
      // __tracking이 있는 경우에만 제거
      if ("__tracking" in cleaned[key]) {
        const { __tracking, ...rest } = cleaned[key];
        cleaned[key] = rest;
      }
      // __tracking이 없으면 그대로 유지
    }
  }

  return cleaned;
}
