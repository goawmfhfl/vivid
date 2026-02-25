"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import { OneViewCardSkeleton } from "@/components/reports/GrowthInsightsSkeleton";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { COLORS } from "@/lib/design-system";
import { useDailyVividInsights } from "@/hooks/useDailyVividInsights";
import { useCountUp } from "@/hooks/useCountUp";
import { getKSTDateString } from "@/lib/date-utils";
import { PreviewDataNotice } from "./PreviewDataNotice";

/** 데이터 부족 시 그래프 미리보기용 플레이스홀더 */
function getPlaceholderMetrics(): {
  totalAverage: number;
  alignmentAverage: number;
  todoCompletionAverage: number;
  rows: Array<{ reportDate: string; alignmentScore: number; todoCompletionScore: number }>;
} {
  const today = new Date();
  const rows = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return {
      reportDate: getKSTDateString(d),
      alignmentScore: 70 + (i % 3) * 5,
      todoCompletionScore: 68 + (i % 4) * 4,
    };
  });
  return {
    totalAverage: 72,
    alignmentAverage: 75,
    todoCompletionAverage: 68,
    rows,
  };
}

interface RecentTrendsSectionProps {
  isLoading?: boolean;
  error?: Error | null;
}

export function RecentTrendsSection({
  isLoading = false,
  error = null,
}: RecentTrendsSectionProps) {
  const [isAnimated, setIsAnimated] = useState(false);
  const {
    data: scoreEntries,
    isLoading: isLoadingScores,
    error: scoreError,
  } = useDailyVividInsights({ enabled: true, count: 7 });

  const placeholderMetrics = useMemo(() => getPlaceholderMetrics(), []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsAnimated(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // 꿈 일치도(alignment_score)=vivid, 투두 달성률(todo_completion_score)=review
  const scoreMetrics = useMemo(() => {
    if (!scoreEntries || scoreEntries.length === 0) return null;

    const rows = scoreEntries
      .map((entry) => ({
        reportDate: entry.report_date,
        alignmentScore: entry.report && "alignment_score" in entry.report ? entry.report.alignment_score : undefined,
        todoCompletionScore: entry.report && "todo_completion_score" in entry.report ? entry.report.todo_completion_score : null,
      }))
      .filter(
        (row): row is {
          reportDate: string;
          alignmentScore: number | undefined;
          todoCompletionScore: number | null;
        } =>
          (typeof row.alignmentScore === "number" && Number.isFinite(row.alignmentScore)) ||
          (typeof row.todoCompletionScore === "number" && Number.isFinite(row.todoCompletionScore))
      );

    if (rows.length === 0) return null;

    const withAlignment = rows.filter((r) => typeof r.alignmentScore === "number" && Number.isFinite(r.alignmentScore));
    const alignmentAverage = withAlignment.length > 0
      ? Math.round(withAlignment.reduce((sum, row) => sum + (row.alignmentScore ?? 0), 0) / withAlignment.length)
      : 0;
    const withTodoCompletion = rows.filter((r) => r.todoCompletionScore != null && Number.isFinite(r.todoCompletionScore) && r.todoCompletionScore > 0);
    const hasTodoCompletionData = withTodoCompletion.length > 0;
    const todoCompletionAverage = hasTodoCompletionData
      ? Math.round(
          withTodoCompletion.reduce((sum, r) => sum + (r.todoCompletionScore ?? 0), 0) / withTodoCompletion.length
        )
      : 0;
    const totalAverage = hasTodoCompletionData
      ? Math.round((alignmentAverage + todoCompletionAverage) / 2)
      : alignmentAverage;

    return {
      rows: rows.map((r) => ({
        reportDate: r.reportDate,
        alignmentScore: r.alignmentScore,
        todoCompletionScore: r.todoCompletionScore,
      })),
      alignmentAverage,
      todoCompletionAverage,
      totalAverage,
      hasTodoCompletionData,
    };
  }, [scoreEntries]);

  // 실제 데이터 있으면 사용, 없으면 플레이스홀더로 UI 미리보기
  const effectiveMetrics = scoreMetrics ?? placeholderMetrics;
  const hasRealData = !!scoreMetrics;
  const hasTodoCompletionData = scoreMetrics?.hasTodoCompletionData ?? true; // placeholder는 둘 다 있음

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
          최근 7일 데이터 기반 인사이트
        </p>
        <OneViewCardSkeleton />
      </section>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorDisplay
          message={error instanceof Error ? error.message : "최근 동향을 불러오는 중 오류가 발생했습니다."}
          size="md"
        />
      </div>
    );
  }

  const cardBg = COLORS.background.cardElevated;
  const cardBorder = COLORS.border.light;
  const showScoreSkeleton = isLoadingScores;
  const showGraphCard = !scoreError; // 데이터 부족해도 그래프 UI 미리보기

  return (
    <section className="mb-10 w-full max-w-2xl min-w-0">
      <h2
        className="text-[13px] sm:text-sm font-semibold mb-1"
        style={{ color: COLORS.text.primary }}
      >
        한눈에 보기
      </h2>
      <p className="text-[12px] sm:text-sm mb-4" style={{ color: COLORS.text.secondary, lineHeight: "1.6" }}>
        최근 7일 데이터 기반 인사이트
      </p>

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
                    key={`skeleton-metric-${idx}`}
                    className="rounded-lg p-3"
                    style={{
                      backgroundColor: COLORS.background.base,
                      border: `1px solid ${COLORS.border.light}`,
                    }}
                  >
                    <div
                      className="h-3 w-20 rounded mb-2"
                      style={{ backgroundColor: COLORS.border.light }}
                    />
                    <div
                      className="h-6 w-12 rounded"
                      style={{ backgroundColor: COLORS.border.default }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t" style={{ borderColor: COLORS.border.light }}>
              <div
                className="h-3 w-36 rounded mb-2.5"
                style={{ backgroundColor: COLORS.border.light }}
              />
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }).map((_, idx) => (
                  <div key={`skeleton-day-${idx}`} className="flex flex-col items-center gap-1">
                    <div className="w-full h-16 flex items-end justify-center gap-1">
                      <div
                        className="w-2 rounded-t"
                        style={{
                          height: `${18 + ((idx % 3) + 1) * 8}px`,
                          backgroundColor: COLORS.border.default,
                        }}
                      />
                      <div
                        className="w-2 rounded-t"
                        style={{
                          height: `${14 + ((idx % 4) + 1) * 7}px`,
                          backgroundColor: COLORS.border.light,
                        }}
                      />
                    </div>
                    <div
                      className="h-2 w-8 rounded"
                      style={{ backgroundColor: COLORS.border.light }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : showGraphCard ? (
        <>
          {!hasRealData && (
            <PreviewDataNotice
              subtitle="꿈 일치도 데이터가 쌓이면 나의 기록이 표시됩니다"
              accentColor={COLORS.brand.primary}
            />
          )}
          <div
            className="rounded-xl overflow-hidden min-w-0 transition-all duration-300 mb-4"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${cardBorder}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
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
                          stroke={COLORS.brand.primary}
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
                      {hasTodoCompletionData ? "통합 평균" : "꿈 일치도 평균"}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="grid gap-2.5"
                style={{
                  gridTemplateColumns: hasTodoCompletionData ? "1fr 1fr" : "1fr",
                }}
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
              <div className="flex items-center gap-1.5 mb-2.5">
                <BarChart3 className="w-3.5 h-3.5" style={{ color: COLORS.brand.primary }} />
                <span className="text-xs font-medium" style={{ color: COLORS.text.primary }}>
                  {effectiveMetrics.rows.length}일 데이터 점수 추이
                </span>
              </div>
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${effectiveMetrics.rows.length}, minmax(0, 1fr))` }}
              >
                {effectiveMetrics.rows.map((item) => (
                  <div key={item.reportDate} className="flex flex-col items-center gap-1">
                    <div
                      className="w-full h-16 flex items-end justify-center"
                      style={{ gap: hasTodoCompletionData && item.todoCompletionScore != null ? 4 : 0 }}
                    >
                      <div
                        className="rounded-t transition-all duration-1000 ease-out"
                        style={{
                          width: hasTodoCompletionData && item.todoCompletionScore != null ? 8 : 16,
                          height: `${isAnimated ? Math.max(4, (item.alignmentScore ?? 0) * 0.64) : 0}px`,
                          backgroundColor: COLORS.chart.alignment,
                        }}
                      />
                      {hasTodoCompletionData && item.todoCompletionScore != null && (
                        <div
                          className="w-2 rounded-t transition-all duration-1000 ease-out"
                          style={{
                            height: `${isAnimated ? Math.max(4, item.todoCompletionScore * 0.64) : 0}px`,
                            backgroundColor: COLORS.chart.execution,
                          }}
                        />
                      )}
                    </div>
                    <span className="text-[11px]" style={{ color: COLORS.text.muted }}>
                      {item.reportDate.slice(5).replace("-", ".")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </>
      ) : null}
    </section>
  );
}
