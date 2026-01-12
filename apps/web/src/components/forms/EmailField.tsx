"use client";

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
}

export function EmailField({
  value,
  onChange,
  placeholder = "example@gmail.com",
  error,
  disabled = false,
}: EmailFieldProps) {
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
            color: error ? COLORS.status.error : (value ? COLORS.brand.primary : COLORS.text.tertiary),
            opacity: value ? 1 : 0.4,
          }}
        />
        <Input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-8 pr-4 py-3.5 border-0 border-b-2 rounded-none transition-all focus:ring-0 focus:outline-none"
          disabled={disabled}
          style={{
            backgroundColor: "transparent",
            fontSize: "16px",
            paddingLeft: "2rem",
            borderBottomColor: error 
              ? COLORS.status.error 
              : value 
                ? COLORS.brand.primary 
                : COLORS.border.light,
            borderBottomWidth: "2px",
          }}
        />
        <div 
          className="absolute bottom-0 left-0 h-0.5 transition-all duration-300"
          style={{
            width: error || value ? "100%" : "0%",
            backgroundColor: error 
              ? COLORS.status.error 
              : value 
                ? COLORS.brand.primary 
                : "transparent",
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
