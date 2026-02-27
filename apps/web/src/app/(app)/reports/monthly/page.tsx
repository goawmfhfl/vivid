"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AppHeader } from "@/components/common/AppHeader";
import { MonthlyCandidatesSection } from "@/components/summaries/MonthlyCandidatesSection";
import { FourMonthTrendsSection } from "@/components/reports/FourMonthTrendsSection";
import { MonthlyTrendsSection } from "@/components/reports/MonthlyTrendsSection";
import { useMonthlyTrends } from "@/hooks/useMonthlyTrends";
import { useSubscription } from "@/hooks/useSubscription";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  GRADIENT_UTILS,
  SHADOWS,
} from "@/lib/design-system";
import { withAuth } from "@/components/auth";
import { List } from "lucide-react";
import { PullToRefresh } from "@/components/common/PullToRefresh";
import { QUERY_KEYS } from "@/constants";

function MonthlyReportsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isPro, isLoading: isLoadingSubscription } = useSubscription();

  // 비Pro 사용자는 리포트 메인으로 리다이렉트
  useEffect(() => {
    if (isLoadingSubscription) return;
    if (!isPro) {
      router.replace("/reports");
    }
  }, [isPro, isLoadingSubscription, router]);

  // 월간 흐름 데이터 조회
  const {
    data: monthlyTrendsData,
    isLoading: isLoadingTrends,
    error: trendsError,
    refetch: refetchMonthlyTrends,
  } = useMonthlyTrends();

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refetchMonthlyTrends(),
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.MONTHLY_CANDIDATES] }),
    ]);
  }, [queryClient, refetchMonthlyTrends]);

  // 비Pro 또는 로딩 중에는 리다이렉트/스켈레톤 처리
  if (isLoadingSubscription || !isPro) {
    return null;
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div
        className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-24`}
      >
        <AppHeader 
          title="월간 VIVID 리포트" 
          showBackButton={true}
          onBack={() => router.push("/reports")}
        />

      {/* 아직 생성되지 않은 월간 vivid 알림 */}
      <div className="mb-8">
        <MonthlyCandidatesSection />
      </div>

      {/* 월간 리스트 보러가기 버튼 - 부드러운 옐로우 */}
      <div className="mb-12">
        <button
          type="button"
          onClick={() => router.push("/reports/monthly/list")}
          className="w-full relative overflow-hidden transition-all duration-300 active:scale-[0.98] cursor-pointer min-w-0 p-3 sm:p-5 text-left"
          style={{
            background: GRADIENT_UTILS.cardBackground(COLORS.monthly.light, 0.2),
            border: `1.5px solid ${GRADIENT_UTILS.borderColor(COLORS.monthly.primary, "35")}`,
            borderRadius: "20px",
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
          <div className="relative z-0 flex flex-col gap-1.5 sm:gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: GRADIENT_UTILS.iconBadge(COLORS.monthly.primary, 0.08),
                  boxShadow: `0 2px 8px ${COLORS.monthly.primary}35`,
                }}
              >
                <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: COLORS.text.white }} />
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
                월간 VIVID 리스트 보러가기
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
              작성한 월간 VIVID 목록 확인
            </p>
          </div>
        </button>
      </div>

      {/* 한눈에 보기 - 최근 4달 인사이트 */}
      <div className="mb-12">
        <FourMonthTrendsSection />
      </div>

      {/* 성장인사이트 - 나를 설명하는 4가지 흐름 */}
      <div className="mb-12">
        <MonthlyTrendsSection
          data={monthlyTrendsData ?? null}
          isLoading={isLoadingTrends}
          error={trendsError}
        />
      </div>
      </div>
    </PullToRefresh>
  );
}

export default withAuth(MonthlyReportsPage);
