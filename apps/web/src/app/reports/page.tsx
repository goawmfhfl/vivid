"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AppHeader } from "@/components/common/AppHeader";
import { RecentTrendsSection } from "@/components/reports/RecentTrendsSection";
import { useRecentTrends } from "@/hooks/useRecentTrends";
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

function ReportsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isPro } = useSubscription();

  // 최근 동향 데이터 조회
  const {
    data: recentTrendsData,
    isLoading: isLoadingTrends,
    error: trendsError,
    refetch: refetchTrends,
  } = useRecentTrends();

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refetchTrends(),
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.CURRENT_USER] }),
    ]);
  }, [queryClient, refetchTrends]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div
        className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-24`}
      >
        <AppHeader
          title="리포트"
          subtitle="주간 및 월간 기록을 분석하고 인사이트를 확인하세요"
        />

      <div className="grid grid-cols-2 gap-4 mt-8">
        {/* 주간 리포트 버튼 */}
        <button
          onClick={() => {
            if (isPro) {
              router.push("/reports/weekly");
            } else {
              router.push("/membership");
            }
          }}
          className="w-full relative overflow-hidden transition-all duration-300 active:scale-[0.98] cursor-pointer"
          style={{
            background: GRADIENT_UTILS.cardBackground(COLORS.brand.light, 0.15),
            border: `1.5px solid ${GRADIENT_UTILS.borderColor(
              COLORS.brand.light,
              "30"
            )}`,
            borderRadius: "20px",
            padding: "20px",
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
              background: GRADIENT_UTILS.decoration(COLORS.brand.light, 0.6),
            }}
          />
          <div className="relative z-10 flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: GRADIENT_UTILS.iconBadge(
                    COLORS.brand.light,
                    0.15
                  ),
                  boxShadow: `0 2px 8px ${COLORS.brand.light}30`,
                }}
              >
                <Calendar
                  className="w-4 h-4"
                  style={{ color: COLORS.text.white }}
                />
              </div>
              <h3
                className={TYPOGRAPHY.h3.fontSize}
                style={{
                  ...TYPOGRAPHY.h3,
                  fontSize: "0.9rem",
                  whiteSpace: "nowrap",
                }}
              >
                주간 VIVID
              </h3>
              {!isPro && (
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md ml-auto"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.brand.primary} 0%, ${COLORS.brand.secondary || COLORS.brand.primary} 100%)`,
                  }}
                >
                  <Lock className="w-3 h-3" style={{ color: COLORS.text.white }} />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: COLORS.text.white }}
                  >
                    Pro
                  </span>
                </div>
              )}
            </div>
            <p
              className="text-xs leading-relaxed"
              style={{
                color: COLORS.text.secondary,
                opacity: 0.85,
                lineHeight: "1.4",
                fontSize: "0.75rem",
              }}
            >
              일주일간의 기록 분석
            </p>
          </div>
        </button>

        {/* 월간 리포트 버튼 */}
        <button
          onClick={() => {
            if (isPro) {
              router.push("/reports/monthly");
            } else {
              router.push("/membership");
            }
          }}
          className="w-full relative overflow-hidden transition-all duration-300 active:scale-[0.98] cursor-pointer"
          style={{
            background: GRADIENT_UTILS.cardBackground(
              COLORS.brand.primary,
              0.15
            ),
            border: `1.5px solid ${GRADIENT_UTILS.borderColor(
              COLORS.brand.primary,
              "30"
            )}`,
            borderRadius: "20px",
            padding: "20px",
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
              background: GRADIENT_UTILS.decoration(COLORS.brand.primary, 0.6),
            }}
          />
          <div className="relative z-10 flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: GRADIENT_UTILS.iconBadge(
                    COLORS.brand.primary,
                    0.15
                  ),
                  boxShadow: `0 2px 8px ${COLORS.brand.primary}30`,
                }}
              >
                <TrendingUp
                  className="w-4 h-4"
                  style={{ color: COLORS.text.white }}
                />
              </div>
              <h3
                className={TYPOGRAPHY.h3.fontSize}
                style={{
                  ...TYPOGRAPHY.h3,
                  fontSize: "0.9rem",
                  whiteSpace: "nowrap",
                }}
              >
                월간 VIVID
              </h3>
              {!isPro && (
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md ml-auto"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.brand.primary} 0%, ${COLORS.brand.secondary || COLORS.brand.primary} 100%)`,
                  }}
                >
                  <Lock className="w-3 h-3" style={{ color: COLORS.text.white }} />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: COLORS.text.white }}
                  >
                    Pro
                  </span>
                </div>
              )}
            </div>
            <p
              className="text-xs leading-relaxed"
              style={{
                color: COLORS.text.secondary,
                opacity: 0.85,
                lineHeight: "1.4",
                fontSize: "0.75rem",
              }}
            >
              한 달간의 기록 분석
            </p>
          </div>
        </button>
      </div>

      {/* 최근 동향 섹션 */}
      <div
        className="mt-12 pt-12 border-t"
        style={{ borderColor: COLORS.border.light }}
      >
        <RecentTrendsSection
          data={recentTrendsData || null}
          isLoading={isLoadingTrends}
          error={trendsError || null}
        />
      </div>
      </div>
    </PullToRefresh>
  );
}

export default withAuth(ReportsPage);
