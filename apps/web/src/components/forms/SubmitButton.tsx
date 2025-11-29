"use client";

import { Button } from "../ui/button";

interface SubmitButtonProps {
  isLoading: boolean;
  isValid: boolean;
  loadingText: string;
  defaultText: string;
  disabled?: boolean;
}

export function SubmitButton({
  isLoading,
  isValid,
  loadingText,
  defaultText,
  disabled = false,
}: SubmitButtonProps) {
  const isDisabled = !isValid || isLoading || disabled;

  return (
    <Button
      type="submit"
      disabled={isDisabled}
      className="w-full py-6 rounded-xl transition-all"
      style={{
        backgroundColor: !isDisabled ? "#6B7A6F" : "#D1D5DB",
        color: "white",
        fontSize: "1rem",
        opacity: !isDisabled ? 1 : 0.6,
      }}
    >
      {isLoading ? loadingText : defaultText}
    </Button>
  );
}
