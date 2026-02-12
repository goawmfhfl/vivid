"use client";

import { useRouter } from "next/navigation";
import { Lightbulb, Scale, Lock } from "lucide-react";
import { AnimatedScoreBlock } from "@/components/reports/AnimatedScoreBlock";
import { ReportDropdown } from "@/components/reports/ReportDropdown";
import { GrowthInsightsSectionSkeleton } from "@/components/reports/GrowthInsightsSkeleton";
import { PreviewDataNotice } from "@/components/reports/PreviewDataNotice";
import { COLORS } from "@/lib/design-system";
import type { UserPersonaInsightsResponse } from "@/app/api/user-persona/insights/route";

interface GrowthInsightsSectionProps {
  growth_insights: UserPersonaInsightsResponse["growth_insights"] | null;
  identity?: UserPersonaInsightsResponse["identity"];
  patterns?: UserPersonaInsightsResponse["patterns"];
  isLoading?: boolean;
  isLocked?: boolean;
  hasRealData?: boolean;
}

const ACCENT = COLORS.brand.primary;
const CARD_BG = COLORS.background.cardElevated;
const CARD_BORDER = COLORS.border.light;

export function GrowthInsightsSection({
  growth_insights,
  identity = null,
  patterns = null,
  isLoading = false,
  isLocked = false,
  hasRealData = true,
}: GrowthInsightsSectionProps) {
  const router = useRouter();
  if (isLoading) return <GrowthInsightsSectionSkeleton />;
  if (!growth_insights) return null;

  const {
    self_clarity_index,
    pattern_balance_score,
    self_clarity_rationale,
    pattern_balance_rationale,
  } = growth_insights;

  const cards = [
    {
      id: "clarity",
      title: "정체성·지향 명확도",
      Icon: Lightbulb,
      score: self_clarity_index,
      rationale: self_clarity_rationale,
      blocks: [
        { label: "나의 특성", items: identity?.traits ?? [] },
        { label: "지향하는 자아", items: identity?.ideal_self ?? [] },
        { label: "나를 움직이는 원동력", items: identity?.driving_forces ?? [] },
      ].filter((b) => b.items.length > 0),
    },
    {
      id: "balance",
      title: "몰입·에너지 vs 걸림돌 균형",
      Icon: Scale,
      score: pattern_balance_score,
      rationale: pattern_balance_rationale,
      blocks: [
        { label: "몰입의 순간", items: patterns?.flow_moments ?? [] },
        { label: "에너지원", items: patterns?.energy_sources ?? [] },
        { label: "걸림돌", items: patterns?.stumbling_blocks ?? [] },
      ].filter((b) => b.items.length > 0),
    },
  ];

  return (
    <section className="space-y-6 w-full max-w-2xl relative min-w-0">
      {!hasRealData && (
        <PreviewDataNotice
          subtitle="나의 기록이 쌓이면 성장 인사이트가 표시됩니다"
          accentColor={ACCENT}
        />
      )}
      {cards.map(({ id, title, Icon, score, rationale, blocks }, cardIdx) => (
        <div
          key={id}
          className="relative rounded-xl overflow-hidden transition-all duration-200 animate-fade-in"
          style={{
            backgroundColor: CARD_BG,
            border: `1px solid ${CARD_BORDER}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            animationDelay: `${cardIdx * 100}ms`,
          }}
        >
          {/* 비Pro: Pro 전용 데이터 오버레이 */}
          {isLocked && (
            <button
              type="button"
              onClick={() => router.push("/membership")}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 cursor-pointer transition-opacity hover:opacity-100"
              style={{
                backgroundColor: "rgba(250, 250, 248, 0.85)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                opacity: 0.95,
              }}
            >
              <div
                className="flex items-center justify-center w-12 h-12 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.brand.primary} 0%, ${COLORS.brand.dark} 100%)`,
                  boxShadow: `0 2px 12px ${COLORS.brand.primary}50`,
                }}
              >
                <Lock className="w-6 h-6" style={{ color: COLORS.text.white }} />
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: COLORS.text.primary }}
              >
                Pro 멤버 전용
              </span>
            </button>
          )}
          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: ACCENT }} />
          <div className="pl-4 pr-4 pt-4 pb-4 relative">
            {/* 1. 제목(왼쪽) + 점수·그래프(오른쪽) 한 줄 (줄바꿈 없음, 좁을 땐 크기 축소) */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 flex-nowrap mb-4 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                <div
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${ACCENT}18` }}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: ACCENT }} />
                </div>
                <h3
                  className="text-xs sm:text-sm font-semibold truncate"
                  style={{ color: COLORS.text.primary }}
                >
                  {title}
                </h3>
              </div>
              <div className="flex-shrink-0">
                <AnimatedScoreBlock
                  score={score}
                  accentColor={ACCENT}
                  durationMs={1200}
                  layout="inline"
                />
              </div>
            </div>

            {/* 2. 드롭다운 리스트 */}
            {blocks.length > 0 && (
              <div className="space-y-2 mt-3">
                {blocks.map((b) => (
                  <ReportDropdown
                    key={b.label}
                    label={b.label}
                    items={b.items}
                    accentColor={ACCENT}
                  />
                ))}
              </div>
            )}

            {/* 3. 인사이트 */}
            {rationale && (
              <p
                className="text-xs mt-4 leading-relaxed"
                style={{ color: COLORS.text.secondary }}
              >
                {rationale}
              </p>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
