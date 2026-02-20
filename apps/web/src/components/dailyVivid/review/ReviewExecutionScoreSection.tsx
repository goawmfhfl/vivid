import { CheckCircle2, Zap } from "lucide-react";
import { ScrollAnimation } from "../../ui/ScrollAnimation";
import { ChartGlassCard, useInViewOnce } from "../analysisShared";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { hexToRgbTriplet } from "../colorUtils";
import { useCountUp } from "@/hooks/useCountUp";
import type { DailyReportData } from "../types";

const executionColor = COLORS.chart.execution;
const executionGradientColor = hexToRgbTriplet(executionColor);
const executionGlow = `rgba(${executionGradientColor}, 0.45)`;

interface ReviewExecutionScoreSectionProps {
  view: DailyReportData;
}

export function ReviewExecutionScoreSection({ view }: ReviewExecutionScoreSectionProps) {
  const executionScore = typeof view.execution_score === "number" ? view.execution_score : null;
  const executionPoints = Array.isArray(view.execution_analysis_points)
    ? view.execution_analysis_points.filter((p) => typeof p === "string" && p.trim())
    : [];

  if (executionScore === null || executionScore <= 0) return null;

  const { ref: scoreRef, isInView: scoreInView } = useInViewOnce<HTMLDivElement>(0.25, "0px 0px -15% 0px");
  const target = scoreInView ? Math.min(executionScore, 100) : 0;
  const score = useCountUp(target, 1200, true);
  const progress = Math.min(score, 100);

  return (
    <ScrollAnimation delay={180}>
      <div className="mb-60" ref={scoreRef}>
        <ChartGlassCard gradientColor={executionGradientColor}>
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: `${executionColor}20`,
                border: `1.5px solid ${executionColor}40`,
              }}
            >
              <Zap className="w-4 h-4" style={{ color: executionColor }} />
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
              실행력 점수
            </p>
          </div>
          <div className="mb-4">
            <div className="flex items-center gap-4 mb-3">
              <div
                className={cn(
                  TYPOGRAPHY.number.large.fontSize,
                  TYPOGRAPHY.number.large.fontWeight
                )}
                style={{
                  color: executionColor,
                  textShadow: `0 6px 18px ${executionGlow}`,
                }}
              >
                {score}
              </div>
              <div
                className={cn(TYPOGRAPHY.h4.fontSize, "font-medium")}
                style={{ color: COLORS.text.tertiary }}
              >
                / 100
              </div>
            </div>
            <div
              className="h-10 rounded-full overflow-hidden relative"
              style={{
                backgroundColor: COLORS.glass.surfaceStrong,
                border: `1px solid ${COLORS.glass.border}`,
                boxShadow: `inset 0 4px 12px ${COLORS.glass.shadow}`,
              }}
            >
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out relative"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${executionColor} 0%, rgba(${executionGradientColor}, 0.85) 45%, rgba(${executionGradientColor}, 0.55) 100%)`,
                  boxShadow: `0 8px 20px ${executionGlow}`,
                }}
              />
            </div>
          </div>
          {executionPoints.length > 0 && (
            <div
              className="mt-6 pt-5 border-t"
              style={{ borderColor: `${executionColor}20` }}
            >
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2
                  className="w-4 h-4"
                  style={{ color: executionColor }}
                />
                <p
                  className={cn(
                    TYPOGRAPHY.label.fontSize,
                    TYPOGRAPHY.label.fontWeight,
                    TYPOGRAPHY.label.letterSpacing,
                    "uppercase"
                  )}
                  style={{ color: COLORS.text.secondary }}
                >
                  실행력 분석 포인트
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {executionPoints.map((reason, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      backgroundColor: `${executionColor}12`,
                      border: `1px solid ${executionColor}25`,
                    }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: executionColor }}
                    />
                    <span
                      className={cn(TYPOGRAPHY.bodySmall.fontSize)}
                      style={{ color: COLORS.text.primary }}
                    >
                      {reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartGlassCard>
      </div>
    </ScrollAnimation>
  );
}
