"use client";

import { COLORS, CARD_STYLES, SPACING } from "@/lib/design-system";
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
        "rounded-xl p-6 transition-all",
        CARD_STYLES.hover.hoverShadow,
        className
      )}
      style={{
        ...CARD_STYLES.default,
        ...CARD_STYLES.hover.transition,
      }}
    >
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
  );
}
