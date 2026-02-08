import { Target, Sparkles, TrendingUp, Zap } from "lucide-react";
import { ScrollAnimation } from "../ui/ScrollAnimation";
import { ContentCard, KeywordCard } from "../common/feedback";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { SectionProps } from "./types";
import { hexToRgbTriplet } from "./colorUtils";

export function FutureVisionSection({ view }: SectionProps) {
  const hasFutureData = !!(
    view.future_summary?.trim() ||
    view.future_evaluation?.trim() ||
    (view.future_keywords && view.future_keywords.length > 0)
  );

  if (!hasFutureData) return null;

  const futureColor = COLORS.dailyVivid.future;
  const futureGradientColor = hexToRgbTriplet(futureColor);

  return (
    <ScrollAnimation delay={160}>
      <div className="mb-60">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${futureColor} 0%, ${futureColor}DD 100%)`,
              boxShadow: `0 4px 12px ${futureColor}40`,
            }}
          >
            <Target className="w-5 h-5 text-white" />
          </div>
          <h3
            className={cn(TYPOGRAPHY.h2.fontSize, TYPOGRAPHY.h2.fontWeight)}
            style={{ color: COLORS.text.primary }}
          >
            앞으로의 나의 모습 (미래 비전)
          </h3>
        </div>
        <div className="space-y-5">
          {view.future_summary && (
            <ContentCard
              icon={Sparkles}
              iconColor={futureColor}
              label="기대하는 모습 요약"
              content={view.future_summary}
              gradientColor={futureGradientColor}
            />
          )}
          {view.future_evaluation && (
            <ContentCard
              icon={TrendingUp}
              iconColor={futureColor}
              label="비비드 AI 평가"
              content={view.future_evaluation}
              gradientColor={futureGradientColor}
            />
          )}
          {view.future_keywords && view.future_keywords.length > 0 && (
            <KeywordCard
              icon={Zap}
              iconColor={futureColor}
              label="기대하는 모습 키워드"
              keywords={view.future_keywords}
              gradientColor={futureGradientColor}
              badgeColor={`rgba(${futureGradientColor}, 0.15)`}
              badgeTextColor={COLORS.dailyVivid.futureText}
              duration={7}
            />
          )}
        </div>
      </div>
    </ScrollAnimation>
  );
}
