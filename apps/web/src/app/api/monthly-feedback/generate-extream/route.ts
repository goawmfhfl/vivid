import { NextRequest } from "next/server";
import { handleGenerateMonthlyFeedback } from "./handlers/get";
import { SSEStreamHelper } from "./utils/sse";

// Next.js API Route 타임아웃 설정 (최대 5분)
export const maxDuration = 300;

/**
 * GET 핸들러: 월간 피드백 생성 (SSE 스트리밍)
 */
export async function GET(request: NextRequest) {
  // SSE 스트림 생성
  const stream = new ReadableStream({
    async start(controller) {
      const sseHelper = new SSEStreamHelper(controller);

      // 핸들러 호출
      await handleGenerateMonthlyFeedback(request, {
        sendProgress: (step, total, sectionName) =>
          sseHelper.sendProgress(step, total, sectionName),
        sendComplete: (data) => sseHelper.sendComplete(data),
        sendError: (error) => sseHelper.sendError(error),
      });
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
