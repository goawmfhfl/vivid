"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  COLORS,
  TRANSITIONS,
  TYPOGRAPHY,
  hexToRgba,
  SPACING,
  darkenColor,
} from "@/lib/design-system";

interface EmotionSaveButtonProps {
  disabled?: boolean;
  isSaving?: boolean;
  onClick: () => void;
  accentColor?: string;
}

export function EmotionSaveButton({
  disabled,
  isSaving,
  onClick,
  accentColor,
}: EmotionSaveButtonProps) {
  // 고정된 버튼 색상 (감정 컬러와 무관)
  const activeColor = COLORS.brand.primary;
  const inactiveColor = hexToRgba(COLORS.brand.primary, 0.4);
  const isDisabled = disabled || isSaving;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "w-full relative overflow-hidden group",
        "flex items-center justify-center gap-2.5",
        "rounded-xl font-semibold",
        SPACING.card.padding,
        TYPOGRAPHY.body.fontSize,
        TRANSITIONS.default,
        "disabled:cursor-not-allowed"
      )}
      style={{
        background: isDisabled
          ? inactiveColor
          : activeColor,
        color: isDisabled 
          ? hexToRgba(COLORS.text.white, 0.6) 
          : COLORS.text.white,
        border: `1.5px solid ${isDisabled 
          ? hexToRgba(COLORS.brand.primary, 0.3)
          : activeColor}`,
        boxShadow: isDisabled
          ? "none"
          : `0 2px 8px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)`,
        transform: isDisabled ? "none" : "translateY(0)",
        height: "52px",
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.background = darkenColor(activeColor, 0.1);
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.background = activeColor;
        }
      }}
      onMouseDown={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center gap-2.5">
        {!isSaving && (
          <Sparkles 
            className="w-4 h-4" 
            style={{ 
              color: isDisabled ? "inherit" : COLORS.text.white,
              opacity: isDisabled ? 0.5 : 1,
            }} 
          />
        )}
        <span style={{ letterSpacing: "-0.01em" }}>
          {isSaving ? "저장 중..." : "감정 저장하기"}
        </span>
      </div>
    </button>
  );
}
