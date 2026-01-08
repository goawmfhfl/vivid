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
}

export function PasswordField({
  value,
  onChange,
  placeholder = "비밀번호를 입력하세요",
  error,
  disabled = false,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label
        className={cn("block mb-2", TYPOGRAPHY.body.fontSize)}
        style={{ color: COLORS.text.primary }}
      >
        비밀번호
      </label>
      <div className="relative">
        <Lock
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
          style={{ color: COLORS.brand.primary, opacity: 0.5 }}
        />
        <Input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-11 pr-10"
          disabled={disabled}
          style={{
            borderColor: error ? COLORS.status.error : COLORS.border.light,
            backgroundColor: COLORS.surface.elevated,
          }}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
          disabled={disabled}
        >
          {showPassword ? (
            <EyeOff
              className="w-5 h-5"
              style={{ color: COLORS.brand.primary, opacity: 0.5 }}
            />
          ) : (
            <Eye
              className="w-5 h-5"
              style={{ color: COLORS.brand.primary, opacity: 0.5 }}
            />
          )}
        </button>
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
