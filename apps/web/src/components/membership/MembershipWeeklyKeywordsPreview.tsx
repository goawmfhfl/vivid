"use client";

import type { WeeklyReport } from "@/types/weekly-vivid";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";

type MembershipWeeklyKeywordsPreviewProps = {
  weeklyKeywordsAnalysis: WeeklyReport["weekly_keywords_analysis"];
};

export function MembershipWeeklyKeywordsPreview({
  weeklyKeywordsAnalysis,
}: MembershipWeeklyKeywordsPreviewProps) {
  const keywords = [...weeklyKeywordsAnalysis.vision_keywords_trend].sort(
    (a, b) => b.days - a.days
  );

  return (
    <div className="space-y-4">
      <div>
        <p
          className={cn(
            TYPOGRAPHY.label.fontSize,
            TYPOGRAPHY.label.fontWeight,
            TYPOGRAPHY.label.letterSpacing,
            "uppercase mb-1"
          )}
          style={{ color: COLORS.text.tertiary }}
        >
          Weekly Vivid Preview
        </p>
        <h3
          className={cn(TYPOGRAPHY.h4.fontSize, TYPOGRAPHY.h4.fontWeight)}
          style={{ color: COLORS.text.primary }}
        >
          비전 키워드 트렌드
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {keywords.map((keyword) => (
          <div
            key={keyword.keyword}
            className="rounded-xl p-4"
            style={{
              backgroundColor: COLORS.background.base,
              border: `1px solid ${COLORS.border.light}`,
            }}
          >
              <div className="flex items-start justify-between gap-3 mb-2">
                <p
                  className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.fontWeight, "flex-1")}
                  style={{ color: COLORS.text.primary }}
                >
                  {keyword.keyword}
                </p>
                <span
                  className={cn(TYPOGRAPHY.bodySmall.fontSize, "px-2 py-1 rounded-md tabular-nums")}
                  style={{
                    backgroundColor: COLORS.primary[100],
                    color: COLORS.brand.primary,
                  }}
                >
                  {keyword.days}일
                </span>
              </div>

              <p
                className={cn(TYPOGRAPHY.bodySmall.fontSize, TYPOGRAPHY.bodySmall.lineHeight, "mb-3")}
                style={{ color: COLORS.text.secondary }}
              >
                {keyword.context}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {keyword.related_keywords.map((related) => (
                  <span
                    key={`${keyword.keyword}-${related}`}
                    className={cn(TYPOGRAPHY.bodySmall.fontSize, "px-2 py-1 rounded-md")}
                    style={{
                      backgroundColor: COLORS.background.hover,
                      color: COLORS.text.secondary,
                    }}
                  >
                    {related}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
  );
}
