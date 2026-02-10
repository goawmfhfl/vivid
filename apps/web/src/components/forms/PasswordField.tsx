"use client";

import { useState } from "react";
import { Eye, EyeOff, AlertCircle, Lock } from "lucide-react";
import { Input } from "../ui/Input";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  autocomplete?: "current-password" | "new-password" | "off";
  disableActiveStyle?: boolean;
}

export function PasswordField({
  value,
  onChange,
  placeholder = "비밀번호를 입력하세요",
  error,
  disabled = false,
  autocomplete = "current-password",
  disableActiveStyle = false,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

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
        비밀번호
      </label>
      <div className="relative group">
        <Lock
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
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          autoComplete={autocomplete}
          className="pl-8 pr-10 py-3.5 border-0 border-b-2 rounded-none transition-all focus:ring-0 focus:outline-none"
          disabled={disabled}
          style={{
            backgroundColor: "transparent",
            fontSize: "16px",
            paddingLeft: "2rem",
            borderBottomColor: borderColor,
            borderBottomWidth: "2px",
          }}
        />
        <div 
          className="absolute bottom-0 left-0 h-0.5 transition-all duration-300"
          style={{
            width: error || (!disableActiveStyle && (value || isFocused)) ? "100%" : "0%",
            backgroundColor: error 
              ? COLORS.status.error 
              : !disableActiveStyle && (value || isFocused)
                ? COLORS.brand.primary 
                : "transparent",
          }}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
          disabled={disabled}
        >
          {showPassword ? (
            <EyeOff
              className="w-5 h-5"
              style={{
                color: error
                  ? COLORS.status.error
                  : !disableActiveStyle && value
                  ? COLORS.brand.primary
                  : COLORS.text.tertiary,
              }}
            />
          ) : (
            <Eye
              className="w-5 h-5"
              style={{
                color: error
                  ? COLORS.status.error
                  : !disableActiveStyle && value
                  ? COLORS.brand.primary
                  : COLORS.text.tertiary,
              }}
            />
          )}
        </button>
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
