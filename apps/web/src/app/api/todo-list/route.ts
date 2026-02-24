import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { decryptTodoListItems } from "@/app/api/daily-vivid/db-service";
import { encrypt } from "@/lib/encryption";

/**
 * PATCH: 투두 항목 업데이트 (체크, 내용, 일정)
 * Body: { id: string, userId: string, is_checked?: boolean, contents?: string, scheduled_at?: string | null }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, is_checked, contents, scheduled_at, userId } = body as {
      id?: string;
      is_checked?: boolean;
      contents?: string;
      scheduled_at?: string | null;
      userId?: string;
    };

    if (!id || !userId) {
      return NextResponse.json(
        { error: "id and userId are required" },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (typeof is_checked === "boolean") updates.is_checked = is_checked;
    if (typeof contents === "string") updates.contents = encrypt(contents);
    if (scheduled_at === null || (typeof scheduled_at === "string" && scheduled_at !== "")) {
      updates.scheduled_at = scheduled_at ?? null;
    }

    const supabase = getServiceSupabase();

    const { data: updatedData, error } = await supabase
      .from("todo_list_items")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId)
      .select("id, contents, is_checked, category, sort_order, scheduled_at");

    if (error) {
      throw new Error(`Failed to update todo: ${error.message}`);
    }

    if (!updatedData || updatedData.length === 0) {
      return NextResponse.json(
        { error: "Todo item not found or access denied" },
        { status: 404 }
      );
    }

    const data = updatedData[0];
    const decrypted = decryptTodoListItems([data])[0];
    return NextResponse.json(
      { data: { ...decrypted, sort_order: data.sort_order, scheduled_at: data.scheduled_at } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Todo PATCH error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE: 투두 항목 삭제
 * Body: { id: string, userId: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, userId } = body as { id?: string; userId?: string };

    if (!id || !userId) {
      return NextResponse.json(
        { error: "id and userId are required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { error } = await supabase
      .from("todo_list_items")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to delete todo: ${error.message}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Todo DELETE error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
