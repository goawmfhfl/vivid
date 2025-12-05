import { NextRequest } from "next/server";
import { handleGetMonthlyFeedbackById } from "./handlers/get";

/**
 * GET 핸들러: 월간 피드백 상세 조회 (id 기반)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleGetMonthlyFeedbackById(request, id);
}
