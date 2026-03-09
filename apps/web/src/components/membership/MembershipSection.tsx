"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";

type MembershipSectionProps = {
  icon: LucideIcon;
  iconColor: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  /** 실제 사용자 후기 섹션과 동일한 카드 레이아웃 사용 */
  accentColor: string;
  accentLight: string;
  accentBorder: string;
};

export function MembershipSection({
  icon: Icon,
  iconColor,
  eyebrow,
  title,
  description,
  children,
  accentColor,
  accentLight,
  accentBorder,
}: MembershipSectionProps) {
  return (
    <section
      className="relative overflow-hidden rounded-2xl p-5 sm:p-6 space-y-5"
      style={{
        background: `linear-gradient(180deg, ${COLORS.background.cardElevated} 0%, ${accentLight} 100%)`,
        border: `1px solid ${accentBorder}`,
        boxShadow: "0 1px 3px rgba(43, 43, 43, 0.04)",
      }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ backgroundColor: accentColor }}
      />
      <div className="pl-4 sm:pl-5">
        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 sm:gap-6">
          <div className="flex flex-col gap-3">
            <div
              className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: accentLight,
                color: accentColor,
                border: `1px solid ${accentColor}40`,
              }}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p
                className={cn(
                  TYPOGRAPHY.label.fontSize,
                  TYPOGRAPHY.label.fontWeight,
                  TYPOGRAPHY.label.letterSpacing,
                  "uppercase"
                )}
                style={{ color: accentColor }}
              >
                {eyebrow}
              </p>
              <h2
                className={cn(TYPOGRAPHY.h3.fontSize, TYPOGRAPHY.h3.fontWeight)}
                style={{ color: COLORS.text.primary }}
              >
                {title}
              </h2>
            </div>
          </div>
          <div className="sm:pt-0 min-w-0">
            <p
              className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
              style={{ color: COLORS.text.secondary }}
            >
              {description}
            </p>
          </div>
        </div>
      </div>
      <div className="pl-4 sm:pl-5 pt-1">{children}</div>
    </section>
  );
}
