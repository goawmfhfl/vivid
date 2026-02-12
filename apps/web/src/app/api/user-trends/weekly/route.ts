import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { decryptJsonbFields, type JsonbValue } from "@/lib/jsonb-encryption";
import { getAuthenticatedUserIdFromRequest } from "@/app/api/utils/auth";
import { API_ENDPOINTS } from "@/constants";
import type {
  WeeklyMetricBreakdownItem,
  WeeklyMetricsBreakdown,
  WeeklyPoint,
  UserTrendsRow,
  WeeklyUserTrendDataQuality,
  WeeklyUserTrendInsights,
  WeeklyUserTrendMetrics,
} from "@/types/user-trends";

type Mode = "latest" | "history";

function clampCount(value: string | null): number {
  const parsed = Number(value || "4");
  if (!Number.isFinite(parsed)) return 4;
  return Math.min(Math.max(Math.floor(parsed), 1), 12);
}

function asMetrics(value: unknown): WeeklyUserTrendMetrics {
  const row = (value || {}) as Record<string, unknown>;
  return {
    reflection_continuity: Number(row.reflection_continuity) || 0,
    identity_coherence: Number(row.identity_coherence) || 0,
  };
}

function asInsights(value: unknown): WeeklyUserTrendInsights {
  const row = (value || {}) as Record<string, unknown>;
  return {
    overall_summary:
      typeof row.overall_summary === "string" ? row.overall_summary : "",
    insufficient_data_note:
      typeof row.insufficient_data_note === "string" && row.insufficient_data_note.trim()
        ? row.insufficient_data_note
        : null,
  };
}

function asPoints(value: unknown): WeeklyPoint[] {
  if (!Array.isArray(value)) return [];
  return value.map((point, index) => {
    const row = (point || {}) as Record<string, unknown>;
    return {
      week_label:
        typeof row.week_label === "string" ? row.week_label : `${index + 1}주차`,
      value: Number(row.value) || 0,
    };
  });
}

function asMetricItem(
  value: unknown,
  fallbackLabel: string,
  fallbackScore: number
): WeeklyMetricBreakdownItem {
  const row = (value || {}) as Record<string, unknown>;
  const deltaRaw = row.delta_from_previous;
  return {
    label: typeof row.label === "string" ? row.label : fallbackLabel,
    current_score: Number(row.current_score) || fallbackScore,
    delta_from_previous:
      typeof deltaRaw === "number" && Number.isFinite(deltaRaw)
        ? deltaRaw
        : null,
    weekly_points: asPoints(row.weekly_points),
    score_reason_summary:
      typeof row.score_reason_summary === "string"
        ? row.score_reason_summary
        : typeof row.score_reason === "string"
          ? row.score_reason
          : "",
    score_reason_items: Array.isArray(row.score_reason_items)
      ? row.score_reason_items
          .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
          .slice(0, 5)
      : [],
    score_evidence_items: Array.isArray(row.score_evidence_items)
      ? row.score_evidence_items
          .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
          .slice(0, 5)
      : [],
    flow_insight:
      typeof row.flow_insight === "string"
        ? row.flow_insight
        : "",
    confidence:
      row.confidence === "high" || row.confidence === "medium" || row.confidence === "low"
        ? row.confidence
        : "low",
  };
}

function buildFallbackBreakdown(metrics: WeeklyUserTrendMetrics): WeeklyMetricsBreakdown {
  const fallbackPoints: WeeklyPoint[] = [];

  return {
    reflection_continuity: {
      label: "꾸준히 기록하기",
      current_score: metrics.reflection_continuity,
      delta_from_previous: null,
      weekly_points: fallbackPoints,
      score_reason_summary: "",
      score_reason_items: [],
      score_evidence_items: [],
      flow_insight: "",
      confidence: "low",
    },
    identity_coherence: {
      label: "나에 대한 이야기",
      current_score: metrics.identity_coherence,
      delta_from_previous: null,
      weekly_points: fallbackPoints,
      score_reason_summary: "",
      score_reason_items: [],
      score_evidence_items: [],
      flow_insight: "",
      confidence: "low",
    },
  };
}

function asMetricsBreakdown(
  value: unknown,
  metrics: WeeklyUserTrendMetrics
): WeeklyMetricsBreakdown {
  const row = (value || {}) as Record<string, unknown>;
  if (Object.keys(row).length === 0) {
    return buildFallbackBreakdown(metrics);
  }
  return {
    reflection_continuity: asMetricItem(
      row.reflection_continuity,
      "꾸준히 기록하기",
      metrics.reflection_continuity
    ),
    identity_coherence: asMetricItem(
      row.identity_coherence,
      "나에 대한 이야기",
      metrics.identity_coherence
    ),
  };
}

function asDataQuality(value: unknown): WeeklyUserTrendDataQuality {
  const row = (value || {}) as Record<string, unknown>;
  return {
    valid_weeks: Number(row.valid_weeks) || 0,
    valid_records: Number(row.valid_records) || 0,
    is_partial: Boolean(row.is_partial),
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = (searchParams.get("mode") || "latest") as Mode;
    const count = clampCount(searchParams.get("count"));
    const userId = await getAuthenticatedUserIdFromRequest(request);
    const supabase = getServiceSupabase();

    const limit = mode === "latest" ? 1 : count;
    const { data, error } = await supabase
      .from(API_ENDPOINTS.USER_TRENDS)
      .select("*")
      .eq("user_id", userId)
      .eq("type", "weekly")
      .order("period_end", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch user trends: ${error.message}`);
    }

    const rawRows = (data || []) as Array<Record<string, unknown>>;
    // 비교할 데이터가 없으면(1주 미만) 빈 배열 반환
    const rows =
      mode === "history" && rawRows.length < 2 ? [] : rawRows;

    const result = rows.map((row) => {
      const metrics = decryptJsonbFields((row.metrics as JsonbValue) || {});
      const insights = decryptJsonbFields((row.insights as JsonbValue) || {});
      const metricsBreakdown = decryptJsonbFields(
        (row.metrics_breakdown as JsonbValue) || {}
      );
      const debug = decryptJsonbFields((row.debug as JsonbValue) || {});
      const dataQuality = decryptJsonbFields((row.data_quality as JsonbValue) || {});
      const parsedMetrics = asMetrics(metrics);

      return {
        id: String(row.id),
        user_id: String(row.user_id),
        type: "weekly",
        period_start: String(row.period_start),
        period_end: String(row.period_end),
        metrics: parsedMetrics,
        metrics_breakdown: asMetricsBreakdown(metricsBreakdown, parsedMetrics),
        insights: asInsights(insights),
        debug: (debug as Record<string, unknown>) || null,
        data_quality: asDataQuality(dataQuality),
        source_count: Number(row.source_count) || 0,
        generated_at: String(row.generated_at),
        created_at: String(row.created_at),
        updated_at: String(row.updated_at),
      }       satisfies UserTrendsRow;
    });

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
