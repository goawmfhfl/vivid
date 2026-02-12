"use client";

import { AlertCircle, ChevronDown } from "lucide-react";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface CandidatesNoticeBoxProps {
  title: string;
  description: string;
  isExpanded: boolean;
  onClick: () => void;
  /** accentColor: 주간=weekly 시 스카이블루, 월간=brand 시 그린 (기본: brand) */
  accentColor?: string;
}

export function CandidatesNoticeBox({
  title,
  description,
  isExpanded,
  onClick,
  accentColor = COLORS.brand.primary,
}: CandidatesNoticeBoxProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className={cn(
        "rounded-xl p-4 cursor-pointer transition-all duration-200",
        "border hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      )}
      style={{
        backgroundColor: COLORS.background.card,
        borderColor: `${accentColor}40`,
        boxShadow: `0 1px 3px ${accentColor}12`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${accentColor}60`;
        e.currentTarget.style.boxShadow = `0 4px 12px ${accentColor}18`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${accentColor}40`;
        e.currentTarget.style.boxShadow = `0 1px 3px ${accentColor}12`;
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="p-2 rounded-lg flex-shrink-0 mt-0.5"
          style={{
            backgroundColor: `${accentColor}18`,
          }}
        >
          <AlertCircle className="w-4 h-4" style={{ color: accentColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className={cn("mb-1 font-semibold", TYPOGRAPHY.body.fontSize)}
                style={{ color: COLORS.text.primary }}
              >
                {title}
              </h3>
              <p
                className={cn("text-sm", TYPOGRAPHY.body.lineHeight)}
                style={{ color: COLORS.text.secondary }}
              >
                {description}
              </p>
            </div>
            <ChevronDown
              className="w-5 h-5 flex-shrink-0 transition-transform duration-200"
              style={{
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                color: accentColor,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
