import { CheckCircle2, Sparkles, TrendingUp } from "lucide-react";
import { ScrollAnimation } from "../ui/ScrollAnimation";
import { ContentCard } from "../common/feedback";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { SectionProps } from "./types";
import { hexToRgbTriplet } from "./colorUtils";

export function RetrospectiveSection({ view }: SectionProps) {
  const hasRetrospectiveData =
    !!view?.retrospective_summary &&
    view?.retrospective_summary !== "null" &&
    !!view?.retrospective_evaluation &&
    view?.retrospective_evaluation !== "null";

  if (!hasRetrospectiveData) return null;

  const alignmentColor = COLORS.brand.primary;
  const reviewGradientColor = hexToRgbTriplet(alignmentColor);

  return (
    <ScrollAnimation delay={200}>
      <div className="mb-60">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${alignmentColor} 0%, ${alignmentColor}DD 100%)`,
              boxShadow: `0 4px 12px ${alignmentColor}40`,
            }}
          >
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <h3
            className={cn(TYPOGRAPHY.h2.fontSize, TYPOGRAPHY.h2.fontWeight)}
            style={{ color: COLORS.text.primary }}
          >
            오늘의 회고
          </h3>
        </div>
        <div className="space-y-5">
          {view.retrospective_summary && (
            <ContentCard
              icon={Sparkles}
              iconColor={alignmentColor}
              label="회고 요약"
              content={view.retrospective_summary}
              gradientColor={reviewGradientColor}
            />
          )}
          {view.retrospective_evaluation && (
            <ContentCard
              icon={TrendingUp}
              iconColor={alignmentColor}
              label="회고 AI 평가"
              content={view.retrospective_evaluation}
              gradientColor={reviewGradientColor}
            />
          )}
        </div>
      </div>
    </ScrollAnimation>
  );
}
