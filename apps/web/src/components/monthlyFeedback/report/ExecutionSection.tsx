"use client";

import {
  CheckCircle2,
  Lock,
  TrendingUp,
  ArrowRight,
  Star,
  Heart,
  Briefcase,
  Users,
  Sparkles,
  Target,
  MessageSquare,
  BarChart3,
  Zap,
} from "lucide-react";
import { Card } from "../../ui/card";
import type { ExecutionReport } from "@/types/monthly-feedback-new";
import { COLORS, SPACING, SHADOWS, TRANSITIONS } from "@/lib/design-system";
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
} from "recharts";

type ExecutionSectionProps = {
  executionReport: ExecutionReport;
  isPro?: boolean;
};

const EXECUTION_COLOR = COLORS.brand.primary; // #6B7A6F
const EXECUTION_COLOR_DARK = COLORS.brand.dark; // #5A6B5A

// 습관 카테고리별 아이콘과 라벨 - 프로젝트 디자인 시스템과 일치하는 컬러
const HABIT_CATEGORIES = {
  health: {
    icon: Heart,
    label: "건강",
    color: "#B89A7A", // 감정 섹션과 동일한 베이지 톤
    gradient: "linear-gradient(135deg, #B89A7A 0%, #A78A6A 100%)",
    lightBg: "rgba(184, 154, 122, 0.1)",
  },
  work: {
    icon: Briefcase,
    label: "업무",
    color: "#6B7A6F", // 실행 섹션 메인 컬러
    gradient: "linear-gradient(135deg, #6B7A6F 0%, #5A6B5A 100%)",
    lightBg: "rgba(107, 122, 111, 0.1)",
  },
  relationship: {
    icon: Users,
    label: "관계",
    color: "#A3BFD9", // 비전 섹션과 동일한 파란색 톤
    gradient: "linear-gradient(135deg, #A3BFD9 0%, #8FA8C7 100%)",
    lightBg: "rgba(163, 191, 217, 0.1)",
  },
  self_care: {
    icon: Sparkles,
    label: "자기계발",
    color: "#8B9A8F", // 실행 섹션과 조화로운 녹색 계열
    gradient: "linear-gradient(135deg, #8B9A8F 0%, #7A8A7A 100%)",
    lightBg: "rgba(139, 154, 143, 0.1)",
  },
} as const;

export function ExecutionSection({
  executionReport,
  isPro = false,
}: ExecutionSectionProps) {
  const router = useRouter();

  if (!executionReport) {
    return null;
  }

  // 습관 점수 차트 데이터 준비
  const habitChartData = executionReport.habit_scores
    ? (["health", "work", "relationship", "self_care"] as const)
        .map((category) => {
          const score = executionReport.habit_scores[category];
          if (score === undefined) return null;
          return {
            name: HABIT_CATEGORIES[category].label,
            value: score,
            color: HABIT_CATEGORIES[category].color,
            gradient: HABIT_CATEGORIES[category].gradient,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
    : [];

  // 빈도수 기반 크기 계산 (최대 빈도수 대비)
  const maxFrequency =
    executionReport.core_feedbacks && executionReport.core_feedbacks.length > 0
      ? Math.max(...executionReport.core_feedbacks.map((f) => f.frequency))
      : 1;

  const maxImprovementFrequency =
    executionReport.recurring_improvements_with_frequency &&
    executionReport.recurring_improvements_with_frequency.length > 0
      ? Math.max(
          ...executionReport.recurring_improvements_with_frequency.map(
            (f) => f.frequency
          )
        )
      : 1;

  return (
    <div className={cn(SPACING.section.marginBottom)}>
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-5 sm:mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${EXECUTION_COLOR} 0%, ${EXECUTION_COLOR_DARK} 100%)`,
            boxShadow: `0 4px 12px ${EXECUTION_COLOR}30`,
          }}
        >
          <CheckCircle2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2
            className="text-xl sm:text-2xl font-semibold"
            style={{ color: COLORS.text.primary }}
          >
            이번 달의 피드백
          </h2>
          <p className="text-xs mt-0.5" style={{ color: COLORS.text.muted }}>
            실행과 성장의 패턴을 확인하세요
          </p>
        </div>
      </div>

      {/* Recurring Positives - 모든 사용자 */}
      {Array.isArray(executionReport.recurring_positives) &&
        executionReport.recurring_positives.length > 0 && (
          <Card
            className={cn(
              "mb-5 relative overflow-hidden group",
              TRANSITIONS.default
            )}
            style={{
              background:
                "linear-gradient(135deg, rgba(107, 122, 111, 0.08) 0%, rgba(255, 255, 255, 1) 100%)",
              border: `1.5px solid ${EXECUTION_COLOR}30`,
              borderRadius: "20px",
              boxShadow: SHADOWS.md,
            }}
          >
            {/* 배경 장식 */}
            <div
              className="absolute top-0 right-0 w-40 h-40 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
              style={{
                background:
                  "radial-gradient(circle, rgba(107, 122, 111, 0.8) 0%, transparent 70%)",
              }}
            />
            {/* 헤더 */}
            <div
              className={cn(
                SPACING.card.padding,
                "pb-4 border-b relative z-10"
              )}
              style={{ borderColor: `${EXECUTION_COLOR}20` }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${EXECUTION_COLOR} 0%, ${EXECUTION_COLOR_DARK} 100%)`,
                    boxShadow: `0 4px 12px ${EXECUTION_COLOR}30`,
                  }}
                >
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: COLORS.text.primary }}
                    >
                      반복되는 잘한 점
                    </p>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{
                        backgroundColor: `${EXECUTION_COLOR}20`,
                        color: EXECUTION_COLOR,
                      }}
                    >
                      {executionReport.recurring_positives.length}개
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* 바디 */}
            <div className={cn(SPACING.card.padding, "pt-4 relative z-10")}>
              <ul className="space-y-2">
                {executionReport.recurring_positives
                  .slice(0, isPro ? 10 : 5)
                  .map((positive, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div
                        className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: EXECUTION_COLOR,
                        }}
                      />
                      <span
                        className="text-sm flex-1"
                        style={{
                          color: COLORS.text.primary,
                          lineHeight: "1.7",
                        }}
                      >
                        {positive}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </Card>
        )}

      {/* Pro 전용 섹션들 */}
      {isPro ? (
        <div className="space-y-4">
          {/* Core Feedback for Month */}
          {executionReport.core_feedback_for_month && (
            <Card
              className={cn(
                "p-5 sm:p-6 mb-5 relative overflow-hidden group",
                TRANSITIONS.default
              )}
              style={{
                background:
                  "linear-gradient(135deg, rgba(107, 122, 111, 0.12) 0%, rgb(255, 255, 255) 100%)",
                border: `1.5px solid ${EXECUTION_COLOR}40`,
                borderRadius: "20px",
                boxShadow: SHADOWS.lg,
              }}
            >
              {/* 배경 장식 */}
              <div
                className="absolute top-0 right-0 w-48 h-48 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
                style={{
                  background:
                    "radial-gradient(circle, rgba(107, 122, 111, 0.8) 0%, transparent 70%)",
                }}
              />
              {/* 헤더 */}
              <div
                className={cn("pb-4 mb-4 border-b relative z-10")}
                style={{ borderColor: `${EXECUTION_COLOR}20` }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${EXECUTION_COLOR} 0%, ${EXECUTION_COLOR_DARK} 100%)`,
                      boxShadow: `0 4px 12px ${EXECUTION_COLOR}30`,
                    }}
                  >
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: COLORS.text.primary }}
                      >
                        이번 달 핵심 피드백
                      </p>
                      <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: EXECUTION_COLOR }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* 바디 */}
              <div className="relative z-10">
                <div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: COLORS.background.card,
                    border: `1px solid ${COLORS.border.light}`,
                  }}
                >
                  <p
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{
                      color: COLORS.text.primary,
                      lineHeight: "1.8",
                    }}
                  >
                    {executionReport.core_feedback_for_month}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Habit Scores with Chart */}
          {executionReport.habit_scores && habitChartData.length > 0 && (
            <Card
              className={cn(
                "p-5 sm:p-6 mb-5 relative overflow-hidden group",
                TRANSITIONS.default
              )}
              style={{
                background:
                  "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgb(255, 255, 255) 100%)",
                border: `1.5px solid ${EXECUTION_COLOR}30`,
                borderRadius: "20px",
                boxShadow: SHADOWS.md,
              }}
            >
              {/* 배경 장식 */}
              <div
                className="absolute top-0 right-0 w-48 h-48 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
                style={{
                  background:
                    "radial-gradient(circle, rgba(107, 122, 111, 0.8) 0%, transparent 70%)",
                }}
              />
              {/* 헤더 */}
              <div
                className={cn("pb-4 mb-4 border-b relative z-10")}
                style={{ borderColor: `${EXECUTION_COLOR}20` }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${EXECUTION_COLOR} 0%, ${EXECUTION_COLOR_DARK} 100%)`,
                      boxShadow: `0 4px 12px ${EXECUTION_COLOR}30`,
                    }}
                  >
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: COLORS.text.primary }}
                      >
                        습관 점수
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* 바디 */}
              <div className="relative z-10">
                {/* 바 차트 */}
                <div className="mb-5" style={{ height: "200px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={habitChartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                      barCategoryGap="30%"
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={COLORS.border.light}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12, fill: COLORS.text.secondary }}
                        axisLine={{ stroke: COLORS.border.light }}
                      />
                      <YAxis
                        domain={[0, 10]}
                        tick={{ fontSize: 12, fill: COLORS.text.secondary }}
                        axisLine={{ stroke: COLORS.border.light }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: COLORS.background.card,
                          border: `1px solid ${COLORS.border.default}`,
                          borderRadius: "12px",
                          boxShadow: SHADOWS.md,
                        }}
                        labelStyle={{ color: COLORS.text.primary }}
                        formatter={(value: number) => [`${value}/10`, "점수"]}
                      />
                      <Bar
                        dataKey="value"
                        radius={[8, 8, 0, 0]}
                        animationDuration={1000}
                      >
                        {habitChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* 상세 카드들 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(
                    ["health", "work", "relationship", "self_care"] as const
                  ).map((category) => {
                    const categoryInfo = HABIT_CATEGORIES[category];
                    const score = executionReport.habit_scores[category];
                    const reason = executionReport.habit_scores[
                      `${category}_reason` as keyof typeof executionReport.habit_scores
                    ] as string | undefined;

                    if (score === undefined) return null;

                    const Icon = categoryInfo.icon;
                    const percentage = (score / 10) * 100;

                    return (
                      <div
                        key={category}
                        className="p-4 rounded-xl group/item transition-all duration-200"
                        style={{
                          backgroundColor: COLORS.background.card,
                          border: `1.5px solid ${categoryInfo.color}20`,
                          boxShadow: SHADOWS.sm,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor =
                            categoryInfo.color;
                          e.currentTarget.style.boxShadow = `0 4px 12px ${categoryInfo.color}30`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = `${categoryInfo.color}20`;
                          e.currentTarget.style.boxShadow = SHADOWS.sm;
                        }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                              background: categoryInfo.gradient,
                              boxShadow: `0 2px 8px ${categoryInfo.color}30`,
                            }}
                          >
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span
                            className="text-sm font-semibold flex-1"
                            style={{ color: COLORS.text.primary }}
                          >
                            {categoryInfo.label}
                          </span>
                          <span
                            className="text-lg font-bold"
                            style={{ color: categoryInfo.color }}
                          >
                            {score}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: COLORS.text.muted }}
                          >
                            /10
                          </span>
                        </div>

                        {/* 프로그레스 바 */}
                        <div className="mb-2">
                          <div
                            className="h-2 rounded-full overflow-hidden"
                            style={{
                              backgroundColor: categoryInfo.lightBg,
                            }}
                          >
                            <div
                              className="h-full rounded-full transition-all duration-1000 ease-out"
                              style={{
                                width: `${percentage}%`,
                                background: categoryInfo.gradient,
                                boxShadow: `0 0 8px ${categoryInfo.color}40`,
                              }}
                            />
                          </div>
                        </div>

                        {reason && (
                          <p
                            className="text-xs mt-2 leading-relaxed"
                            style={{ color: COLORS.text.secondary }}
                          >
                            {reason}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}

          {/* Core Feedbacks */}
          {Array.isArray(executionReport.core_feedbacks) &&
            executionReport.core_feedbacks.length > 0 && (
              <Card
                className={cn(
                  "p-5 sm:p-6 mb-5 relative overflow-hidden group",
                  TRANSITIONS.default
                )}
                style={{
                  background:
                    "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgb(255, 255, 255) 100%)",
                  border: `1.5px solid ${EXECUTION_COLOR}30`,
                  borderRadius: "20px",
                  boxShadow: SHADOWS.md,
                }}
              >
                {/* 배경 장식 */}
                <div
                  className="absolute top-0 right-0 w-40 h-40 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(107, 122, 111, 0.8) 0%, transparent 70%)",
                  }}
                />
                {/* 헤더 */}
                <div
                  className={cn("pb-4 mb-4 border-b relative z-10")}
                  style={{ borderColor: `${EXECUTION_COLOR}20` }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${EXECUTION_COLOR} 0%, ${EXECUTION_COLOR_DARK} 100%)`,
                        boxShadow: `0 4px 12px ${EXECUTION_COLOR}30`,
                      }}
                    >
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p
                          className="text-sm font-semibold"
                          style={{ color: COLORS.text.primary }}
                        >
                          핵심 피드백
                        </p>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{
                            backgroundColor: `${EXECUTION_COLOR}20`,
                            color: EXECUTION_COLOR,
                          }}
                        >
                          {executionReport.core_feedbacks.length}개
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 바디 */}
                <div className="relative z-10">
                  <div className="space-y-3">
                    {executionReport.core_feedbacks.map((feedback, idx) => {
                      const frequencyRatio = feedback.frequency / maxFrequency;
                      const intensity = Math.max(0.3, frequencyRatio);

                      return (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-xl group/item transition-all duration-200"
                          style={{
                            backgroundColor: COLORS.background.card,
                            border: `1.5px solid ${EXECUTION_COLOR}${Math.round(
                              intensity * 40
                            )}`,
                            boxShadow: SHADOWS.sm,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = EXECUTION_COLOR;
                            e.currentTarget.style.boxShadow = `0 4px 12px ${EXECUTION_COLOR}30`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = `${EXECUTION_COLOR}${Math.round(
                              intensity * 40
                            )}`;
                            e.currentTarget.style.boxShadow = SHADOWS.sm;
                          }}
                        >
                          <div
                            className="flex-shrink-0 mt-1 transition-transform duration-200 group-hover/item:scale-110"
                            style={{
                              opacity: intensity,
                            }}
                          >
                            <CheckCircle2
                              className="w-5 h-5"
                              style={{ color: EXECUTION_COLOR }}
                            />
                          </div>
                          <div className="flex-1">
                            <span
                              className="text-sm block"
                              style={{
                                color: COLORS.text.primary,
                                lineHeight: "1.7",
                              }}
                            >
                              {feedback.summary}
                            </span>
                            {feedback.frequency > 1 && (
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-1">
                                  {Array.from({
                                    length: Math.min(feedback.frequency, 5),
                                  }).map((_, i) => (
                                    <div
                                      key={i}
                                      className="w-1.5 h-1.5 rounded-full"
                                      style={{
                                        backgroundColor: EXECUTION_COLOR,
                                        opacity: 0.6 + i * 0.1,
                                      }}
                                    />
                                  ))}
                                </div>
                                <span
                                  className="text-xs font-medium"
                                  style={{
                                    color: EXECUTION_COLOR,
                                    backgroundColor: `${EXECUTION_COLOR}15`,
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                  }}
                                >
                                  {feedback.frequency}회 반복
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            )}

          {/* Recurring Improvements with Frequency */}
          {Array.isArray(
            executionReport.recurring_improvements_with_frequency
          ) &&
            executionReport.recurring_improvements_with_frequency.length >
              0 && (
              <Card
                className={cn(
                  "p-5 sm:p-6 mb-5 relative overflow-hidden group",
                  TRANSITIONS.default
                )}
                style={{
                  background:
                    "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgb(255, 255, 255) 100%)",
                  border: `1.5px solid ${EXECUTION_COLOR}30`,
                  borderRadius: "20px",
                  boxShadow: SHADOWS.md,
                }}
              >
                {/* 배경 장식 */}
                <div
                  className="absolute top-0 right-0 w-40 h-40 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(107, 122, 111, 0.8) 0%, transparent 70%)",
                  }}
                />
                {/* 헤더 */}
                <div
                  className={cn("pb-4 mb-4 border-b relative z-10")}
                  style={{ borderColor: `${EXECUTION_COLOR}20` }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${EXECUTION_COLOR} 0%, ${EXECUTION_COLOR_DARK} 100%)`,
                        boxShadow: `0 4px 12px ${EXECUTION_COLOR}30`,
                      }}
                    >
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p
                          className="text-sm font-semibold"
                          style={{ color: COLORS.text.primary }}
                        >
                          개선이 필요한 영역
                        </p>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{
                            backgroundColor: `${EXECUTION_COLOR}20`,
                            color: EXECUTION_COLOR,
                          }}
                        >
                          {
                            executionReport
                              .recurring_improvements_with_frequency.length
                          }
                          개
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 바디 */}
                <div className="relative z-10">
                  <div className="space-y-3">
                    {executionReport.recurring_improvements_with_frequency.map(
                      (improvement, idx) => {
                        const frequencyRatio =
                          improvement.frequency / maxImprovementFrequency;
                        const intensity = Math.max(0.3, frequencyRatio);

                        return (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-3 rounded-xl group/item transition-all duration-200"
                            style={{
                              backgroundColor: COLORS.background.card,
                              border: `1.5px solid ${EXECUTION_COLOR}${Math.round(
                                intensity * 40
                              )}`,
                              boxShadow: SHADOWS.sm,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor =
                                EXECUTION_COLOR;
                              e.currentTarget.style.boxShadow = `0 4px 12px ${EXECUTION_COLOR}30`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = `${EXECUTION_COLOR}${Math.round(
                                intensity * 40
                              )}`;
                              e.currentTarget.style.boxShadow = SHADOWS.sm;
                            }}
                          >
                            <div
                              className="flex-shrink-0 mt-1.5 w-2 h-2 rounded-full transition-transform duration-200 group-hover/item:scale-150"
                              style={{
                                backgroundColor: EXECUTION_COLOR,
                                opacity: intensity,
                                boxShadow: `0 0 8px ${EXECUTION_COLOR}40`,
                              }}
                            />
                            <div className="flex-1">
                              <span
                                className="text-sm block"
                                style={{
                                  color: COLORS.text.primary,
                                  lineHeight: "1.7",
                                }}
                              >
                                {improvement.summary}
                              </span>
                              {improvement.frequency > 1 && (
                                <div className="flex items-center gap-2 mt-2">
                                  <div className="flex items-center gap-1">
                                    {Array.from({
                                      length: Math.min(
                                        improvement.frequency,
                                        5
                                      ),
                                    }).map((_, i) => (
                                      <div
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{
                                          backgroundColor: EXECUTION_COLOR,
                                          opacity: 0.6 + i * 0.1,
                                        }}
                                      />
                                    ))}
                                  </div>
                                  <span
                                    className="text-xs font-medium"
                                    style={{
                                      color: EXECUTION_COLOR,
                                      backgroundColor: `${EXECUTION_COLOR}15`,
                                      padding: "2px 6px",
                                      borderRadius: "4px",
                                    }}
                                  >
                                    {improvement.frequency}회 반복
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </Card>
            )}

          {/* AI Comment */}
          {executionReport.feedback_ai_comment && (
            <Card
              className={cn(
                "p-5 sm:p-6 mb-5 relative overflow-hidden group",
                TRANSITIONS.default
              )}
              style={{
                background:
                  "linear-gradient(135deg, rgba(107, 122, 111, 0.12) 0%, rgb(255, 255, 255) 100%)",
                border: `1.5px solid ${EXECUTION_COLOR}40`,
                borderRadius: "20px",
                boxShadow: SHADOWS.lg,
              }}
            >
              {/* 배경 장식 */}
              <div
                className="absolute top-0 right-0 w-48 h-48 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
                style={{
                  background:
                    "radial-gradient(circle, rgba(107, 122, 111, 0.8) 0%, transparent 70%)",
                }}
              />
              {/* 헤더 */}
              <div
                className={cn("pb-4 mb-4 border-b relative z-10")}
                style={{ borderColor: `${EXECUTION_COLOR}20` }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${EXECUTION_COLOR} 0%, ${EXECUTION_COLOR_DARK} 100%)`,
                      boxShadow: `0 4px 12px ${EXECUTION_COLOR}30`,
                    }}
                  >
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: COLORS.text.primary }}
                      >
                        AI 종합 코멘트
                      </p>
                      <Zap
                        className="w-4 h-4"
                        style={{ color: EXECUTION_COLOR }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* 바디 */}
              <div className="relative z-10">
                <div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: COLORS.background.card,
                    border: `1px solid ${COLORS.border.light}`,
                  }}
                >
                  <p
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{
                      color: COLORS.text.primary,
                      lineHeight: "1.8",
                    }}
                  >
                    {executionReport.feedback_ai_comment}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      ) : (
        /* Free 모드: Pro 업그레이드 유도 */
        <Card
          className={cn(
            SPACING.card.padding,
            "cursor-pointer relative overflow-hidden group",
            TRANSITIONS.default,
            "hover:scale-[1.02]"
          )}
          style={{
            background:
              "linear-gradient(135deg, rgba(107, 122, 111, 0.12) 0%, rgba(255, 255, 255, 1) 100%)",
            border: `1.5px solid ${EXECUTION_COLOR}40`,
            borderRadius: "20px",
            boxShadow: SHADOWS.lg,
          }}
          onClick={() => router.push("/subscription")}
        >
          {/* 배경 장식 */}
          <div
            className="absolute top-0 right-0 w-48 h-48 opacity-5 group-hover:opacity-15 transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(circle, rgba(107, 122, 111, 0.8) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(circle, rgba(107, 122, 111, 0.6) 0%, transparent 70%)",
            }}
          />

          <div className="flex items-start gap-4 relative z-10">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
              style={{
                background: `linear-gradient(135deg, ${EXECUTION_COLOR}30 0%, ${EXECUTION_COLOR}15 100%)`,
                border: `2px solid ${EXECUTION_COLOR}40`,
                boxShadow: `0 4px 12px ${EXECUTION_COLOR}20`,
              }}
            >
              <Lock className="w-6 h-6" style={{ color: EXECUTION_COLOR }} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <p
                  className="text-sm font-semibold"
                  style={{ color: COLORS.text.primary }}
                >
                  더 깊은 피드백 분석이 필요하신가요?
                </p>
                <span
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${EXECUTION_COLOR} 0%, ${EXECUTION_COLOR_DARK} 100%)`,
                    color: COLORS.text.white,
                    letterSpacing: "0.5px",
                    boxShadow: `0 2px 8px ${EXECUTION_COLOR}30`,
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
                Pro 멤버십에서는 이번 달의 <strong>습관 점수 시각화</strong>,{" "}
                <strong>핵심 피드백 분석</strong>,{" "}
                <strong>개선 영역 추적</strong>을 제공합니다. &quot;기록을 통해
                나는 어떻게 달라지고 있을까?&quot; 직접 확인해보세요.
              </p>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl group/cta transition-all duration-200"
                style={{
                  backgroundColor: `${EXECUTION_COLOR}10`,
                  border: `1.5px solid ${EXECUTION_COLOR}30`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${EXECUTION_COLOR}15`;
                  e.currentTarget.style.borderColor = EXECUTION_COLOR;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = `${EXECUTION_COLOR}10`;
                  e.currentTarget.style.borderColor = `${EXECUTION_COLOR}30`;
                }}
              >
                <span
                  className="text-sm font-semibold"
                  style={{ color: EXECUTION_COLOR }}
                >
                  Pro 멤버십으로 업그레이드
                </span>
                <ArrowRight
                  className="w-4 h-4 transition-transform duration-200 group-hover/cta:translate-x-1"
                  style={{ color: EXECUTION_COLOR }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
