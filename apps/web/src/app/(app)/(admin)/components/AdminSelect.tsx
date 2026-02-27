"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { COLORS } from "@/lib/design-system";
import { cn } from "@/lib/utils";

export interface AdminSelectOption {
  value: string;
  label: string;
}

export interface AdminSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  options: AdminSelectOption[];
  label?: string;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
}

/**
 * 관리자 영역 공통 드롭다운 컴포넌트
 * 디자인 시스템 기반 일관된 UI
 */
export const AdminSelect = React.forwardRef<HTMLSelectElement, AdminSelectProps>(
  (
    {
      options,
      label,
      placeholder,
      className,
      containerClassName,
      value,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: COLORS.text.secondary }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            value={value}
            className={cn(
              "w-full appearance-none rounded-xl border px-4 py-2.5 pr-10 text-sm font-medium transition-all",
              "focus:outline-none focus:ring-2 focus:ring-offset-1",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            style={{
              backgroundColor: COLORS.background.cardElevated,
              borderColor: COLORS.border.input,
              color: COLORS.text.primary,
            }}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: COLORS.text.tertiary }}
          />
        </div>
      </div>
    );
  }
);
AdminSelect.displayName = "AdminSelect";
