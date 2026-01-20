import { NextRequest } from "next/server";
import { handleGetMonthlyVividList } from "./handlers/get";

/**
 * GET 핸들러: 월간 비비드 리스트 조회
 */
export async function GET(request: NextRequest) {
  return handleGetMonthlyVividList(request);
}
