"use client";

import { cn } from "@/lib/utils";
import { COLORS, TRANSITIONS, TYPOGRAPHY, hexToRgba } from "@/lib/design-system";

interface EmotionSelectableChipProps {
  label: string;
  selected: boolean;
  accent: string;
  animationDelayMs?: number;
  onClick: () => void;
}

export function EmotionSelectableChip({
  label,
  selected,
  accent,
  animationDelayMs = 0,
  onClick,
}: EmotionSelectableChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative rounded-full px-3 py-1.5",
        TYPOGRAPHY.bodySmall.fontSize,
        selected ? "font-bold" : TYPOGRAPHY.body.fontWeight,
        TRANSITIONS.default,
        "animate-emotion-fade-slide"
      )}
      style={{
        animationDelay: `${animationDelayMs}ms`,
        backgroundColor: selected ? hexToRgba(accent, 0.45) : COLORS.background.card,
        border: `1px solid ${
          selected ? hexToRgba(accent, 0.6) : COLORS.border.light
        }`,
        color: selected ? COLORS.text.white : COLORS.text.secondary,
      }}
      aria-pressed={selected}
    >
      <span className="relative z-10">{label}</span>
      {selected && (
        <span
          className="absolute inset-0 rounded-full emotion-keyword-glow z-0"
          style={{ color: accent }}
          aria-hidden="true"
        />
      )}
    </button>
  );
}
