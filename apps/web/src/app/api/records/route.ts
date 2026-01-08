import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServiceSupabase } from "@/lib/supabase-service";
import { getAuthenticatedUserId } from "../utils/auth";
import { encrypt, decrypt } from "@/lib/encryption";
import { API_ENDPOINTS } from "@/constants";
import { getKSTDateString } from "@/lib/date-utils";
import {
  RECORDS_REVALIDATE,
  getCacheControlHeader,
} from "@/constants/cache";

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

    return NextResponse.json(
      { data: decryptedRecords },
      {
        status: 200,
        headers: {
          "Cache-Control": getCacheControlHeader(RECORDS_REVALIDATE),
        },
      }
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

    const targetKstDate = kst_date || getKSTDateString();
    const todayKstDate = getKSTDateString();

    // targetKstDate가 미래인 경우 생성 차단
    if (targetKstDate > todayKstDate) {
      return NextResponse.json(
        { error: "미래 날짜에는 기록을 생성할 수 없습니다." },
        { status: 400 }
      );
    }

    const [year, month, day] = targetKstDate.split("-").map(Number);

    // created_at 계산: UTC로 저장해야 함
    // 오늘: 현재 UTC 시간 그대로 사용
    // 과거: 해당 날짜 23:59:59 KST를 UTC로 변환 (KST 23:59:59 = UTC 14:59:59)
    let createdAtUtc: Date;
    if (targetKstDate === todayKstDate) {
      // 오늘인 경우: 현재 UTC 시간 사용
      createdAtUtc = new Date();
    } else {
      // 과거 날짜인 경우: KST 23:59:59를 UTC로 변환
      // KST 23:59:59 = UTC 14:59:59 (9시간 차이)
      createdAtUtc = new Date(Date.UTC(year, month - 1, day, 14, 59, 59));
    }

    // kst_date를 제외하고 삽입 (데이터베이스가 자동 생성)
    const { data: newRecord, error } = await supabase
      .from(API_ENDPOINTS.RECORDS)
      .insert({
        user_id: authenticatedUserId,
        content: encryptedContent,
        type: type,
        created_at: createdAtUtc.toISOString(),
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

    // Records 조회 캐시 무효화
    revalidatePath("/api/records");

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
