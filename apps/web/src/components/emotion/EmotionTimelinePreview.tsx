"use client";

import { cn } from "@/lib/utils";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  hexToRgba,
} from "@/lib/design-system";
import {
  getEmotionIntensityLabel,
  type EmotionIntensity,
} from "@/lib/emotion-data";

interface EmotionTimelinePreviewProps {
  intensity?: EmotionIntensity;
  keywords: string[];
  factors: string[];
  reasonText: string;
}

export function EmotionTimelinePreview({
  intensity,
  keywords,
  factors,
  reasonText,
}: EmotionTimelinePreviewProps) {
  if (!intensity) {
    return (
      <div className="rounded-xl border p-4">
        <p
          className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
          style={{ color: COLORS.text.muted }}
        >
          아직 감정 데이터가 없어요
        </p>
      </div>
    );
  }

  const intensityLabel = getEmotionIntensityLabel(intensity);
  const intensityColor = COLORS.emotion.intensity[intensity];

  return (
    <div className="rounded-xl border p-4">
      <div className={cn("flex items-center", SPACING.element.gapSmall, "mb-3")}>
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: intensityColor }}
        />
        <span
          className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.h4.fontWeight)}
          style={{ color: COLORS.text.primary }}
        >
          감정 타임라인
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <p
            className={cn(TYPOGRAPHY.caption.fontSize)}
            style={{ color: COLORS.text.muted }}
          >
            감정 상태
          </p>
          <p
            className={cn(TYPOGRAPHY.body.fontSize)}
            style={{ color: intensityColor }}
          >
            {intensityLabel}
          </p>
        </div>

        {keywords.length > 0 && (
          <div>
            <p
              className={cn(TYPOGRAPHY.caption.fontSize)}
              style={{ color: COLORS.text.muted }}
            >
              표현 키워드
            </p>
            <div className={cn("flex flex-wrap", SPACING.element.gapSmall)}>
              {keywords.map((keyword) => (
                <span
                  key={`preview-keyword-${keyword}`}
                  className={cn(
                    "rounded-full px-3 py-1",
                    TYPOGRAPHY.caption.fontSize
                  )}
                  style={{
                    backgroundColor: hexToRgba(intensityColor, 0.12),
                    border: `1px solid ${hexToRgba(intensityColor, 0.4)}`,
                    color: intensityColor,
                  }}
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {factors.length > 0 && (
          <div>
            <p
              className={cn(TYPOGRAPHY.caption.fontSize)}
              style={{ color: COLORS.text.muted }}
            >
              감정 요인
            </p>
            <div className={cn("flex flex-wrap", SPACING.element.gapSmall)}>
              {factors.map((factor) => (
                <span
                  key={`preview-factor-${factor}`}
                  className={cn(
                    "rounded-full px-3 py-1",
                    TYPOGRAPHY.caption.fontSize
                  )}
                  style={{
                    backgroundColor: COLORS.background.hover,
                    border: `1px solid ${COLORS.border.light}`,
                    color: COLORS.text.secondary,
                  }}
                >
                  {factor}
                </span>
              ))}
            </div>
          </div>
        )}

        {reasonText.trim().length > 0 && (
          <div>
            <p
              className={cn(TYPOGRAPHY.caption.fontSize)}
              style={{ color: COLORS.text.muted }}
            >
              한 줄 단서
            </p>
            <p
              className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
              style={{ color: COLORS.text.secondary }}
            >
              {reasonText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
