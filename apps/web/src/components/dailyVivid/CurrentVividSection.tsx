import { Sparkles, TrendingUp, Zap } from "lucide-react";
import { ScrollAnimation } from "../ui/ScrollAnimation";
import { ContentCard, KeywordCard } from "../common/feedback";
import { COLORS } from "@/lib/design-system";
import { SectionProps } from "./types";
import { hexToRgbTriplet } from "./colorUtils";

export function CurrentVividSection({ view }: SectionProps) {
  const hasCurrentData = !!(
    view.current_summary?.trim() ||
    view.current_evaluation?.trim() ||
    (view.current_keywords && view.current_keywords.length > 0)
  );

  if (!hasCurrentData) return null;

  const currentColor = COLORS.dailyVivid.current;
  const currentGradientColor = hexToRgbTriplet(currentColor);

  return (
    <ScrollAnimation delay={160}>
      <div className="mb-60">
        <div className="space-y-5">
          {view.current_summary && (
            <ContentCard
              icon={Sparkles}
              iconColor={currentColor}
              label="오늘의 비비드 요약"
              content={view.current_summary}
              gradientColor={currentGradientColor}
            />
          )}
          {view.current_evaluation && (
            <ContentCard
              icon={TrendingUp}
              iconColor={currentColor}
              label="비비드 AI 평가"
              content={view.current_evaluation}
              gradientColor={currentGradientColor}
            />
          )}
          {view.current_keywords && view.current_keywords.length > 0 && (
            <KeywordCard
              icon={Zap}
              iconColor={currentColor}
              label="오늘의 비비드 키워드"
              keywords={view.current_keywords}
              gradientColor={currentGradientColor}
              badgeColor={`rgba(${currentGradientColor}, 0.15)`}
              badgeTextColor={COLORS.dailyVivid.currentText}
              duration={7}
            />
          )}
        </div>
      </div>
    </ScrollAnimation>
  );
}
