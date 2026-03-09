"use client";

import { Calendar, TrendingUp } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import type { MonthlyReport } from "@/types/monthly-vivid";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";

type MembershipMonthlyCoreVisionsPreviewProps = {
  visionEvolution: MonthlyReport["vision_evolution"];
  vividColor?: string;
};

const ACCENT = COLORS.brand.primary;

function CoreVisionPreviewCard({
  vision,
  idx,
}: {
  vision: MonthlyReport["vision_evolution"]["core_visions"][number];
  idx: number;
}) {
  const consistencyPercent = Math.round(vision.consistency * 100);
  const animatedPercent = useCountUp(consistencyPercent, 1200);
  const animatedWidth = useCountUp(consistencyPercent, 1200);

  return (
    <div
      className="relative overflow-visible rounded-xl p-4"
      style={{
        backgroundColor: COLORS.background.base,
        border: `1px solid ${COLORS.border.light}`,
      }}
    >
      <span
        className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs tabular-nums"
        style={{
          backgroundColor: COLORS.text.primary,
          color: COLORS.text.white,
          boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
        }}
      >
        {idx + 1}
      </span>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: ACCENT }} />
            <span
              className={cn(TYPOGRAPHY.bodySmall.fontSize, TYPOGRAPHY.bodySmall.fontWeight)}
              style={{ color: COLORS.text.secondary }}
            >
              일관성
            </span>
          </div>
          <span
            className={cn(TYPOGRAPHY.bodySmall.fontSize, TYPOGRAPHY.bodySmall.fontWeight)}
            style={{ color: ACCENT }}
          >
            {animatedPercent}%
          </span>
        </div>
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: COLORS.primary[100] }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${animatedWidth}%`,
              backgroundColor: ACCENT,
            }}
          />
        </div>
      </div>

      <p
        className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.fontWeight, "mb-3")}
        style={{ color: COLORS.text.primary }}
      >
        {vision.vision}
      </p>

      <div className="flex items-center gap-1.5 mb-4">
        <Calendar className="w-4 h-4" style={{ color: ACCENT }} />
        <p
          className={cn(TYPOGRAPHY.bodySmall.fontSize)}
          style={{ color: COLORS.text.secondary }}
        >
          {vision.first_date} ~ {vision.last_date}
        </p>
      </div>

      <div className="pt-4 border-t" style={{ borderColor: COLORS.border.light }}>
        <p
          className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
          style={{ color: COLORS.text.secondary }}
        >
          {vision.evolution_story}
        </p>
      </div>
    </div>
  );
}

export function MembershipMonthlyCoreVisionsPreview({
  visionEvolution,
}: MembershipMonthlyCoreVisionsPreviewProps) {
  return (
    <div className="space-y-4">
      <div>
        <p
          className={cn(
            TYPOGRAPHY.label.fontSize,
            TYPOGRAPHY.label.fontWeight,
            TYPOGRAPHY.label.letterSpacing,
            "uppercase mb-1"
          )}
          style={{ color: COLORS.text.tertiary }}
        >
          Monthly Vivid Preview
        </p>
        <h3
          className={cn(TYPOGRAPHY.h4.fontSize, TYPOGRAPHY.h4.fontWeight)}
          style={{ color: COLORS.text.primary }}
        >
          핵심 비전들
        </h3>
      </div>

      <div className="space-y-4">
        {visionEvolution.core_visions.map((vision, idx) => (
          <CoreVisionPreviewCard
            key={`${vision.vision}-${idx}`}
            vision={vision}
            idx={idx}
          />
        ))}
      </div>
    </div>
  );
}
