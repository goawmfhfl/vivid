import { NextRequest } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { fetchDailyFeedbacksByRange, saveWeeklyFeedback } from "../db-service";
import { generateWeeklyFeedbackFromDailyWithProgress } from "../ai-service-stream";
import type { WeeklyFeedbackGenerateRequest } from "../types";
import { verifySubscription } from "@/lib/subscription-utils";
import type { WeeklyFeedback } from "@/types/weekly-feedback";

// Next.js API Route 타임아웃 설정 (최대 3분)
export const maxDuration = 180;

/**
 * POST 핸들러: 주간 피드백 생성 (SSE 스트리밍)
 *
 * 플로우:
 * 1. Daily Feedback 조회
 * 2. AI로 Weekly Feedback 생성 (각 섹션 생성 시점에 진행 상황 전송)
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
        sectionName: string
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
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch (error) {
          // 컨트롤러가 닫혀있으면 무시
          isClosed = true;
          console.warn("Cannot send progress: controller is closed");
        }
      };

      const sendComplete = (data: WeeklyFeedback & { id: string }) => {
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
        const start = searchParams.get("start");
        const end = searchParams.get("end");
        const timezone = searchParams.get("timezone") || "Asia/Seoul";

        // 요청 검증
        if (!userId || !start || !end) {
          sendError("userId, start, and end are required");
          return;
        }

        const supabase = getServiceSupabase();

        // Pro 멤버십 확인
        const isPro = (await verifySubscription(userId)).isPro;

        // 1️⃣ Daily Feedback 데이터 조회
        const dailyFeedbacks = await fetchDailyFeedbacksByRange(
          supabase,
          userId,
          start,
          end
        );

        if (dailyFeedbacks.length === 0) {
          sendError("No daily feedbacks found for this date range");
          return;
        }

        // 2️⃣ AI 요청: Weekly Feedback 생성 (진행 상황 콜백 포함)
        const weeklyFeedback =
          await generateWeeklyFeedbackFromDailyWithProgress(
            dailyFeedbacks,
            { start, end, timezone },
            isPro,
            sendProgress // 진행 상황 콜백 전달
          );

        // 생성된 데이터 확인
        console.log("Generated weekly feedback:", {
          hasSummaryReport: !!weeklyFeedback.summary_report,
          summaryReportType: typeof weeklyFeedback.summary_report,
          summaryReportKeys: weeklyFeedback.summary_report
            ? Object.keys(weeklyFeedback.summary_report)
            : null,
        });

        // 추적 정보 제거 (DB 저장 전)
        const cleanedFeedback = removeTrackingInfo(weeklyFeedback);

        // 데이터 검증: 필수 필드 확인
        // summary_report가 null이거나 undefined인 경우만 에러 처리
        if (
          cleanedFeedback.summary_report === null ||
          cleanedFeedback.summary_report === undefined
        ) {
          console.error("Summary report validation failed:", {
            hasSummaryReport: !!cleanedFeedback.summary_report,
            summaryReportType: typeof cleanedFeedback.summary_report,
            weeklyFeedbackKeys: Object.keys(weeklyFeedback),
            cleanedFeedbackKeys: Object.keys(cleanedFeedback),
            weeklyFeedbackSummaryReport: weeklyFeedback.summary_report,
            cleanedFeedbackSummaryReport: cleanedFeedback.summary_report,
          });
          sendError("Summary report가 생성되지 않았습니다.");
          return;
        }

        // 3️⃣ Supabase weekly_feedbacks 테이블에 저장
        const savedId = await saveWeeklyFeedback(
          supabase,
          userId,
          cleanedFeedback
        );

        // 완료 메시지 전송
        sendComplete({ ...cleanedFeedback, id: savedId });
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
 * 추적 정보 제거 (DB 저장 전)
 */
function removeTrackingInfo(feedback: any): WeeklyFeedback {
  const cleaned = { ...feedback };

  const sections = [
    "summary_report",
    "daily_life_report",
    "emotion_report",
    "vision_report",
    "insight_report",
    "execution_report",
    "closing_report",
  ];

  for (const key of sections) {
    // null이나 undefined가 아닌 경우에만 처리
    if (cleaned[key] !== null && cleaned[key] !== undefined) {
      if (typeof cleaned[key] === "object") {
        // __tracking이 있는 경우에만 제거
        if ("__tracking" in cleaned[key]) {
          const { __tracking, ...rest } = cleaned[key];
          cleaned[key] = rest;
        }
        // __tracking이 없으면 그대로 유지
      }
      // 객체가 아니면 그대로 유지 (이론적으로는 발생하지 않아야 함)
    }
    // null이나 undefined면 그대로 유지 (null은 유효한 값일 수 있음)
  }

  return cleaned as WeeklyFeedback;
}
