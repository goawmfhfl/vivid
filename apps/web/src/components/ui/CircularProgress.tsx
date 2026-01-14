"use client";

import { useCountUp } from "@/hooks/useCountUp";

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
  textSize?: "sm" | "md" | "lg";
  className?: string;
  animated?: boolean;
  duration?: number;
}

export function CircularProgress({
  percentage,
  size = 60,
  strokeWidth = 6,
  showText = true,
  textSize = "md",
  className = "",
  animated = true,
  duration = 1000,
}: CircularProgressProps) {
  // animated가 false이거나 percentage가 빠르게 변경되는 경우 직접 값 사용
  const animatedPercentage = animated && duration > 0
    ? useCountUp(percentage, duration, true)
    : percentage;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedPercentage / 100) * circumference;

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
        style={{ width: size, height: size }}
      >
        {/* 배경 원 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#EFE9E3"
          strokeWidth={strokeWidth}
        />
        {/* 진행 원 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#A8BBA8"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            transition: "stroke-dashoffset 1s ease-out",
          }}
        />
      </svg>
      {/* 텍스트 */}
      {showText && (
        <div
          className={`absolute inset-0 flex items-center justify-center ${textSizeClasses[textSize]}`}
          style={{
            color: "#6B7A6F",
            fontWeight: "600",
          }}
        >
          {Math.round(animatedPercentage)}%
        </div>
      )}
    </div>
  );
}
