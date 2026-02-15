import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { decryptTodoListItems } from "@/app/api/daily-vivid/db-service";

/**
 * PATCH: 투두 항목 체크 상태 토글
 * Body: { id: string, is_checked: boolean, userId: string }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, is_checked, userId } = body as {
      id?: string;
      is_checked?: boolean;
      userId?: string;
    };

    if (!id || typeof is_checked !== "boolean" || !userId) {
      return NextResponse.json(
        { error: "id, is_checked, and userId are required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from("todo_list_items")
      .update({
        is_checked,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select("id, contents, is_checked, category")
      .single();

    if (error) {
      throw new Error(`Failed to update todo: ${error.message}`);
    }

    if (!data) {
      return NextResponse.json(
        { error: "Todo item not found or access denied" },
        { status: 404 }
      );
    }

    const decrypted = decryptTodoListItems([data])[0];
    return NextResponse.json({ data: decrypted }, { status: 200 });
  } catch (error) {
    console.error("Todo PATCH error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
