import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";
import { decryptDailyVivid, encryptDailyVivid } from "@/lib/jsonb-encryption";
import { API_ENDPOINTS } from "@/constants";
import type { DailyVividRow, Report, ReviewReport } from "@/types/daily-vivid";
import { isVividReport } from "@/types/daily-vivid";

function getDayOfWeek(dateStr: string): string {
  const dateObj = new Date(`${dateStr}T00:00:00+09:00`);
  return dateObj.toLocaleDateString("ko-KR", {
    weekday: "long",
    timeZone: "Asia/Seoul",
  });
}

function isValidScore(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * POST: vivid report의 execution_score를 type=review 행으로 마이그레이션
 * 관리자 인증 필요
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json().catch(() => ({}));
    const {
      userId,
      dryRun = true,
      batchSize = 100,
    }: { userId?: string; dryRun?: boolean; batchSize?: number } = body;

    const supabase = getServiceSupabase();

    let query = supabase
      .from(API_ENDPOINTS.DAILY_VIVID)
      .select("id, user_id, report_date, day_of_week, report, type")
      .eq("type", "vivid")
      .order("report_date", { ascending: false })
      .limit(batchSize * 2);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: vividRows, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`조회 실패: ${fetchError.message}`);
    }

    if (!vividRows?.length) {
      return NextResponse.json({
        message: "마이그레이션할 vivid 행이 없습니다.",
        stats: { processed: 0, created: 0, skipped: 0, errors: 0 },
      });
    }

    const toMigrate: Array<{
      id: string;
      user_id: string;
      report_date: string;
      day_of_week: string | null;
      report: Report;
    }> = [];

    for (const row of vividRows) {
      const decrypted = decryptDailyVivid(
        row as unknown as Record<string, unknown>
      ) as unknown as DailyVividRow;
      const report = decrypted?.report;
      if (
        report &&
        isVividReport(report) &&
        "execution_score" in report &&
        isValidScore(report.execution_score)
      ) {
        toMigrate.push({
          id: row.id,
          user_id: row.user_id,
          report_date: row.report_date,
          day_of_week: row.day_of_week ?? null,
          report: report as Report,
        });
      }
    }

    if (toMigrate.length === 0) {
      return NextResponse.json({
        message: "execution_score가 있는 vivid 행이 없습니다.",
        stats: { processed: 0, created: 0, skipped: 0, errors: 0 },
      });
    }

    const stats = { processed: 0, created: 0, skipped: 0, errors: 0 };
    const errors: Array<{ user_id: string; report_date: string; error: string }> = [];

    for (const item of toMigrate) {
      stats.processed++;

      const { data: existingReview } = await supabase
        .from(API_ENDPOINTS.DAILY_VIVID)
        .select("id")
        .eq("user_id", item.user_id)
        .eq("report_date", item.report_date)
        .eq("type", "review")
        .maybeSingle();

      if (existingReview?.id) {
        stats.skipped++;
        continue;
      }

      if (dryRun) {
        stats.created++;
        continue;
      }

      try {
        const r = item.report as unknown as { retrospective_summary?: string; retrospective_evaluation?: string };
        const reviewReport: ReviewReport = {
          retrospective_summary: r.retrospective_summary ?? "",
          retrospective_evaluation: r.retrospective_evaluation ?? "",
          completed_todos: [],
          uncompleted_todos: [],
          todo_feedback: [],
        };

        const encrypted = encryptDailyVivid({ report: reviewReport });

        const { error: insertError } = await supabase
          .from(API_ENDPOINTS.DAILY_VIVID)
          .insert({
            user_id: item.user_id,
            report_date: item.report_date,
            day_of_week: item.day_of_week ?? getDayOfWeek(item.report_date),
            report: encrypted.report,
            type: "review",
          });

        if (insertError) throw new Error(insertError.message);
        stats.created++;
      } catch (err) {
        stats.errors++;
        errors.push({
          user_id: item.user_id,
          report_date: item.report_date,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return NextResponse.json({
      message: dryRun
        ? `[DRY RUN] ${stats.created}개 review 행 생성 예정`
        : `${stats.created}개 review 행 생성 완료`,
      stats: {
        processed: stats.processed,
        created: stats.created,
        skipped: stats.skipped,
        errors: stats.errors,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("migrate-execution-score error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "마이그레이션 실패", details: msg },
      { status: 500 }
    );
  }
}
