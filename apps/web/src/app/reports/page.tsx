"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AppHeader } from "@/components/common/AppHeader";
import { RecentTrendsSection } from "@/components/reports/RecentTrendsSection";
import { GrowthInsightsSection } from "@/components/reports/GrowthInsightsSection";
import { ReportsPageSkeleton } from "@/components/reports/GrowthInsightsSkeleton";
import { useUserPersonaInsights } from "@/hooks/useUserPersonaInsights";
import { useSubscription } from "@/hooks/useSubscription";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  GRADIENT_UTILS,
  SHADOWS,
} from "@/lib/design-system";
import { withAuth } from "@/components/auth";
import { Calendar, TrendingUp, Lock } from "lucide-react";
import { PullToRefresh } from "@/components/common/PullToRefresh";
import { QUERY_KEYS } from "@/constants";
import type { UserPersonaInsightsResponse } from "@/app/api/user-persona/insights/route";

/** 비Pro 사용자용 테스트 데이터 — 일반인 컨셉 미리보기 + Notice로 Pro 안내 */
const MOCK_PERSONA_INSIGHTS: Pick<
  UserPersonaInsightsResponse,
  "growth_insights" | "identity" | "patterns"
> = {
  growth_insights: {
    self_clarity_index: 72,
    pattern_balance_score: 68,
    self_clarity_rationale:
      "일상의 균형과 몸·마음 조화를 꾸준히 챙기려는 모습이 드러납니다. Pro에서 나의 기록 기반 인사이트를 확인해 보세요.",
    pattern_balance_rationale:
      "몰입할 때와 지칠 때의 패턴이 비교적 뚜렷합니다. Pro 멤버십으로 구체적인 균형 인사이트를 확인할 수 있어요.",
  },
  identity: {
    traits: [
      "꾸준히 실천하려 하고, 한 번 정한 일은 끝까지 해내는 편",
      "조금씩이라도 나아지려는 성장 마인드를 갖고 있음",
      "하루를 돌아보고 반성하며 다음에 살짝 다듬어 나가는 스타일",
    ],
    ideal_self: [
      "깊이 있게 생각한 뒤 말하고 행동하는 사람",
      "현실에 맞게 움직이되, 꾸준히 실천하는 사람",
      "주변과 따뜻하게 소통하며 관계를 쌓아가는 사람",
    ],
    driving_forces: [
      "내가 하는 일이 누군가에게 조금이라도 도움이 되길 바라는 마음",
      "마음이 흔들리지 않도록 내면의 평화를 유지하려는 노력",
      "나와 주변을 조금씩 더 나은 방향으로 바꿔나가고 싶은 욕구",
    ],
  },
  patterns: {
    flow_moments: [
      "좋아하는 일에 집중하다 보니 시간 가는 줄 몰랐던 순간",
      "일기를 쓰며 하루를 정리하고 마음이 가벼워진 시간",
      "주간을 돌아보고 다음 주를 가볍게 설계하는 시간",
    ],
    stumbling_blocks: [
      "한 번에 완벽하게 하려다 지쳐서 미루게 되는 경우",
      "빨리 결과를 내려다 실수가 나오거나 조급해지는 순간",
    ],
    energy_sources: [
      "책이나 글을 읽으며 새로운 생각을 만날 때",
      "운동이나 산책으로 몸을 움직인 뒤 머리가 맑아질 때",
      "친구·가족과 이야기하며 연결감을 느낄 때",
    ],
  },
};

function ReportsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isPro, isLoading: isLoadingSubscription } = useSubscription();
  const growthSectionTriggerRef = useRef<HTMLDivElement | null>(null);
  const [isGrowthSectionVisible, setIsGrowthSectionVisible] = useState(false);

  const {
    data: personaInsights,
    isLoading: isLoadingInsights,
    refetch: refetchInsights,
  } = useUserPersonaInsights({ enabled: isPro && isGrowthSectionVisible });

  useEffect(() => {
    const target = growthSectionTriggerRef.current;
    if (!target || isGrowthSectionVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsGrowthSectionVisible(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        threshold: 0.15,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [isGrowthSectionVisible]);

  const handleRefresh = useCallback(async () => {
    const tasks: Promise<unknown>[] = [
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.CURRENT_USER] }),
    ];
    if (isPro) {
      tasks.push(refetchInsights());
    }
    await Promise.all(tasks);
  }, [queryClient, isPro, refetchInsights]);

  // Pro: 실제 데이터 있으면 사용, 없으면 미리보기. 비Pro: 미리보기
  const growthInsightsToShow =
    isPro && personaInsights?.growth_insights
      ? personaInsights.growth_insights
      : MOCK_PERSONA_INSIGHTS.growth_insights;
  const identityToShow =
    isPro && personaInsights?.identity
      ? personaInsights.identity
      : MOCK_PERSONA_INSIGHTS.identity;
  const patternsToShow =
    isPro && personaInsights?.patterns
      ? personaInsights.patterns
      : MOCK_PERSONA_INSIGHTS.patterns;
  const hasRealGrowthData = !!personaInsights?.growth_insights;
  const showGrowthSection = true; // 데이터 없어도 미리보기로 항상 표시
  const growthSectionLocked = !isPro;

  if (isLoadingSubscription) {
    return (
      <div
        className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-24 min-w-0 overflow-x-hidden min-h-[60vh]`}
      >
        <AppHeader
          title="리포트"
          subtitle="주간 및 월간 기록을 분석하고 인사이트를 확인하세요"
        />
        <ReportsPageSkeleton />
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div
        className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-24 min-w-0 overflow-x-hidden`}
      >
        <AppHeader
          title="리포트"
          subtitle="주간 및 월간 기록을 분석하고 인사이트를 확인하세요"
        />

      <div
        className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8 min-w-0 animate-fade-in"
        style={{ animationDelay: "0ms" }}
      >
        {/* 주간 리포트 버튼 - 하늘빛 블루 테마 */}
        <button
          onClick={() => {
            if (isPro) {
              router.push("/reports/weekly");
            } else {
              router.push("/membership");
            }
          }}
          className="w-full relative overflow-hidden transition-all duration-300 active:scale-[0.98] cursor-pointer min-w-0 p-3 sm:p-5"
          style={{
            background: GRADIENT_UTILS.cardBackground(COLORS.weekly.light, 0.18),
            border: `1.5px solid ${GRADIENT_UTILS.borderColor(
              COLORS.weekly.primary,
              "35"
            )}`,
            borderRadius: "20px",
            textAlign: "left",
            boxShadow: SHADOWS.default,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = SHADOWS.lg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = SHADOWS.default;
          }}
        >
          {/* 배경 장식 그라디언트 */}
          <div
            className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none"
            style={{
              background: GRADIENT_UTILS.decoration(COLORS.weekly.primary, 0.5),
            }}
          />
          {/* Pro 뱃지 */}
          {!isPro && (
            <div
              className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-md px-1.5 py-0.5 min-w-0 sm:px-2 sm:py-0.5"
              style={{
                background: `linear-gradient(135deg, ${COLORS.weekly.primary} 0%, ${COLORS.weekly.dark} 100%)`,
              }}
            >
              <Lock className="w-3 h-3 flex-shrink-0" style={{ color: COLORS.text.white }} />
              <span
                className="text-[10px] sm:text-xs font-semibold truncate"
                style={{ color: COLORS.text.white }}
              >
                Pro
              </span>
            </div>
          )}
          <div className="relative z-0 flex flex-col gap-1.5 sm:gap-2 pr-12 sm:pr-14">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: GRADIENT_UTILS.iconBadge(COLORS.weekly.primary, 0.08),
                  boxShadow: `0 2px 8px ${COLORS.weekly.primary}35`,
                }}
              >
                <Calendar
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  style={{ color: COLORS.text.white }}
                />
              </div>
              <h3
                className={TYPOGRAPHY.h3.fontSize}
                style={{
                  ...TYPOGRAPHY.h3,
                  fontSize: "clamp(0.8rem, 2.5vw, 0.9rem)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                <span className="sm:hidden">주간</span>
                <span className="hidden sm:inline">주간 VIVID</span>
              </h3>
            </div>
            <p
              className="text-[0.7rem] sm:text-xs leading-relaxed line-clamp-2"
              style={{
                color: COLORS.text.secondary,
                opacity: 0.85,
                lineHeight: "1.4",
              }}
            >
              일주일간의 기록 분석
            </p>
          </div>
        </button>

        {/* 월간 리포트 버튼 - 부드러운 옐로우 톤 */}
        <button
          onClick={() => {
            if (isPro) {
              router.push("/reports/monthly");
            } else {
              router.push("/membership");
            }
          }}
          className="w-full relative overflow-hidden transition-all duration-300 active:scale-[0.98] cursor-pointer min-w-0 p-3 sm:p-5"
          style={{
            background: GRADIENT_UTILS.cardBackground(COLORS.monthly.light, 0.2),
            border: `1.5px solid ${GRADIENT_UTILS.borderColor(
              COLORS.monthly.primary,
              "35"
            )}`,
            borderRadius: "20px",
            textAlign: "left",
            boxShadow: SHADOWS.default,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = SHADOWS.lg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = SHADOWS.default;
          }}
        >
          <div
            className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none"
            style={{
              background: GRADIENT_UTILS.decoration(COLORS.monthly.primary, 0.5),
            }}
          />
          {!isPro && (
            <div
              className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-md px-1.5 py-0.5 min-w-0 sm:px-2 sm:py-0.5"
              style={{
                background: `linear-gradient(135deg, ${COLORS.monthly.primary} 0%, ${COLORS.monthly.dark} 100%)`,
              }}
            >
              <Lock className="w-3 h-3 flex-shrink-0" style={{ color: COLORS.text.white }} />
              <span
                className="text-[10px] sm:text-xs font-semibold truncate"
                style={{ color: COLORS.text.white }}
              >
                Pro
              </span>
            </div>
          )}
          <div className="relative z-0 flex flex-col gap-1.5 sm:gap-2 pr-12 sm:pr-14">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: GRADIENT_UTILS.iconBadge(COLORS.monthly.primary, 0.08),
                  boxShadow: `0 2px 8px ${COLORS.monthly.primary}35`,
                }}
              >
                <TrendingUp
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  style={{ color: COLORS.text.white }}
                />
              </div>
              <h3
                className={TYPOGRAPHY.h3.fontSize}
                style={{
                  ...TYPOGRAPHY.h3,
                  fontSize: "clamp(0.8rem, 2.5vw, 0.9rem)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                <span className="sm:hidden">월간</span>
                <span className="hidden sm:inline">월간 VIVID</span>
              </h3>
            </div>
            <p
              className="text-[0.7rem] sm:text-xs leading-relaxed line-clamp-2"
              style={{
                color: COLORS.text.secondary,
                opacity: 0.85,
                lineHeight: "1.4",
              }}
            >
              한 달간의 기록 분석
            </p>
          </div>
        </button>
      </div>

      {/* 한눈에 보기 + 성장 인사이트 */}
      <div
        className="mt-12 pt-12 border-t"
        style={{ borderColor: COLORS.border.light }}
      >
        <div
          className="animate-fade-in"
          style={{ animationDelay: "150ms" }}
        >
          <RecentTrendsSection />
        </div>
        <div ref={growthSectionTriggerRef} className="h-1 w-full" />
        {isGrowthSectionVisible && showGrowthSection && (
          <div
            className="animate-fade-in mt-12"
            style={{ animationDelay: "400ms" }}
          >
            <h2
              className="mt-12 text-[13px] sm:text-sm font-semibold mb-1"
              style={{ color: COLORS.text.primary }}
            >
              성장 인사이트
            </h2>
            <p
              className="text-[12px] sm:text-sm mb-4"
              style={{ color: COLORS.text.secondary, lineHeight: "1.6" }}
            >
              나의 기록을 바탕으로 한 성장 인사이트
            </p>
            <GrowthInsightsSection
              growth_insights={growthInsightsToShow}
              identity={identityToShow ?? undefined}
              patterns={patternsToShow ?? undefined}
              isLoading={isPro ? isLoadingInsights : false}
              isLocked={growthSectionLocked}
              hasRealData={hasRealGrowthData}
            />
          </div>
        )}
      </div>
      </div>
    </PullToRefresh>
  );
}

export default withAuth(ReportsPage);
