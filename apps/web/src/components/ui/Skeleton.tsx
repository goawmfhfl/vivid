"use client";

import { COLORS } from "@/lib/design-system";

interface SkeletonProps {
  className?: string;
  variant?: "button" | "text" | "circle";
  width?: string | number;
  height?: string | number;
}

/**
 * 펄스 애니메이션을 가진 스켈레톤 컴포넌트
 */
export function Skeleton({
  className = "",
  variant = "button",
  width,
  height,
}: SkeletonProps) {
  const baseStyles: React.CSSProperties = {
    backgroundColor: COLORS.background.hover,
    borderRadius:
      variant === "circle" ? "50%" : variant === "button" ? "12px" : "4px",
    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
  };

  const sizeStyles: React.CSSProperties = {};
  if (width) {
    sizeStyles.width = typeof width === "number" ? `${width}px` : width;
  }
  if (height) {
    sizeStyles.height = typeof height === "number" ? `${height}px` : height;
  }

  return (
    <>
      <div
        className={className}
        style={{
          ...baseStyles,
          ...sizeStyles,
        }}
      />
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
}

/**
 * 날짜 버튼 형태의 스켈레톤
 */
export function DateButtonSkeleton() {
  return (
    <div className="flex flex-col items-center gap-1 md:gap-2">
      {/* 요일 스켈레톤 */}
      <div
        className="w-5 h-3 md:w-6 md:h-4 rounded"
        style={{
          backgroundColor: COLORS.background.hover,
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      />
      {/* 날짜 버튼 스켈레톤 - 실제 날짜 박스와 동일한 스타일 */}
      <div
        className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center"
        style={{
          backgroundColor: COLORS.background.card,
          border: `1px solid ${COLORS.border.light}`,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      />
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
