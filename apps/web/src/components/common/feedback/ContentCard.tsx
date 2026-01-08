import React from "react";
import { LucideIcon } from "lucide-react";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { GradientCard } from "./GradientCard";

export interface ContentCardProps {
  /** 아이콘 컴포넌트 */
  icon: LucideIcon;
  /** 아이콘 색상 */
  iconColor: string;
  /** 라벨 텍스트 */
  label: string;
  /** 내용 */
  content: string;
  /** 그라디언트 색상 */
  gradientColor: string;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 내용 카드 컴포넌트
 * 아이콘, 라벨, 내용을 포함한 그라디언트 카드
 */
export function ContentCard({
  icon: Icon,
  iconColor,
  label,
  content,
  gradientColor,
  className,
}: ContentCardProps) {
  return (
    <GradientCard gradientColor={gradientColor} className={className}>
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
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
      <p
        className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
        style={{ color: "#1a1a1a" }}
      >
        {content}
      </p>
    </GradientCard>
  );
}
