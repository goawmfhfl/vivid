"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { AlertCircle, Mail } from "lucide-react";
import { Input } from "../ui/Input";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface EmailFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  rightAction?: ReactNode;
  disableActiveStyle?: boolean;
}

export function EmailField({
  value,
  onChange,
  placeholder = "example@gmail.com",
  error,
  disabled = false,
  rightAction,
  disableActiveStyle = false,
}: EmailFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasRightAction = Boolean(rightAction);
  const lineInsetRight = hasRightAction ? "7.25rem" : "0";
  const isActiveLine = disableActiveStyle
    ? Boolean(error)
    : Boolean(error || value || isFocused);

  const borderColor = error 
    ? COLORS.status.error 
    : !disableActiveStyle && (isFocused || value)
      ? COLORS.brand.primary 
      : COLORS.border.light;

  return (
    <div>
      <label
        className={cn("block mb-3", TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.fontWeight)}
        style={{ color: COLORS.text.primary }}
      >
        이메일
      </label>
      <div className="relative group">
        <Mail
          className="absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors"
          style={{ 
            color: error
              ? COLORS.status.error
              : !disableActiveStyle && (value || isFocused)
              ? COLORS.brand.primary
              : COLORS.text.tertiary,
            opacity: !disableActiveStyle && (value || isFocused) ? 1 : 0.4,
          }}
        />
        <Input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="pl-8 pr-4 py-3.5 border-0 rounded-none transition-all focus:ring-0 focus:outline-none"
          disabled={disabled}
          style={{
            backgroundColor: "transparent",
            fontSize: "16px",
            paddingLeft: "2rem",
            paddingRight: rightAction ? "7.25rem" : "1rem",
          }}
        />
        {rightAction && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            {rightAction}
          </div>
        )}
        <div
          className="absolute bottom-0 left-0 h-0.5"
          style={{
            right: lineInsetRight,
            backgroundColor: COLORS.border.light,
          }}
        />
        <div
          className="absolute bottom-0 left-0 h-0.5 transition-transform duration-300"
          style={{
            right: lineInsetRight,
            transform: isActiveLine ? "scaleX(1)" : "scaleX(0)",
            transformOrigin: "left",
            backgroundColor: borderColor,
          }}
        />
      </div>
      {error && (
        <p
          className={cn("mt-2 flex items-center gap-1.5", TYPOGRAPHY.caption.fontSize)}
          style={{ color: COLORS.status.error }}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
