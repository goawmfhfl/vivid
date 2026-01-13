"use client";

import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/common/AppHeader";
import { WeeklyTrendsSection } from "@/components/reports/WeeklyTrendsSection";
import { WeeklyCandidatesSection } from "@/components/summaries/WeeklyCandidatesSection";
import { useWeeklyTrends } from "@/hooks/useWeeklyTrends";
import { SPACING, COLORS } from "@/lib/design-system";
import { withAuth } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { List } from "lucide-react";

function WeeklyReportsPage() {
  const router = useRouter();

  // 주간 흐름 데이터 조회
  const {
    data: weeklyTrendsData,
    isLoading: isLoadingTrends,
    error: trendsError,
  } = useWeeklyTrends();

  return (
    <div
      className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-24`}
    >
      <AppHeader 
        title="주간 VIVID 리포트" 
        showBackButton={true}
      />

      {/* 아직 생성되지 않은 주간 vivid 알림 */}
      <div className="mb-8">
        <WeeklyCandidatesSection />
      </div>

      {/* 주간 리스트 보러가기 버튼 */}
      <div className="mb-12">
        <Button
          onClick={() => router.push("/reports/weekly/list")}
          className="w-full relative overflow-hidden group"
          style={{
            backgroundColor: COLORS.brand.primary,
            color: "white",
            padding: "1.5rem 2rem",
            borderRadius: "16px",
            border: "none",
            fontSize: "1.125rem",
            boxShadow: `
              0 4px 16px rgba(107, 122, 111, 0.25),
              0 2px 8px rgba(107, 122, 111, 0.15),
              inset 0 1px 0 rgba(255,255,255,0.2)
            `,
            transition: "all 0.3s ease",
            fontWeight: "700",
            letterSpacing: "0.01em",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
            e.currentTarget.style.boxShadow = `
              0 8px 24px rgba(107, 122, 111, 0.35),
              0 4px 12px rgba(107, 122, 111, 0.2),
              inset 0 1px 0 rgba(255,255,255,0.3)
            `;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow = `
              0 4px 16px rgba(107, 122, 111, 0.25),
              0 2px 8px rgba(107, 122, 111, 0.15),
              inset 0 1px 0 rgba(255,255,255,0.2)
            `;
          }}
        >
          {/* 배경 그라데이션 오버레이 */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `linear-gradient(135deg, ${COLORS.brand.primary} 0%, ${COLORS.brand.light} 100%)`,
            }}
          />
          <div className="relative z-10 flex items-center justify-center gap-3">
            <List className="w-6 h-6" />
            <span className="text-lg font-bold">주간 VIVID 리스트 보러가기</span>
          </div>
        </Button>
      </div>

      {/* 나의 주간 흐름 */}
      <div className="mb-12">
        <WeeklyTrendsSection
          data={weeklyTrendsData ?? null}
          isLoading={isLoadingTrends}
          error={trendsError}
        />
      </div>
    </div>
  );
}

export default withAuth(WeeklyReportsPage);
