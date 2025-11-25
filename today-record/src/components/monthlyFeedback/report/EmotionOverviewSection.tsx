"use client";

import {
  Heart,
  TrendingUp,
  AlertTriangle,
  Zap,
  Cloud,
  Sparkles,
} from "lucide-react";
import { Card } from "../../ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useCountUp } from "@/hooks/useCountUp";
import type { MonthlyReportData } from "./types";

type EmotionOverviewSectionProps = {
  emotion_overview: MonthlyReportData["emotion_overview"];
};

const QUADRANT_COLORS = {
  "몰입·설렘": "#A8BBA8",
  "불안·초조": "#B89A7A",
  "슬픔·무기력": "#6B7A6F",
  "안도·평온": "#E5B96B",
};

export function EmotionOverviewSection({
  emotion_overview,
}: EmotionOverviewSectionProps) {
  const [stability, stabilityRef] = useCountUp({
    targetValue: emotion_overview.emotion_stability_score,
    duration: 1000,
    delay: 0,
    triggerOnVisible: true,
  });

  // 감정 사분면 분포 차트 데이터
  const quadrantChartData = emotion_overview.emotion_quadrant_distribution.map(
    (item) => ({
      name: item.quadrant,
      value: item.ratio * 100,
      count: item.count,
      color: QUADRANT_COLORS[item.quadrant],
    })
  );

  return (
    <div className="mb-10 sm:mb-12" style={{ marginTop: "32px" }}>
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#B89A7A" }}
        >
          <Heart className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: "#333333" }}
        >
          월간 감정 분석
        </h2>
      </div>

      {/* 감정 사분면 분포 차트 */}
      {quadrantChartData.length > 0 && (
        <Card
          className="p-5 mb-4"
          style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
        >
          <p className="text-xs mb-4" style={{ color: "#6B7A6F" }}>
            감정 사분면 분포
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={quadrantChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value.toFixed(0)}%`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {quadrantChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `${value.toFixed(1)}%`,
                  props.payload.name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* 감정 키워드 */}
      {emotion_overview.emotion_keywords &&
        emotion_overview.emotion_keywords.length > 0 && (
          <Card
            className="p-5 mb-4"
            style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
          >
            <p className="text-xs mb-3" style={{ color: "#6B7A6F" }}>
              이번 달 감정 키워드
            </p>
            <div className="flex flex-wrap gap-2">
              {emotion_overview.emotion_keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="text-sm px-3 py-1.5 rounded-full"
                  style={{
                    backgroundColor: "#F5F7F5",
                    color: "#6B7A6F",
                    fontWeight: "500",
                  }}
                >
                  {keyword}
                </span>
              ))}
            </div>
          </Card>
        )}

      {/* 감정 패턴 요약 */}
      {emotion_overview.emotion_pattern_summary && (
        <Card
          className="p-5 mb-4"
          style={{ backgroundColor: "#F5F7F5", border: "1px solid #E0E5E0" }}
        >
          <div className="flex items-start gap-3">
            <TrendingUp
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              style={{ color: "#A8BBA8" }}
            />
            <div>
              <p className="text-xs mb-2" style={{ color: "#6B7A6F" }}>
                감정 패턴 요약
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#4E4B46", lineHeight: "1.7" }}
              >
                {emotion_overview.emotion_pattern_summary}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* 트리거들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* 긍정 트리거 */}
        {emotion_overview.positive_triggers &&
          emotion_overview.positive_triggers.length > 0 && (
            <Card
              className="p-5"
              style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4" style={{ color: "#A8BBA8" }} />
                <p
                  className="text-xs font-semibold"
                  style={{ color: "#6B7A6F" }}
                >
                  긍정 감정 트리거
                </p>
              </div>
              <ul className="space-y-2">
                {emotion_overview.positive_triggers.map((trigger, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-xs mt-1" style={{ color: "#A8BBA8" }}>
                      •
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: "#4E4B46", lineHeight: "1.6" }}
                    >
                      {trigger}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

        {/* 부정 트리거 */}
        {emotion_overview.negative_triggers &&
          emotion_overview.negative_triggers.length > 0 && (
            <Card
              className="p-5"
              style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle
                  className="w-4 h-4"
                  style={{ color: "#B89A7A" }}
                />
                <p
                  className="text-xs font-semibold"
                  style={{ color: "#6B7A6F" }}
                >
                  부정 감정 트리거
                </p>
              </div>
              <ul className="space-y-2">
                {emotion_overview.negative_triggers.map((trigger, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-xs mt-1" style={{ color: "#B89A7A" }}>
                      •
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: "#4E4B46", lineHeight: "1.6" }}
                    >
                      {trigger}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
      </div>

      {/* 감정 안정성 점수 */}
      <Card
        ref={stabilityRef}
        className="p-5 mb-4"
        style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs mb-1" style={{ color: "#6B7A6F" }}>
              감정 안정성 점수
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold" style={{ color: "#A8BBA8" }}>
                {stability}
              </span>
              <span className="text-sm" style={{ color: "#6B7A6F" }}>
                / 10
              </span>
            </div>
          </div>
          <div className="w-24 h-24 relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="#F0F5F0"
                strokeWidth="8"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="#A8BBA8"
                strokeWidth="8"
                strokeDasharray={`${(stability / 10) * 251.2} 251.2`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-xs font-semibold"
                style={{ color: "#6B7A6F" }}
              >
                {Math.round((stability / 10) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* AI 코멘트 */}
      {emotion_overview.emotion_ai_comment && (
        <Card
          className="p-5"
          style={{ backgroundColor: "#F5F7F5", border: "1px solid #E0E5E0" }}
        >
          <div className="flex items-start gap-3">
            <Sparkles
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              style={{ color: "#A8BBA8" }}
            />
            <div>
              <p className="text-xs mb-2" style={{ color: "#6B7A6F" }}>
                AI 감정 코멘트
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#4E4B46", lineHeight: "1.7" }}
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
