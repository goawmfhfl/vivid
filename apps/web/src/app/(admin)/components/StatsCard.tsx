"use client";

import { COLORS, CARD_STYLES } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-6 relative overflow-hidden group",
        CARD_STYLES.hover.transition,
        CARD_STYLES.hover.hoverShadow,
        className
      )}
      style={{
        ...CARD_STYLES.default,
        background: `linear-gradient(135deg, ${COLORS.background.card} 0%, ${COLORS.background.hoverLight} 100%)`,
      }}
    >
      {/* 그라데이션 액센트 */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
        style={{
          background: `radial-gradient(circle, ${COLORS.brand.primary} 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10">
        <h3
          className="text-sm font-medium mb-2"
          style={{ color: COLORS.text.tertiary }}
        >
          {title}
        </h3>
        <p
          className="text-2xl sm:text-3xl font-bold mb-1"
          style={{ color: COLORS.text.primary }}
        >
          {value}
        </p>
        <p className="text-xs" style={{ color: COLORS.text.muted }}>
          {description}
        </p>
      </div>
    </div>
  );
}
