"use client";

import {
  ListTodo,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import type { WeeklyReport } from "@/types/weekly-vivid";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";

const ACCENT = COLORS.brand.primary;
const CHART_COLORS = [
  COLORS.brand.primary,
  COLORS.primary[400],
  COLORS.accent[500],
  COLORS.primary[600],
];

type MembershipTodoBalancePreviewProps = {
  completedTodosInsights: NonNullable<WeeklyReport["completed_todos_insights"]>;
};

function toRadarData(
  breakdown: Array<{ category: string; percentage: number }>
): Array<{ subject: string; value: number; fullMark: number; displayPercent: number }> {
  if (!breakdown.length) return [];
  const max = Math.max(...breakdown.map((item) => item.percentage), 1);

  return breakdown.map((item) => ({
    subject: item.category,
    value: (item.percentage / max) * 100,
    fullMark: 100,
    displayPercent: item.percentage,
  }));
}

export function MembershipTodoBalancePreview({
  completedTodosInsights,
}: MembershipTodoBalancePreviewProps) {
  const radarData = toRadarData(
    completedTodosInsights.time_investment_breakdown ?? []
  );

  return (
    <div className="space-y-6">
      <div
        className="rounded-xl p-4"
        style={{
          backgroundColor: COLORS.background.base,
          border: `1px solid ${COLORS.border.light}`,
        }}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: ACCENT }} />
            <span
              className={cn(
                TYPOGRAPHY.label.fontSize,
                TYPOGRAPHY.label.fontWeight,
                TYPOGRAPHY.label.letterSpacing
              )}
              style={{ color: COLORS.text.secondary }}
            >
              시간 투자 요약
            </span>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-stretch sm:justify-center">
            <div className="flex-1 space-y-4 min-w-0">
              {(completedTodosInsights.time_investment_breakdown ?? []).map(
                (item, index) => (
                  <div key={item.category} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor:
                              CHART_COLORS[index % CHART_COLORS.length],
                          }}
                        />
                        <span
                          className="text-sm sm:text-base font-medium"
                          style={{ color: COLORS.text.primary }}
                        >
                          {item.category}
                        </span>
                      </div>
                      <span
                        className={cn(TYPOGRAPHY.body.fontSize, "font-semibold tabular-nums")}
                        style={{ color: ACCENT }}
                      >
                        {item.percentage}%
                      </span>
                    </div>
                    <div
                      className="h-2.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: COLORS.primary[100] }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="w-full sm:w-44 flex-shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke={ACCENT} strokeOpacity={0.3} />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={({ payload, x, y, textAnchor }) => {
                      const item = radarData.find(
                        (datum) => datum.subject === payload.value
                      );
                      return (
                        <g>
                          <text
                            x={x}
                            y={y}
                            textAnchor={textAnchor}
                            fill={COLORS.text.secondary}
                            fontSize={11}
                          >
                            {payload.value}
                          </text>
                          {item && (
                            <text
                              x={x}
                              y={Number(y ?? 0) + 12}
                              textAnchor={textAnchor}
                              fill={ACCENT}
                              fontSize={10}
                              fontWeight={600}
                            >
                              {item.displayPercent}%
                            </text>
                          )}
                        </g>
                      );
                    }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                  <Radar
                    name="비율"
                    dataKey="value"
                    stroke={ACCENT}
                    fill={ACCENT}
                    fillOpacity={0.4}
                    strokeWidth={2}
                    isAnimationActive
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <p
            className={cn(TYPOGRAPHY.bodySmall.fontSize, TYPOGRAPHY.bodySmall.lineHeight)}
            style={{ color: COLORS.text.secondary }}
          >
            {completedTodosInsights.time_investment_summary}
          </p>
        </div>
      </div>

      <div
        className="rounded-xl p-4"
        style={{
          backgroundColor: COLORS.background.base,
          border: `1px solid ${COLORS.border.light}`,
        }}
      >
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4" style={{ color: ACCENT }} />
              <span
                className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight)}
                style={{ color: COLORS.text.secondary }}
              >
                반복 패턴
              </span>
            </div>
            <ul className="space-y-2">
              {completedTodosInsights.repetitive_patterns.map((pattern) => (
                <li
                  key={pattern}
                  className={cn(TYPOGRAPHY.bodySmall.fontSize, "flex items-start gap-2")}
                  style={{ color: COLORS.text.primary }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: ACCENT }}
                  />
                  {pattern}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" style={{ color: ACCENT }} />
              <span
                className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight)}
                style={{ color: COLORS.text.secondary }}
              >
                새로운 영역
              </span>
            </div>
            <ul className="space-y-2">
              {completedTodosInsights.new_areas.map((area) => (
                <li
                  key={area}
                  className={cn(TYPOGRAPHY.bodySmall.fontSize, "flex items-start gap-2")}
                  style={{ color: COLORS.text.primary }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: ACCENT }}
                  />
                  {area}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <ListTodo className="w-4 h-4" style={{ color: ACCENT }} />
              <span
                className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight)}
                style={{ color: COLORS.text.secondary }}
              >
                미완료 패턴
              </span>
            </div>
            <ul className="space-y-2">
              {(completedTodosInsights.incomplete_patterns ?? []).map((pattern) => (
                <li
                  key={pattern}
                  className={cn(TYPOGRAPHY.bodySmall.fontSize, "flex items-start gap-2")}
                  style={{ color: COLORS.text.primary }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: ACCENT }}
                  />
                  {pattern}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
