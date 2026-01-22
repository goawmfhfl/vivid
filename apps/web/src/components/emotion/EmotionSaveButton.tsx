"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BUTTON_STYLES,
  TRANSITIONS,
  TYPOGRAPHY,
  hexToRgba,
} from "@/lib/design-system";

interface EmotionSaveButtonProps {
  disabled?: boolean;
  isSaving?: boolean;
  onClick: () => void;
}

export function EmotionSaveButton({
  disabled,
  isSaving,
  onClick,
}: EmotionSaveButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled || isSaving}
      className={cn(
        "w-full disabled:opacity-100",
        BUTTON_STYLES.primary.borderRadius,
        BUTTON_STYLES.primary.padding,
        TYPOGRAPHY.body.fontSize,
        TYPOGRAPHY.h4.fontWeight,
        TRANSITIONS.default
      )}
      style={{
        backgroundColor:
          disabled || isSaving
            ? hexToRgba(BUTTON_STYLES.primary.background, 0.55)
            : BUTTON_STYLES.primary.background,
        color: BUTTON_STYLES.primary.color,
      }}
    >
      {isSaving ? "저장 중..." : "감정 저장하기"}
    </Button>
  );
}
