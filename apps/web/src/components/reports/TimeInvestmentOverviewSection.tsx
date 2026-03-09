"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { COLORS } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { useRecentTimeInvestment } from "@/hooks/useRecentTimeInvestment";
import { TimeInvestmentOverviewSkeleton } from "./GrowthInsightsSkeleton";
import { PreviewDataNotice } from "./PreviewDataNotice";
import type { TimeInvestmentWeekItem } from "@/app/api/weekly-vivid/recent-time-investment/route";

const CATEGORY_ORDER = ["업무", "생활", "운동", "관계", "기타", "학습"] as const;

const CHART_COLORS = [
  COLORS.primary[500],
  COLORS.primary[400],
  COLORS.primary[600],
  COLORS.primary[300],
  COLORS.primary[700],
  COLORS.secondary[400],
];

/** 카테고리별 퍼센트를 고정 순서로 정규화 (누락 시 0) */
function normalizeBreakdown(
  breakdown: Array<{ category: string; percentage: number }>
): Array<{ category: string; percentage: number }> {
  const map = new Map(breakdown.map((b) => [b.category, b.percentage]));
  return CATEGORY_ORDER.map((cat) => ({
    category: cat,
    percentage: map.get(cat) ?? 0,
  }));
}

/** 주간 변화 요약 텍스트 생성 (예: "35% → 38% → 32% → 40%") */
function getWeeklyChangeSummary(percentages: number[]): string {
  if (percentages.length === 0) return "";
  return percentages.map((p) => `${p}%`).join(" → ");
}

/** 스파이더 차트용 데이터 변환 */
function toRadarData(
  breakdown: Array<{ category: string; percentage: number }>
): Array<{
  subject: string;
  value: number;
  fullMark: number;
  displayPercent: number;
}> {
  if (!breakdown.length) return [];
  const max = Math.max(...breakdown.map((b) => b.percentage), 1);
  return breakdown.map((b) => ({
    subject: b.category,
    value: (b.percentage / max) * 100,
    fullMark: 100,
    displayPercent: b.percentage,
  }));
}

/** 추이 방향 설명 (상승/하락/유지) */
function getTrendDescription(percentages: number[]): string {
  if (percentages.length < 2) return "";
  const first = percentages[0];
  const last = percentages[percentages.length - 1];
  const delta = last - first;
  if (delta > 2) return "전주 대비 상승 추세예요";
  if (delta < -2) return "전주 대비 하락 추세예요";
  return "전주 대비 비슷한 수준이에요";
}

/** 4주치 예제 데이터 */
function getPlaceholderTimeInvestmentData(): TimeInvestmentWeekItem[] {
  const today = new Date();
  const base = [
    { category: "업무", pct: 35 },
    { category: "생활", pct: 20 },
    { category: "운동", pct: 15 },
    { category: "관계", pct: 10 },
    { category: "기타", pct: 12 },
    { category: "학습", pct: 8 },
  ];

  return Array.from({ length: 4 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (3 - i) * 7);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekNum = Math.ceil(day / 7);
    const weekLabel = `[${String(month).padStart(2, "0")}월${weekNum}주차]`;
    const start = new Date(d);
    start.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const variation = (i % 2) * 3 - (i % 3);
    const breakdown = base.map((b, j) => ({
      category: b.category,
      percentage: Math.max(0, Math.min(100, b.pct + variation + (j % 2) * 2)),
    }));
    const sum = breakdown.reduce((s, x) => s + x.percentage, 0);
    const scale = 100 / sum;
    const scaled = breakdown.map((b) => ({
      category: b.category,
      percentage: Math.round(b.percentage * scale),
    }));
    const diff = 100 - scaled.reduce((s, x) => s + x.percentage, 0);
    if (diff !== 0) {
      scaled[0] = {
        ...scaled[0],
        percentage: scaled[0].percentage + diff,
      };
    }

    return {
      week_start: start.toISOString().slice(0, 10),
      week_end: end.toISOString().slice(0, 10),
      week_label: weekLabel,
      breakdown: scaled,
    };
  });
}

interface TimeInvestmentOverviewSectionProps {
  /** 한눈에 보기 내부에 중첩될 때 true (제목 생략) */
  variant?: "standalone" | "nested";
}

export function TimeInvestmentOverviewSection({
  variant = "standalone",
}: TimeInvestmentOverviewSectionProps) {
  const [isAnimated, setIsAnimated] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const {
    data: apiData,
    isLoading,
    error,
  } = useRecentTimeInvestment();

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsAnimated(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const hasRealData = !!(apiData?.data?.length ?? 0);
  const effectiveData = useMemo(() => {
    const raw =
      hasRealData && apiData?.data
        ? apiData.data
        : getPlaceholderTimeInvestmentData();
    // API는 최신순(week_start DESC)으로 반환 → 차트는 과거→최신 순(시간 흐름)으로 표시
    return [...raw].reverse();
  }, [hasRealData, apiData?.data]);

  /** 카테고리별 4주 데이터 */
  const categoryData = useMemo(() => {
    const result: Record<
      string,
      { weekLabels: string[]; percentages: number[]; average: number }
    > = {};
    for (const cat of CATEGORY_ORDER) {
      const weekLabels: string[] = [];
      const percentages: number[] = [];
      for (const week of effectiveData) {
        const normalized = normalizeBreakdown(week.breakdown);
        const item = normalized.find((b) => b.category === cat);
        weekLabels.push(week.week_label);
        percentages.push(item?.percentage ?? 0);
      }
      const average =
        percentages.length > 0
          ? Math.round(
              percentages.reduce((s, p) => s + p, 0) / percentages.length
            )
          : 0;
      result[cat] = { weekLabels, percentages, average };
    }
    return result;
  }, [effectiveData]);

  /** 4주 평균 breakdown (스파이더 차트용) */
  const averageBreakdown = useMemo(() => {
    if (effectiveData.length === 0) return [];
    const sums = new Map<string, number>();
    for (const week of effectiveData) {
      const normalized = normalizeBreakdown(week.breakdown);
      normalized.forEach((b) => {
        sums.set(b.category, (sums.get(b.category) ?? 0) + b.percentage);
      });
    }
    return CATEGORY_ORDER.map((cat) => ({
      category: cat,
      percentage: Math.round((sums.get(cat) ?? 0) / effectiveData.length),
    }));
  }, [effectiveData]);

  const radarData = useMemo(
    () => toRadarData(averageBreakdown),
    [averageBreakdown]
  );

  /** 카테고리별 라인 차트 데이터 */
  const getLineChartDataForCategory = (category: string) => {
    const { weekLabels, percentages } = categoryData[category] ?? {
      weekLabels: [],
      percentages: [],
    };
    return weekLabels.map((label, i) => ({
      week_label: label,
      value: percentages[i] ?? 0,
    }));
  };

  if (isLoading) {
    return (
      <div className={variant === "nested" ? "mt-8" : ""}>
        {variant === "standalone" && (
          <>
            <h2
              className="text-[13px] sm:text-sm font-semibold mb-1"
              style={{ color: COLORS.text.primary }}
            >
              시간 투자 한눈에 보기
            </h2>
            <p
              className="text-[12px] sm:text-sm mb-4"
              style={{ color: COLORS.text.secondary, lineHeight: "1.6" }}
            >
              시간 투자 변화
            </p>
          </>
        )}
        {variant === "nested" && (
          <h3
            className="text-xs sm:text-[13px] font-medium mb-3"
            style={{ color: COLORS.text.secondary }}
          >
            시간 투자 변화
          </h3>
        )}
        <TimeInvestmentOverviewSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={variant === "nested" ? "mt-8" : ""}>
        <p className="text-xs" style={{ color: COLORS.text.muted }}>
          데이터를 불러오는 중 오류가 발생했습니다.
        </p>
      </div>
    );
  }

  const accent = COLORS.weekly.primary;
  const cardBg = COLORS.background.cardElevated;
  const cardBorder = COLORS.border.light;

  return (
    <div className={variant === "nested" ? "mt-8" : ""}>
      {variant === "standalone" && (
        <>
          <h2
            className="text-[13px] sm:text-sm font-semibold mb-1"
            style={{ color: COLORS.text.primary }}
          >
            시간 투자 한눈에 보기
          </h2>
          <p
            className="text-[12px] sm:text-sm mb-4"
            style={{ color: COLORS.text.secondary, lineHeight: "1.6" }}
          >
            시간 투자 변화
          </p>
        </>
      )}
      {variant === "nested" && (
        <h3
          className="text-xs sm:text-[13px] font-medium mb-3"
          style={{ color: COLORS.text.secondary }}
        >
          시간 투자 변화
        </h3>
      )}

      {!hasRealData && (
        <PreviewDataNotice
          subtitle="주간 비비드가 쌓이면 나의 시간 투자 기록이 표시됩니다"
          accentColor={accent}
        />
      )}

      <div
        className="relative rounded-xl overflow-hidden min-w-0 transition-all duration-300"
        style={{
          backgroundColor: cardBg,
          border: `1px solid ${cardBorder}`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ backgroundColor: accent }}
        />
        <div className="pl-4 pr-4 pt-4 pb-4">
          {/* 카테고리별 드롭다운 */}
          <div className="space-y-1">
            {CATEGORY_ORDER.map((cat, idx) => {
              const { average, percentages } = categoryData[cat] ?? {
                average: 0,
                percentages: [],
              };
              const isExpanded = expandedCategory === cat;
              const lineData = getLineChartDataForCategory(cat);
              const trendDesc = getTrendDescription(percentages);
              const weeklySummary = getWeeklyChangeSummary(percentages);

              return (
                <div
                  key={cat}
                  className="rounded-lg overflow-hidden"
                  style={{
                    backgroundColor: COLORS.background.base,
                    border: `1px solid ${COLORS.border.light}`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedCategory(isExpanded ? null : cat)
                    }
                    className="w-full flex items-center justify-between gap-2 px-3 py-3 text-left hover:opacity-90 transition-opacity"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor:
                            CHART_COLORS[idx % CHART_COLORS.length],
                        }}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{ color: COLORS.text.primary }}
                      >
                        {cat}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="text-sm font-semibold tabular-nums"
                        style={{ color: accent }}
                      >
                        평균 {average}%
                      </span>
                      {isExpanded ? (
                        <ChevronUp
                          className="w-4 h-4"
                          style={{ color: COLORS.text.muted }}
                        />
                      ) : (
                        <ChevronDown
                          className="w-4 h-4"
                          style={{ color: COLORS.text.muted }}
                        />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div
                      className="px-3 pb-4 pt-1 border-t"
                      style={{ borderColor: COLORS.border.light }}
                    >
                      {/* 해당 카테고리만의 라인 차트 */}
                      <div className="mb-4">
                        <ResponsiveContainer width="100%" height={180}>
                          <LineChart
                            data={lineData}
                            margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke={COLORS.border.light}
                              vertical={false}
                            />
                            <XAxis
                              dataKey="week_label"
                              tick={{
                                fontSize: 10,
                                fill: COLORS.text.muted,
                              }}
                              axisLine={{ stroke: COLORS.border.light }}
                              tickLine={false}
                            />
                            <YAxis
                              domain={[0, 100]}
                              tick={{
                                fontSize: 10,
                                fill: COLORS.text.muted,
                              }}
                              axisLine={false}
                              tickLine={{ stroke: COLORS.border.light }}
                              tickFormatter={(v) => `${v}%`}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: cardBg,
                                border: `1px solid ${cardBorder}`,
                                borderRadius: 8,
                                fontSize: 12,
                              }}
                              formatter={(value: number) => [`${value}%`, cat]}
                              labelFormatter={(label) => label}
                            />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke={
                                CHART_COLORS[idx % CHART_COLORS.length]
                              }
                              strokeWidth={2}
                              dot={{
                                r: 4,
                                strokeWidth: 2,
                                fill: CHART_COLORS[idx % CHART_COLORS.length],
                              }}
                              activeDot={{ r: 6, strokeWidth: 2 }}
                              isAnimationActive={isAnimated}
                              connectNulls
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* 주간 변화 요약 */}
                      <div
                        className="mb-4 px-3 py-2 rounded-lg"
                        style={{
                          backgroundColor: `${accent}12`,
                          border: `1px solid ${COLORS.border.light}`,
                        }}
                      >
                        <p
                          className="text-xs font-medium mb-1"
                          style={{ color: COLORS.text.secondary }}
                        >
                          주간 변화
                        </p>
                        <p
                          className="text-xs tabular-nums"
                          style={{ color: COLORS.text.primary }}
                        >
                          {weeklySummary}
                        </p>
                        {trendDesc && (
                          <p
                            className="text-xs mt-1"
                            style={{ color: accent }}
                          >
                            {trendDesc}
                          </p>
                        )}
                      </div>

                      {/* AI 인사이트 영역 (placeholder) */}
                      <div
                        className={cn(
                          "rounded-lg px-3 py-3 min-h-[60px]",
                          "border border-dashed"
                        )}
                        style={{
                          backgroundColor: COLORS.background.hover + "40",
                          borderColor: COLORS.border.light,
                        }}
                      >
                        <p
                          className="text-xs"
                          style={{ color: COLORS.text.muted }}
                        >
                          AI 피드백이 여기에 표시됩니다
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 4주 평균 스파이더 차트 */}
          <div
            className="mt-6 pt-6 border-t flex flex-col items-center"
            style={{ borderColor: COLORS.border.light }}
          >
            <p
              className="text-xs font-medium mb-3"
              style={{ color: COLORS.text.secondary }}
            >
              4주 평균 시간 투자
            </p>
            {radarData.length > 0 && (
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid
                    stroke={COLORS.primary[500]}
                    strokeOpacity={0.4}
                  />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={({ payload, x, y, textAnchor }) => {
                      const item = radarData.find(
                        (d) => d.subject === payload.value
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
                              fill={COLORS.primary[500]}
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
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={false}
                  />
                  <Radar
                    name="비율"
                    dataKey="value"
                    stroke={COLORS.primary[500]}
                    fill={COLORS.primary[500]}
                    fillOpacity={0.5}
                    strokeWidth={2}
                    isAnimationActive={isAnimated}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* 종합 AI 피드백 영역 */}
          <div
            className="mt-6 pt-6 border-t"
            style={{ borderColor: COLORS.border.light }}
          >
            <p
              className="text-xs font-medium mb-3"
              style={{ color: COLORS.text.secondary }}
            >
              종합 AI 피드백
            </p>
            <div
              className={cn(
                "rounded-xl px-4 py-4 min-h-[100px]",
                "border"
              )}
              style={{
                backgroundColor: COLORS.background.base,
                borderColor: COLORS.border.light,
              }}
            >
              <p
                className="text-sm leading-relaxed"
                style={{ color: COLORS.text.muted }}
              >
                최근 4주간의 시간 투자 패턴을 분석한 AI 피드백이 여기에 표시됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
