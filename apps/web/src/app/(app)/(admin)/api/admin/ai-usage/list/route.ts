import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";
import type { AIUsageDetail } from "@/types/admin";

/**
 * GET /api/admin/ai-usage/list
 * 전체 AI 사용량 목록 (필터, 검색, 페이지네이션 지원)
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;

    // 필터 파라미터
    const model = searchParams.get("model") || "";
    const requestType = searchParams.get("requestType") || "";
    const userId = searchParams.get("userId") || "";
    const searchQuery = searchParams.get("search") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const supabase = getServiceSupabase();

    // 검색 필터링을 위한 유저 정보 조회 (검색 쿼리가 있는 경우)
    let userIdsForSearch: string[] = [];
    if (searchQuery) {
      // 검색어로 유저를 먼저 찾기
      const { data: matchingUsers } = await supabase
        .from("profiles")
        .select("id")
        .or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      userIdsForSearch = matchingUsers?.map((u) => u.id) || [];
    }

    // 기본 쿼리
    let query = supabase
      .from("ai_requests")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // 필터 적용
    if (model) {
      query = query.eq("model", model);
    }
    if (requestType) {
      query = query.eq("request_type", requestType);
    }
    if (userId) {
      query = query.eq("user_id", userId);
    } else if (searchQuery && userIdsForSearch.length > 0) {
      // 검색어가 있고 유저 검색 결과가 있으면 user_id 필터 추가
      query = query.in("user_id", userIdsForSearch);
    } else if (searchQuery && userIdsForSearch.length === 0) {
      // 검색어가 있지만 매칭되는 유저가 없으면 빈 결과 반환
      return NextResponse.json({
        details: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      });
    }
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    // 페이지네이션
    query = query.range(offset, offset + limit - 1);

    const { data: requests, error, count } = await query;

    if (error) {
      console.error("AI 사용량 목록 조회 실패:", error);
      return NextResponse.json(
        { error: "AI 사용량 목록을 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    const details: AIUsageDetail[] = (requests || []).map((req) => ({
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
      user_id: req.user_id,
    }));

    // 유저 정보 추가 (Supabase Auth admin API 사용 - user_metadata에서 name 가져오기)
    const userIds = Array.from(new Set(details.map((d) => d.user_id).filter((id): id is string => !!id)));
    
    const userMap = new Map<string, { name: string; email: string }>();
    
    if (userIds.length > 0) {
      const userInfoPromises = userIds.map(async (userId) => {
        try {
          const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);
          if (error || !user) {
            return { id: userId, name: "알 수 없음", email: "" };
          }
          return {
            id: user.id,
            name: (user.user_metadata?.name as string) || "알 수 없음",
            email: user.email || "",
          };
        } catch {
          return { id: userId, name: "알 수 없음", email: "" };
        }
      });
      
      const userInfos = await Promise.all(userInfoPromises);
      userInfos.forEach((info) => userMap.set(info.id, { name: info.name, email: info.email }));
    }

    const detailsWithUsers = details.map((detail) => ({
      ...detail,
      user_name: detail.user_id ? userMap.get(detail.user_id)?.name || "알 수 없음" : "알 수 없음",
      user_email: detail.user_id ? userMap.get(detail.user_id)?.email || "" : "",
    }));

    return NextResponse.json({
      details: detailsWithUsers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("AI 사용량 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "AI 사용량 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
