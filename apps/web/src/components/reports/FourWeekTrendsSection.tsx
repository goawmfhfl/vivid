"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, ChevronDown } from "lucide-react";
import { OneViewCardSkeleton } from "@/components/reports/GrowthInsightsSkeleton";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { ProNoticeBox } from "@/components/reports/ProNoticeBox";
import { COLORS } from "@/lib/design-system";
import { useDailyVividInsights } from "@/hooks/useDailyVividInsights";
import { useCountUp } from "@/hooks/useCountUp";
import { useSubscription } from "@/hooks/useSubscription";
import { PreviewDataNotice } from "./PreviewDataNotice";

interface FourWeekTrendsSectionProps {
  isLoading?: boolean;
  error?: Error | null;
}

function formatMonthWeek(month: number, day: number): string {
  const weekOfMonth = Math.ceil(day / 7);
  return `${month}월 ${weekOfMonth}주차`;
}

/** 데이터 없을 때 미리보기용 플레이스홀더 */
function getFourWeekPlaceholderMetrics(): {
  weekPoints: Array<{
    weekLabel: string;
    alignmentAverage: number;
    executionAverage: number;
    totalAverage: number;
    weekHasExecution?: boolean;
  }>;
  alignmentAverage: number;
  executionAverage: number;
  totalAverage: number;
} {
  const today = new Date();
  const weekPoints = Array.from({ length: 4 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (3 - i) * 7);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekOfMonth = Math.ceil(day / 7);
    return {
      weekLabel: `${month}월 ${weekOfMonth}주차`,
      alignmentAverage: 72 + (i % 2) * 4,
      executionAverage: 68 + (i % 3) * 3,
      totalAverage: 70 + (i % 2) * 3,
      weekHasExecution: true,
    };
  });
  return {
    weekPoints,
    alignmentAverage: 74,
    executionAverage: 69,
    totalAverage: 72,
  };
}

export function FourWeekTrendsSection({
  isLoading = false,
  error = null,
}: FourWeekTrendsSectionProps) {
  const { isPro } = useSubscription();
  const [isAnimated, setIsAnimated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    data: scoreEntries,
    isLoading: isLoadingScores,
    error: scoreError,
  } = useDailyVividInsights({ enabled: isPro, count: 30 });

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsAnimated(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const scoreMetrics = useMemo(() => {
    if (!scoreEntries || scoreEntries.length === 0) return null;

    const rows = scoreEntries
      .map((entry) => ({
        reportDate: entry.report_date,
        alignmentScore: entry.report && "alignment_score" in entry.report ? entry.report.alignment_score : undefined,
        executionScore: entry.report?.execution_score ?? null,
      }))
      .filter(
        (row): row is { reportDate: string; alignmentScore: number | undefined; executionScore: number | null } =>
          (typeof row.alignmentScore === "number" && Number.isFinite(row.alignmentScore)) ||
          (typeof row.executionScore === "number" && Number.isFinite(row.executionScore))
      );

    if (rows.length === 0) return null;

    const hasExecutionData = rows.some((r) => r.executionScore != null && Number.isFinite(r.executionScore));

    // 최신일 기준 정렬, 중복 날짜 제거 (날짜당 1개)
    const byDate = new Map<string, { alignmentScore?: number; executionScore: number | null }>();
    for (const r of rows) {
      if (!byDate.has(r.reportDate)) {
        byDate.set(r.reportDate, {
          alignmentScore: r.alignmentScore,
          executionScore: r.executionScore,
        });
      }
    }
    const uniqueDates = Array.from(byDate.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 28);

    if (uniqueDates.length === 0) return null;

    // 4주로 분할 (각 7일)
    const weekPoints: Array<{
      weekLabel: string;
      alignmentAverage: number;
      executionAverage: number;
      totalAverage: number;
      weekHasExecution: boolean;
    }> = [];

    for (let w = 0; w < 4; w++) {
      const start = w * 7;
      const chunk = uniqueDates.slice(start, start + 7);
      if (chunk.length === 0) break;

      const [endDate] = chunk[0]; // 해당 주의 마지막 날(최신일)
      const [month, day] = endDate.slice(5).split("-").map(Number);
      const weekLabel = formatMonthWeek(month, day);

      const alignmentValues = chunk
        .map(([, r]) => r.alignmentScore)
        .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
      const alignmentAvg = alignmentValues.length > 0
        ? Math.round(alignmentValues.reduce((s, v) => s + v, 0) / alignmentValues.length)
        : 0;
      const execValues = chunk
        .map(([, r]) => r.executionScore)
        .filter((v): v is number => v != null && Number.isFinite(v));
      const weekHasExecution = execValues.length > 0;
      const executionAvg = weekHasExecution
        ? Math.round(execValues.reduce((s, v) => s + v, 0) / execValues.length)
        : 0;
      const totalAvg = weekHasExecution
        ? Math.round((alignmentAvg + executionAvg) / 2)
        : alignmentAvg;
      weekPoints.push({
        weekLabel,
        alignmentAverage: alignmentAvg,
        executionAverage: executionAvg,
        totalAverage: totalAvg,
        weekHasExecution,
      });
    }

    // 과거 순 정렬 (가장 오래된 주가 먼저)
    weekPoints.reverse();

    if (weekPoints.length === 0) return null;

    const alignmentAverage = Math.round(
      weekPoints.reduce((s, p) => s + p.alignmentAverage, 0) / weekPoints.length
    );
    const execPoints = weekPoints.filter((p) => p.weekHasExecution !== false);
    const executionAverage =
      execPoints.length > 0
        ? Math.round(
            execPoints.reduce((s, p) => s + p.executionAverage, 0) / execPoints.length
          )
        : 0;
    const totalAverage = hasExecutionData && execPoints.length > 0
      ? Math.round((alignmentAverage + executionAverage) / 2)
      : alignmentAverage;

    return {
      weekPoints,
      alignmentAverage,
      executionAverage,
      totalAverage,
      hasExecutionData,
    };
  }, [scoreEntries]);

  const placeholderMetrics = useMemo(() => getFourWeekPlaceholderMetrics(), []);
  const effectiveMetrics = scoreMetrics ?? placeholderMetrics;
  const hasRealData = !!scoreMetrics;
  const hasExecutionData = scoreMetrics?.hasExecutionData ?? true;

  const displayTotal = useCountUp(effectiveMetrics.totalAverage, 1000, isAnimated);
  const displayAlignment = useCountUp(
    effectiveMetrics.alignmentAverage,
    900,
    isAnimated
  );
  const displayExecution = useCountUp(
    effectiveMetrics.executionAverage,
    900,
    isAnimated
  );

  if (isLoading) {
    return (
      <section className="mb-10 w-full max-w-2xl min-w-0">
        <h2
          className="text-[13px] sm:text-sm font-semibold mb-1"
          style={{ color: COLORS.text.primary }}
        >
          한눈에 보기
        </h2>
        <p className="text-[12px] sm:text-sm mb-4" style={{ color: COLORS.text.secondary, lineHeight: "1.6" }}>
          최근 4주간의 데이터를 기반으로 한 인사이트
        </p>
        <OneViewCardSkeleton />
      </section>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorDisplay
          message={error instanceof Error ? error.message : "최근 4주 동향을 불러오는 중 오류가 발생했습니다."}
          size="md"
        />
      </div>
    );
  }

  const accent = COLORS.weekly.primary; // 주간 페이지 전용 하늘빛
  const cardBg = COLORS.background.cardElevated;
  const cardBorder = COLORS.border.light;
  const showScoreSkeleton = isPro && isLoadingScores;

  return (
    <section className="mb-10 w-full max-w-2xl min-w-0">
      <h2
        className="text-[13px] sm:text-sm font-semibold mb-1"
        style={{ color: COLORS.text.primary }}
      >
        한눈에 보기
      </h2>
      <p className="text-[12px] sm:text-sm mb-4" style={{ color: COLORS.text.secondary, lineHeight: "1.6" }}>
        최근 4주간의 데이터를 기반으로 한 인사이트
      </p>

      {!isPro && (
        <ProNoticeBox
          message="Pro 멤버가 되면 최근 4주 기록을 바탕으로 한 인사이트를 확인할 수 있어요."
          className="mb-4"
        />
      )}

      {showScoreSkeleton ? (
        <div
          className="rounded-xl overflow-hidden min-w-0 transition-all duration-300 mb-4 animate-pulse"
          style={{
            backgroundColor: cardBg,
            border: `1px solid ${cardBorder}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div className="pl-4 pr-4 pt-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-4 items-center">
              <div className="flex justify-center">
                <div
                  className="w-[132px] h-[132px] rounded-full"
                  style={{
                    backgroundColor: COLORS.background.base,
                    border: `1px solid ${COLORS.border.light}`,
                  }}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[0, 1].map((idx) => (
                  <div
                    key={`skeleton-${idx}`}
                    className="rounded-lg p-3"
                    style={{
                      backgroundColor: COLORS.background.base,
                      border: `1px solid ${COLORS.border.light}`,
                    }}
                  >
                    <div className="h-3 w-20 rounded mb-2" style={{ backgroundColor: COLORS.border.light }} />
                    <div className="h-6 w-12 rounded" style={{ backgroundColor: COLORS.border.default }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t" style={{ borderColor: COLORS.border.light }}>
              <div className="h-3 w-48 rounded mb-2.5" style={{ backgroundColor: COLORS.border.light }} />
              <div className="h-16 rounded" style={{ backgroundColor: COLORS.border.light }} />
            </div>
          </div>
        </div>
      ) : isPro && !scoreError ? (
        <>
          {!hasRealData && (
            <PreviewDataNotice
              subtitle="꿈 일치도 데이터가 쌓이면 나의 기록이 표시됩니다"
              accentColor={accent}
            />
          )}
          <div
            className="relative rounded-xl overflow-hidden min-w-0 transition-all duration-300 mb-4"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${cardBorder}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: accent }} />
          <div className="pl-4 pr-4 pt-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-4 items-center">
              <div className="flex justify-center">
                <div className="relative w-[132px] h-[132px]">
                  {(() => {
                    const donutSize = 132;
                    const strokeWidth = 12;
                    const radius = (donutSize - strokeWidth) / 2;
                    const circumference = 2 * Math.PI * radius;
                    const progress = isAnimated
                      ? Math.max(0, Math.min(100, effectiveMetrics.totalAverage))
                      : 0;
                    const dashOffset = circumference - (progress / 100) * circumference;

                    return (
                      <svg width={donutSize} height={donutSize} className="-rotate-90">
                        <circle
                          cx={donutSize / 2}
                          cy={donutSize / 2}
                          r={radius}
                          fill="none"
                          stroke={COLORS.border.light}
                          strokeWidth={strokeWidth}
                        />
                        <circle
                          cx={donutSize / 2}
                          cy={donutSize / 2}
                          r={radius}
                          fill="none"
                          stroke={accent}
                          strokeWidth={strokeWidth}
                          strokeDasharray={circumference}
                          strokeDashoffset={dashOffset}
                          strokeLinecap="round"
                          style={{ transition: "stroke-dashoffset 1s ease-out" }}
                        />
                      </svg>
                    );
                  })()}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className="text-2xl font-semibold tabular-nums"
                      style={{ color: COLORS.text.primary }}
                    >
                      {displayTotal}
                    </span>
                    <span className="text-xs" style={{ color: COLORS.text.muted }}>
                      최근 한달 통합 평균
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="grid gap-2.5"
                style={{ gridTemplateColumns: hasExecutionData ? "1fr 1fr" : "1fr" }}
              >
                <div
                  className="rounded-lg p-3"
                  style={{
                    backgroundColor: COLORS.background.base,
                    border: `1px solid ${COLORS.border.light}`,
                  }}
                >
                  <p className="text-xs mb-1" style={{ color: COLORS.text.secondary }}>
                    꿈 일치도 평균
                  </p>
                  <p
                    className="text-xl font-semibold tabular-nums"
                    style={{ color: COLORS.chart.alignment }}
                  >
                    {displayAlignment}
                  </p>
                </div>
                {hasExecutionData && (
                  <div
                    className="rounded-lg p-3"
                    style={{
                      backgroundColor: COLORS.background.base,
                      border: `1px solid ${COLORS.border.light}`,
                    }}
                  >
                    <p className="text-xs mb-1" style={{ color: COLORS.text.secondary }}>
                      실행력 평균
                    </p>
                    <p
                      className="text-xl font-semibold tabular-nums"
                      style={{ color: COLORS.chart.execution }}
                    >
                      {displayExecution}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t" style={{ borderColor: COLORS.border.light }}>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between list-none cursor-pointer text-left py-1"
                style={{ color: COLORS.text.primary }}
              >
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" style={{ color: COLORS.brand.primary }} />
                  <span className="text-xs font-medium">
                    최근 한달 주차별 통합 평균 추이
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  style={{ color: COLORS.text.secondary }}
                />
              </button>
              {isExpanded && effectiveMetrics.weekPoints.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {effectiveMetrics.weekPoints.map((point) => (
                    <div key={point.weekLabel} className="flex flex-col items-center gap-1">
                      <div
                        className="w-full h-16 flex items-end justify-center"
                        style={{ gap: hasExecutionData ? 4 : 0 }}
                      >
                        <div
                          className="rounded-t transition-all duration-1000 ease-out"
                          style={{
                            width: hasExecutionData ? 8 : 16,
                            height: `${isAnimated ? Math.max(4, point.alignmentAverage * 0.64) : 0}px`,
                            backgroundColor: COLORS.chart.alignment,
                          }}
                        />
                        {hasExecutionData && (
                          <div
                            className="w-2 rounded-t transition-all duration-1000 ease-out"
                            style={{
                              height: `${isAnimated ? Math.max(4, point.executionAverage * 0.64) : 0}px`,
                              backgroundColor: COLORS.chart.execution,
                            }}
                          />
                        )}
                      </div>
                      <span className="text-[11px]" style={{ color: COLORS.text.muted }}>
                        {point.weekLabel}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        </>
      ) : null}
    </section>
  );
}
