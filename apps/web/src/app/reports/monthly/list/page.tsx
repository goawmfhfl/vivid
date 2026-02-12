"use client";

import { Suspense, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/common/AppHeader";
import { useSubscription } from "@/hooks/useSubscription";
import { MonthlyListSkeleton } from "@/components/reports/GrowthInsightsSkeleton";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { MonthlySummariesTab } from "@/components/summaries/MonthlySummariesTab";
import { useMonthlyVividList } from "@/hooks/useMonthlyVivid";
import { convertMonthlyVividToPeriodSummary } from "@/components/summaries/monthly-vivid-mapper";
import { SPACING } from "@/lib/design-system";
import { withAuth } from "@/components/auth";
import { PullToRefresh } from "@/components/common/PullToRefresh";

function MonthlyListPage() {
  const router = useRouter();
  const { isPro, isLoading: isLoadingSubscription } = useSubscription();

  // 비Pro 사용자는 리포트 메인으로 리다이렉트
  useEffect(() => {
    if (isLoadingSubscription) return;
    if (!isPro) {
      router.replace("/reports");
    }
  }, [isPro, isLoadingSubscription, router]);

  // 월간 비비드 리스트 조회
  const {
    data: monthlyVividList = [],
    isLoading: isLoadingMonthly,
    error: monthlyError,
    refetch: refetchMonthly,
  } = useMonthlyVividList(true);

  const handleRefresh = useCallback(async () => {
    await refetchMonthly();
  }, [refetchMonthly]);

  // 월간 비비드을 PeriodSummary로 변환 (Hooks는 early return 전에 호출)
  const monthlySummaries = useMemo(() => {
    return monthlyVividList.map(convertMonthlyVividToPeriodSummary);
  }, [monthlyVividList]);

  // 비Pro 또는 로딩 중에는 리다이렉트 처리
  if (isLoadingSubscription || !isPro) {
    return null;
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div
        className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-24`}
      >
        <AppHeader
          title="월간 VIVID 리스트"
          showBackButton={true}
          onBack={() => router.push("/reports/monthly")}
        />

      {/* 월간 리포트 리스트 */}
      {isLoadingMonthly ? (
        <MonthlyListSkeleton />
      ) : monthlyError ? (
        <div className="py-12">
          <ErrorDisplay
            message={
              monthlyError instanceof Error
                ? monthlyError.message
                : "월간 vivid를 불러오는 중 오류가 발생했습니다."
            }
            size="md"
            onRetry={() => {
              refetchMonthly();
            }}
            retryLabel="다시 시도"
          />
        </div>
      ) : (
        <MonthlySummariesTab summaries={monthlySummaries} />
      )}
      </div>
    </PullToRefresh>
  );
}

const MonthlyListPageWithAuth = withAuth(MonthlyListPage);

export default function Page() {
  return (
    <Suspense fallback={<MonthlyListSkeleton />}>
      <MonthlyListPageWithAuth />
    </Suspense>
  );
}
