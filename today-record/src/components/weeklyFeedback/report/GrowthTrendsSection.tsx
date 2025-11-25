"use client";

import { useMemo } from "react";
import { AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";
import { Card } from "../../ui/card";
import { useCountUp } from "@/hooks/useCountUp";
import type { WeeklyReportData } from "./types";

type GrowthTrendsSectionProps = {
  integrity: WeeklyReportData["integrity"];
  growthPoints: string[];
  adjustmentPoints: string[];
};

export function GrowthTrendsSection({
  integrity,
  growthPoints,
  adjustmentPoints,
}: GrowthTrendsSectionProps) {
  // Count up animations for integrity scores
  const [displayAverage, averageRef] = useCountUp({
    targetValue: integrity.average,
    duration: 1000,
    delay: 200,
    triggerOnVisible: true,
    threshold: 0.2,
    rootMargin: "0px 0px -50px 0px",
  });

  const [displayMin, minRef] = useCountUp({
    targetValue: integrity.min,
    duration: 1000,
    delay: 400,
    triggerOnVisible: true,
    threshold: 0.2,
    rootMargin: "0px 0px -50px 0px",
  });

  const [displayMax, maxRef] = useCountUp({
    targetValue: integrity.max,
    duration: 1000,
    delay: 600,
    triggerOnVisible: true,
    threshold: 0.2,
    rootMargin: "0px 0px -50px 0px",
  });

  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#D08C60" }}
        >
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold" style={{ color: "#333333" }}>
          성장 트렌드
        </h2>
      </div>

      {/* Integrity Score Summary */}
      <Card
        className="p-4 sm:p-5 mb-4"
        style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
      >
        <p
          className="text-xs mb-2.5 sm:mb-3"
          style={{ color: "#6B7A6F" }}
        >
          주간 정합도 점수 요약
        </p>
        <div ref={averageRef} className="flex justify-center gap-4 sm:gap-6">
          <div className="text-center">
            <p className="text-xs" style={{ color: "#6B7A6F" }}>
              평균
            </p>
            <p className="text-base font-semibold" style={{ color: "#333333" }}>
              {displayAverage.toFixed(1)}
            </p>
          </div>
          <div ref={minRef} className="text-center">
            <p className="text-xs" style={{ color: "#6B7A6F" }}>
              최소
            </p>
            <p className="text-base font-semibold" style={{ color: "#333333" }}>
              {displayMin.toFixed(1)}
            </p>
          </div>
          <div ref={maxRef} className="text-center">
            <p className="text-xs" style={{ color: "#6B7A6F" }}>
              최대
            </p>
            <p className="text-base font-semibold" style={{ color: "#333333" }}>
              {displayMax.toFixed(1)}
            </p>
          </div>
        </div>
      </Card>

      {/* Growth & Adjustment Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Growth Points */}
        <Card
          className="p-4 sm:p-5"
          style={{
            backgroundColor: "#F0F5F0",
            border: "1px solid #D5E3D5",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4" style={{ color: "#A8BBA8" }} />
            <p className="text-xs" style={{ color: "#6B7A6F" }}>
              이번 주 성장 포인트
            </p>
          </div>
          <ul className="space-y-2.5">
            {growthPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: "#A8BBA8" }}
                />
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#333333" }}
                >
                  {point}
                </p>
              </li>
            ))}
          </ul>
        </Card>

        {/* Adjustment Points */}
        <Card
          className="p-4 sm:p-5"
          style={{
            backgroundColor: "#FDF6F0",
            border: "1px solid #F0DCC8",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4" style={{ color: "#D08C60" }} />
            <p className="text-xs" style={{ color: "#6B7A6F" }}>
              개선 포인트
            </p>
          </div>
          <ul className="space-y-2.5">
            {adjustmentPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: "#D08C60" }}
                />
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#333333" }}
                >
                  {point}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
