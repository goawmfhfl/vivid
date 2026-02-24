import { Sparkles } from "lucide-react";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { ScrollAnimation } from "../../ui/ScrollAnimation";
import { ChartGlassCard } from "../analysisShared";
import { ReviewSectionHeader } from "./ReviewSectionHeader";
import { REVIEW_ACCENT_RGB, SUB_CARD_STYLE } from "./reviewSectionStyles";
import type { DailyReportData } from "../types";

interface ReviewSummarySectionProps {
  view: DailyReportData;
}

export function ReviewSummarySection({ view }: ReviewSummarySectionProps) {
  const hasSummary = !!view.retrospective_summary?.trim();
  const hasEvaluation = !!view.retrospective_evaluation?.trim();
  if (!hasSummary && !hasEvaluation) return null;

  return (
    <ScrollAnimation delay={120}>
      <div className="mb-60">
        <ReviewSectionHeader icon={Sparkles} title="회고 요약" />
        <ChartGlassCard gradientColor={REVIEW_ACCENT_RGB}>
          <div className="space-y-6">
            {hasSummary && (
              <div
                className="rounded-xl overflow-hidden p-5"
                style={SUB_CARD_STYLE}
              >
                <p
                  className={cn(
                    TYPOGRAPHY.label.fontSize,
                    TYPOGRAPHY.label.fontWeight,
                    TYPOGRAPHY.label.letterSpacing,
                    "uppercase mb-3"
                  )}
                  style={{ color: COLORS.text.secondary }}
                >
                  오늘의 하루 요약
                </p>
                <p
                  className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
                  style={{ color: COLORS.text.primary }}
                >
                  {view.retrospective_summary}
                </p>
              </div>
            )}
            {hasEvaluation && (
              <div
                className="rounded-xl overflow-hidden p-5"
                style={SUB_CARD_STYLE}
              >
                <p
                  className={cn(
                    TYPOGRAPHY.label.fontSize,
                    TYPOGRAPHY.label.fontWeight,
                    TYPOGRAPHY.label.letterSpacing,
                    "uppercase mb-3"
                  )}
                  style={{ color: COLORS.text.secondary }}
                >
                  AI 평가
                </p>
                <p
                  className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
                  style={{ color: COLORS.text.primary }}
                >
                  {view.retrospective_evaluation}
                </p>
              </div>
            )}
          </div>
        </ChartGlassCard>
      </div>
    </ScrollAnimation>
  );
}
