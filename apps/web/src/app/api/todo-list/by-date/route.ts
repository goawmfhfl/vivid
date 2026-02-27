import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { fetchTodoListsForDate } from "@/app/api/daily-vivid/db-service";
import { API_ENDPOINTS } from "@/constants";

export const dynamic = "force-dynamic";

/**
 * GET: 해당 날짜의 todo_list_items 조회
 * vivid에 연결된 네이티브 항목 + scheduled_at=date인 스케줄된 항목 + 미룬 항목
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");

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

    const { data: vividRow } = await supabase
      .from(API_ENDPOINTS.DAILY_VIVID)
      .select("id")
      .eq("user_id", userId)
      .eq("report_date", date)
      .eq("type", "vivid")
      .maybeSingle();

    const vividIdForTodo = vividRow?.id ?? null;

    const { todoLists } = await fetchTodoListsForDate(
      supabase,
      userId,
      date,
      vividIdForTodo
    );

    return NextResponse.json(
      { todoLists },
    {
        status: 200,
        headers: {
          "Cache-Control": "private, no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
    }
    );
  } catch (error) {
    console.error("Todo by-date error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
