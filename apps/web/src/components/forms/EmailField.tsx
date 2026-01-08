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
        className={cn("block mb-2", TYPOGRAPHY.body.fontSize)}
        style={{ color: COLORS.text.primary }}
      >
        이메일
      </label>
      <div className="relative">
        <Mail
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
          style={{ color: COLORS.brand.primary, opacity: 0.5 }}
        />
        <Input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-11 pr-4"
          disabled={disabled}
          style={{
            borderColor: error ? COLORS.status.error : COLORS.border.light,
            backgroundColor: COLORS.surface.elevated,
          }}
        />
      </div>
      {error && (
        <p
          className={cn("mt-1.5 flex items-center gap-1", TYPOGRAPHY.caption.fontSize)}
          style={{ color: COLORS.status.error }}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
