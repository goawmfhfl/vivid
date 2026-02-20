import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { decryptDailyVivid } from "@/lib/jsonb-encryption";
import { fetchTodoListsForDate } from "../db-service";
import type { DailyVividRow } from "@/types/daily-vivid";
import { API_ENDPOINTS } from "@/constants";
// 날짜별 조회는 버튼 라벨(보기/생성하기)에 직결되므로 항상 최신 상태 필요 → 캐시 비활성화
const BY_DATE_NO_CACHE = "private, max-age=0, must-revalidate";

/**
 * GET 핸들러: 일일 비비드 조회 (date 기반)
 * vivid가 없어도 scheduled_at = date 인 todo가 있으면 todoLists 반환
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");
    const generationTypeParam = searchParams.get("generation_type");
    const generationType =
      generationTypeParam === "review" ? "review" : "vivid";

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json({ error: "date is required" }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { data: rows, error } = await supabase
      .from(API_ENDPOINTS.DAILY_VIVID)
      .select("*")
      .eq("user_id", userId)
      .eq("report_date", date)
      .eq("type", generationType)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      throw new Error(`Failed to fetch daily vivid: ${error.message}`);
    }

    const data = rows?.[0] ?? null;

    let vividIdForTodo: string | null = data?.id ?? null;
    if (generationType === "review" && data) {
      const { data: vividRow } = await supabase
        .from(API_ENDPOINTS.DAILY_VIVID)
        .select("id")
        .eq("user_id", userId)
        .eq("report_date", date)
        .eq("type", "vivid")
        .maybeSingle();
      vividIdForTodo = vividRow?.id ?? null;
    } else if (generationType === "vivid") {
      vividIdForTodo = data?.id ?? null;
    }

    const { todoLists, hasNativeTodoList } = await fetchTodoListsForDate(
      supabase,
      userId,
      date,
      vividIdForTodo
    );

    if (!data) {
      return NextResponse.json(
        {
          data: null,
          todoLists: todoLists,
          hasNativeTodoList: false,
        },
        {
          status: 200,
          headers: { "Cache-Control": BY_DATE_NO_CACHE },
        }
      );
    }

    const decrypted = decryptDailyVivid(
      data as unknown as { [key: string]: unknown }
    ) as unknown as DailyVividRow;

    if (decrypted.report == null) {
      return NextResponse.json(
        {
          data: null,
          todoLists: todoLists,
          hasNativeTodoList,
        },
        {
          status: 200,
          headers: { "Cache-Control": BY_DATE_NO_CACHE },
        }
      );
    }

    const result: DailyVividRow = {
      ...decrypted,
      todoLists: todoLists.length > 0 ? todoLists : (decrypted.todoLists ?? []),
      hasNativeTodoList,
    };

    return NextResponse.json(
      { data: result },
      {
        status: 200,
        headers: { "Cache-Control": BY_DATE_NO_CACHE },
      }
    );
  } catch (error) {
    console.error("API error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
