"use client";

import { COLORS, SPACING } from "@/lib/design-system";

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
    animation: "skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
  };

  const sizeStyles: React.CSSProperties = {};
  if (width) {
    sizeStyles.width = typeof width === "number" ? `${width}px` : width;
  }
  if (height) {
    sizeStyles.height = typeof height === "number" ? `${height}px` : height;
  }

  return (
    <div
      className={className}
      style={{
        ...baseStyles,
        ...sizeStyles,
      }}
    />
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
          animation: "skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      />
      {/* 날짜 버튼 스켈레톤 - 실제 날짜 박스와 동일한 스타일 */}
      <div
        className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center"
        style={{
          backgroundColor: COLORS.background.card,
          border: `1px solid ${COLORS.border.light}`,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          animation: "skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      />
    </div>
  );
}

/**
 * RecordItem 형태의 스켈레톤
 */
export function RecordItemSkeleton() {
  return (
    <>
      <div
        className={`${SPACING.card.paddingSmall} relative`}
        style={{
          backgroundColor: COLORS.background.card,
          border: `1.5px solid ${COLORS.border.light}`,
          borderRadius: "12px",
          boxShadow: `
            0 2px 8px rgba(0,0,0,0.04),
            0 1px 3px rgba(0,0,0,0.02)
          `,
          position: "relative",
          overflow: "hidden",
          paddingLeft: "48px",
        }}
      >
        {/* 왼쪽 마진 라인 */}
        <div
          className="absolute left-0 top-0 bottom-0"
          style={{
            width: "2px",
            backgroundColor: `${COLORS.border.card}CC`,
            left: "36px",
          }}
        />

        {/* 내용 영역 */}
        <div className="relative z-10">
          {/* 상단: 타입 아이콘+제목, 시간, 글자수 */}
          <div className="flex items-center gap-2.5 flex-wrap mb-3">
            {/* 타입 아이콘+제목 스켈레톤 */}
            <div className="flex items-center gap-1.5">
              <div
                className="w-4 h-4 rounded"
                style={{
                  backgroundColor: COLORS.border.light,
                  animation: "skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                }}
              />
              <div
                className="w-12 h-4 rounded"
                style={{
                  backgroundColor: COLORS.border.light,
                  animation: "skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                }}
              />
            </div>
            {/* 시간 스켈레톤 */}
            <div
              className="w-16 h-3 rounded"
              style={{
                backgroundColor: COLORS.border.light,
                animation: "skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
            {/* 글자수 스켈레톤 */}
            <div
              className="w-10 h-3 rounded"
              style={{
                backgroundColor: COLORS.border.light,
                animation: "skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
          </div>

          {/* 하단: 내용 텍스트 스켈레톤 (여러 줄) */}
          <div className="space-y-2.5">
            <div
              className="w-full rounded"
              style={{
                backgroundColor: COLORS.border.light,
                height: "5px",
                animation: "skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
            <div
              className="w-5/6 rounded"
              style={{
                backgroundColor: COLORS.border.light,
                height: "5px",
                animation: "skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
            <div
              className="w-full rounded"
              style={{
                backgroundColor: COLORS.border.light,
                height: "5px",
                animation: "skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
            <div
              className="w-4/6 rounded"
              style={{
                backgroundColor: COLORS.border.light,
                height: "5px",
                animation: "skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
            <div
              className="w-3/5 rounded"
              style={{
                backgroundColor: COLORS.border.light,
                height: "5px",
                animation: "skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
