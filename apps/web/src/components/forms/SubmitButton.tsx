"use client";

import { Button } from "../ui/button";

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
      className="px-8 py-3 rounded-xl transition-all font-medium"
      style={{
        backgroundColor: !isDisabled ? "#6B7A6F" : "#D1D5DB",
        color: "white",
        fontSize: "0.95rem",
        opacity: !isDisabled ? 1 : 0.6,
        minWidth: "140px",
        boxShadow: !isDisabled ? "0 2px 8px rgba(107, 122, 111, 0.2)" : "none",
      }}
    >
      {isLoading ? loadingText : defaultText}
    </Button>
  );
}
