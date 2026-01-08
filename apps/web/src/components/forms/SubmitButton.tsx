"use client";

import { Button } from "../ui/button";
import { COLORS, TYPOGRAPHY, SHADOWS } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface SubmitButtonProps {
  isLoading: boolean;
  isValid: boolean;
  loadingText: string;
  defaultText: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function SubmitButton({
  isLoading,
  isValid,
  loadingText,
  defaultText,
  disabled = false,
  onClick,
}: SubmitButtonProps) {
  const isDisabled = !isValid || isLoading || disabled;

  return (
    <Button
      type={onClick ? "button" : "submit"}
      disabled={isDisabled}
      onClick={onClick}
      className={cn(
        "h-auto px-8 py-3 rounded-xl transition-all font-medium",
        TYPOGRAPHY.body.fontSize,
        onClick ? "flex-shrink-0" : "w-full"
      )}
      style={{
        backgroundColor: !isDisabled ? COLORS.brand.primary : COLORS.text.tertiary,
        color: COLORS.text.white,
        opacity: !isDisabled ? 1 : 0.6,
        minWidth: onClick ? "140px" : "auto",
        boxShadow: !isDisabled ? SHADOWS.elevation2 : "none",
        border: "none",
        lineHeight: "1.5",
      }}
      variant={undefined}
      size={undefined}
    >
      {isLoading ? loadingText : defaultText}
    </Button>
  );
}
