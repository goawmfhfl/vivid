"use client";

import { useState } from "react";
import {
  Lightbulb,
  Calendar,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import type { InsightReport } from "@/types/monthly-feedback-new";
import { COLORS, SPACING } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

// InsightReport는 이미 import됨
type InsightSectionProps = {
  insightReport: InsightReport;
  isPro?: boolean;
};

const INSIGHT_COLOR = "#E5B96B";
const INSIGHT_COLOR_DARK = "#D4A85A";

export function InsightSection({
  insightReport,
  isPro = false,
}: InsightSectionProps) {
  const [isTopInsightsExpanded, setIsTopInsightsExpanded] = useState(false);

  if (!insightReport) {
    return null;
  }

  // core_insights 차트 데이터 준비 (최대 5개)
  const coreInsightsChartData =
    insightReport.core_insights && insightReport.core_insights.length > 0
      ? insightReport.core_insights
          .slice(0, 5)
          .map((insight) => {
            const summary =
              typeof insight === "string" ? insight : insight.summary || "";
            return {
              name:
                summary.length > 20
                  ? summary.substring(0, 20) + "..."
                  : summary,
              frequency:
                typeof insight === "object" && insight.frequency
                  ? insight.frequency
                  : 1,
              fullName: summary,
            };
          })
          .sort((a, b) => b.frequency - a.frequency)
      : [];

  return (
    <div className={cn(SPACING.section.marginBottom)}>
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${INSIGHT_COLOR} 0%, ${INSIGHT_COLOR_DARK} 100%)`,
            boxShadow: `0 2px 8px ${INSIGHT_COLOR}30`,
          }}
        >
          <Lightbulb className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: COLORS.text.primary }}
        >
          이번 달의 인사이트
        </h2>
      </div>

      {/* 통계 정보 - Pro 전용 (통합 카드) */}
      {isPro &&
        (insightReport.insight_days_count !== undefined ||
          insightReport.insight_records_count !== undefined) && (
          <Card
            className={cn(
              SPACING.card.padding,
              "mb-4 relative overflow-hidden group"
            )}
            style={{
              background:
                "linear-gradient(135deg, rgba(229, 185, 107, 0.12) 0%, rgba(255, 255, 255, 1) 100%)",
              border: `1px solid rgba(229, 185, 107, 0.3)`,
              borderRadius: "20px",
              boxShadow: "0 4px 20px rgba(229, 185, 107, 0.08)",
            }}
          >
            <div className="flex items-center justify-between gap-4">
              {/* 기록한 날 */}
              {insightReport.insight_days_count !== undefined && (
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${INSIGHT_COLOR} 0%, ${INSIGHT_COLOR_DARK} 100%)`,
                      boxShadow: `0 2px 8px ${INSIGHT_COLOR}30`,
                    }}
                  >
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-semibold uppercase tracking-wide mb-1"
                      style={{ color: COLORS.text.secondary }}
                    >
                      기록한 날
                    </p>
                    <p
                      className="text-2xl sm:text-3xl font-bold"
                      style={{ color: INSIGHT_COLOR }}
                    >
                      {insightReport.insight_days_count}
                      <span
                        className="text-sm font-normal ml-1"
                        style={{ color: COLORS.text.tertiary }}
                      >
                        일
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* 구분선 */}
              {insightReport.insight_days_count !== undefined &&
                insightReport.insight_records_count !== undefined && (
                  <div
                    className="w-px h-12"
                    style={{
                      backgroundColor: "rgba(229, 185, 107, 0.2)",
                    }}
                  />
                )}

              {/* 총 인사이트 */}
              {insightReport.insight_records_count !== undefined && (
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${INSIGHT_COLOR} 0%, ${INSIGHT_COLOR_DARK} 100%)`,
                      boxShadow: `0 2px 8px ${INSIGHT_COLOR}30`,
                    }}
                  >
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-semibold uppercase tracking-wide mb-1"
                      style={{ color: COLORS.text.secondary }}
                    >
                      총 인사이트
                    </p>
                    <p
                      className="text-2xl sm:text-3xl font-bold"
                      style={{ color: INSIGHT_COLOR }}
                    >
                      {insightReport.insight_records_count}
                      <span
                        className="text-sm font-normal ml-1"
                        style={{ color: COLORS.text.tertiary }}
                      >
                        개
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

      {/* 종합 인사이트 요약 - Pro 전용 */}
      {isPro && insightReport.insight_comprehensive_summary && (
        <Card
          className={cn("mb-4 relative overflow-hidden group")}
          style={{
            background:
              "linear-gradient(135deg, rgba(229, 185, 107, 0.15) 0%, rgba(255, 255, 255, 1) 100%)",
            border: `2px solid rgba(229, 185, 107, 0.3)`,
            borderRadius: "20px",
            boxShadow: "0 4px 20px rgba(229, 185, 107, 0.12)",
          }}
        >
          {/* 헤더 */}
          <div
            className={cn(SPACING.card.padding, "pb-4 border-b")}
            style={{ borderColor: "rgba(229, 185, 107, 0.2)" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${INSIGHT_COLOR} 0%, ${INSIGHT_COLOR_DARK} 100%)`,
                  boxShadow: `0 4px 12px ${INSIGHT_COLOR}30`,
                }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: COLORS.text.secondary }}
              >
                종합 인사이트 분석
              </p>
            </div>
          </div>
          {/* 바디 */}
          <div className={cn(SPACING.card.padding, "pt-4")}>
            <p
              className="text-sm leading-relaxed"
              style={{
                color: COLORS.text.primary,
                lineHeight: "1.7",
              }}
            >
              {insightReport.insight_comprehensive_summary}
            </p>
          </div>
        </Card>
      )}

      {/* Core Insights - 모든 사용자 (시각화 강화) */}
      {Array.isArray(insightReport.core_insights) &&
        insightReport.core_insights.length > 0 && (
          <Card
            className={cn("mb-4 relative overflow-hidden group")}
            style={{
              background:
                "linear-gradient(135deg, rgba(229, 185, 107, 0.12) 0%, rgba(255, 255, 255, 1) 100%)",
              border: `1px solid rgba(229, 185, 107, 0.3)`,
              borderRadius: "20px",
              boxShadow: "0 4px 20px rgba(229, 185, 107, 0.08)",
            }}
          >
            {/* 헤더 */}
            <div
              className={cn(SPACING.card.padding, "pb-4 border-b")}
              style={{ borderColor: "rgba(229, 185, 107, 0.2)" }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${INSIGHT_COLOR} 0%, ${INSIGHT_COLOR_DARK} 100%)`,
                    boxShadow: `0 4px 12px ${INSIGHT_COLOR}30`,
                  }}
                >
                  <Lightbulb className="w-4 h-4 text-white" />
                </div>
                <p
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: COLORS.text.secondary }}
                >
                  핵심 인사이트 ({insightReport.core_insights.length}개)
                </p>
              </div>
            </div>
            {/* 바디 */}
            <div className={cn(SPACING.card.padding, "pt-4")}>
              {/* 차트 - core_insights 5개용 */}
              {coreInsightsChartData.length > 0 && (
                <div className="mb-6" style={{ height: "280px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={coreInsightsChartData}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(229, 185, 107, 0.2)"
                        horizontal={true}
                        vertical={false}
                      />
                      <XAxis
                        type="number"
                        tick={{
                          fill: COLORS.text.tertiary,
                          fontSize: 11,
                        }}
                        tickLine={{ stroke: "rgba(229, 185, 107, 0.3)" }}
                        axisLine={{ stroke: "rgba(229, 185, 107, 0.3)" }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{
                          fill: COLORS.text.secondary,
                          fontSize: 11,
                        }}
                        tickLine={false}
                        axisLine={false}
                        width={120}
                        tickFormatter={(value: string) => {
                          if (value.length > 20) {
                            return value.substring(0, 20) + "...";
                          }
                          return value;
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: `1px solid ${INSIGHT_COLOR}40`,
                          borderRadius: "12px",
                          padding: "8px 12px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                        labelStyle={{
                          color: COLORS.text.primary,
                          fontWeight: "bold",
                          marginBottom: "4px",
                        }}
                        formatter={(
                          value: number,
                          name: string,
                          props: { payload?: { fullName?: string } }
                        ) => [`${value}회`, props.payload?.fullName || ""]}
                      />
                      <Bar
                        dataKey="frequency"
                        radius={[0, 8, 8, 0]}
                        fill={INSIGHT_COLOR}
                      >
                        {coreInsightsChartData.map((_, idx) => (
                          <Cell
                            key={`cell-${idx}`}
                            fill={`rgba(229, 185, 107, ${0.6 + idx * 0.05})`}
                          />
                        ))}
                        <LabelList
                          dataKey="frequency"
                          position="right"
                          style={{
                            fill: COLORS.text.secondary,
                            fontSize: "11px",
                            fontWeight: "600",
                          }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* 핵심 인사이트 리스트 (최대 5개) */}
              <div className="space-y-4">
                {insightReport.core_insights.slice(0, 5).map((insight, idx) => {
                  const insightSummary =
                    typeof insight === "string"
                      ? insight
                      : insight.summary || "";
                  const insightExplanation =
                    typeof insight === "object" && insight.explanation
                      ? insight.explanation
                      : null;
                  const insightFrequency =
                    typeof insight === "object" && insight.frequency
                      ? insight.frequency
                      : null;

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl transition-all duration-300 hover:scale-[1.01]"
                      style={{
                        backgroundColor: "rgba(229, 185, 107, 0.08)",
                        border: "1px solid rgba(229, 185, 107, 0.2)",
                        boxShadow: "0 2px 8px rgba(229, 185, 107, 0.1)",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{
                            background: `linear-gradient(135deg, ${INSIGHT_COLOR} 0%, ${INSIGHT_COLOR_DARK} 100%)`,
                            boxShadow: `0 2px 8px ${INSIGHT_COLOR}30`,
                          }}
                        >
                          <span
                            className="text-xs font-bold text-white"
                            style={{ fontSize: "10px" }}
                          >
                            {idx + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <p
                              className="text-sm font-semibold truncate"
                              style={{
                                color: COLORS.text.primary,
                                lineHeight: "1.6",
                              }}
                              title={insightSummary}
                            >
                              {insightSummary}
                            </p>
                            {insightFrequency !== null && (
                              <span
                                className="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
                                style={{
                                  backgroundColor: `${INSIGHT_COLOR}20`,
                                  color: INSIGHT_COLOR_DARK,
                                }}
                              >
                                {insightFrequency}회
                              </span>
                            )}
                          </div>
                          {insightExplanation && (
                            <p
                              className="text-xs leading-relaxed"
                              style={{
                                color: COLORS.text.secondary,
                                lineHeight: "1.6",
                              }}
                            >
                              {insightExplanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 주요 인사이트 드롭다운 (Pro 전용) */}
              {isPro &&
                insightReport.top_insights &&
                insightReport.top_insights.length > 0 && (
                  <div
                    className="mt-6 pt-6 border-t"
                    style={{ borderColor: "rgba(229, 185, 107, 0.2)" }}
                  >
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setIsTopInsightsExpanded(!isTopInsightsExpanded)
                      }
                      className="w-full flex items-center justify-between p-3"
                      style={{
                        backgroundColor: "rgba(229, 185, 107, 0.05)",
                        border: `1px solid rgba(229, 185, 107, 0.2)`,
                      }}
                    >
                      <span
                        className="text-xs font-semibold"
                        style={{ color: COLORS.text.primary }}
                      >
                        주요 인사이트 ({insightReport.top_insights.length}개)
                      </span>
                      {isTopInsightsExpanded ? (
                        <ChevronUp
                          className="w-4 h-4"
                          style={{ color: COLORS.text.secondary }}
                        />
                      ) : (
                        <ChevronDown
                          className="w-4 h-4"
                          style={{ color: COLORS.text.secondary }}
                        />
                      )}
                    </Button>
                    {isTopInsightsExpanded && (
                      <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
                        {insightReport.top_insights
                          .sort((a, b) => b.frequency - a.frequency)
                          .map((insight, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-lg"
                              style={{
                                backgroundColor: COLORS.background.card,
                                border: `1px solid ${COLORS.border.light}`,
                              }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <p
                                  className="text-xs font-medium truncate flex-1"
                                  style={{ color: COLORS.text.primary }}
                                  title={insight.summary}
                                >
                                  {insight.summary}
                                </p>
                                <span
                                  className="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ml-2"
                                  style={{
                                    backgroundColor: `${INSIGHT_COLOR}15`,
                                    color: INSIGHT_COLOR_DARK,
                                  }}
                                >
                                  {insight.frequency}회
                                </span>
                              </div>
                              {(insight.first_date || insight.last_date) && (
                                <div className="flex items-center gap-2 mt-1">
                                  {insight.first_date && (
                                    <span
                                      className="text-xs"
                                      style={{ color: COLORS.text.tertiary }}
                                    >
                                      시작: {insight.first_date}
                                    </span>
                                  )}
                                  {insight.first_date &&
                                    insight.last_date &&
                                    insight.first_date !==
                                      insight.last_date && (
                                      <span
                                        className="text-xs"
                                        style={{ color: COLORS.text.tertiary }}
                                      >
                                        ·
                                      </span>
                                    )}
                                  {insight.last_date &&
                                    insight.first_date !==
                                      insight.last_date && (
                                      <span
                                        className="text-xs"
                                        style={{ color: COLORS.text.tertiary }}
                                      >
                                        마지막: {insight.last_date}
                                      </span>
                                    )}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
            </div>
          </Card>
        )}
    </div>
  );
}
