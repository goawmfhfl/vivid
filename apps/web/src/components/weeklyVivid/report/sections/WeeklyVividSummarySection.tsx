import { Target } from "lucide-react";
import type { WeeklyReport } from "@/types/weekly-vivid";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { ContentCard, GradientCard } from "@/components/common/feedback";
import { ScrollAnimation } from "@/components/ui/ScrollAnimation";

type WeeklyVividSummarySectionProps = {
  weeklyVividSummary: WeeklyReport["weekly_vivid_summary"];
  vividColor: string;
};

export function WeeklyVividSummarySection({
  weeklyVividSummary,
  vividColor,
}: WeeklyVividSummarySectionProps) {
  if (!weeklyVividSummary) return null;

  return (
    <ScrollAnimation delay={0}>
      <div className="space-y-5">
      <ContentCard
        label="주간 비비드 요약"
        content={weeklyVividSummary.summary}
        gradientColor="163, 191, 217"
        sectionNumber={1}
        sectionNumberColor="#A3BFD9"
      />
      {weeklyVividSummary.key_points &&
        weeklyVividSummary.key_points.length > 0 && (
          <GradientCard gradientColor="163, 191, 217">
            <p
              className={cn(
                TYPOGRAPHY.label.fontSize,
                TYPOGRAPHY.label.fontWeight,
                TYPOGRAPHY.label.letterSpacing,
                "mb-3 uppercase"
              )}
              style={{ color: COLORS.text.secondary }}
            >
              핵심 포인트
            </p>
            <div className="space-y-3">
              {weeklyVividSummary.key_points.map((point, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg transition-all duration-200 hover:shadow-sm"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    border: "1px solid rgba(163, 191, 217, 0.25)",
                  }}
                >
                  <p
                    className={cn(
                      TYPOGRAPHY.body.fontSize,
                      "font-semibold mb-2"
                    )}
                    style={{ color: COLORS.text.primary }}
                  >
                    {point.point}
                  </p>
                  {point.dates && point.dates.length > 0 && (
                    <p
                      className={cn(TYPOGRAPHY.bodySmall.fontSize, "mt-1.5")}
                      style={{ color: COLORS.text.secondary }}
                    >
                      {point.dates.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </GradientCard>
        )}
      {weeklyVividSummary.next_week_vision_key_points &&
        weeklyVividSummary.next_week_vision_key_points.length > 0 && (
          <GradientCard gradientColor="163, 191, 217">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: `${vividColor}20`,
                  border: `1.5px solid ${vividColor}40`,
                }}
              >
                <Target className="w-4 h-4" style={{ color: vividColor }} />
              </div>
              <p
                className={cn(
                  TYPOGRAPHY.label.fontSize,
                  TYPOGRAPHY.label.fontWeight,
                  TYPOGRAPHY.label.letterSpacing,
                  "uppercase"
                )}
                style={{ color: COLORS.text.secondary }}
              >
                다음주 비전 핵심 포인트
              </p>
            </div>
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.6)",
                border: `1px solid rgba(163, 191, 217, 0.3)`,
              }}
            >
              <ul className="space-y-3">
                {weeklyVividSummary.next_week_vision_key_points.map(
                  (point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div
                        className="w-1 h-1 rounded-full mt-2.5 flex-shrink-0"
                        style={{ 
                          backgroundColor: vividColor,
                          boxShadow: `0 0 0 3px ${vividColor}20`,
                        }}
                      />
                      <p
                        className={cn(
                          TYPOGRAPHY.body.fontSize,
                          TYPOGRAPHY.body.lineHeight,
                          "flex-1"
                        )}
                        style={{
                          color: COLORS.text.primary,
                        }}
                      >
                        {point}
                      </p>
                    </li>
                  )
                )}
              </ul>
            </div>
          </GradientCard>
        )}
      </div>
    </ScrollAnimation>
  );
}
