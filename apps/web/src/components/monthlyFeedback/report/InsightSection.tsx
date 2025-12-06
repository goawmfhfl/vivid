"use client";

import {
  Lightbulb,
  Lock,
  TrendingUp,
  ArrowRight,
  Calendar,
  FileText,
  Sparkles,
  Target,
} from "lucide-react";
import { Card } from "../../ui/card";
import type { InsightReport } from "@/types/monthly-feedback-new";
import { COLORS, SPACING } from "@/lib/design-system";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  if (!insightReport) {
    return null;
  }

  // 차트 데이터 준비
  const topInsightsChartData =
    insightReport.top_insights && insightReport.top_insights.length > 0
      ? insightReport.top_insights
          .slice(0, 8)
          .map((insight) => ({
            name:
              insight.summary.length > 20
                ? insight.summary.substring(0, 20) + "..."
                : insight.summary,
            frequency: insight.frequency,
            fullName: insight.summary,
          }))
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
              <div className="flex-1">
                <div className="space-y-4">
                  {insightReport.core_insights.map((insight, idx) => {
                    // core_insights가 객체인 경우 (월간 피드백)
                    const insightSummary =
                      typeof insight === "string"
                        ? insight
                        : insight.summary || "";
                    const insightExplanation =
                      typeof insight === "object" && insight.explanation
                        ? insight.explanation
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
                          <div className="flex-1">
                            <p
                              className="text-sm font-semibold mb-2"
                              style={{
                                color: COLORS.text.primary,
                                lineHeight: "1.6",
                              }}
                            >
                              {insightSummary}
                            </p>
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
              </div>
            </div>
          </Card>
        )}

      {/* Top Insights - Pro 전용 (차트 포함) */}
      {isPro ? (
        <div className="space-y-4">
          {insightReport.top_insights &&
            insightReport.top_insights.length > 0 && (
              <Card
                className={cn("relative overflow-hidden group")}
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
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: COLORS.text.secondary }}
                    >
                      주요 인사이트 ({insightReport.top_insights.length}개)
                    </p>
                  </div>
                </div>
                {/* 바디 */}
                <div className={cn(SPACING.card.padding, "pt-4")}>
                  <div className="flex-1">
                    {/* 막대 차트 */}
                    {topInsightsChartData.length > 0 && (
                      <div className="mb-6" style={{ height: "320px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={topInsightsChartData}
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
                                props: any
                              ) => [`${value}회`, props.payload.fullName]}
                            />
                            <Bar
                              dataKey="frequency"
                              radius={[0, 8, 8, 0]}
                              fill={INSIGHT_COLOR}
                            >
                              {topInsightsChartData.map((_, idx) => (
                                <Cell
                                  key={`cell-${idx}`}
                                  fill={`rgba(229, 185, 107, ${
                                    0.6 + idx * 0.05
                                  })`}
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

                    {/* 인사이트 상세 리스트 */}
                    <ul className="space-y-2">
                      {insightReport.top_insights
                        .slice(0, 10)
                        .map((insight, idx) => {
                          return (
                            <li
                              key={idx}
                              className="flex items-start gap-3 py-2 border-b last:border-b-0"
                              style={{
                                borderColor: "rgba(229, 185, 107, 0.15)",
                              }}
                            >
                              <div
                                className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{
                                  background: `linear-gradient(135deg, ${INSIGHT_COLOR} 0%, ${INSIGHT_COLOR_DARK} 100%)`,
                                }}
                              >
                                <Target className="w-3 h-3 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-2 flex-wrap">
                                  <p
                                    className="text-sm font-medium flex-1 min-w-0"
                                    style={{ color: COLORS.text.primary }}
                                  >
                                    {insight.summary}
                                  </p>
                                  {insight.frequency > 0 && (
                                    <span
                                      className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
                                      style={{
                                        backgroundColor:
                                          "rgba(229, 185, 107, 0.2)",
                                        color: INSIGHT_COLOR_DARK,
                                      }}
                                    >
                                      {insight.frequency}회
                                    </span>
                                  )}
                                </div>
                                {(insight.first_date || insight.last_date) && (
                                  <div className="flex items-center gap-2 mt-1.5">
                                    {insight.first_date && (
                                      <span
                                        className="text-xs"
                                        style={{
                                          color: COLORS.text.tertiary,
                                        }}
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
                                          style={{
                                            color: COLORS.text.tertiary,
                                          }}
                                        >
                                          ·
                                        </span>
                                      )}
                                    {insight.last_date &&
                                      insight.first_date !==
                                        insight.last_date && (
                                        <span
                                          className="text-xs"
                                          style={{
                                            color: COLORS.text.tertiary,
                                          }}
                                        >
                                          마지막: {insight.last_date}
                                        </span>
                                      )}
                                  </div>
                                )}
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                </div>
              </Card>
            )}

          {/* AI 코멘트 */}
          {insightReport.insight_ai_comment && (
            <Card
              className={cn("relative overflow-hidden group")}
              style={{
                background:
                  "linear-gradient(135deg, rgba(229, 185, 107, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
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
                      background: `linear-gradient(135deg, rgba(229, 185, 107, 0.4) 0%, rgba(229, 185, 107, 0.2) 100%)`,
                      boxShadow: `0 4px 12px rgba(229, 185, 107, 0.2)`,
                    }}
                  >
                    <Sparkles
                      className="w-4 h-4"
                      style={{ color: INSIGHT_COLOR }}
                    />
                  </div>
                  <p
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: COLORS.text.secondary }}
                  >
                    AI 코멘트
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
                  {insightReport.insight_ai_comment}
                </p>
              </div>
            </Card>
          )}
        </div>
      ) : (
        /* Free 모드: Pro 업그레이드 유도 (더 강화) */
        <div className="space-y-4">
          {/* 핵심 인사이트만 보여주고 나머지는 잠금 */}
          {insightReport.top_insights &&
            insightReport.top_insights.length > 0 && (
              <Card
                className={cn(SPACING.card.padding, "relative overflow-hidden")}
                style={{
                  background:
                    "linear-gradient(135deg, rgba(229, 185, 107, 0.05) 0%, rgba(255, 255, 255, 1) 100%)",
                  border: `1px solid rgba(229, 185, 107, 0.2)`,
                  borderRadius: "20px",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Lock
                    className="w-3.5 h-3.5"
                    style={{ color: INSIGHT_COLOR }}
                  />
                  <p
                    className="text-xs font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    주요 인사이트 미리보기 (최대 3개)
                  </p>
                </div>
                <div className="space-y-2">
                  {insightReport.top_insights
                    .slice(0, 3)
                    .map((insight, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg opacity-75"
                        style={{
                          backgroundColor: "rgba(229, 185, 107, 0.05)",
                          border: "1px solid rgba(229, 185, 107, 0.15)",
                        }}
                      >
                        <p
                          className="text-sm"
                          style={{ color: COLORS.text.primary }}
                        >
                          {insight.summary}
                        </p>
                      </div>
                    ))}
                </div>
              </Card>
            )}

          {/* Pro 업그레이드 유도 카드 */}
          <Card
            className={cn(
              SPACING.card.padding,
              "cursor-pointer transition-all hover:scale-[1.02] relative overflow-hidden group"
            )}
            style={{
              background:
                "linear-gradient(135deg, rgba(229, 185, 107, 0.12) 0%, rgba(255, 255, 255, 1) 100%)",
              border: `2px solid rgba(229, 185, 107, 0.4)`,
              borderRadius: "20px",
              boxShadow: "0 4px 20px rgba(229, 185, 107, 0.15)",
            }}
            onClick={() => router.push("/subscription")}
          >
            <div
              className="absolute top-0 right-0 w-40 h-40 opacity-10 group-hover:opacity-20 transition-opacity duration-300"
              style={{
                background:
                  "radial-gradient(circle, rgba(229, 185, 107, 0.8) 0%, transparent 70%)",
              }}
            />

            <div className="flex items-start gap-4 relative z-10">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${INSIGHT_COLOR} 0%, ${INSIGHT_COLOR_DARK} 100%)`,
                  boxShadow: `0 4px 12px ${INSIGHT_COLOR}40`,
                }}
              >
                <Lock className="w-4 h-4 text-white" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    더 깊은 인사이트 분석이 필요하신가요?
                  </p>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: INSIGHT_COLOR,
                      color: "white",
                      letterSpacing: "0.5px",
                      boxShadow: `0 2px 8px ${INSIGHT_COLOR}40`,
                    }}
                  >
                    PRO
                  </span>
                </div>
                <p
                  className="text-sm mb-4 leading-relaxed"
                  style={{
                    color: COLORS.text.secondary,
                    lineHeight: "1.7",
                  }}
                >
                  Pro 멤버십에서는 이번 달의 <strong>주요 인사이트 차트</strong>
                  , <strong>종합 분석</strong>, <strong>통계 정보</strong>를
                  확인할 수 있습니다. 기록을 성장으로 바꾸는 당신만의 인사이트
                  지도를 함께 만들어보세요.
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span style={{ color: INSIGHT_COLOR }}>
                    Pro 멤버십으로 업그레이드
                  </span>
                  <ArrowRight
                    className="w-5 h-5"
                    style={{ color: INSIGHT_COLOR }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
