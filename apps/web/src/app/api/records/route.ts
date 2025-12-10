import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { getAuthenticatedUserId } from "../utils/auth";
import { encrypt, decrypt } from "@/lib/encryption";
import { API_ENDPOINTS } from "@/constants";
import { getKSTDateString } from "@/lib/date-utils";

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
    const { content, type, kst_date } = body;

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

    // kst_date는 데이터베이스에서 자동 생성되는 컬럼이므로 직접 삽입하지 않음
    // 대신 created_at을 조작하여 원하는 날짜로 설정
    // kst_date가 제공된 경우, 해당 날짜의 KST 정오로 created_at 설정
    const targetKstDate = kst_date || getKSTDateString();

    // kst_date를 기반으로 created_at 계산 (KST 기준)
    // targetKstDate가 "2025-12-09" 형식이면, 이를 KST 시간대로 변환
    const [year, month, day] = targetKstDate.split("-").map(Number);
    // KST 기준으로 해당 날짜의 정오(12:00)로 설정
    // KST는 UTC+9이므로, UTC로는 03:00이 되어야 KST 12:00
    const kstDateTime = new Date(Date.UTC(year, month - 1, day, 3, 0, 0));

    // kst_date를 제외하고 삽입 (데이터베이스가 자동 생성)
    const { data: newRecord, error } = await supabase
      .from(API_ENDPOINTS.RECORDS)
      .insert({
        user_id: authenticatedUserId,
        content: encryptedContent,
        type: type,
        created_at: kstDateTime.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create record: ${error.message}`);
    }

    // 생성된 레코드의 kst_date가 원하는 날짜와 일치하는지 확인
    // 일치하지 않으면 업데이트 시도 (단, kst_date가 업데이트 가능한 경우에만)
    if (kst_date && newRecord.kst_date !== kst_date) {
      // kst_date가 자동 생성 컬럼이 아닌 경우에만 업데이트 시도
      // 실패해도 무시 (자동 생성 컬럼이면 업데이트 불가)
      try {
        const { data: updatedRecord } = await supabase
          .from(API_ENDPOINTS.RECORDS)
          .update({ kst_date: kst_date })
          .eq("id", newRecord.id)
          .select()
          .single();

        if (updatedRecord) {
          newRecord.kst_date = updatedRecord.kst_date;
        }
      } catch (updateError) {
        // 업데이트 실패는 무시 (kst_date가 자동 생성 컬럼일 수 있음)
        console.log(
          "kst_date 업데이트 실패 (자동 생성 컬럼일 수 있음):",
          updateError
        );
      }
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
