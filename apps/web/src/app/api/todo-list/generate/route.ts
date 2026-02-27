import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { verifySubscription } from "@/lib/subscription-utils";
import { API_ENDPOINTS } from "@/constants";
import {
  generateTodoListFromQ1,
  generateTodoListGeneric,
} from "@/app/api/daily-vivid/ai-service-stream";
import {
  fetchRecordsByDateOptional,
  saveTodoListItems,
  decryptTodoListItems,
  MANUAL_ADD_CATEGORY,
  TodoListItemRow,
} from "@/app/api/daily-vivid/db-service";
import { encryptDailyVivid } from "@/lib/jsonb-encryption";

async function getOrCreateDailyVividForDate(
  supabase: ReturnType<typeof getServiceSupabase>,
  userId: string,
  date: string
): Promise<{ id: string }> {
  const { data: rows, error: fetchError } = await supabase
    .from(API_ENDPOINTS.DAILY_VIVID)
    .select("id")
    .eq("user_id", userId)
    .eq("report_date", date)
    .eq("type", "vivid")
    .order("created_at", { ascending: false })
    .limit(1);

  if (fetchError) throw new Error(`Failed to fetch daily vivid: ${fetchError.message}`);
  const existing = rows?.[0] ?? null;
  if (existing?.id) return { id: existing.id };

  const dateObj = new Date(`${date}T00:00:00+09:00`);
  const dayOfWeek = dateObj.toLocaleDateString("ko-KR", {
    weekday: "long",
    timeZone: "Asia/Seoul",
  });

  const encrypted = encryptDailyVivid({ report: null });
  const { data: inserted, error: insertError } = await supabase
    .from(API_ENDPOINTS.DAILY_VIVID)
    .insert({
      user_id: userId,
      report_date: date,
      day_of_week: dayOfWeek,
      report: encrypted.report ?? null,
      type: "vivid",
    })
    .select("id")
    .single();

  if (insertError || !inserted?.id) {
    throw new Error(`Failed to create daily vivid: ${insertError?.message ?? "unknown"}`);
  }
  return { id: inserted.id };
}

/**
 * POST: 오늘의 할 일 생성 (Pro 전용)
 * Body: { userId: string, date: string } (YYYY-MM-DD)
 * 비비드/Q1 없어도 생성 가능 (일반 할 일 목록 생성)
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

    const supabase = getServiceSupabase();
    const dailyVivid = await getOrCreateDailyVividForDate(supabase, userId, date);

    const records = await fetchRecordsByDateOptional(supabase, userId, date);
    const hasQ1 = records.some((r) => {
      const content = r.content || "";
      return /Q1\.\s*오늘 하루를 어떻게 보낼까\?/i.test(content);
    });

    const dateObj = new Date(`${date}T00:00:00+09:00`);
    const dayOfWeek = dateObj.toLocaleDateString("ko-KR", {
      weekday: "long",
      timeZone: "Asia/Seoul",
    });

    const todoItems = hasQ1
      ? await generateTodoListFromQ1(records, date, dayOfWeek, isPro, userId)
      : await generateTodoListGeneric(date, dayOfWeek, isPro, userId);

    if (!todoItems?.length) {
      return NextResponse.json(
        {
          error: hasQ1
            ? "투두 리스트를 생성할 수 없습니다. Q1 내용을 더 구체적으로 작성해주세요."
            : "투두 리스트를 생성할 수 없습니다. 잠시 후 다시 시도해 주세요.",
        },
        { status: 400 }
      );
    }

    // 인사이트/회고에서 직접 추가한 항목(직접 추가)은 보존하고 AI 생성 항목과 병합
    const { data: existingRows } = await supabase
      .from("todo_list_items")
      .select("contents, is_checked, category")
      .eq("daily_vivid_id", dailyVivid.id)
      .is("scheduled_at", null);

    const existingManual =
      existingRows?.length
        ? decryptTodoListItems(existingRows as TodoListItemRow[])
            .filter((r) => (r.category ?? "").trim() === MANUAL_ADD_CATEGORY)
            .map((r) => ({
              contents: r.contents,
              category: r.category,
              is_checked: r.is_checked ?? false,
            }))
        : [];

    const merged = [
      ...existingManual,
      ...todoItems.map((t) => ({ contents: t.contents, category: t.category })),
    ];

    await saveTodoListItems(
      supabase,
      dailyVivid.id,
      userId,
      merged
    );

    const { data: savedItems } = await supabase
      .from("todo_list_items")
      .select("id, contents, is_checked, category, sort_order, scheduled_at")
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
