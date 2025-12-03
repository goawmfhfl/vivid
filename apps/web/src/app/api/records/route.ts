import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { getAuthenticatedUserId } from "../utils/auth";
import { encrypt, decrypt } from "@/lib/encryption";
import { API_ENDPOINTS } from "@/constants";

/**
 * GET 핸들러: Records 조회
 */
export async function GET(request: NextRequest) {
  try {
    const authenticatedUserId = await getAuthenticatedUserId(request);
    const supabase = getServiceSupabase();

    // 쿼리 파라미터에서 날짜 범위 가져오기 (선택적)
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query = supabase
      .from(API_ENDPOINTS.RECORDS)
      .select("*")
      .eq("user_id", authenticatedUserId);

    // 날짜 범위 필터링 (있는 경우)
    if (startDate) {
      query = query.gte("kst_date", startDate);
    }
    if (endDate) {
      query = query.lte("kst_date", endDate);
    }

    const { data: records, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      throw new Error(`Failed to fetch records: ${error.message}`);
    }

    // 복호화 처리
    const decryptedRecords = (records || []).map((record) => ({
      ...record,
      content: decrypt(record.content),
    }));

    return NextResponse.json({ data: decryptedRecords }, { status: 200 });
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
 * POST 핸들러: Record 생성
 */
export async function POST(request: NextRequest) {
  try {
    const authenticatedUserId = await getAuthenticatedUserId(request);
    const body = await request.json();
    const { content, type } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "content is required and must be a string" },
        { status: 400 }
      );
    }

    if (!type || typeof type !== "string") {
      return NextResponse.json(
        { error: "type is required and must be a string" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 암호화 처리
    const encryptedContent = encrypt(content);

    const { data: newRecord, error } = await supabase
      .from(API_ENDPOINTS.RECORDS)
      .insert({
        user_id: authenticatedUserId,
        content: encryptedContent,
        type: type,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create record: ${error.message}`);
    }

    // 반환 시 복호화
    const decryptedRecord = {
      ...newRecord,
      content: decrypt(newRecord.content),
    };

    return NextResponse.json({ data: decryptedRecord }, { status: 201 });
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
