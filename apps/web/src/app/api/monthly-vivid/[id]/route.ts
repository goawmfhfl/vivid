import { NextRequest } from "next/server";
import { handleGetMonthlyVividById } from "./handlers/get";

/**
 * GET 핸들러: 월간 비비드 상세 조회 (id 기반)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleGetMonthlyVividById(request, id);
}
