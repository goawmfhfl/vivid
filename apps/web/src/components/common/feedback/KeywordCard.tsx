import React from "react";
import { LucideIcon } from "lucide-react";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { ScrollingKeywords } from "../../ui/ScrollingKeywords";
import { GradientCard } from "./GradientCard";

export interface KeywordCardProps {
  /** 아이콘 컴포넌트 */
  icon: LucideIcon;
  /** 아이콘 색상 */
  iconColor: string;
  /** 라벨 텍스트 */
  label: string;
  /** 키워드 배열 */
  keywords: string[];
  /** 그라디언트 색상 */
  gradientColor: string;
  /** 키워드 배지 색상 */
  badgeColor: string;
  /** 키워드 배지 텍스트 색상 */
  badgeTextColor: string;
  /** 애니메이션 지속 시간 (초) */
  duration?: number;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 키워드 카드 컴포넌트
 * 스크롤링 키워드를 포함한 그라디언트 카드
 */
export function KeywordCard({
  icon: Icon,
  iconColor,
  label,
  keywords,
  gradientColor,
  badgeColor,
  badgeTextColor,
  duration = 15,
  className,
}: KeywordCardProps) {
  return (
    <GradientCard
      gradientColor={gradientColor}
      className={cn("p-5 sm:p-6", className)}
      hover={false}
    >
      {/* 배경 장식 */}
      <div
        className="absolute top-0 right-0 w-48 h-48 opacity-2 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 80% 20%, ${gradientColor}20 0%, transparent 60%)`,
        }}
      />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: `${iconColor}20`,
              border: `1.5px solid ${iconColor}40`,
            }}
          >
            <Icon className="w-4 h-4" style={{ color: iconColor }} />
          </div>
          <p
            className={cn(
              TYPOGRAPHY.label.fontSize,
              TYPOGRAPHY.label.fontWeight,
              TYPOGRAPHY.label.letterSpacing,
              "uppercase"
            )}
            style={{ color: COLORS.text.secondary }}
          >
            {label}
          </p>
        </div>
        <div className="-mx-2">
          <ScrollingKeywords
            keywords={keywords}
            duration={duration}
            badgeStyle={{
              backgroundColor: badgeColor,
              color: badgeTextColor,
              border: `1px solid rgba(${gradientColor}, 0.3)`,
              borderRadius: "9999px",
              padding: "0.375rem 0.625rem",
              fontSize: "0.75rem",
              fontWeight: "500",
            }}
          />
        </div>
      </div>
    </GradientCard>
  );
}
