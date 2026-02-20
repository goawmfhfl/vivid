import type { LucideIcon } from "lucide-react";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { SECTION_HEADER_ICON_STYLE } from "./reviewSectionStyles";

interface ReviewSectionHeaderProps {
  icon: LucideIcon;
  title: string;
  className?: string;
}

/** 회고 섹션 공통 헤더 (아이콘 + 타이틀) */
export function ReviewSectionHeader({
  icon: Icon,
  title,
  className,
}: ReviewSectionHeaderProps) {
  return (
    <div
      className={cn("flex items-center gap-3 mb-6", className)}
      style={{ minHeight: 40 }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110"
        style={{
          ...SECTION_HEADER_ICON_STYLE,
          width: SECTION_HEADER_ICON_STYLE.width,
          height: SECTION_HEADER_ICON_STYLE.height,
        }}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3
        className={cn(TYPOGRAPHY.h2.fontSize, TYPOGRAPHY.h2.fontWeight)}
        style={{ color: COLORS.text.primary }}
      >
        {title}
      </h3>
    </div>
  );
}
