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
import { useInvestmentTrends } from "@/hooks/useInvestmentTrends";
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

  const { data: investmentTrends } = useInvestmentTrends();

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
              const catRising = investmentTrends?.focus_pattern?.rising?.find((r) => r.category === cat);
              const catDeclining = investmentTrends?.focus_pattern?.declining?.find((d) => d.category === cat);

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

                      {/* 집중 패턴 AI 인사이트 */}
                      {investmentTrends?.focus_pattern && (investmentTrends.based_on_weeks ?? 0) >= 2 ? (
                        <div
                          className="rounded-lg px-3 py-3"
                          style={{
                            backgroundColor: `${accent}10`,
                            border: `1px solid ${accent}30`,
                          }}
                        >
                          {(catRising || catDeclining) && (
                            <div className="flex items-center gap-1.5 mb-2">
                              {catRising && (
                                <span
                                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                                  style={{
                                    backgroundColor: "#22c55e20",
                                    color: "#16a34a",
                                    border: "1px solid #22c55e40",
                                  }}
                                >
                                  ↑ {catRising.delta}
                                </span>
                              )}
                              {catDeclining && (
                                <span
                                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                                  style={{
                                    backgroundColor: COLORS.background.hover,
                                    color: COLORS.text.muted,
                                    border: `1px solid ${COLORS.border.light}`,
                                  }}
                                >
                                  ↓ {catDeclining.delta}
                                </span>
                              )}
                            </div>
                          )}
                          <p
                            className="text-xs leading-relaxed"
                            style={{ color: COLORS.text.secondary }}
                          >
                            {investmentTrends.focus_pattern.insight}
                          </p>
                        </div>
                      ) : (
                        <div
                          className={cn("rounded-lg px-3 py-3 min-h-[52px]", "border border-dashed")}
                          style={{
                            backgroundColor: COLORS.background.hover + "40",
                            borderColor: COLORS.border.light,
                          }}
                        >
                          <p className="text-xs" style={{ color: COLORS.text.muted }}>
                            주간 VIVID를 2개 이상 작성하면 AI 인사이트가 생성돼요
                          </p>
                        </div>
                      )}
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

          {/* 관심사 키워드 변화 */}
          <div
            className="mt-6 pt-6 border-t"
            style={{ borderColor: COLORS.border.light }}
          >
            <p
              className="text-xs font-medium mb-3"
              style={{ color: COLORS.text.secondary }}
            >
              관심사 키워드 변화
            </p>
            {investmentTrends?.keyword_trend && (investmentTrends.based_on_weeks ?? 0) >= 2 ? (
              <div
                className="rounded-xl px-4 py-4"
                style={{
                  backgroundColor: COLORS.background.base,
                  border: `1px solid ${COLORS.border.light}`,
                }}
              >
                {/* insight 텍스트 */}
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: COLORS.text.secondary }}
                >
                  {investmentTrends.keyword_trend.insight}
                </p>

                {/* 주차별 키워드 */}
                {investmentTrends.keyword_trend.keywords_by_week.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {investmentTrends.keyword_trend.keywords_by_week.map((w) => (
                      <div key={w.week_label} className="flex items-start gap-2">
                        <span
                          className="text-[10px] font-medium flex-shrink-0 mt-0.5 min-w-[56px]"
                          style={{ color: COLORS.text.muted }}
                        >
                          {w.week_label}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {w.keywords.map((kw) => {
                            const isRising = investmentTrends.keyword_trend?.rising.includes(kw);
                            const isDeclining = investmentTrends.keyword_trend?.declining.includes(kw);
                            return (
                              <span
                                key={kw}
                                className="text-[10px] px-1.5 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: isRising
                                    ? "#22c55e20"
                                    : isDeclining
                                    ? COLORS.background.hover
                                    : `${accent}15`,
                                  color: isRising
                                    ? "#16a34a"
                                    : isDeclining
                                    ? COLORS.text.muted
                                    : accent,
                                  border: isRising
                                    ? "1px solid #22c55e40"
                                    : isDeclining
                                    ? `1px solid ${COLORS.border.light}`
                                    : `1px solid ${accent}30`,
                                }}
                              >
                                {kw}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* rising / declining 요약 뱃지 */}
                {(investmentTrends.keyword_trend.rising.length > 0 ||
                  investmentTrends.keyword_trend.declining.length > 0) && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t" style={{ borderColor: COLORS.border.light }}>
                    {investmentTrends.keyword_trend.rising.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px]" style={{ color: COLORS.text.muted }}>↑ 증가</span>
                        {investmentTrends.keyword_trend.rising.map((kw) => (
                          <span
                            key={kw}
                            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: "#22c55e20",
                              color: "#16a34a",
                              border: "1px solid #22c55e40",
                            }}
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                    {investmentTrends.keyword_trend.declining.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px]" style={{ color: COLORS.text.muted }}>↓ 감소</span>
                        {investmentTrends.keyword_trend.declining.map((kw) => (
                          <span
                            key={kw}
                            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: COLORS.background.hover,
                              color: COLORS.text.muted,
                              border: `1px solid ${COLORS.border.light}`,
                            }}
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div
                className={cn("rounded-xl px-4 py-4 min-h-[80px]", "border border-dashed")}
                style={{
                  backgroundColor: COLORS.background.hover + "40",
                  borderColor: COLORS.border.light,
                }}
              >
                <p className="text-sm" style={{ color: COLORS.text.muted }}>
                  주간 VIVID를 2개 이상 작성하면 관심사 키워드 변화를 분석해드려요
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
