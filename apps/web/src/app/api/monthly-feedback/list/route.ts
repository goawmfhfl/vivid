import { NextRequest } from "next/server";
import { handleGetMonthlyFeedbackList } from "./handlers/get";

/**
 * GET 핸들러: 월간 피드백 리스트 조회
 */
export async function GET(request: NextRequest) {
  return handleGetMonthlyFeedbackList(request);
}
