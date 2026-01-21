"use client";
import { cn } from "@/lib/utils";
import { EmotionSelectableChip } from "@/components/emotion/EmotionSelectableChip";
import {
  getKeywordsForIntensity,
  type EmotionIntensity,
} from "@/lib/emotion-data";
import { COLORS, SPACING, TYPOGRAPHY } from "@/lib/design-system";

interface EmotionKeywordPickerProps {
  intensity?: EmotionIntensity;
  selectedKeywords: string[];
  onToggle: (keyword: string) => void;
}

export function EmotionKeywordPicker({
  intensity,
  selectedKeywords,
  onToggle,
}: EmotionKeywordPickerProps) {
  if (!intensity) return null;

  const keywords = getKeywordsForIntensity(intensity);
  const accent = COLORS.emotion.intensity[intensity];

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
          지금 감정을 표현하는 키워드를 골라주세요
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
        {keywords.map((keyword, index) => (
          <EmotionSelectableChip
            key={keyword}
            label={keyword}
            selected={selectedKeywords.includes(keyword)}
            accent={accent}
            animationDelayMs={index * 20}
            onClick={() => onToggle(keyword)}
          />
        ))}
      </div>
    </div>
  );
}
