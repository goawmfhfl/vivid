"use client";

import { COLORS } from "@/lib/design-system";

interface ScoreGaugeProps {
  score: number;
  max?: number;
  barColor?: string;
  trackColor?: string;
  height?: number;
  className?: string;
}

/**
 * 0–100 점수를 막대 게이지로 표시 (디자인 시스템 토큰 사용)
 */
export function ScoreGauge({
  score,
  max = 100,
  barColor = COLORS.brand.primary,
  trackColor = COLORS.border.light,
  height = 8,
  className = "",
}: ScoreGaugeProps) {
  const value = Math.min(Math.max(score, 0), max);
  const percent = max > 0 ? (value / max) * 100 : 0;

  return (
    <div
      className={className}
      style={{
        width: "100%",
        borderRadius: height / 2,
        backgroundColor: trackColor,
        height,
        overflow: "hidden",
      }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        style={{
          width: `${percent}%`,
          height,
          borderRadius: height / 2,
          backgroundColor: barColor,
          transition: "width 0.4s ease-out",
        }}
      />
    </div>
  );
}
