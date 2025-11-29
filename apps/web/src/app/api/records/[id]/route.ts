import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { getAuthenticatedUserId } from "../../utils/auth";
import { encrypt, decrypt } from "@/lib/encryption";
import { API_ENDPOINTS } from "@/constants";

/**
 * PATCH 핸들러: Record 수정
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticatedUserId = await getAuthenticatedUserId(request);
    const { id } = await params;
    const body = await request.json();
    const { content } = body;

    if (content !== undefined && typeof content !== "string") {
      return NextResponse.json(
        { error: "content must be a string" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 업데이트 데이터 준비
    const updateData: { content?: string } = {};
    if (content !== undefined) {
      // 암호화 처리
      updateData.content = encrypt(content);
    }

    const { data: updatedRecord, error } = await supabase
      .from(API_ENDPOINTS.RECORDS)
      .update(updateData)
      .eq("id", parseInt(id))
      .eq("user_id", authenticatedUserId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update record: ${error.message}`);
    }

    if (!updatedRecord) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // 반환 시 복호화
    const decryptedRecord = {
      ...updatedRecord,
      content: decrypt(updatedRecord.content),
    };

    return NextResponse.json({ data: decryptedRecord }, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("Unauthorized")) {
      return NextResponse.json({ error: errorMessage }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE 핸들러: Record 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticatedUserId = await getAuthenticatedUserId(request);
    const { id } = await params;

    const supabase = getServiceSupabase();

    const { error } = await supabase
      .from(API_ENDPOINTS.RECORDS)
      .delete()
      .eq("id", parseInt(id))
      .eq("user_id", authenticatedUserId);

    if (error) {
      throw new Error(`Failed to delete record: ${error.message}`);
    }

    return NextResponse.json(
      { message: "Record deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("Unauthorized")) {
      return NextResponse.json({ error: errorMessage }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
