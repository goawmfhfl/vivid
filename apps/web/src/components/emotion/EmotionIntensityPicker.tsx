"use client";

import { cn } from "@/lib/utils";
import {
  EMOTION_INTENSITIES,
  getEmotionIntensityLabel,
  type EmotionIntensity,
} from "@/lib/emotion-data";
import type { CSSProperties } from "react";
import {
  COLORS,
  EMOTION_INTENSITY_STYLES,
  TRANSITIONS,
  TYPOGRAPHY,
  hexToRgba,
} from "@/lib/design-system";

interface EmotionIntensityPickerProps {
  value?: EmotionIntensity;
  onChange: (value: EmotionIntensity) => void;
}

export function EmotionIntensityPicker({
  value,
  onChange,
}: EmotionIntensityPickerProps) {
  const displayValue = value ?? 4;
  const activeLabel = getEmotionIntensityLabel(displayValue as EmotionIntensity);
  const activeColor =
    EMOTION_INTENSITIES.find((item) => item.value === displayValue)?.color ||
    COLORS.emotion.intensity[4];
  const sliderPercent = ((displayValue - 1) / 6) * 100;

  return (
    <div
      role="radiogroup"
      aria-label="감정 상태 선택"
      className="flex flex-col items-center"
    >
      <div
        className="relative flex items-center justify-center"
        style={{
          width: EMOTION_INTENSITY_STYLES.ring.outer,
          height: EMOTION_INTENSITY_STYLES.ring.outer,
        }}
      >
        <div
          className="absolute rounded-full emotion-ring-soft"
          style={{
            width: EMOTION_INTENSITY_STYLES.ring.outer,
            height: EMOTION_INTENSITY_STYLES.ring.outer,
            border: `1px solid ${hexToRgba(activeColor, 0.28)}`,
            opacity: 0.85,
          }}
          aria-hidden="true"
        />
        <div
          className="absolute rounded-full emotion-ring-soft"
          style={{
            width: EMOTION_INTENSITY_STYLES.ring.middle,
            height: EMOTION_INTENSITY_STYLES.ring.middle,
            border: `1px solid ${hexToRgba(activeColor, 0.32)}`,
            opacity: 0.95,
          }}
          aria-hidden="true"
        />
        <div
          className="absolute rounded-full emotion-core-pulse"
          style={{
            width: "104px",
            height: "104px",
            border: `1px solid ${hexToRgba(activeColor, 0.4)}`,
            background: `radial-gradient(circle at 35% 30%, ${hexToRgba(
              activeColor,
              0.6
            )} 0%, ${hexToRgba(activeColor, 0.25)} 45%, transparent 75%)`,
            color: activeColor,
          }}
          aria-hidden="true"
        >
          <div
            className="absolute inset-6 rounded-full emotion-core-inner"
            style={{
              border: `1px solid ${hexToRgba(activeColor, 0.35)}`,
              background: hexToRgba(activeColor, 0.2),
              color: activeColor,
            }}
          >
            <div
              className="absolute inset-4 rounded-full emotion-core-deep"
              style={{
                border: `1px solid ${hexToRgba(activeColor, 0.3)}`,
                background: hexToRgba(activeColor, 0.18),
                color: activeColor,
              }}
            />
          </div>
        </div>
        <div
          className="absolute rounded-full emotion-aura"
          style={{
            width: EMOTION_INTENSITY_STYLES.ring.inner,
            height: EMOTION_INTENSITY_STYLES.ring.inner,
            border: `1px solid ${hexToRgba(activeColor, 0.25)}`,
            color: activeColor,
          }}
          aria-hidden="true"
        />
      </div>

      <div className="mt-6 w-full relative">
        <p
          className={cn(
            TYPOGRAPHY.bodySmall.fontSize,
            "absolute -top-6 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-center"
          )}
          style={{
            color: COLORS.text.primary,
            background: `linear-gradient(135deg, ${hexToRgba(
              activeColor,
              0.12
            )} 0%, ${hexToRgba(activeColor, 0.04)} 100%)`,
            backdropFilter: "blur(6px)",
          }}
        >
          {activeLabel}
        </p>
        <div className="relative">
          <input
            type="range"
            min={1}
            max={7}
            step={1}
            value={displayValue}
            onChange={(event) =>
              onChange(Number(event.target.value) as EmotionIntensity)
            }
            className={cn(
              "emotion-intensity-slider emotion-intensity-slider--ghost",
              TRANSITIONS.default
            )}
            style={
              {
                "--emotion-slider-track": `linear-gradient(90deg, ${hexToRgba(
                  activeColor,
                  0.15
                )} 0%, ${hexToRgba(activeColor, 0.55)} 50%, ${hexToRgba(
                  activeColor,
                  0.2
                )} 100%)`,
                "--emotion-slider-thumb": activeColor,
                "--emotion-slider-thumb-border": hexToRgba(activeColor, 0.7),
                "--emotion-slider-thumb-shadow": `0 6px 16px ${hexToRgba(
                  activeColor,
                  0.35
                )}`,
                "--emotion-slider-track-height":
                  EMOTION_INTENSITY_STYLES.slider.trackHeight,
                "--emotion-slider-thumb-size":
                  EMOTION_INTENSITY_STYLES.slider.thumbSize,
              } as CSSProperties
            }
            aria-valuetext={activeLabel}
          />
          <span
            className="emotion-slider-dot"
            style={
              {
                left: `${sliderPercent}%`,
                width: EMOTION_INTENSITY_STYLES.slider.thumbSize,
                height: EMOTION_INTENSITY_STYLES.slider.thumbSize,
                backgroundColor: activeColor,
                border: `1.5px solid ${hexToRgba(activeColor, 0.7)}`,
                boxShadow: `0 6px 16px ${hexToRgba(activeColor, 0.35)}`,
              } as CSSProperties
            }
            aria-hidden="true"
          />
        </div>
        <div className="mt-3 flex justify-between">
          <span
            className={cn(TYPOGRAPHY.caption.fontSize)}
            style={{ color: COLORS.text.muted }}
          >
            아주 불쾌함
          </span>
          <span
            className={cn(TYPOGRAPHY.caption.fontSize)}
            style={{ color: COLORS.text.muted }}
          >
            아주 기분 좋음
          </span>
        </div>
      </div>
    </div>
  );
}
