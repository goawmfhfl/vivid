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

interface FourMonthTrendsSectionProps {
  isLoading?: boolean;
  error?: Error | null;
}

/** 데이터 없을 때 미리보기용 플레이스홀더 */
function getFourMonthPlaceholderMetrics(): {
  monthPoints: Array<{
    monthLabel: string;
    alignmentAverage: number;
    todoCompletionAverage: number;
    totalAverage: number;
    monthHasTodoCompletion: boolean;
  }>;
  alignmentAverage: number;
  todoCompletionAverage: number;
  totalAverage: number;
  hasTodoCompletionData: boolean;
} {
  const today = new Date();
  const monthPoints = Array.from({ length: 4 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (3 - i), 1);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return {
      monthLabel: `${year}년 ${month}월`,
      alignmentAverage: 72 + (i % 2) * 4,
      todoCompletionAverage: 68 + (i % 3) * 3,
      totalAverage: 70 + (i % 2) * 3,
      monthHasTodoCompletion: true,
    };
  });
  return {
    monthPoints,
    alignmentAverage: 74,
    todoCompletionAverage: 69,
    totalAverage: 72,
    hasTodoCompletionData: true,
  };
}

export function FourMonthTrendsSection({
  isLoading = false,
  error = null,
}: FourMonthTrendsSectionProps) {
  const { isPro } = useSubscription();
  const [isAnimated, setIsAnimated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    data: scoreEntries,
    isLoading: isLoadingScores,
    error: scoreError,
  } = useDailyVividInsights({ enabled: isPro, count: 120 });

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
        todoCompletionScore: entry.report && "todo_completion_score" in entry.report ? entry.report.todo_completion_score : null,
      }))
      .filter(
        (row): row is { reportDate: string; alignmentScore: number | undefined; todoCompletionScore: number | null } =>
          (typeof row.alignmentScore === "number" && Number.isFinite(row.alignmentScore)) ||
          (typeof row.todoCompletionScore === "number" && Number.isFinite(row.todoCompletionScore))
      );

    if (rows.length === 0) return null;

    const hasTodoCompletionData = rows.some((r) => r.todoCompletionScore != null && Number.isFinite(r.todoCompletionScore));

    const byDate = new Map<string, { alignmentScore?: number; todoCompletionScore: number | null }>();
    for (const r of rows) {
      if (!byDate.has(r.reportDate)) {
        byDate.set(r.reportDate, { alignmentScore: r.alignmentScore, todoCompletionScore: r.todoCompletionScore });
      }
    }
    const uniqueDates = Array.from(byDate.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 120);

    if (uniqueDates.length === 0) return null;

    const byMonth = new Map<string, { alignmentScore: number[]; todoCompletionScore: number[] }>();
    for (const [date, scores] of uniqueDates) {
      const month = date.slice(0, 7);
      if (!byMonth.has(month)) {
        byMonth.set(month, { alignmentScore: [], todoCompletionScore: [] });
      }
      const m = byMonth.get(month)!;
      if (typeof scores.alignmentScore === "number" && Number.isFinite(scores.alignmentScore)) {
        m.alignmentScore.push(scores.alignmentScore);
      }
      if (scores.todoCompletionScore != null && Number.isFinite(scores.todoCompletionScore) && scores.todoCompletionScore > 0) {
        m.todoCompletionScore.push(scores.todoCompletionScore);
      }
    }

    const sortedMonths = Array.from(byMonth.keys()).sort().slice(-4);
    if (sortedMonths.length === 0) return null;

    const monthPoints: Array<{
      monthLabel: string;
      alignmentAverage: number;
      todoCompletionAverage: number;
      totalAverage: number;
      monthHasTodoCompletion: boolean;
    }> = [];

    for (const month of sortedMonths) {
      const m = byMonth.get(month)!;
      const alignmentAvg = m.alignmentScore.length > 0
        ? Math.round(m.alignmentScore.reduce((s, v) => s + v, 0) / m.alignmentScore.length)
        : 0;
      const monthHasTodoCompletion = m.todoCompletionScore.length > 0;
      const todoCompletionAvg = monthHasTodoCompletion
        ? Math.round(m.todoCompletionScore.reduce((s, v) => s + v, 0) / m.todoCompletionScore.length)
        : 0;
      const totalAvg = monthHasTodoCompletion
        ? Math.round((alignmentAvg + todoCompletionAvg) / 2)
        : alignmentAvg;
      const [y, mo] = month.split("-").map(Number);
      monthPoints.push({
        monthLabel: `${y}년 ${mo}월`,
        alignmentAverage: alignmentAvg,
        todoCompletionAverage: todoCompletionAvg,
        totalAverage: totalAvg,
        monthHasTodoCompletion,
      });
    }

    if (monthPoints.length === 0) return null;

    const alignmentAverage = Math.round(
      monthPoints.reduce((s, p) => s + p.alignmentAverage, 0) / monthPoints.length
    );
    // 할 일 달성률: 범위 내 실제 투두 작성한 날만 기준으로 평균 (체크가 하나도 안 된 날은 제외)
    const allTodoScoresInRange = uniqueDates
      .map(([, scores]) => scores.todoCompletionScore)
      .filter((v): v is number => v != null && Number.isFinite(v) && v > 0);
    const todoCompletionAverage =
      allTodoScoresInRange.length > 0
        ? Math.round(
            allTodoScoresInRange.reduce((s, v) => s + v, 0) / allTodoScoresInRange.length
          )
        : 0;
    const todoPoints = monthPoints.filter((p) => p.monthHasTodoCompletion);
    const totalAverage =
      hasTodoCompletionData && allTodoScoresInRange.length > 0
        ? Math.round((alignmentAverage + todoCompletionAverage) / 2)
        : alignmentAverage;

    return {
      monthPoints,
      alignmentAverage,
      todoCompletionAverage,
      totalAverage,
      hasTodoCompletionData,
    };
  }, [scoreEntries]);

  const placeholderMetrics = useMemo(() => getFourMonthPlaceholderMetrics(), []);
  const effectiveMetrics = scoreMetrics ?? placeholderMetrics;
  const hasRealData = !!scoreMetrics;
  const hasTodoCompletionData = scoreMetrics?.hasTodoCompletionData ?? true;

  const displayTotal = useCountUp(effectiveMetrics.totalAverage, 1000, isAnimated);
  const displayAlignment = useCountUp(
    effectiveMetrics.alignmentAverage,
    900,
    isAnimated
  );
  const displayTodoCompletion = useCountUp(
    effectiveMetrics.todoCompletionAverage ?? 0,
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
          최근 4달간의 데이터를 기반으로 한 인사이트
        </p>
        <OneViewCardSkeleton />
      </section>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorDisplay
          message={error instanceof Error ? error.message : "최근 4달 동향을 불러오는 중 오류가 발생했습니다."}
          size="md"
        />
      </div>
    );
  }

  const accent = COLORS.monthly.primary; // 월간 페이지 전용 부드러운 보랏빛
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
        최근 4달간의 데이터를 기반으로 한 인사이트
      </p>

      {!isPro && (
        <ProNoticeBox
          message="Pro 멤버가 되면 최근 4달 기록을 바탕으로 한 인사이트를 확인할 수 있어요."
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
                      최근 4달 통합 평균
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="grid gap-2.5"
                style={{ gridTemplateColumns: hasTodoCompletionData ? "1fr 1fr" : "1fr" }}
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
                {hasTodoCompletionData && (
                  <div
                    className="rounded-lg p-3"
                    style={{
                      backgroundColor: COLORS.background.base,
                      border: `1px solid ${COLORS.border.light}`,
                    }}
                  >
                    <p className="text-xs mb-1" style={{ color: COLORS.text.secondary }}>
                      할 일 달성률 평균
                    </p>
                    <p
                      className="text-xl font-semibold tabular-nums"
                      style={{ color: COLORS.chart.execution }}
                    >
                      {displayTodoCompletion}
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
                    최근 4달 월별 통합 평균 추이
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  style={{ color: COLORS.text.secondary }}
                />
              </button>
              {isExpanded && effectiveMetrics.monthPoints.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {effectiveMetrics.monthPoints.map((point) => (
                    <div key={point.monthLabel} className="flex flex-col items-center gap-1">
                      <div
                        className="w-full h-16 flex items-end justify-center"
                        style={{ gap: hasTodoCompletionData ? 4 : 0 }}
                      >
                        <div
                          className="rounded-t transition-all duration-1000 ease-out"
                          style={{
                            width: hasTodoCompletionData ? 8 : 16,
                            height: `${isAnimated ? Math.max(4, point.alignmentAverage * 0.64) : 0}px`,
                            backgroundColor: COLORS.chart.alignment,
                          }}
                        />
                        {hasTodoCompletionData && (
                          <div
                            className="w-2 rounded-t transition-all duration-1000 ease-out"
                            style={{
                              height: `${isAnimated ? Math.max(4, point.todoCompletionAverage * 0.64) : 0}px`,
                              backgroundColor: COLORS.chart.execution,
                            }}
                          />
                        )}
                      </div>
                      <span className="text-[11px]" style={{ color: COLORS.text.muted }}>
                        {point.monthLabel}
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
