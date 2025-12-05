import { NextRequest } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import {
  fetchWeeklyFeedbacksByMonth,
  validateAllSections,
  saveMonthlyFeedback,
} from "../db-service";
import { generateMonthlyFeedbackFromWeeklyWithProgress } from "../ai-service-extream";
import type { MonthlyFeedbackGenerateRequest } from "../types";
import { getKSTDateString } from "@/lib/date-utils";
import { verifySubscription } from "@/lib/subscription-utils";
import type { MonthlyFeedback } from "@/types/monthly-feedback";

// Next.js API Route 타임아웃 설정 (최대 5분)
export const maxDuration = 300;

/**
 * 월의 시작일과 종료일 계산 (KST 기준)
 */
function getMonthDateRange(month: string): {
  start_date: string;
  end_date: string;
} {
  const [year, monthNum] = month.split("-").map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0); // 다음 달 0일 = 이번 달 마지막 날

  return {
    start_date: getKSTDateString(startDate),
    end_date: getKSTDateString(endDate),
  };
}

/**
 * GET 핸들러: 월간 피드백 생성 (SSE 스트리밍)
 *
 * 플로우:
 * 1. Weekly Feedback 조회
 * 2. 각 영역별 데이터 존재 여부 검증 (2개 이상)
 * 3. AI로 Monthly Feedback 생성 (각 섹션 생성 시점에 진행 상황 전송)
 * 4. DB 저장
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

      const sendComplete = (data: MonthlyFeedback & { id: string }) => {
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
        const month = searchParams.get("month");

        // 요청 검증
        if (!userId || !month) {
          sendError("userId and month are required");
          return;
        }

        // 월 형식 검증
        if (!/^\d{4}-\d{2}$/.test(month)) {
          sendError("month must be in YYYY-MM format");
          return;
        }

        const supabase = getServiceSupabase();

        // Pro 멤버십 확인
        const isPro = (await verifySubscription(userId)).isPro;

        // 날짜 범위 계산
        const dateRange = getMonthDateRange(month);

        // 1️⃣ Weekly Feedback 데이터 조회
        const weeklyFeedbacks = await fetchWeeklyFeedbacksByMonth(
          supabase,
          userId,
          dateRange.start_date,
          dateRange.end_date
        );

        // 최소 2개 이상의 weekly-feedback이 있어야 함
        if (weeklyFeedbacks.length < 2) {
          sendError(
            `최소 2개 이상의 주간 피드백이 필요합니다. 현재: ${weeklyFeedbacks.length}개`
          );
          return;
        }

        // 2️⃣ 각 영역별 데이터 존재 여부 검증 (2개 이상)
        const sectionValidation = validateAllSections(weeklyFeedbacks);

        // 검증 실패한 영역이 있으면 에러
        const failedSections = Object.entries(sectionValidation)
          .filter(([_, isValid]) => !isValid)
          .map(([section]) => section);

        if (failedSections.length > 0) {
          sendError(
            `다음 영역들이 2개 이상의 데이터를 가지고 있지 않습니다: ${failedSections.join(
              ", "
            )}`
          );
          return;
        }

        // 3️⃣ AI 요청: Monthly Feedback 생성 (진행 상황 콜백 포함)
        const monthlyFeedback =
          await generateMonthlyFeedbackFromWeeklyWithProgress(
            weeklyFeedbacks,
            month,
            dateRange,
            isPro,
            sendProgress // 진행 상황 콜백 전달
          );

        // month_label 설정 (없는 경우)
        if (!monthlyFeedback.month_label) {
          const [year, monthNum] = month.split("-");
          monthlyFeedback.month_label = `${year}년 ${monthNum}월`;
        }

        // date_range 설정 (없는 경우)
        if (!monthlyFeedback.date_range) {
          monthlyFeedback.date_range = dateRange;
        }

        // 4️⃣ Supabase monthly_feedback 테이블에 저장
        const savedId = await saveMonthlyFeedback(
          supabase,
          userId,
          monthlyFeedback
        );

        // 완료 메시지 전송
        sendComplete({ ...monthlyFeedback, id: savedId });
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
