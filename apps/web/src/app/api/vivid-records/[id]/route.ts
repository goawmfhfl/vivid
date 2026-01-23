import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
    const { content, type, emotion } = body;

    if (content !== undefined && typeof content !== "string") {
      return NextResponse.json(
        { error: "content must be a string" },
        { status: 400 }
      );
    }

    if (type !== undefined && typeof type !== "string") {
      return NextResponse.json(
        { error: "type must be a string" },
        { status: 400 }
      );
    }

    if (emotion !== undefined) {
      if (!emotion || typeof emotion !== "object") {
        return NextResponse.json(
          { error: "emotion must be an object" },
          { status: 400 }
        );
      }
      if (
        typeof emotion.intensity !== "number" ||
        emotion.intensity < 1 ||
        emotion.intensity > 7
      ) {
        return NextResponse.json(
          { error: "emotion.intensity must be between 1 and 7" },
          { status: 400 }
        );
      }
      if (
        (emotion.keywords && !Array.isArray(emotion.keywords)) ||
        (emotion.factors && !Array.isArray(emotion.factors))
      ) {
        return NextResponse.json(
          { error: "emotion.keywords and emotion.factors must be arrays" },
          { status: 400 }
        );
      }
      if (
        emotion.reasonText !== undefined &&
        emotion.reasonText !== null &&
        typeof emotion.reasonText !== "string"
      ) {
        return NextResponse.json(
          { error: "emotion.reasonText must be a string or null" },
          { status: 400 }
        );
      }
    }

    const supabase = getServiceSupabase();

    // 업데이트 데이터 준비
    const updateData: { content?: string; type?: string } = {};
    if (content !== undefined) {
      // 암호화 처리
      updateData.content = encrypt(content);
    }
    if (type !== undefined) {
      updateData.type = type;
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

    let emotionPayload: {
      intensity: number;
      keywords: string[];
      factors: string[];
      reasonText: string | null;
    } | null = null;

    if (emotion !== undefined) {
      const keywords = Array.isArray(emotion.keywords) ? emotion.keywords : [];
      const factors = Array.isArray(emotion.factors) ? emotion.factors : [];
      const reasonText =
        typeof emotion.reasonText === "string" && emotion.reasonText.trim()
          ? emotion.reasonText.trim()
          : null;

      const { error: emotionError } = await supabase
        .from("emotion_records")
        .upsert(
          {
            record_id: parseInt(id),
            intensity: emotion.intensity,
            keywords,
            factors,
            reason_text: reasonText ? encrypt(reasonText) : null,
          },
          { onConflict: "record_id" }
        );

      if (emotionError) {
        throw new Error(`Failed to update emotion record: ${emotionError.message}`);
      }

      emotionPayload = {
        intensity: emotion.intensity,
        keywords,
        factors,
        reasonText,
      };
    }

    if (!emotionPayload && updatedRecord.type === "emotion") {
      const { data: emotionRecord } = await supabase
        .from("emotion_records")
        .select("*")
        .eq("record_id", parseInt(id))
        .single();

      if (emotionRecord) {
        emotionPayload = {
          intensity: emotionRecord.intensity,
          keywords: emotionRecord.keywords || [],
          factors: emotionRecord.factors || [],
          reasonText: emotionRecord.reason_text
            ? decrypt(emotionRecord.reason_text)
            : null,
        };
      }
    }

    // 반환 시 복호화
    const decryptedRecord = {
      ...updatedRecord,
      content: decrypt(updatedRecord.content),
      emotion: emotionPayload,
    };

    // Records 조회 캐시 무효화
    revalidatePath("/api/vivid-records");

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

    // Records 조회 캐시 무효화
    revalidatePath("/api/vivid-records");

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
