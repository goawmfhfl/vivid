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
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useCountUp } from "@/hooks/useCountUp";
import type { MonthlyReportData } from "./types";

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

  const [stability, stabilityRef] = useCountUp({
    targetValue: emotion_overview.emotion_stability_score,
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
    return {
      name: item.quadrant,
      value: item.ratio * 100,
      count: item.count,
      color: QUADRANT_COLORS[item.quadrant],
      explanation: item.explanation,
    };
  });

  // 차트 커스텀 라벨
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    name,
    value,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // 값이 너무 작으면 라벨 표시 안 함
    if (value < 5) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-semibold"
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
            className="text-sm font-bold mb-1"
            style={{ color: data.payload.color }}
          >
            {data.name}
          </p>
          <p className="text-lg font-bold mb-2" style={{ color: "#333333" }}>
            {data.value.toFixed(1)}% ({data.payload.count}일)
          </p>
          <p className="text-xs leading-relaxed" style={{ color: "#4E4B46" }}>
            {data.payload.explanation}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mb-10 sm:mb-12" style={{ marginTop: "32px" }}>
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #7C9A7C 0%, #6B8A6B 100%)",
            boxShadow: "0 4px 12px rgba(124, 154, 124, 0.3)",
          }}
        >
          <Heart className="w-6 h-6 text-white" />
        </div>
        <h2
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: "#333333" }}
        >
          월간 감정 분석
        </h2>
      </div>

      {/* 감정 사분면 분포 차트 */}
      {quadrantChartData.length > 0 && (
        <Card
          className="p-6 mb-6 transition-all duration-300 hover:shadow-lg"
          style={{
            backgroundColor: "white",
            border: "1px solid #E8E8E8",
            borderRadius: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #7C9A7C 0%, #6B8A6B 100%)",
                boxShadow: "0 2px 8px rgba(124, 154, 124, 0.3)",
              }}
            >
              <Heart className="w-5 h-5 text-white" />
            </div>
            <p
              className="text-sm font-semibold uppercase tracking-wide"
              style={{ color: "#4E4B46", letterSpacing: "0.05em" }}
            >
              감정 사분면 분포
            </p>
          </div>
          <div className="relative">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <defs>
                  {quadrantChartData.map((entry, index) => {
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
                  data={quadrantChartData}
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
                  {quadrantChartData.map((entry, index) => (
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
                const IconComponent =
                  QUADRANT_ICONS[item.name as keyof typeof QUADRANT_ICONS];
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
                      className="text-xs font-medium flex-1"
                      style={{ color: "#4E4B46" }}
                    >
                      {item.name}
                    </span>
                    <span
                      className="text-xs font-bold"
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
                        className="text-sm font-bold mb-1"
                        style={{ color: item.color }}
                      >
                        {item.name}
                      </p>
                      <p
                        className="text-xs font-medium"
                        style={{ color: "#6B7A6F" }}
                      >
                        {item.value.toFixed(1)}% · {item.count}일
                      </p>
                    </div>
                  </div>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "#4E4B46", lineHeight: "1.7" }}
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
          className="p-6 mb-6 transition-all duration-300 hover:shadow-lg"
          style={{
            backgroundColor: "white",
            border: "1px solid #E8E8E8",
            borderRadius: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #7C9A7C 0%, #6B8A6B 100%)",
                boxShadow: "0 2px 8px rgba(124, 154, 124, 0.3)",
              }}
            >
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p
                className="text-sm font-semibold mb-3 uppercase tracking-wide"
                style={{ color: "#4E4B46", letterSpacing: "0.05em" }}
              >
                감정 사분면 분석 요약
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#4E4B46", lineHeight: "1.8" }}
              >
                {emotion_overview.emotion_quadrant_analysis_summary}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* 트리거들 */}
      <div className="mb-6">
        {/* 긍정 트리거 */}
        {emotion_overview.positive_triggers &&
          emotion_overview.positive_triggers.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-5">
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
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: "#4E4B46", letterSpacing: "0.05em" }}
                >
                  긍정 감정 트리거
                </p>
              </div>
              <div className="space-y-1.5">
                {emotion_overview.positive_triggers.map((trigger, index) => (
                  <div
                    key={index}
                    className="relative flex items-start gap-3 py-2.5 px-3 rounded-xl transition-all duration-300 group"
                    style={{
                      background:
                        "linear-gradient(to right, rgba(124, 154, 124, 0.03) 0%, transparent 100%)",
                      borderLeft: "3px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderLeftColor = "#7C9A7C";
                      e.currentTarget.style.background =
                        "linear-gradient(to right, rgba(124, 154, 124, 0.08) 0%, rgba(124, 154, 124, 0.02) 100%)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderLeftColor = "transparent";
                      e.currentTarget.style.background =
                        "linear-gradient(to right, rgba(124, 154, 124, 0.03) 0%, transparent 100%)";
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-semibold transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 mt-0.5"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(124, 154, 124, 0.15) 0%, rgba(107, 138, 107, 0.1) 100%)",
                        border: "1.5px solid rgba(124, 154, 124, 0.3)",
                        color: "#7C9A7C",
                        fontSize: "11px",
                        fontWeight: "600",
                      }}
                    >
                      {index + 1}
                    </div>
                    <p
                      className="flex-1 text-sm leading-relaxed pt-0.5 transition-colors duration-200 group-hover:text-[#5A6B5A]"
                      style={{
                        color: "#4E4B46",
                        lineHeight: "1.65",
                        letterSpacing: "0.01em",
                        fontWeight: "400",
                      }}
                    >
                      {trigger}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* 부정 트리거 */}
        {emotion_overview.negative_triggers &&
          emotion_overview.negative_triggers.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
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
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: "#4E4B46", letterSpacing: "0.05em" }}
                >
                  부정 감정 트리거
                </p>
              </div>
              <div className="space-y-1.5">
                {emotion_overview.negative_triggers.map((trigger, index) => (
                  <div
                    key={index}
                    className="relative flex items-start gap-3 py-2.5 px-3 rounded-xl transition-all duration-300 group"
                    style={{
                      background:
                        "linear-gradient(to right, rgba(212, 165, 116, 0.03) 0%, transparent 100%)",
                      borderLeft: "3px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderLeftColor = "#D4A574";
                      e.currentTarget.style.background =
                        "linear-gradient(to right, rgba(212, 165, 116, 0.08) 0%, rgba(212, 165, 116, 0.02) 100%)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderLeftColor = "transparent";
                      e.currentTarget.style.background =
                        "linear-gradient(to right, rgba(212, 165, 116, 0.03) 0%, transparent 100%)";
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-semibold transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 mt-0.5"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(212, 165, 116, 0.15) 0%, rgba(196, 149, 100, 0.1) 100%)",
                        border: "1.5px solid rgba(212, 165, 116, 0.3)",
                        color: "#D4A574",
                        fontSize: "11px",
                        fontWeight: "600",
                      }}
                    >
                      {index + 1}
                    </div>
                    <p
                      className="flex-1 text-sm leading-relaxed pt-0.5 transition-colors duration-200 group-hover:text-[#B8956A]"
                      style={{
                        color: "#4E4B46",
                        lineHeight: "1.65",
                        letterSpacing: "0.01em",
                        fontWeight: "400",
                      }}
                    >
                      {trigger}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* 감정 안정성 점수 */}
      <Card
        ref={stabilityRef}
        className="p-6 mb-6 transition-all duration-300 hover:shadow-lg overflow-visible"
        style={{
          backgroundColor: "white",
          border: "1px solid #E8E8E8",
          borderRadius: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #7C9A7C 0%, #6B8A6B 100%)",
                boxShadow: "0 2px 8px rgba(124, 154, 124, 0.3)",
              }}
            >
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: "#4E4B46", letterSpacing: "0.05em" }}
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
                            className="text-xs font-semibold"
                            style={{ color: "#333333" }}
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
                        className="text-xs leading-relaxed"
                        style={{ color: "#4E4B46", lineHeight: "1.7" }}
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
              className="text-3xl font-bold"
              style={{
                background: "linear-gradient(135deg, #7C9A7C 0%, #6B8A6B 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {stability}
            </span>
            <span className="text-sm font-medium" style={{ color: "#9CA3AF" }}>
              / 10
            </span>
          </div>
        </div>

        {/* 진행 바 */}
        <div
          className="h-4 rounded-full overflow-hidden mb-4"
          style={{
            backgroundColor: "#F0F5F0",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              background: `linear-gradient(90deg, #7C9A7C 0%, #6B8A6B 100%)`,
              width: `${(stability / 10) * 100}%`,
              boxShadow: `0 2px 6px rgba(124, 154, 124, 0.4)`,
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
                  backgroundColor: "#F5F7F5",
                  borderLeftColor: "#7C9A7C",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #7C9A7C 0%, #6B8A6B 100%)",
                      boxShadow: "0 2px 4px rgba(124, 154, 124, 0.3)",
                    }}
                  >
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-xs font-semibold mb-2 uppercase tracking-wide"
                      style={{ color: "#4E4B46", letterSpacing: "0.05em" }}
                    >
                      왜 {stability}점인가요?
                    </p>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "#4E4B46", lineHeight: "1.7" }}
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
                  background:
                    "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)",
                  borderLeftColor: "#7C9A7C",
                  boxShadow: "0 2px 8px rgba(124, 154, 124, 0.2)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #7C9A7C 0%, #6B8A6B 100%)",
                      boxShadow: "0 2px 4px rgba(124, 154, 124, 0.3)",
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-xs font-semibold mb-2 uppercase tracking-wide"
                      style={{ color: "#4E4B46", letterSpacing: "0.05em" }}
                    >
                      잘하고 있어요!
                    </p>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "#4E4B46", lineHeight: "1.7" }}
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
            style={{ borderColor: "#EFE9E3" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Target
                className="w-4 h-4"
                style={{
                  color: "#7C9A7C",
                }}
              />
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: "#4E4B46", letterSpacing: "0.05em" }}
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
                      index % 2 === 0 ? "#FAFAF8" : "transparent",
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform duration-200 hover:scale-110"
                    style={{
                      background:
                        "linear-gradient(135deg, #7C9A7C 0%, #6B8A6B 100%)",
                      boxShadow: "0 2px 4px rgba(124, 154, 124, 0.3)",
                    }}
                  >
                    <span className="text-xs font-bold text-white">
                      {index + 1}
                    </span>
                  </div>
                  <span
                    className="text-sm leading-relaxed flex-1"
                    style={{ color: "#4E4B46", lineHeight: "1.7" }}
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
          className="p-6 transition-all duration-300 hover:shadow-lg"
          style={{
            backgroundColor: "white",
            border: "1px solid #E8E8E8",
            borderRadius: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #7C9A7C 0%, #6B8A6B 100%)",
                boxShadow: "0 2px 8px rgba(124, 154, 124, 0.3)",
              }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p
                className="text-sm font-semibold mb-3 uppercase tracking-wide"
                style={{ color: "#4E4B46", letterSpacing: "0.05em" }}
              >
                AI 감정 코멘트
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#4E4B46", lineHeight: "1.8" }}
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
