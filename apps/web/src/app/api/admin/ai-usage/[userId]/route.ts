import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../utils/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";
import type { AIUsageDetail } from "@/types/admin";

/**
 * GET /api/admin/ai-usage/[userId]
 * 유저별 AI 사용량 상세 내역
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const userId = params.userId;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = (page - 1) * limit;

    const supabase = getServiceSupabase();

    const {
      data: requests,
      error,
      count,
    } = await supabase
      .from("ai_requests")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("AI 사용량 상세 조회 실패:", error);
      return NextResponse.json(
        { error: "AI 사용량을 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    const details: AIUsageDetail[] =
      requests?.map((req) => ({
        id: req.id,
        model: req.model,
        request_type: req.request_type,
        section_name: req.section_name,
        prompt_tokens: req.prompt_tokens,
        completion_tokens: req.completion_tokens,
        cached_tokens: req.cached_tokens || 0,
        total_tokens: req.total_tokens,
        cost_usd: Number(req.cost_usd || 0),
        cost_krw: Number(req.cost_krw || 0),
        duration_ms: req.duration_ms,
        success: req.success,
        error_message: req.error_message,
        created_at: req.created_at,
      })) || [];

    return NextResponse.json({
      details,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("유저별 AI 사용량 상세 조회 실패:", error);
    return NextResponse.json(
      { error: "AI 사용량을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
