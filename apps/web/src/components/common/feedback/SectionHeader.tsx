import React from "react";
import { LucideIcon } from "lucide-react";
import { COLORS, TYPOGRAPHY, SHADOWS } from "@/lib/design-system";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  /** 아이콘 컴포넌트 */
  icon: LucideIcon;
  /** 아이콘 배경 그라디언트 색상 */
  iconGradient: string;
  /** 제목 */
  title: string;
  /** 설명 (선택) */
  description?: string;
  /** 아이콘 크기 (기본: w-12 h-12) */
  iconSize?: "sm" | "md" | "lg";
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 섹션 헤더 컴포넌트
 * 아이콘, 제목, 설명을 포함한 섹션 헤더
 */
export function SectionHeader({
  icon: Icon,
  iconGradient,
  title,
  description,
  iconSize = "md",
  className,
}: SectionHeaderProps) {
  const iconSizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-14 h-14",
  };

  const iconInnerSize = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-7 h-7",
  };

  return (
    <div className={cn("flex items-center gap-4 mb-10", className)}>
      <div
        className={cn(
          iconSizeClasses[iconSize],
          "rounded-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden group"
        )}
        style={{
          background: `linear-gradient(135deg, ${iconGradient} 0%, ${iconGradient}DD 100%)`,
          boxShadow: SHADOWS.elevation3,
        }}
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              "radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, transparent 70%)",
          }}
        />
        <Icon className={cn(iconInnerSize[iconSize], "text-white relative z-10")} />
      </div>
      <div>
        <h2
          className={cn(TYPOGRAPHY.h1.fontSize, TYPOGRAPHY.h1.fontWeight, "mb-2")}
          style={{ color: COLORS.text.primary }}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
            style={{ color: COLORS.text.secondary }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
