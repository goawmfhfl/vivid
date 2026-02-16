import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";

/**
 * POST: 투두 항목 순서 변경
 * Body: { itemIds: string[], userId: string }
 * itemIds는 새 순서대로 정렬된 id 배열
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemIds, userId } = body as {
      itemIds?: string[];
      userId?: string;
    };

    if (!Array.isArray(itemIds) || itemIds.length === 0 || !userId) {
      return NextResponse.json(
        { error: "itemIds (non-empty array) and userId are required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 각 id에 대해 sort_order 업데이트 (배치)
    const updates = itemIds.map((id, index) =>
      supabase
        .from("todo_list_items")
        .update({ sort_order: index, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", userId)
    );

    const results = await Promise.all(updates);
    const hasError = results.some((r) => r.error);
    if (hasError) {
      const firstError = results.find((r) => r.error);
      throw new Error(
        `Failed to reorder todos: ${firstError?.error?.message ?? "Unknown error"}`
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Todo reorder error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
