import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import {
  encryptJsonbFields,
  encryptDailyFeedback,
} from "@/lib/jsonb-encryption";
import { isEncrypted } from "@/lib/encryption";
import { API_ENDPOINTS } from "@/constants";

// JSONB 값의 가능한 타입
type JsonbValue =
  | string
  | number
  | boolean
  | null
  | JsonbValue[]
  | { [key: string]: JsonbValue };

/**
 * JSONB 필드가 암호화되어 있는지 확인하는 헬퍼 함수
 */
function isJsonbEncrypted(obj: JsonbValue): boolean {
  if (obj === null || obj === undefined) {
    return false;
  }

  if (typeof obj === "string") {
    return isEncrypted(obj);
  }

  if (Array.isArray(obj)) {
    return obj.some((item) => isJsonbEncrypted(item));
  }

  if (typeof obj === "object") {
    return Object.values(obj).some((value) => isJsonbEncrypted(value));
  }

  return false;
}

/**
 * POST 핸들러: 기존 Weekly/Monthly Feedback 데이터 암호화 마이그레이션
 *
 * 개발/테스트 환경에서만 사용 가능
 */
export async function POST(request: NextRequest) {
  // 개발 환경 체크
  const isDevelopment =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_NODE_ENV === "development";

  if (!isDevelopment) {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const {
      userId,
      tableType, // "daily" | "weekly" | "monthly" | "both" | "all"
      batchSize = 50,
      dryRun = false,
    }: {
      userId?: string;
      tableType?: "daily" | "weekly" | "monthly" | "both" | "all";
      batchSize?: number;
      dryRun?: boolean;
    } = body;

    const supabase = getServiceSupabase();

    // 통계 정보
    const stats = {
      daily: {
        totalProcessed: 0,
        totalEncrypted: 0,
        totalSkipped: 0,
        totalErrors: 0,
      },
      weekly: {
        totalProcessed: 0,
        totalEncrypted: 0,
        totalSkipped: 0,
        totalErrors: 0,
      },
      monthly: {
        totalProcessed: 0,
        totalEncrypted: 0,
        totalSkipped: 0,
        totalErrors: 0,
      },
    };

    const errors: Array<{
      table: string;
      id: string;
      error: string;
    }> = [];

    // Daily Feedback 마이그레이션
    if (
      tableType === "daily" ||
      tableType === "all" ||
      (!tableType &&
        tableType !== "weekly" &&
        tableType !== "monthly" &&
        tableType !== "both")
    ) {
      let offset = 0;
      let hasMore = true;
      let query = supabase
        .from(API_ENDPOINTS.DAILY_FEEDBACK)
        .select(
          "id, emotion_overview, narrative_overview, insight_overview, vision_overview, feedback_overview, meta_overview, user_id"
        );

      if (userId) {
        query = query.eq("user_id", userId);
      }

      while (hasMore) {
        const { data: feedbacks, error: fetchError } = await query
          .range(offset, offset + batchSize - 1)
          .order("id", { ascending: true });

        if (fetchError) {
          throw new Error(
            `Failed to fetch daily feedbacks: ${fetchError.message}`
          );
        }

        if (!feedbacks || feedbacks.length === 0) {
          hasMore = false;
          break;
        }

        for (const feedback of feedbacks) {
          stats.daily.totalProcessed++;

          try {
            // 이미 암호화된 데이터인지 확인
            const isAlreadyEncrypted =
              isJsonbEncrypted(feedback.emotion_overview) ||
              isJsonbEncrypted(feedback.narrative_overview) ||
              isJsonbEncrypted(feedback.insight_overview) ||
              isJsonbEncrypted(feedback.vision_overview) ||
              isJsonbEncrypted(feedback.feedback_overview) ||
              isJsonbEncrypted(feedback.meta_overview);

            if (isAlreadyEncrypted) {
              stats.daily.totalSkipped++;
              continue;
            }

            // Dry run 모드면 실제 업데이트하지 않음
            if (dryRun) {
              stats.daily.totalEncrypted++;
              continue;
            }

            // 암호화
            const encryptedData = encryptDailyFeedback({
              emotion_overview: feedback.emotion_overview,
              narrative_overview: feedback.narrative_overview,
              insight_overview: feedback.insight_overview,
              vision_overview: feedback.vision_overview,
              feedback_overview: feedback.feedback_overview,
              meta_overview: feedback.meta_overview,
            });

            // 업데이트
            const { error: updateError } = await supabase
              .from(API_ENDPOINTS.DAILY_FEEDBACK)
              .update(encryptedData)
              .eq("id", feedback.id);

            if (updateError) {
              throw new Error(updateError.message);
            }

            stats.daily.totalEncrypted++;
          } catch (error) {
            stats.daily.totalErrors++;
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            errors.push({
              table: "daily_feedback",
              id: String(feedback.id),
              error: errorMessage,
            });
            console.error(
              `Error encrypting daily feedback ${feedback.id}:`,
              error
            );
          }
        }

        offset += batchSize;
        hasMore = feedbacks.length === batchSize;
      }
    }

    // Weekly Feedback 마이그레이션
    if (
      tableType === "weekly" ||
      tableType === "both" ||
      tableType === "all" ||
      !tableType
    ) {
      let offset = 0;
      let hasMore = true;
      let query = supabase
        .from(API_ENDPOINTS.WEEKLY_FEEDBACKS)
        .select(
          "id, weekly_overview, emotion_overview, growth_trends, insight_replay, vision_visualization_report, execution_reflection, closing_section, user_id"
        );

      if (userId) {
        query = query.eq("user_id", userId);
      }

      while (hasMore) {
        const { data: feedbacks, error: fetchError } = await query
          .range(offset, offset + batchSize - 1)
          .order("id", { ascending: true });

        if (fetchError) {
          throw new Error(
            `Failed to fetch weekly feedbacks: ${fetchError.message}`
          );
        }

        if (!feedbacks || feedbacks.length === 0) {
          hasMore = false;
          break;
        }

        for (const feedback of feedbacks) {
          stats.weekly.totalProcessed++;

          try {
            // 이미 암호화된 데이터인지 확인
            const isAlreadyEncrypted =
              isJsonbEncrypted(feedback.weekly_overview) ||
              isJsonbEncrypted(feedback.emotion_overview) ||
              isJsonbEncrypted(feedback.growth_trends) ||
              isJsonbEncrypted(feedback.insight_replay) ||
              isJsonbEncrypted(feedback.vision_visualization_report) ||
              isJsonbEncrypted(feedback.execution_reflection) ||
              isJsonbEncrypted(feedback.closing_section);

            if (isAlreadyEncrypted) {
              stats.weekly.totalSkipped++;
              continue;
            }

            // Dry run 모드면 실제 업데이트하지 않음
            if (dryRun) {
              stats.weekly.totalEncrypted++;
              continue;
            }

            // 암호화
            const encryptedData = {
              weekly_overview: encryptJsonbFields(feedback.weekly_overview),
              emotion_overview: feedback.emotion_overview
                ? encryptJsonbFields(feedback.emotion_overview)
                : null,
              growth_trends: encryptJsonbFields(feedback.growth_trends),
              insight_replay: encryptJsonbFields(feedback.insight_replay),
              vision_visualization_report: encryptJsonbFields(
                feedback.vision_visualization_report
              ),
              execution_reflection: encryptJsonbFields(
                feedback.execution_reflection
              ),
              closing_section: encryptJsonbFields(feedback.closing_section),
            };

            // 업데이트
            const { error: updateError } = await supabase
              .from(API_ENDPOINTS.WEEKLY_FEEDBACKS)
              .update(encryptedData)
              .eq("id", feedback.id);

            if (updateError) {
              throw new Error(updateError.message);
            }

            stats.weekly.totalEncrypted++;
          } catch (error) {
            stats.weekly.totalErrors++;
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            errors.push({
              table: "weekly_feedback",
              id: String(feedback.id),
              error: errorMessage,
            });
            console.error(
              `Error encrypting weekly feedback ${feedback.id}:`,
              error
            );
          }
        }

        offset += batchSize;
        hasMore = feedbacks.length === batchSize;
      }
    }

    // Monthly Feedback 마이그레이션
    if (
      tableType === "monthly" ||
      tableType === "both" ||
      tableType === "all" ||
      !tableType
    ) {
      let offset = 0;
      let hasMore = true;
      let query = supabase
        .from(API_ENDPOINTS.MONTHLY_FEEDBACK)
        .select(
          "id, summary_overview, emotion_overview, insight_overview, feedback_overview, vision_overview, conclusion_overview, user_id"
        );

      if (userId) {
        query = query.eq("user_id", userId);
      }

      while (hasMore) {
        const { data: feedbacks, error: fetchError } = await query
          .range(offset, offset + batchSize - 1)
          .order("id", { ascending: true });

        if (fetchError) {
          throw new Error(
            `Failed to fetch monthly feedbacks: ${fetchError.message}`
          );
        }

        if (!feedbacks || feedbacks.length === 0) {
          hasMore = false;
          break;
        }

        for (const feedback of feedbacks) {
          stats.monthly.totalProcessed++;

          try {
            // 이미 암호화된 데이터인지 확인
            const isAlreadyEncrypted =
              isJsonbEncrypted(feedback.summary_overview) ||
              isJsonbEncrypted(feedback.emotion_overview) ||
              isJsonbEncrypted(feedback.insight_overview) ||
              isJsonbEncrypted(feedback.feedback_overview) ||
              isJsonbEncrypted(feedback.vision_overview) ||
              isJsonbEncrypted(feedback.conclusion_overview);

            if (isAlreadyEncrypted) {
              stats.monthly.totalSkipped++;
              continue;
            }

            // Dry run 모드면 실제 업데이트하지 않음
            if (dryRun) {
              stats.monthly.totalEncrypted++;
              continue;
            }

            // 암호화
            const encryptedData = {
              summary_overview: encryptJsonbFields(feedback.summary_overview),
              emotion_overview: encryptJsonbFields(feedback.emotion_overview),
              insight_overview: encryptJsonbFields(feedback.insight_overview),
              feedback_overview: encryptJsonbFields(feedback.feedback_overview),
              vision_overview: encryptJsonbFields(feedback.vision_overview),
              conclusion_overview: encryptJsonbFields(
                feedback.conclusion_overview
              ),
            };

            // 업데이트
            const { error: updateError } = await supabase
              .from(API_ENDPOINTS.MONTHLY_FEEDBACK)
              .update(encryptedData)
              .eq("id", feedback.id);

            if (updateError) {
              throw new Error(updateError.message);
            }

            stats.monthly.totalEncrypted++;
          } catch (error) {
            stats.monthly.totalErrors++;
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            errors.push({
              table: "monthly_feedback",
              id: String(feedback.id),
              error: errorMessage,
            });
            console.error(
              `Error encrypting monthly feedback ${feedback.id}:`,
              error
            );
          }
        }

        offset += batchSize;
        hasMore = feedbacks.length === batchSize;
      }
    }

    return NextResponse.json(
      {
        message: dryRun
          ? "Dry run completed (no data was modified)"
          : "Migration completed",
        stats,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Migration error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Migration failed", details: errorMessage },
      { status: 500 }
    );
  }
}
