"use client";

import { useState, useEffect, useRef } from "react";
import {
  Heart,
  TrendingUp,
  AlertTriangle,
  Zap,
  Sparkles,
  HelpCircle,
  X,
  Target,
} from "lucide-react";
import { Card } from "../../ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useCountUp } from "@/hooks/useCountUp";
import type { MonthlyReportData } from "./types";
import {
  SECTION_COLORS,
  COMMON_COLORS,
  TYPOGRAPHY,
  SPACING,
  CARD_STYLES,
} from "./design-system";

type EmotionOverviewSectionProps = {
  emotion_overview: MonthlyReportData["emotion_overview"];
};

const QUADRANT_COLORS = {
  "몰입·설렘": "#7C9A7C", // 더 깊은 그린
  "불안·초조": "#D4A574", // 따뜻한 베이지
  "슬픔·무기력": "#8B9A8B", // 중성 그레이-그린
  "안도·평온": "#B8A082", // 부드러운 베이지-브라운
};

const QUADRANT_GRADIENTS = {
  "몰입·설렘": "linear-gradient(135deg, #7C9A7C 0%, #6B8A6B 100%)",
  "불안·초조": "linear-gradient(135deg, #D4A574 0%, #C49564 100%)",
  "슬픔·무기력": "linear-gradient(135deg, #8B9A8B 0%, #7A8A7A 100%)",
  "안도·평온": "linear-gradient(135deg, #B8A082 0%, #A89072 100%)",
};

const QUADRANT_ICONS = {
  "몰입·설렘": Zap,
  "불안·초조": AlertTriangle,
  "슬픔·무기력": Heart,
  "안도·평온": TrendingUp,
};

export function EmotionOverviewSection({
  emotion_overview,
}: EmotionOverviewSectionProps) {
  const [showStabilityTooltip, setShowStabilityTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // 숫자로 변환 (복호화 과정에서 문자열로 변환될 수 있음)
  const emotionStabilityScore =
    typeof emotion_overview.emotion_stability_score === "number"
      ? emotion_overview.emotion_stability_score
      : Number(emotion_overview.emotion_stability_score) || 0;

  const [stability, stabilityRef] = useCountUp({
    targetValue: emotionStabilityScore,
    duration: 1000,
    delay: 0,
    triggerOnVisible: true,
  });

  // 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setShowStabilityTooltip(false);
      }
    }

    if (showStabilityTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStabilityTooltip]);

  // 감정 사분면 분포 차트 데이터 - 4개 사분면 모두 포함
  const allQuadrants: Array<
    "몰입·설렘" | "불안·초조" | "슬픔·무기력" | "안도·평온"
  > = ["몰입·설렘", "불안·초조", "슬픔·무기력", "안도·평온"];

  // 기존 데이터를 맵으로 변환
  const quadrantMap = new Map(
    emotion_overview.emotion_quadrant_distribution.map((item) => [
      item.quadrant,
      item,
    ])
  );

  // 4개 사분면 모두 포함하여 차트 데이터 생성
  const quadrantChartData = allQuadrants.map((quadrant) => {
    const item = quadrantMap.get(quadrant) || {
      quadrant,
      count: 0,
      ratio: 0,
      explanation: `이번 달에는 ${quadrant} 감정이 거의 나타나지 않았습니다.`,
    };
    // 숫자로 변환 (복호화 과정에서 문자열로 변환될 수 있음)
    const ratio =
      typeof item.ratio === "number" ? item.ratio : Number(item.ratio) || 0;
    const count =
      typeof item.count === "number" ? item.count : Number(item.count) || 0;

    return {
      name: item.quadrant,
      value: ratio * 100,
      count: count,
      color: QUADRANT_COLORS[item.quadrant],
      explanation: item.explanation,
    };
  });

  // 차트 데이터
  const chartData = quadrantChartData;

  // 차트 커스텀 라벨
  const renderCustomLabel = (props: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    value?: number;
  }) => {
    const {
      cx = 0,
      cy = 0,
      midAngle = 0,
      innerRadius = 0,
      outerRadius = 0,
      value = 0,
    } = props;

    // 값이 너무 작으면 라벨 표시 안 함
    if (value < 5) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className={`${TYPOGRAPHY.bodySmall.fontSize} ${TYPOGRAPHY.bodySmall.fontWeight}`}
        style={{
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
        }}
      >
        {`${value.toFixed(0)}%`}
      </text>
    );
  };

  // 차트 커스텀 툴팁
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      payload: { explanation: string; color: string; count: number };
    }>;
  }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0];
      return (
        <div
          className="p-4 rounded-xl shadow-xl"
          style={{
            backgroundColor: "#FAFAF8",
            border: `2px solid ${data.payload.color}`,
            maxWidth: "300px",
            boxShadow: `0 4px 12px ${data.payload.color}30`,
          }}
        >
          <p
            className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.fontWeight} mb-1`}
            style={{ color: data.payload.color }}
          >
            {data.name}
          </p>
          <p
            className={`${TYPOGRAPHY.h3.fontSize} ${TYPOGRAPHY.h3.fontWeight} mb-2`}
            style={{ color: COMMON_COLORS.text.primary }}
          >
            {data.value.toFixed(1)}% ({data.payload.count}일)
          </p>
          <p
            className={`${TYPOGRAPHY.bodySmall.fontSize} ${TYPOGRAPHY.bodySmall.lineHeight}`}
            style={{ color: COMMON_COLORS.text.secondary }}
          >
            {data.payload.explanation}
          </p>
        </div>
      );
    }
    return null;
  };

  const colors = SECTION_COLORS.emotion;

  return (
    <div
      className={SPACING.section.marginBottom}
      style={{ marginTop: SPACING.section.marginTop }}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: colors.gradient,
            boxShadow: `0 2px 8px ${colors.primary}30`,
          }}
        >
          <Heart className="w-5 h-5 text-white" />
        </div>
        <h2
          className={`${TYPOGRAPHY.h2.fontSize} ${TYPOGRAPHY.h2.fontWeight}`}
          style={{ color: COMMON_COLORS.text.primary }}
        >
          월간 감정 분석
        </h2>
      </div>

      {/* 감정 사분면 분포 차트 */}
      {quadrantChartData.length > 0 && (
        <Card
          className={`${SPACING.card.padding} mb-6 transition-all duration-300 hover:shadow-lg`}
          style={CARD_STYLES.withColor(colors.primary)}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: colors.gradient,
                boxShadow: `0 2px 8px ${colors.primary}30`,
              }}
            >
              <Heart className="w-5 h-5 text-white" />
            </div>
            <p
              className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} ${TYPOGRAPHY.label.textTransform}`}
              style={{
                color: COMMON_COLORS.text.tertiary,
                letterSpacing: "0.05em",
              }}
            >
              감정 사분면 분포
            </p>
          </div>
          <div className="relative">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <defs>
                  {chartData.map((entry, index) => {
                    // 각 색상에 대한 더 어두운 버전 생성
                    const darkerColor = entry.color;
                    const lighterColor = entry.color;
                    return (
                      <linearGradient
                        key={`gradient-${index}`}
                        id={`gradient-${index}`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor={lighterColor}
                          stopOpacity={1}
                        />
                        <stop
                          offset="100%"
                          stopColor={darkerColor}
                          stopOpacity={0.85}
                        />
                      </linearGradient>
                    );
                  })}
                </defs>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={110}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#FFFFFF"
                  strokeWidth={3}
                  paddingAngle={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#gradient-${index})`}
                      style={{
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* 범례 */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              {quadrantChartData.map((item, index) => {
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-lg transition-all duration-200 hover:bg-gray-50"
                  >
                    <div
                      className="w-4 h-4 rounded"
                      style={{
                        background:
                          QUADRANT_GRADIENTS[
                            item.name as keyof typeof QUADRANT_GRADIENTS
                          ],
                        boxShadow: `0 1px 3px ${item.color}40`,
                      }}
                    />
                    <span
                      className={`${TYPOGRAPHY.bodySmall.fontSize} font-medium flex-1`}
                      style={{ color: COMMON_COLORS.text.secondary }}
                    >
                      {item.name}
                    </span>
                    <span
                      className={`${TYPOGRAPHY.bodySmall.fontSize} ${TYPOGRAPHY.bodySmall.fontWeight}`}
                      style={{ color: item.color }}
                    >
                      {item.value.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 사분면별 상세 설명 */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {quadrantChartData.map((item, index) => {
              const IconComponent =
                QUADRANT_ICONS[item.name as keyof typeof QUADRANT_ICONS];
              return (
                <div
                  key={index}
                  className="p-5 rounded-xl transition-all duration-200 hover:shadow-md"
                  style={{
                    backgroundColor: `${item.color}0A`,
                    border: `1.5px solid ${item.color}30`,
                    borderRadius: "16px",
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {IconComponent && (
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          background:
                            QUADRANT_GRADIENTS[
                              item.name as keyof typeof QUADRANT_GRADIENTS
                            ],
                          boxShadow: `0 2px 6px ${item.color}40`,
                        }}
                      >
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p
                        className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.fontWeight} mb-1`}
                        style={{ color: item.color }}
                      >
                        {item.name}
                      </p>
                      <p
                        className={`${TYPOGRAPHY.bodySmall.fontSize} font-medium`}
                        style={{ color: COMMON_COLORS.text.tertiary }}
                      >
                        {item.value.toFixed(1)}% · {item.count}일
                      </p>
                    </div>
                  </div>
                  <p
                    className={`${TYPOGRAPHY.bodySmall.fontSize} ${TYPOGRAPHY.bodySmall.lineHeight}`}
                    style={{ color: COMMON_COLORS.text.secondary }}
                  >
                    {item.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 감정 사분면 분석 요약 */}
      {emotion_overview.emotion_quadrant_analysis_summary && (
        <Card
          className={`${SPACING.card.padding} mb-6 transition-all duration-300 hover:shadow-lg`}
          style={CARD_STYLES.gradient}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: colors.gradient,
                boxShadow: `0 2px 8px ${colors.primary}30`,
              }}
            >
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p
                className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} ${TYPOGRAPHY.label.textTransform} mb-3`}
                style={{
                  color: COMMON_COLORS.text.tertiary,
                  letterSpacing: "0.05em",
                }}
              >
                감정 사분면 분석 요약
              </p>
              <p
                className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight}`}
                style={{ color: COMMON_COLORS.text.secondary }}
              >
                {emotion_overview.emotion_quadrant_analysis_summary}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* 트리거들 */}
      <div className="mb-6 space-y-6">
        {/* 긍정 트리거 */}
        {emotion_overview.positive_triggers &&
          emotion_overview.positive_triggers.length > 0 && (
            <Card
              className={`${SPACING.card.padding} transition-all duration-300 hover:shadow-lg`}
              style={CARD_STYLES.withColor("#7C9A7C")}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #7C9A7C 0%, #6B8A6B 100%)",
                    boxShadow: "0 2px 8px rgba(124, 154, 124, 0.3)",
                  }}
                >
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <p
                  className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} ${TYPOGRAPHY.label.textTransform}`}
                  style={{
                    color: COMMON_COLORS.text.tertiary,
                    letterSpacing: "0.05em",
                  }}
                >
                  긍정 감정 트리거
                </p>
              </div>
              <div className="space-y-2">
                {emotion_overview.positive_triggers.map((trigger, index) => (
                  <div
                    key={index}
                    className="relative flex items-start gap-3 p-4 rounded-xl transition-all duration-300 group cursor-pointer"
                    style={{
                      backgroundColor: "#FAFAF8",
                      border: `1.5px solid rgba(124, 154, 124, 0.15)`,
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#7C9A7C";
                      e.currentTarget.style.backgroundColor =
                        "rgba(124, 154, 124, 0.08)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(124, 154, 124, 0.15)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(124, 154, 124, 0.15)";
                      e.currentTarget.style.backgroundColor = "#FAFAF8";
                      e.currentTarget.style.boxShadow =
                        "0 1px 3px rgba(0, 0, 0, 0.05)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-semibold transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                      style={{
                        background:
                          "linear-gradient(135deg, #7C9A7C 0%, #6B8A6B 100%)",
                        boxShadow: "0 2px 6px rgba(124, 154, 124, 0.3)",
                        color: "white",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                    >
                      {index + 1}
                    </div>
                    <p
                      className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight} flex-1 pt-1 transition-colors duration-200`}
                      style={{
                        color: COMMON_COLORS.text.primary,
                        letterSpacing: "0.01em",
                        fontWeight: "500",
                      }}
                    >
                      {trigger}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

        {/* 부정 트리거 */}
        {emotion_overview.negative_triggers &&
          emotion_overview.negative_triggers.length > 0 && (
            <Card
              className={`${SPACING.card.padding} transition-all duration-300 hover:shadow-lg`}
              style={CARD_STYLES.withColor("#D4A574")}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #D4A574 0%, #C49564 100%)",
                    boxShadow: "0 2px 8px rgba(212, 165, 116, 0.3)",
                  }}
                >
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <p
                  className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} ${TYPOGRAPHY.label.textTransform}`}
                  style={{
                    color: COMMON_COLORS.text.tertiary,
                    letterSpacing: "0.05em",
                  }}
                >
                  부정 감정 트리거
                </p>
              </div>
              <div className="space-y-2">
                {emotion_overview.negative_triggers.map((trigger, index) => (
                  <div
                    key={index}
                    className="relative flex items-start gap-3 p-4 rounded-xl transition-all duration-300 group cursor-pointer"
                    style={{
                      backgroundColor: "#FAFAF8",
                      border: `1.5px solid rgba(212, 165, 116, 0.15)`,
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#D4A574";
                      e.currentTarget.style.backgroundColor =
                        "rgba(212, 165, 116, 0.08)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(212, 165, 116, 0.15)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(212, 165, 116, 0.15)";
                      e.currentTarget.style.backgroundColor = "#FAFAF8";
                      e.currentTarget.style.boxShadow =
                        "0 1px 3px rgba(0, 0, 0, 0.05)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-semibold transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                      style={{
                        background:
                          "linear-gradient(135deg, #D4A574 0%, #C49564 100%)",
                        boxShadow: "0 2px 6px rgba(212, 165, 116, 0.3)",
                        color: "white",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                    >
                      {index + 1}
                    </div>
                    <p
                      className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight} flex-1 pt-1 transition-colors duration-200`}
                      style={{
                        color: COMMON_COLORS.text.primary,
                        letterSpacing: "0.01em",
                        fontWeight: "500",
                      }}
                    >
                      {trigger}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
      </div>

      {/* 감정 안정성 점수 */}
      <Card
        ref={stabilityRef}
        className={`${SPACING.card.padding} mb-6 transition-all duration-300 hover:shadow-lg overflow-visible`}
        style={CARD_STYLES.withColor(colors.primary)}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: colors.gradient,
                boxShadow: `0 2px 8px ${colors.primary}30`,
              }}
            >
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p
                  className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} ${TYPOGRAPHY.label.textTransform}`}
                  style={{
                    color: COMMON_COLORS.text.tertiary,
                    letterSpacing: "0.05em",
                  }}
                >
                  감정 안정성 점수
                </p>
                <div className="relative" ref={tooltipRef}>
                  <HelpCircle
                    className="w-4 h-4 cursor-pointer transition-colors duration-200"
                    style={{
                      color: "#9CA3AF",
                    }}
                    onMouseEnter={() => setShowStabilityTooltip(true)}
                    onClick={() =>
                      setShowStabilityTooltip(!showStabilityTooltip)
                    }
                  />
                  {showStabilityTooltip && (
                    <div
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-4 rounded-lg shadow-xl z-50"
                      style={{
                        backgroundColor: "#FAFAF8",
                        border: "1.5px solid #A8BBA8",
                        width: "320px",
                        maxWidth: "90vw",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: "#A8BBA8" }}
                          />
                          <p
                            className={`${TYPOGRAPHY.bodySmall.fontSize} ${TYPOGRAPHY.bodySmall.fontWeight}`}
                            style={{ color: COMMON_COLORS.text.primary }}
                          >
                            감정 안정성 점수란?
                          </p>
                        </div>
                        <button
                          onClick={() => setShowStabilityTooltip(false)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p
                        className={`${TYPOGRAPHY.bodySmall.fontSize} ${TYPOGRAPHY.bodySmall.lineHeight}`}
                        style={{ color: COMMON_COLORS.text.secondary }}
                      >
                        {emotion_overview.emotion_stability_explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`${TYPOGRAPHY.number.large.fontSize} ${TYPOGRAPHY.number.large.fontWeight}`}
              style={{
                background: colors.gradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {stability}
            </span>
            <span
              className={`${TYPOGRAPHY.body.fontSize} font-medium`}
              style={{ color: COMMON_COLORS.text.muted }}
            >
              / 10
            </span>
          </div>
        </div>

        {/* 진행 바 */}
        <div
          className="h-4 rounded-full overflow-hidden mb-4"
          style={{
            backgroundColor:
              COMMON_COLORS.background.cardGradient.split(" ")[2],
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              background: colors.gradient,
              width: `${(stability / 10) * 100}%`,
              boxShadow: `0 2px 6px ${colors.primary}40`,
            }}
          />
        </div>

        {/* 점수 분석 피드백 섹션 */}
        {(emotion_overview.emotion_stability_score_reason ||
          emotion_overview.emotion_stability_praise) && (
          <div className="mb-4 space-y-3">
            {/* 점수 이유 설명 */}
            {emotion_overview.emotion_stability_score_reason && (
              <div
                className="p-4 rounded-xl border-l-4 transition-all duration-200 hover:shadow-sm"
                style={{
                  background: COMMON_COLORS.background.cardGradient,
                  borderLeftColor: colors.primary,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: colors.gradient,
                      boxShadow: `0 2px 4px ${colors.primary}30`,
                    }}
                  >
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} ${TYPOGRAPHY.label.textTransform} mb-2`}
                      style={{
                        color: COMMON_COLORS.text.tertiary,
                        letterSpacing: "0.05em",
                      }}
                    >
                      왜 {stability}점인가요?
                    </p>
                    <p
                      className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight}`}
                      style={{ color: COMMON_COLORS.text.secondary }}
                    >
                      {emotion_overview.emotion_stability_score_reason}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 칭찬 메시지 */}
            {emotion_overview.emotion_stability_praise && (
              <div
                className="p-4 rounded-xl border-l-4 transition-all duration-200 hover:shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.primary}10 100%)`,
                  borderLeftColor: colors.primary,
                  boxShadow: `0 2px 8px ${colors.primary}20`,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: colors.gradient,
                      boxShadow: `0 2px 4px ${colors.primary}30`,
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} ${TYPOGRAPHY.label.textTransform} mb-2`}
                      style={{
                        color: COMMON_COLORS.text.tertiary,
                        letterSpacing: "0.05em",
                      }}
                    >
                      잘하고 있어요!
                    </p>
                    <p
                      className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight}`}
                      style={{ color: COMMON_COLORS.text.secondary }}
                    >
                      {emotion_overview.emotion_stability_praise}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 가이드라인 */}
        {(emotion_overview.emotion_stability_guidelines?.length > 0 ||
          emotion_overview.emotion_stability_actions?.length > 0) && (
          <div
            className="mt-4 pt-4 border-t"
            style={{ borderColor: COMMON_COLORS.border.light }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Target
                className="w-4 h-4"
                style={{
                  color: colors.primary,
                }}
              />
              <p
                className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} ${TYPOGRAPHY.label.textTransform}`}
                style={{
                  color: COMMON_COLORS.text.tertiary,
                  letterSpacing: "0.05em",
                }}
              >
                {stability >= 7
                  ? "더 높은 안정성을 위한 가이드라인"
                  : "안정성 향상을 위한 가이드라인"}
              </p>
            </div>
            <ul className="space-y-2.5">
              {(
                emotion_overview.emotion_stability_guidelines ||
                emotion_overview.emotion_stability_actions ||
                []
              ).map((action, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-gray-50 hover:shadow-sm"
                  style={{
                    backgroundColor:
                      index % 2 === 0
                        ? COMMON_COLORS.background.base
                        : "transparent",
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform duration-200 hover:scale-110"
                    style={{
                      background: colors.gradient,
                      boxShadow: `0 2px 4px ${colors.primary}30`,
                    }}
                  >
                    <span
                      className={`${TYPOGRAPHY.bodySmall.fontSize} font-bold text-white`}
                    >
                      {index + 1}
                    </span>
                  </div>
                  <span
                    className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight} flex-1`}
                    style={{ color: COMMON_COLORS.text.secondary }}
                  >
                    {action}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* AI 감정 코멘트 */}
      {emotion_overview.emotion_ai_comment && (
        <Card
          className={`${SPACING.card.padding} transition-all duration-300 hover:shadow-lg`}
          style={CARD_STYLES.gradient}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: colors.gradient,
                boxShadow: `0 2px 8px ${colors.primary}30`,
              }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p
                className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} ${TYPOGRAPHY.label.textTransform} mb-3`}
                style={{
                  color: COMMON_COLORS.text.tertiary,
                  letterSpacing: "0.05em",
                }}
              >
                AI 감정 코멘트
              </p>
              <p
                className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight}`}
                style={{ color: COMMON_COLORS.text.secondary }}
              >
                {emotion_overview.emotion_ai_comment}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
