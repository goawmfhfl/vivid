import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";
import { decrypt } from "@/lib/encryption";
import { decryptDailyVivid } from "@/lib/jsonb-encryption";
import type { Report, ReviewReport } from "@/types/daily-vivid";

/** user_metadata.role === "admin" 인 사용자 ID 목록 조회 */
async function getAdminUserIds(
  supabase: ReturnType<typeof getServiceSupabase>
): Promise<Set<string>> {
  const adminIds = new Set<string>();
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const {
      data: { users },
      error,
    } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) {
      console.warn("[Analytics] admin 목록 조회 실패:", error);
      break;
    }
    const admins = users?.filter((u) => u.user_metadata?.role === "admin") ?? [];
    admins.forEach((u) => adminIds.add(u.id));
    hasMore = (users?.length ?? 0) >= 1000;
    page++;
  }
  return adminIds;
}

/**
 * GET /api/admin/analytics/daily-vivid
 * Daily Vivid 사용 패턴 분석 (관리자 전용)
 * - vivid_records, daily_vivid, todo_list_items 집계
 * - 관리자(admin) 데이터 제외
 * - 개인 식별 정보 없이 익명화된 인사이트 반환
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const currentUserId = authResult.userId;

  try {
    const supabase = getServiceSupabase();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "5000", 10),
      10000
    );
    const sampleSize = Math.min(
      parseInt(searchParams.get("sampleSize") || "200", 10),
      500
    );

    // 관리자 + 현재 로그인 사용자 ID (분석에서 제외)
    const adminIds = await getAdminUserIds(supabase);
    adminIds.add(currentUserId);

    // 1. vivid_records 집계 (타입별, 날짜별)
    const { data: records, error: recordsError } = await supabase
      .from("vivid_records")
      .select("id, user_id, type, kst_date, content, created_at")
      .in("type", ["dream", "vivid", "review"])
      .order("created_at", { ascending: false })
      .limit(limit);

    if (recordsError) {
      console.error("[Analytics] vivid_records 조회 실패:", recordsError);
      return NextResponse.json(
        { error: "vivid_records 조회 실패" },
        { status: 500 }
      );
    }

    // 2. daily_vivid 집계 (타입별, report 메타데이터)
    const { data: dailyRows, error: dailyError } = await supabase
      .from("daily_vivid")
      .select("id, user_id, report_date, type, report, created_at")
      .order("report_date", { ascending: false })
      .limit(limit);

    if (dailyError) {
      console.error("[Analytics] daily_vivid 조회 실패:", dailyError);
      return NextResponse.json(
        { error: "daily_vivid 조회 실패" },
        { status: 500 }
      );
    }

    // 3. todo_list_items 집계
    const { data: todoRows, error: todoError } = await supabase
      .from("todo_list_items")
      .select("id, daily_vivid_id, is_checked, scheduled_at");

    if (todoError) {
      console.warn("[Analytics] todo_list_items 조회 실패 (무시):", todoError);
    }

    // 관리자 데이터 제외
    const recordsList = (records || []).filter((r) => !adminIds.has(r.user_id));
    const dailyListRaw = dailyRows || [];
    const dailyList = dailyListRaw.filter((r) => !adminIds.has(r.user_id));
    const nonAdminDailyIds = new Set(dailyList.map((r) => r.id));
    const todoListRaw = todoRows || [];
    const todoList = todoListRaw.filter(
      (t) => t.daily_vivid_id && nonAdminDailyIds.has(t.daily_vivid_id)
    );

    // === vivid_records 분석 ===
    const typeCount: Record<string, number> = {};
    const userRecordCount: Record<string, number> = {};
    const userDates: Record<string, Set<string>> = {};
    const q1OnlyCount: number[] = [];
    const q2OnlyCount: number[] = [];
    const bothQ1Q2Count: number[] = [];
    const q3Count: number[] = [];
    const contentLengthSamples: number[] = [];

    for (const r of recordsList) {
      typeCount[r.type] = (typeCount[r.type] || 0) + 1;
      userRecordCount[r.user_id] = (userRecordCount[r.user_id] || 0) + 1;
      if (!userDates[r.user_id]) userDates[r.user_id] = new Set();
      userDates[r.user_id].add(r.kst_date);

      // 샘플링: content 길이 (복호화 필요)
      if (contentLengthSamples.length < sampleSize && r.content) {
        try {
          const dec = decrypt(r.content);
          contentLengthSamples.push(dec?.length || 0);

          const hasQ1 = /Q1\.\s*오늘 하루를 어떻게 보낼까\?/i.test(dec || "");
          const hasQ2 = /Q2\.\s*앞으로의 나는 어떤 모습일까\?/i.test(dec || "");
          const hasQ3 = /Q3\.\s*오늘의 나는 어떤 하루를 보냈을까\?/i.test(dec || "");

          if (r.type === "dream" || r.type === "vivid") {
            if (hasQ1 && hasQ2) bothQ1Q2Count.push(1);
            else if (hasQ1) q1OnlyCount.push(1);
            else if (hasQ2) q2OnlyCount.push(1);
          }
          if (r.type === "review" && hasQ3) q3Count.push(1);
        } catch {
          // 복호화 실패 시 스킵
        }
      }
    }

    // === daily_vivid 분석 ===
    const dailyTypeCount: Record<string, number> = {};
    const alignmentScores: number[] = [];
    const userDailyCount: Record<string, number> = {};
    const keywordSamples: string[] = [];
    const aspiredTraitsSamples: string[] = [];

    for (const row of dailyList) {
      const type = (row as { type?: string }).type || "vivid";
      dailyTypeCount[type] = (dailyTypeCount[type] || 0) + 1;
      userDailyCount[row.user_id] = (userDailyCount[row.user_id] || 0) + 1;

      try {
        const decrypted = decryptDailyVivid(
          row as unknown as Record<string, unknown>
        );
        const report = decrypted?.report as Report | ReviewReport | null;
        if (report && typeof report === "object") {
          const score = (report as Report).alignment_score;
          if (typeof score === "number" && Number.isFinite(score)) {
            alignmentScores.push(score);
          }
          const kw = (report as Report).current_keywords;
          if (Array.isArray(kw) && keywordSamples.length < 100) {
            keywordSamples.push(...kw.slice(0, 2));
          }
          const at = (report as Report).aspired_traits;
          if (Array.isArray(at) && aspiredTraitsSamples.length < 100) {
            aspiredTraitsSamples.push(...at.slice(0, 2));
          }
        }
      } catch {
        // 복호화 실패 시 스킵
      }
    }

    // === todo_list_items 분석 ===
    const todoChecked = todoList.filter((t) => t.is_checked === true).length;
    const todoTotal = todoList.length;
    const todoWithScheduled = todoList.filter((t) => t.scheduled_at).length;

    // === 유저별 연속 기록일/빈도 ===
    const continuityByUser: number[] = [];
    for (const [_, dates] of Object.entries(userDates)) {
      const sorted = Array.from(dates).sort();
      if (sorted.length < 2) continue;
      let maxStreak = 1;
      let streak = 1;
      for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i - 1]).getTime();
        const curr = new Date(sorted[i]).getTime();
        const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
        if (diffDays === 1) {
          streak++;
        } else {
          maxStreak = Math.max(maxStreak, streak);
          streak = 1;
        }
      }
      maxStreak = Math.max(maxStreak, streak);
      continuityByUser.push(maxStreak);
    }

    const avgContentLength =
      contentLengthSamples.length > 0
        ? Math.round(
            contentLengthSamples.reduce((a, b) => a + b, 0) /
              contentLengthSamples.length
          )
        : 0;
    const avgAlignment =
      alignmentScores.length > 0
        ? Math.round(
            (alignmentScores.reduce((a, b) => a + b, 0) / alignmentScores.length) *
              10
          ) / 10
        : null;
    const avgRecordsPerUser =
      Object.keys(userRecordCount).length > 0
        ? Math.round(
            (recordsList.length / Object.keys(userRecordCount).length) * 10
          ) / 10
        : 0;
    const avgDailyPerUser =
      Object.keys(userDailyCount).length > 0
        ? Math.round(
            (dailyList.length / Object.keys(userDailyCount).length) * 10
          ) / 10
        : 0;
    const avgMaxStreak =
      continuityByUser.length > 0
        ? Math.round(
            (continuityByUser.reduce((a, b) => a + b, 0) /
              continuityByUser.length) *
              10
          ) / 10
        : 0;

    return NextResponse.json({
      summary: {
        totalRecords: recordsList.length,
        totalDailyVivid: dailyList.length,
        totalTodoItems: todoTotal,
        uniqueUsersWithRecords: Object.keys(userRecordCount).length,
        uniqueUsersWithDaily: Object.keys(userDailyCount).length,
      },
      recordTypeDistribution: typeCount,
      dailyTypeDistribution: dailyTypeCount,
      q1Q2Usage: {
        bothQ1Q2: bothQ1Q2Count.length,
        q1Only: q1OnlyCount.length,
        q2Only: q2OnlyCount.length,
        q3Count: q3Count.length,
        sampleSize: contentLengthSamples.length,
      },
      metrics: {
        avgContentLength,
        avgAlignmentScore: avgAlignment,
        avgRecordsPerUser,
        avgDailyPerUser,
        avgMaxStreakDays: avgMaxStreak,
      },
      todoUsage: {
        total: todoTotal,
        checked: todoChecked,
        completionRate:
          todoTotal > 0 ? Math.round((todoChecked / todoTotal) * 1000) / 10 : 0,
        withScheduled: todoWithScheduled,
      },
      keywordSample: keywordSamples.slice(0, 30),
      aspiredTraitsSample: aspiredTraitsSamples.slice(0, 30),
    });
  } catch (error) {
    console.error("[Analytics] daily-vivid 분석 실패:", error);
    return NextResponse.json(
      { error: "분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
