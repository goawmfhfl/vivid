"use client";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  EMOTION_FACTORS,
  getRecommendedFactors,
  type EmotionIntensity,
} from "@/lib/emotion-data";
import { COLORS, SPACING, TRANSITIONS, TYPOGRAPHY } from "@/lib/design-system";
import { EmotionSelectableChip } from "@/components/emotion/EmotionSelectableChip";

interface EmotionFactorPickerProps {
  intensity?: EmotionIntensity;
  selectedFactors: string[];
  onToggle: (factor: string) => void;
}

export function EmotionFactorPicker({
  intensity,
  selectedFactors,
  onToggle,
}: EmotionFactorPickerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const recommended = useMemo(() => {
    if (!intensity) return [];
    return getRecommendedFactors(intensity, 9);
  }, [intensity]);

  if (!intensity) return null;

  const accent = COLORS.emotion.intensity[intensity];
  const visibleFactors = isExpanded ? EMOTION_FACTORS : recommended;
  const headerText = isExpanded
    ? "천천히 골라도 괜찮아요"
    : "지금 감정에 가까운 요인을 골라주세요.";

  return (
    <div className="animate-emotion-fade-slide">
      <div
        className={cn(
          SPACING.element.marginBottomSmall,
          "flex items-center gap-2"
        )}
      >
        <p
          className={cn(TYPOGRAPHY.body.fontSize)}
          style={{ color: COLORS.text.secondary }}
        >
          {headerText}
        </p>
        <span className="relative inline-flex items-center" aria-hidden="true">
          <span
            className="inline-flex h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: COLORS.status.error }}
          />
        </span>
        <span className="sr-only">필수</span>
      </div>
      <div className={cn("flex flex-wrap", SPACING.element.gapSmall)}>
        {visibleFactors.map((factor, index) => (
          <EmotionSelectableChip
            key={factor.id}
            label={factor.label}
            selected={selectedFactors.includes(factor.label)}
            accent={accent}
            animationDelayMs={index * 20}
            onClick={() => onToggle(factor.label)}
          />
        ))}
      </div>
      <div className={cn(SPACING.element.marginBottomSmall, "mt-3")}>
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className={cn(
            "inline-flex items-center gap-1",
            TYPOGRAPHY.bodySmall.fontSize,
            TRANSITIONS.default
          )}
          style={{ color: COLORS.text.tertiary }}
        >
          {isExpanded ? "추천 요인만 보기" : "+ 다른 요인도 있어요"}
          <ChevronDown
            className={cn("h-4 w-4", isExpanded ? "rotate-180" : "")}
            style={{ transition: "transform 0.2s ease" }}
          />
        </button>
      </div>
    </div>
  );
}
