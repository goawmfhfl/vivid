"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ListTodo,
  TrendingUp,
  Sparkles,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { WeeklyReport } from "@/types/weekly-vivid";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { GradientCard } from "@/components/common/feedback";
import { ScrollAnimation } from "@/components/ui/ScrollAnimation";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

/** 스파이더 차트용 데이터 변환 - 최대값을 100으로 정규화해 비율 차이를 시각적으로 강조 */
function toRadarData(
  breakdown: Array<{ category: string; percentage: number }>
): Array<{ subject: string; value: number; fullMark: number; displayPercent: number }> {
  if (!breakdown.length) return [];
  const max = Math.max(...breakdown.map((b) => b.percentage), 1);
  return breakdown.map((b) => ({
    subject: b.category,
    value: (b.percentage / max) * 100,
    fullMark: 100,
    displayPercent: b.percentage,
  }));
}

/** 이번 주 한 일 분석 섹션 전용 그린 컬러 (프로젝트 브랜드) */
const SECTION_GREEN = COLORS.primary[500]; // #7f8f7a
const SECTION_GREEN_RGB = "127, 143, 122";

type CompletedTodosInsightsSectionProps = {
  completedTodosInsights: WeeklyReport["completed_todos_insights"] | undefined;
  vividColor: string;
};

/**
 * 이번 주 한 일 분석 섹션 (실행력 인사이트)
 * - exclude_todo_completion이 true면 섹션 숨김
 * - uses_todo_list가 false면 할 일 미사용 안내
 * - 그린 컬러 일관 적용, 도넛 차트, 카테고리별 드롭다운
 */
export function CompletedTodosInsightsSection({
  completedTodosInsights,
  vividColor: _vividColor,
}: CompletedTodosInsightsSectionProps) {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  

  const greenColor = SECTION_GREEN;
  const rgb = SECTION_GREEN_RGB;

  // 데이터 없음 (이전 버전 리포트 또는 로딩)
  if (!completedTodosInsights) {
    return null
  }

  const { uses_todo_list } = completedTodosInsights;
  const {
    completed_by_category,
    time_investment_summary,
    time_investment_breakdown,
    repetitive_patterns,
    new_areas,
    incomplete_patterns,
  } = completedTodosInsights;

  const hasAnyContent =
    (completed_by_category?.length ?? 0) > 0 ||
    !!time_investment_summary ||
    (time_investment_breakdown?.length ?? 0) > 0 ||
    (repetitive_patterns?.length ?? 0) > 0 ||
    (new_areas?.length ?? 0) > 0 ||
    (incomplete_patterns?.length ?? 0) > 0;

  // 할 일 미사용 (만들었지만 체크 없음)
  if (!uses_todo_list && !hasAnyContent) {
    return (
      <ScrollAnimation delay={0}>
        <GradientCard gradientColor={rgb}>
          <div className="flex items-start gap-4 mb-60">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: `${greenColor}20`,
                border: `2px solid ${greenColor}40`,
              }}
            >
              <ListTodo className="w-6 h-6" style={{ color: greenColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className={cn(TYPOGRAPHY.body.fontSize, "font-semibold mb-1")}
                style={{ color: COLORS.text.primary }}
              >
                이번 주 한 일 분석
              </h3>
              <p
                className={cn(TYPOGRAPHY.bodySmall.fontSize, TYPOGRAPHY.bodySmall.lineHeight)}
                style={{ color: COLORS.text.secondary }}
              >
                이번 주 할 일 기록이 없어 실행력 인사이트를 제공할 수 없습니다. 할 일을 작성하고 완료하면 여기서 분석 결과를 확인할 수 있습니다.
              </p>
            </div>
          </div>
        </GradientCard>
      </ScrollAnimation>
    );
  }

  const CHART_COLORS = [
    COLORS.primary[500],
    COLORS.primary[400],
    COLORS.primary[600],
    COLORS.primary[300],
    COLORS.primary[700],
    COLORS.secondary[400],
  ];

  return (
    <ScrollAnimation delay={300}>
      <div className="space-y-5 max-w-4xl mx-auto w-full">
        {/* 4. 이번 주 한 일 분석 - 섹션 헤더 (앞으로의 모습 종합 분석과 동일 스타일) */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${greenColor}, ${greenColor}cc)`,
              boxShadow: `0 2px 12px ${greenColor}40`,
            }}
          >
            <span
              className={cn(TYPOGRAPHY.body.fontSize, "font-bold")}
              style={{ color: "white" }}
            >
              4
            </span>
          </div>
          <div>
            <h3
              className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight, "uppercase tracking-wide")}
              style={{ color: COLORS.text.secondary }}
            >
              이번 주 한 일 분석
            </h3>
            <p
              className={cn(TYPOGRAPHY.caption.fontSize)}
              style={{ color: COLORS.text.tertiary }}
            >
              완료한 할 일을 기반으로 한 실행력 인사이트
            </p>
          </div>
        </div>

        {!hasAnyContent ? (
          <GradientCard gradientColor={rgb}>
            <div className="flex items-center gap-3 py-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: greenColor }} />
              <p
                className={cn(TYPOGRAPHY.bodySmall.fontSize)}
                style={{ color: COLORS.text.secondary }}
              >
                이번 주 완료한 할 일에 대한 상세 분석이 준비되었습니다.
              </p>
            </div>
          </GradientCard>
        ) : (
          <div className="space-y-5">
            {/* 카테고리별 완료 현황 */}
            {completed_by_category && completed_by_category.length > 0 && (
              <GradientCard gradientColor={rgb}>
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4" style={{ color: greenColor }} />
                  <span
                    className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight)}
                    style={{ color: COLORS.text.secondary }}
                  >
                    카테고리별 한 일 완료 현황
                  </span>
                </div>
                <div className="space-y-4">
                  {completed_by_category.map((cat, idx) => {
                    const isExpanded = expandedCategory === idx;
                    const hasItems = cat.items && cat.items.length > 0;
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.8)",
                          border: `1px solid rgba(${rgb}, 0.3)`,
                        }}
                      >
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <span
                            className={cn(TYPOGRAPHY.body.fontSize, "font-semibold")}
                            style={{ color: COLORS.text.primary }}
                          >
                            {cat.category}
                          </span>
                          {hasItems && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedCategory(isExpanded ? null : idx)
                              }
                              className={cn(
                                TYPOGRAPHY.caption.fontSize,
                                "font-medium px-2 py-1 rounded-md flex items-center gap-1 transition-colors"
                              )}
                              style={{
                                color: greenColor,
                                backgroundColor: `${greenColor}18`,
                              }}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                          {!hasItems && (
                            <span
                              className={cn(TYPOGRAPHY.caption.fontSize, "font-medium px-2 py-1 rounded-md")}
                              style={{
                                color: greenColor,
                                backgroundColor: `${greenColor}18`,
                              }}
                            >
                              {cat.count}개
                            </span>
                          )}
                        </div>
                        {cat.description && (
                          <p
                            className={cn(TYPOGRAPHY.body.fontSize, "mb-3")}
                            style={{ color: COLORS.text.secondary }}
                          >
                            {cat.description}
                          </p>
                        )}
                        {hasItems && isExpanded && (
                          <ul className="space-y-1.5 mt-3 pt-3 border-t border-white/50">
                            {(cat.items?.slice(0, 5) ?? []).map((item, i) => (
                              <li
                                key={i}
                                className={cn(TYPOGRAPHY.bodySmall.fontSize, "flex items-start gap-2")}
                                style={{ color: COLORS.text.primary }}
                              >
                                <span
                                  className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
                                  style={{ backgroundColor: greenColor }}
                                />
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </GradientCard>
            )}

            {/* 시간 투자 요약 - 도넛 차트 + 텍스트 */}
            {((time_investment_breakdown?.length ?? 0) > 0 || time_investment_summary) && (
              <GradientCard gradientColor={rgb}>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4" style={{ color: greenColor }} />
                  <span
                    className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight)}
                    style={{ color: COLORS.text.secondary }}
                  >
                    시간 투자 요약
                  </span>
                </div>
                {time_investment_breakdown && (time_investment_breakdown?.length ?? 0) > 0 && (() => {
                  const radarData = toRadarData(time_investment_breakdown);
                  return (
                  <div className="mb-4">
                    <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-stretch sm:justify-center">
                      {/* 1) 카테고리별 진행 바 - 어떤 게 얼마인지 한눈에 (모바일 최우선) */}
                      <div className="flex-1 min-w-0 space-y-4">
                        {(time_investment_breakdown ?? []).map((item, index) => (
                          <div
                            key={item.category}
                            className="flex flex-col gap-1.5 min-w-0"
                          >
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
                                className="text-sm sm:text-base font-semibold tabular-nums flex-shrink-0"
                                style={{ color: greenColor }}
                              >
                                {item.percentage}%
                              </span>
                            </div>
                            <div
                              className="h-2.5 rounded-full overflow-hidden"
                              style={{
                                backgroundColor: "rgba(0,0,0,0.06)",
                                minHeight: 10,
                              }}
                            >
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${item.percentage}%`,
                                  backgroundColor:
                                    CHART_COLORS[index % CHART_COLORS.length],
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* 2) 스파이더 차트 - 최대값 정규화로 비율 차이 강조 */}
                      <div className="w-full sm:w-44 flex-shrink-0 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={180}>
                          <RadarChart data={radarData}>
                            <PolarGrid stroke={greenColor} strokeOpacity={0.4} />
                            <PolarAngleAxis
                              dataKey="subject"
                              tick={({ payload, x, y, textAnchor }) => {
                                const item = radarData.find((d) => d.subject === payload.value);
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
                                        fill={greenColor}
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
                              stroke={greenColor}
                              fill={greenColor}
                              fillOpacity={0.5}
                              strokeWidth={2}
                              isAnimationActive
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  );
                })()}
                {time_investment_summary && (
                  <p
                    className={cn(TYPOGRAPHY.bodySmall.fontSize, TYPOGRAPHY.bodySmall.lineHeight)}
                    style={{ color: COLORS.text.secondary }}
                  >
                    {time_investment_summary}
                  </p>
                )}
              </GradientCard>
            )}

            {/* 반복 패턴 · 새로운 영역 · 미완료 패턴 - 통합 카드 */}
            {((repetitive_patterns?.length ?? 0) > 0 ||
              (new_areas?.length ?? 0) > 0 ||
              (incomplete_patterns?.length ?? 0) > 0) && (
              <GradientCard gradientColor={rgb}>
                <div className="grid gap-6 sm:grid-cols-3">
                  {repetitive_patterns && repetitive_patterns.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4" style={{ color: greenColor }} />
                        <span
                          className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight)}
                          style={{ color: COLORS.text.secondary }}
                        >
                          반복 패턴
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {repetitive_patterns.map((p, i) => (
                          <li
                            key={i}
                            className={cn(TYPOGRAPHY.bodySmall.fontSize, "flex items-start gap-2")}
                            style={{ color: COLORS.text.primary }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                              style={{ backgroundColor: greenColor }}
                            />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {new_areas && new_areas.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4" style={{ color: greenColor }} />
                        <span
                          className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight)}
                          style={{ color: COLORS.text.secondary }}
                        >
                          새로운 영역
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {new_areas.map((a, i) => (
                          <li
                            key={i}
                            className={cn(TYPOGRAPHY.bodySmall.fontSize, "flex items-start gap-2")}
                            style={{ color: COLORS.text.primary }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                              style={{ backgroundColor: greenColor }}
                            />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {incomplete_patterns && (incomplete_patterns?.length ?? 0) > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <ListTodo className="w-4 h-4" style={{ color: greenColor }} />
                        <span
                          className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight)}
                          style={{ color: COLORS.text.secondary }}
                        >
                          미완료 패턴
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {(incomplete_patterns ?? []).map((p, i) => (
                          <li
                            key={i}
                            className={cn(TYPOGRAPHY.bodySmall.fontSize, "flex items-start gap-2")}
                            style={{ color: COLORS.text.primary }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                              style={{ backgroundColor: greenColor }}
                            />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </GradientCard>
            )}
          </div>
        )}
      </div>
    </ScrollAnimation>
  );
}
