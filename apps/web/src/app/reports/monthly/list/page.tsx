"use client";

import { useMemo } from "react";
import { AppHeader } from "@/components/common/AppHeader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { MonthlySummariesTab } from "@/components/summaries/MonthlySummariesTab";
import { useMonthlyVividList } from "@/hooks/useMonthlyVivid";
import { convertMonthlyVividToPeriodSummary } from "@/components/summaries/monthly-vivid-mapper";
import { SPACING } from "@/lib/design-system";
import { withAuth } from "@/components/auth";

function MonthlyListPage() {
  // 월간 비비드 리스트 조회
  const {
    data: monthlyVividList = [],
    isLoading: isLoadingMonthly,
    error: monthlyError,
    refetch: refetchMonthly,
  } = useMonthlyVividList(true);

  // 월간 비비드을 PeriodSummary로 변환
  const monthlySummaries = useMemo(() => {
    return monthlyVividList.map(convertMonthlyVividToPeriodSummary);
  }, [monthlyVividList]);

  return (
    <div
      className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-24`}
    >
      <AppHeader 
        title="월간 VIVID 리스트" 
        showBackButton={true}
      />

      {/* 월간 리포트 리스트 */}
      {isLoadingMonthly ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner
            message="월간 vivid를 불러오는 중..."
            size="md"
            showMessage={true}
          />
        </div>
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
  );
}

export default withAuth(MonthlyListPage);
