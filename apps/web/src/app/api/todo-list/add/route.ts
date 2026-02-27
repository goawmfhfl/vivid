import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { decryptTodoListItems } from "@/app/api/daily-vivid/db-service";
import { encryptDailyVivid } from "@/lib/jsonb-encryption";
import { encrypt } from "@/lib/encryption";
import { API_ENDPOINTS } from "@/constants";

const DEFAULT_CATEGORY = "직접 추가";

/**
 * 해당 날짜의 daily_vivid 조회. 없으면 minimal daily_vivid 생성 후 반환.
 * (예정된 할 일에 수동 추가 시 vivid가 없는 날짜도 지원)
 */
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
 * POST: 투두 항목 수동 추가 (Pro 전용)
 * Body: { userId: string, date: string, contents: string, category?: string }
 * vivid가 없는 날짜(예정된 할 일)에도 추가 가능 - minimal daily_vivid 자동 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, date, contents, category } = body as {
      userId?: string;
      date?: string;
      contents?: string;
      category?: string;
    };

    if (!userId || !date) {
      return NextResponse.json(
        { error: "userId and date are required" },
        { status: 400 }
      );
    }

    const trimmedContents = typeof contents === "string" ? contents.trim() : "";
    if (!trimmedContents) {
      return NextResponse.json(
        { error: "contents is required and cannot be empty" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();
    const dailyVivid = await getOrCreateDailyVividForDate(supabase, userId, date);

    // 해당 daily_vivid의 최대 sort_order 조회
    const { data: existingItems } = await supabase
      .from("todo_list_items")
      .select("sort_order")
      .eq("daily_vivid_id", dailyVivid.id)
      .order("sort_order", { ascending: false })
      .limit(1);

    const nextSortOrder =
      existingItems?.length && existingItems[0]?.sort_order != null
        ? existingItems[0].sort_order + 1
        : 0;

    const { data: newItem, error } = await supabase
      .from("todo_list_items")
      .insert({
        daily_vivid_id: dailyVivid.id,
        user_id: userId,
        contents: encrypt(trimmedContents),
        is_checked: false,
        category: encrypt(category?.trim() || DEFAULT_CATEGORY),
        sort_order: nextSortOrder,
      })
      .select("id, contents, is_checked, category, sort_order, scheduled_at")
      .single();

    if (error) {
      throw new Error(`Failed to add todo: ${error.message}`);
    }

    const decrypted = decryptTodoListItems([newItem])[0];
    return NextResponse.json(
      {
        data: {
          ...decrypted,
          sort_order: newItem.sort_order,
          scheduled_at: newItem.scheduled_at,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Todo add error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
