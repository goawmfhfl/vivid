import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { verifySubscription } from "@/lib/subscription-utils";
import { API_ENDPOINTS } from "@/constants";
import { generateTodoListFromQ1 } from "@/app/api/daily-vivid/ai-service-stream";
import {
  fetchRecordsByDateOptional,
  saveTodoListItems,
  decryptTodoListItems,
} from "@/app/api/daily-vivid/db-service";

/**
 * POST: 오늘의 할 일 생성 (Pro 전용)
 * Body: { userId: string, date: string } (YYYY-MM-DD)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, date } = body as { userId?: string; date?: string };

    if (!userId || !date) {
      return NextResponse.json(
        { error: "userId and date are required" },
        { status: 400 }
      );
    }

    const { isPro } = await verifySubscription(userId);
    if (!isPro) {
      return NextResponse.json(
        { error: "Pro 멤버십이 필요합니다." },
        { status: 403 }
      );
    }

    const supabase = getServiceSupabase();

    const { data: dailyVivid, error: dvError } = await supabase
      .from(API_ENDPOINTS.DAILY_VIVID)
      .select("id")
      .eq("user_id", userId)
      .eq("report_date", date)
      .eq("is_vivid_ai_generated", true)
      .maybeSingle();

    if (dvError || !dailyVivid?.id) {
      return NextResponse.json(
        { error: "해당 날짜의 비비드가 없습니다. 먼저 비비드를 생성해주세요." },
        { status: 404 }
      );
    }

    const records = await fetchRecordsByDateOptional(supabase, userId, date);
    const hasQ1 = records.some((r) => {
      const content = r.content || "";
      return /Q1\.\s*오늘 하루를 어떻게 보낼까\?/i.test(content);
    });

    if (!hasQ1) {
      return NextResponse.json(
        { error: "Q1(오늘 하루를 어떻게 보낼까?) 기록이 없어 투두를 생성할 수 없습니다." },
        { status: 400 }
      );
    }

    const dateObj = new Date(`${date}T00:00:00+09:00`);
    const dayOfWeek = dateObj.toLocaleDateString("ko-KR", {
      weekday: "long",
      timeZone: "Asia/Seoul",
    });

    const todoItems = await generateTodoListFromQ1(
      records,
      date,
      dayOfWeek,
      isPro,
      userId
    );

    if (!todoItems?.length) {
      return NextResponse.json(
        { error: "투두 리스트를 생성할 수 없습니다. Q1 내용을 더 구체적으로 작성해주세요." },
        { status: 400 }
      );
    }

    await saveTodoListItems(
      supabase,
      dailyVivid.id,
      userId,
      todoItems
    );

    const { data: savedItems } = await supabase
      .from("todo_list_items")
      .select("id, contents, is_checked, category")
      .eq("daily_vivid_id", dailyVivid.id)
      .order("sort_order", { ascending: true });

    const decrypted = savedItems?.length
      ? decryptTodoListItems(savedItems)
      : [];

    return NextResponse.json(
      { data: decrypted },
      { status: 200 }
    );
  } catch (error) {
    console.error("Todo generate error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
