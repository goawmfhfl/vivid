import type { SupabaseClient } from "@supabase/supabase-js";
import type { DailyReportResponse, Record } from "./types";
import type { DailyVividRow } from "@/types/daily-vivid";
import { decrypt, encrypt } from "@/lib/encryption";
import {
  encryptDailyVivid,
  decryptDailyVivid,
} from "@/lib/jsonb-encryption";

/**
 * 특정 날짜의 기록 조회
 */
export async function fetchRecordsByDate(
  supabase: SupabaseClient,
  userId: string,
  date: string
): Promise<Record[]> {
  const { data: records, error } = await supabase
    .from("vivid_records")
    .select("*")
    .eq("user_id", userId)
    .eq("kst_date", date);

  if (error) {
    throw new Error(`Failed to fetch records: ${error.message}`);
  }

  if (!records || records.length === 0) {
    throw new Error("No records found for this date");
  }

  // 복호화 처리
  return records.map((record) => ({
    ...record,
    content: decrypt(record.content),
  })) as Record[];
}

/**
 * 특정 날짜의 기록 조회 (없으면 빈 배열 반환, 에러 없음)
 */
export async function fetchRecordsByDateOptional(
  supabase: SupabaseClient,
  userId: string,
  date: string
): Promise<Record[]> {
  const { data: records, error } = await supabase
    .from("vivid_records")
    .select("*")
    .eq("user_id", userId)
    .eq("kst_date", date);

  if (error) {
    throw new Error(`Failed to fetch records: ${error.message}`);
  }

  if (!records || records.length === 0) {
    return [];
  }

  return records.map((record) => ({
    ...record,
    content: decrypt(record.content),
  })) as Record[];
}

export type DailyReportGenerationType = "vivid" | "review";

/**
 * 재생성 가능 여부 확인 (기존 레코드 존재 + is_regenerated false)
 */
export async function checkRegenerationEligibility(
  supabase: SupabaseClient,
  userId: string,
  date: string,
  generationType: DailyReportGenerationType
): Promise<{ eligible: boolean; error?: string }> {
  const isVivid = generationType === "vivid";
  const { data: rows, error } = await supabase
    .from("daily_vivid")
    .select("id, is_regenerated")
    .eq("user_id", userId)
    .eq("report_date", date)
    .eq(isVivid ? "is_vivid_ai_generated" : "is_review_ai_generated", true)
    .limit(1);

  if (error) {
    return { eligible: false, error: "기존 피드백 조회 실패" };
  }
  const existing = rows?.[0] ?? null;
  if (!existing) {
    return { eligible: false, error: "재생성할 피드백이 없습니다." };
  }
  if (existing.is_regenerated === true) {
    return { eligible: false, error: "이미 재생성이 완료되었습니다. 1번만 재생성 가능합니다." };
  }
  return { eligible: true };
}

export async function saveDailyReport(
  supabase: SupabaseClient,
  userId: string,
  report: DailyReportResponse,
  generationDurationSeconds?: number,
  generationType: DailyReportGenerationType = "vivid",
  isRegeneration = false
): Promise<DailyVividRow> {
  const isVivid = generationType === "vivid";

  // 해당 (user_id, report_date)에서 현재 generationType에 해당하는 행 조회
  const { data: existingRows, error: checkError } = await supabase
    .from("daily_vivid")
    .select("id, is_regenerated")
    .eq("user_id", userId)
    .eq("report_date", report.date)
    .eq(isVivid ? "is_vivid_ai_generated" : "is_review_ai_generated", true)
    .limit(1);

  if (checkError) {
    throw new Error(`Failed to check existing feedback: ${checkError.message}`);
  }

  const existingData = existingRows?.[0] ?? null;

  // 재생성 요청 시: 기존 레코드 없으면 에러, 이미 재생성됐으면 API에서 검증 (여기선 저장만)
  if (isRegeneration && !existingData) {
    throw new Error("재생성할 피드백이 없습니다.");
  }

  const newReportDataToEncrypt: { [key: string]: unknown } = {
    report: report.report,
    trend: null,
  };

  const encryptedNewReports = encryptDailyVivid(newReportDataToEncrypt);

  const reportData: { [key: string]: unknown } = {
    user_id: userId,
    report_date: report.date,
    day_of_week: report.day_of_week ?? null,
    report: encryptedNewReports.report || null,
    trend: null,
    is_vivid_ai_generated: isVivid,
    is_review_ai_generated: !isVivid,
    generation_duration_seconds: generationDurationSeconds ?? null,
  };

  // 재생성 시 is_regenerated 마크
  if (isRegeneration && existingData) {
    reportData.is_regenerated = true;
  }

  let result;
  if (existingData) {
    const { data: updatedData, error: updateError } = await supabase
      .from("daily_vivid")
      .update(reportData)
      .eq("id", existingData.id)
      .select();

    if (updateError) {
      throw new Error(
        `Failed to update feedback to database: ${updateError.message}`
      );
    }

    if (!updatedData || updatedData.length === 0) {
      throw new Error("Failed to update feedback to database");
    }

    result = updatedData;
  } else {
    const { data: insertedData, error: insertError } = await supabase
      .from("daily_vivid")
      .insert(reportData)
      .select();

    if (insertError) {
      throw new Error(
        `Failed to save feedback to database: ${insertError.message}`
      );
    }

    if (!insertedData || insertedData.length === 0) {
      throw new Error("Failed to save feedback to database");
    }

    result = insertedData;
  }

  // 저장된 레코드 반환
  if (!result || result.length === 0) {
    throw new Error("Failed to save feedback to database");
  }

  // 복호화하여 반환
  const savedRow = result[0] as DailyVividRow;
  const decrypted = decryptDailyVivid(
    savedRow as unknown as { [key: string]: unknown }
  );
  return decrypted as unknown as DailyVividRow;
}

export interface TodoItemToSave {
  contents: string;
  category: string;
}

/**
 * 투두 리스트 항목 저장 (Pro 전용, vivid 생성 시 호출)
 * 기존 항목이 있으면 삭제 후 새로 삽입
 */
export async function saveTodoListItems(
  supabase: SupabaseClient,
  dailyVividId: string,
  userId: string,
  items: TodoItemToSave[]
): Promise<void> {
  if (items.length === 0) return;

  // 기존 todo 항목 삭제
  await supabase
    .from("todo_list_items")
    .delete()
    .eq("daily_vivid_id", dailyVividId);

  const rows = items.map((item, idx) => ({
    daily_vivid_id: dailyVividId,
    user_id: userId,
    contents: encrypt(item.contents),
    is_checked: false,
    category: encrypt(item.category),
    sort_order: idx,
  }));

  const { error } = await supabase.from("todo_list_items").insert(rows);

  if (error) {
    throw new Error(`Failed to save todo list items: ${error.message}`);
  }
}

/**
 * 해당 날짜 vivid의 투두 체크 완료 정보 조회 (회고 생성 시 execution_score 반영용)
 */
export async function fetchTodoCheckSummary(
  supabase: SupabaseClient,
  userId: string,
  date: string
): Promise<{ checked: number; total: number } | null> {
  const { data: dv } = await supabase
    .from("daily_vivid")
    .select("id")
    .eq("user_id", userId)
    .eq("report_date", date)
    .eq("is_vivid_ai_generated", true)
    .maybeSingle();

  if (!dv?.id) return null;

  const { data: items } = await supabase
    .from("todo_list_items")
    .select("is_checked")
    .eq("daily_vivid_id", dv.id);

  if (!items?.length) return null;

  const checked = items.filter((i) => i.is_checked === true).length;
  return { checked, total: items.length };
}

export interface TodoListItemRow {
  id: string;
  contents: string;
  is_checked: boolean;
  category: string;
}

/**
 * todo_list_items의 contents, category 복호화
 */
export function decryptTodoListItems(
  rows: TodoListItemRow[]
): TodoListItemRow[] {
  return rows.map((row) => ({
    ...row,
    contents: decrypt(row.contents),
    category: decrypt(row.category),
  }));
}
