"use client";

import { COLORS } from "@/lib/design-system";

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
  textSize?: "sm" | "md" | "lg";
  className?: string;
}

export function CircularProgress({
  percentage,
  size = 60,
  strokeWidth = 6,
  showText = true,
  textSize = "md",
  className = "",
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

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
          className="transition-all duration-500 ease-out"
          style={{
            transition: "stroke-dashoffset 0.5s ease-out",
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
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}
