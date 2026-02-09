"use client";

import { Lightbulb, Scale, Target } from "lucide-react";
import { ScrollAnimation } from "@/components/ui/ScrollAnimation";
import { FeedbackCard } from "@/components/ui/FeedbackCard";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import type { UserPersonaInsightsResponse } from "@/app/api/user-persona/insights/route";

interface GrowthInsightsSectionProps {
  growth_insights: UserPersonaInsightsResponse["growth_insights"] | null;
  isLoading?: boolean;
  isLocked?: boolean;
}

function ScoreCard({
  title,
  score,
  rationale,
  icon,
  iconColor,
}: {
  title: string;
  score: number;
  rationale?: string;
  icon: React.ReactNode;
  iconColor: string;
}) {
  return (
    <div className="mb-6">
      <FeedbackCard
        icon={icon}
        iconColor={iconColor}
        title={title}
        gradientColor={iconColor}
      >
        <div className="flex items-baseline gap-2 mb-2">
          <span
            className={TYPOGRAPHY.h2.fontSize}
            style={{ ...TYPOGRAPHY.h2, color: COLORS.brand.primary }}
          >
            {score}
          </span>
          <span
            className={TYPOGRAPHY.body.fontSize}
            style={{ color: COLORS.text.muted }}
          >
            / 100
          </span>
        </div>
        {rationale && (
          <p
            className={TYPOGRAPHY.body.fontSize}
            style={{
              color: COLORS.text.secondary,
              lineHeight: "1.6",
            }}
          >
            {rationale}
          </p>
        )}
      </FeedbackCard>
    </div>
  );
}

export function GrowthInsightsSection({
  growth_insights,
  isLoading = false,
  isLocked = false,
}: GrowthInsightsSectionProps) {
  if (isLoading || !growth_insights) {
    return null;
  }

  const {
    self_clarity_index,
    pattern_balance_score,
    vision_consistency_score,
    self_clarity_rationale,
    pattern_balance_rationale,
    vision_consistency_rationale,
  } = growth_insights;

  return (
    <>
      <ScrollAnimation delay={50}>
        <ScoreCard
          title="정체성·지향 명확도"
          score={self_clarity_index}
          rationale={self_clarity_rationale}
          icon={<Lightbulb className="w-4 h-4 text-white" />}
          iconColor="#E5B96B"
        />
      </ScrollAnimation>
      <ScrollAnimation delay={150}>
        <ScoreCard
          title="몰입·에너지 vs 걸림돌 균형"
          score={pattern_balance_score}
          rationale={pattern_balance_rationale}
          icon={<Scale className="w-4 h-4 text-white" />}
          iconColor="#A8BBA8"
        />
      </ScrollAnimation>
      <ScrollAnimation delay={250}>
        <ScoreCard
          title="지향하는 모습 비전 일관도"
          score={vision_consistency_score}
          rationale={vision_consistency_rationale}
          icon={<Target className="w-4 h-4 text-white" />}
          iconColor="#E5B96B"
        />
      </ScrollAnimation>
    </>
  );
}
