import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { decryptDailyVivid } from "@/lib/jsonb-encryption";
import { fetchTodoListsForDate } from "../db-service";
import type { DailyVividRow } from "@/types/daily-vivid";
import { API_ENDPOINTS } from "@/constants";
import {
  FEEDBACK_REVALIDATE,
  getCacheControlHeader,
} from "@/constants/cache";

/**
 * GET 핸들러: 일일 비비드 조회 (id 기반)
 * review 타입일 때 vivid의 todoLists를, vivid 타입일 때 해당 row의 todoLists를 조회해 포함
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from(API_ENDPOINTS.DAILY_VIVID)
      .select("*")
      .eq("user_id", userId)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch daily vivid: ${error.message}`);
    }

    if (!data) {
      return NextResponse.json(
        { error: "Daily vivid not found" },
        { status: 404 }
      );
    }

    const decrypted = decryptDailyVivid(
      data as unknown as { [key: string]: unknown }
    ) as unknown as DailyVividRow;

    const reportDate = decrypted.report_date;
    const rowType = decrypted.type ?? "vivid";

    let vividIdForTodo: string | null = decrypted.id ?? null;
    if (rowType === "review" && reportDate) {
      const { data: vividRow } = await supabase
        .from(API_ENDPOINTS.DAILY_VIVID)
        .select("id")
        .eq("user_id", userId)
        .eq("report_date", reportDate)
        .eq("type", "vivid")
        .maybeSingle();
      vividIdForTodo = vividRow?.id ?? null;
    }

    const { todoLists, hasNativeTodoList } = await fetchTodoListsForDate(
      supabase,
      userId,
      reportDate ?? "",
      vividIdForTodo
    );

    const result: DailyVividRow = {
      ...decrypted,
      todoLists: todoLists.length > 0 ? todoLists : (decrypted.todoLists ?? []),
      hasNativeTodoList: decrypted.hasNativeTodoList ?? hasNativeTodoList,
    };

    return NextResponse.json(
      { data: result },
      {
        status: 200,
        headers: {
          "Cache-Control": getCacheControlHeader(FEEDBACK_REVALIDATE),
        },
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
