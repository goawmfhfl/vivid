export type UserTrendType = "weekly";

export interface WeeklyUserTrendMetrics {
  reflection_continuity: number;
  identity_coherence: number;
}

export interface WeeklyPoint {
  week_label: string;
  value: number;
}

export interface WeeklyMetricBreakdownItem {
  label: string;
  current_score: number;
  delta_from_previous: number | null;
  weekly_points: WeeklyPoint[];
  score_reason_summary: string;
  score_reason_items: string[];
  score_evidence_items: string[];
  flow_insight: string;
  confidence: "low" | "medium" | "high";
}

export interface WeeklyMetricsBreakdown {
  reflection_continuity: WeeklyMetricBreakdownItem;
  identity_coherence: WeeklyMetricBreakdownItem;
}

export interface WeeklyUserTrendInsights {
  overall_summary: string;
  insufficient_data_note: string | null;
}

export interface WeeklyUserTrendDataQuality {
  valid_weeks: number;
  valid_records: number;
  is_partial: boolean;
}

export interface UserTrendsRow {
  id: string;
  user_id: string;
  type: UserTrendType;
  period_start: string;
  period_end: string;
  metrics: WeeklyUserTrendMetrics;
  metrics_breakdown: WeeklyMetricsBreakdown;
  insights: WeeklyUserTrendInsights;
  debug: Record<string, unknown> | null;
  data_quality: WeeklyUserTrendDataQuality;
  source_count: number;
  generated_at: string;
  created_at: string;
  updated_at: string;
}

export interface WeeklyUserTrendsResponse {
  data: UserTrendsRow[];
}
