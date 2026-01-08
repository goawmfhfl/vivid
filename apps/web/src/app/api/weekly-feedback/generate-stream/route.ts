import { NextRequest } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { fetchDailyFeedbacksByRange, saveWeeklyFeedback } from "../db-service";
import { generateWeeklyFeedbackFromDailyWithProgress } from "../ai-service-stream";
import { verifySubscription } from "@/lib/subscription-utils";
import type { WeeklyFeedback } from "@/types/weekly-feedback";
import type { WithTracking } from "../../types";

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
        } catch {
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

      const requestStartTime = Date.now();
      
      try {
        // GET 요청에서 쿼리 파라미터로 데이터 받기
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get("userId");
        const start = searchParams.get("start");
        const end = searchParams.get("end");
        const timezone = searchParams.get("timezone") || "Asia/Seoul";

        console.log("[generate-stream] 요청 시작:", {
          userId,
          start,
          end,
          timezone,
          timestamp: new Date().toISOString(),
        });

        // 요청 검증
        if (!userId || !start || !end) {
          sendError("userId, start, and end are required");
          return;
        }

        const supabase = getServiceSupabase();

        // Pro 멤버십 확인
        const subscriptionStartTime = Date.now();
        const isPro = (await verifySubscription(userId)).isPro;
        console.log("[generate-stream] 멤버십 확인 완료:", {
          isPro,
          duration_ms: Date.now() - subscriptionStartTime,
        });

        // 1️⃣ Daily Feedback 데이터 조회
        const fetchStartTime = Date.now();
        const dailyFeedbacks = await fetchDailyFeedbacksByRange(
          supabase,
          userId,
          start,
          end
        );
        console.log("[generate-stream] Daily Feedback 조회 완료:", {
          count: dailyFeedbacks.length,
          duration_ms: Date.now() - fetchStartTime,
        });

        if (dailyFeedbacks.length === 0) {
          sendError("No daily feedbacks found for this date range");
          return;
        }

        // 2️⃣ AI 요청: Weekly Feedback 생성 (진행 상황 콜백 포함)
        const aiStartTime = Date.now();
        console.log("[generate-stream] AI 요청 시작:", {
          dailyFeedbacksCount: dailyFeedbacks.length,
          isPro,
          timestamp: new Date().toISOString(),
        });
        
        const weeklyFeedback =
          await generateWeeklyFeedbackFromDailyWithProgress(
            dailyFeedbacks,
            { start, end, timezone },
            isPro,
            sendProgress, // 진행 상황 콜백 전달
            userId // AI 사용량 로깅을 위한 userId 전달
          );
        
        console.log("[generate-stream] AI 요청 완료:", {
          duration_ms: Date.now() - aiStartTime,
          duration_seconds: ((Date.now() - aiStartTime) / 1000).toFixed(2),
        });

        // 추적 정보 제거 (DB 저장 전)
        const cleanedFeedback = removeTrackingInfo(weeklyFeedback);

        // 데이터 검증: 필수 필드 확인
        // summary_report가 null이거나 undefined인 경우만 에러 처리
        if (
          cleanedFeedback.summary_report === null ||
          cleanedFeedback.summary_report === undefined
        ) {
          sendError("Summary report가 생성되지 않았습니다.");
          return;
        }

        // 3️⃣ Supabase weekly_feedbacks 테이블에 저장
        const saveStartTime = Date.now();
        const savedId = await saveWeeklyFeedback(
          supabase,
          userId,
          cleanedFeedback
        );
        console.log("[generate-stream] DB 저장 완료:", {
          savedId,
          duration_ms: Date.now() - saveStartTime,
        });

        // 완료 메시지 전송
        const totalDuration = Date.now() - requestStartTime;
        console.log("[generate-stream] 전체 요청 완료:", {
          totalDuration_ms: totalDuration,
          totalDuration_seconds: (totalDuration / 1000).toFixed(2),
          timestamp: new Date().toISOString(),
        });
        
        sendComplete({ ...cleanedFeedback, id: savedId });
        controller.close();
      } catch (error) {
        const totalDuration = Date.now() - requestStartTime;
        console.error("[generate-stream] API error:", {
          error,
          errorType: error?.constructor?.name || typeof error,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
          totalDuration_ms: totalDuration,
          totalDuration_seconds: (totalDuration / 1000).toFixed(2),
          timestamp: new Date().toISOString(),
        });
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
function removeTrackingInfo(
  feedback: WithTracking<WeeklyFeedback>
): WeeklyFeedback {
  const cleaned = { ...feedback } as Record<string, unknown>;

  const sections = [
    "summary_report",
    "daily_life_report",
    "emotion_report",
    "vivid_report",
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
          const { __tracking: _, ...rest } = cleaned[key] as Record<
            string,
            unknown
          > & { __tracking?: unknown };
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
