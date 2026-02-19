import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { decryptDailyVivid } from "@/lib/jsonb-encryption";
import { decryptTodoListItems } from "../db-service";
import type { DailyVividRow } from "@/types/daily-vivid";
import type { TodoListItem } from "@/types/daily-vivid";
import { API_ENDPOINTS } from "@/constants";
// 날짜별 조회는 버튼 라벨(보기/생성하기)에 직결되므로 항상 최신 상태 필요 → 캐시 비활성화
const BY_DATE_NO_CACHE = "private, max-age=0, must-revalidate";

const MANUAL_ADD_CATEGORY = "직접 추가";

/**
 * 날짜 X의 "오늘의 할 일" 조회
 * (A) 해당 날짜 vivid에 연결된 todo (scheduled_at null) - 네이티브
 * (B) scheduled_at = X 인 todo (다른 날짜에서 미룬 것) - 스케줄된 항목
 * (C) 해당 날짜 vivid에서 미룬 항목 (scheduled_at 있음) - 오늘 목록에 유지, "N일 후 진행 예정" 표시
 * @returns { todoLists, hasNativeTodoList } - hasNativeTodoList: "오늘의 할 일 생성하기"로 AI 생성된 항목 존재 여부 (직접 추가 제외)
 */
async function fetchTodoListsForDate(
  supabase: ReturnType<typeof getServiceSupabase>,
  userId: string,
  date: string,
  dailyVividId: string | null
): Promise<{ todoLists: TodoListItem[]; hasNativeTodoList: boolean }> {
  const nativeItems: TodoListItem[] = [];
  const scheduledItems: TodoListItem[] = [];
  const postponedItems: TodoListItem[] = [];

  // (A) 해당 날짜 vivid의 원래 할 일 (scheduled_at null)
  if (dailyVividId) {
    const { data: nativeRows } = await supabase
      .from("todo_list_items")
      .select("id, contents, is_checked, category, sort_order, scheduled_at")
      .eq("daily_vivid_id", dailyVividId)
      .is("scheduled_at", null)
      .order("sort_order", { ascending: true });
    if (nativeRows?.length) {
      nativeItems.push(
        ...(decryptTodoListItems(nativeRows) as TodoListItem[])
      );
    }

    // (C) 해당 날짜 vivid에서 미룬 항목 (오늘 목록에 유지, "N일 후 진행 예정" 표시)
    const { data: postponedRows } = await supabase
      .from("todo_list_items")
      .select("id, contents, is_checked, category, sort_order, scheduled_at")
      .eq("daily_vivid_id", dailyVividId)
      .not("scheduled_at", "is", null)
      .order("sort_order", { ascending: true });
    if (postponedRows?.length) {
      postponedItems.push(
        ...(decryptTodoListItems(postponedRows) as TodoListItem[])
      );
    }
  }

  // (B) 이 날짜로 미룬 할 일 (다른 날짜 vivid에서 온 것)
  const { data: scheduledRows } = await supabase
    .from("todo_list_items")
    .select("id, contents, is_checked, category, sort_order, scheduled_at")
    .eq("user_id", userId)
    .eq("scheduled_at", date)
    .order("sort_order", { ascending: true });
  if (scheduledRows?.length) {
    scheduledItems.push(
      ...(decryptTodoListItems(scheduledRows) as TodoListItem[])
    );
  }

  // 순서 변경 시 sort_order로 전체 정렬 (예정된 스케줄 포함 그룹 간 순서 변경 지원)
  const merged = [...nativeItems, ...postponedItems, ...scheduledItems];
  const todoLists = merged.sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );
  // "오늘의 할 일 생성하기"로 AI 생성된 항목만 카운트 (직접 추가/예정된 할 일은 제외)
  const hasNativeTodoList = nativeItems.some(
    (item) => (item.category ?? "").trim() !== MANUAL_ADD_CATEGORY
  );
  return { todoLists, hasNativeTodoList };
}

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

    const isVivid = generationType === "vivid";
    const { data: rows, error } = await supabase
      .from(API_ENDPOINTS.DAILY_VIVID)
      .select("*")
      .eq("user_id", userId)
      .eq("report_date", date)
      .eq(isVivid ? "is_vivid_ai_generated" : "is_review_ai_generated", true)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      throw new Error(`Failed to fetch daily vivid: ${error.message}`);
    }

    const data = rows?.[0] ?? null;

    // vivid가 없어도 todoLists(스케줄된 항목) 조회
    const { todoLists, hasNativeTodoList } = await fetchTodoListsForDate(
      supabase,
      userId,
      date,
      data?.id ?? null
    );

    if (!data) {
      return NextResponse.json(
        {
          data: null,
          todoLists: todoLists,
          hasNativeTodoList: false, // vivid 없으면 네이티브 항목 없음
        },
        {
          status: 200,
          headers: { "Cache-Control": BY_DATE_NO_CACHE },
        }
      );
    }

    // 서버 사이드에서 복호화 처리
    const decrypted = decryptDailyVivid(
      data as unknown as { [key: string]: unknown }
    ) as unknown as DailyVividRow;

    // report가 null이면 minimal vivid(투두 전용) → 실제 비비드 없음으로 처리
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
