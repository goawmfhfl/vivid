"use client";

import { Suspense, useCallback, useMemo } from "react";
import { AppHeader } from "@/components/common/AppHeader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { WeeklySummariesTab } from "@/components/summaries/WeeklySummariesTab";
import { useWeeklyVividList } from "@/hooks/useWeeklyVivid";
import type { WeeklyVividListItem } from "@/types/weekly-vivid";
import type { PeriodSummary } from "@/types/Entry";
import {
  formatDateRange,
  formatPeriod,
  createPeriodSummaryFromWeeklyVivid,
  calculateWeekNumberInMonth,
} from "@/components/summaries/weekly-vivid-mapper";
import { SPACING } from "@/lib/design-system";
import { withAuth } from "@/components/auth";
import { PullToRefresh } from "@/components/common/PullToRefresh";

/**
 * 주간 비비드 리스트 아이템을 PeriodSummary로 변환
 */
function convertWeeklyVividToPeriodSummary(
  item: WeeklyVividListItem
): PeriodSummary {
  const startDate = new Date(item.week_range.start);
  const endDate = new Date(item.week_range.end);

  const dateRange = formatDateRange(startDate, endDate);
  const period = formatPeriod(startDate, endDate);
  
  // 월 기준 주차 계산
  const result = calculateWeekNumberInMonth(startDate, endDate);
  const { weekNumber, year } = result;
  
  const title = item.title;

  return createPeriodSummaryFromWeeklyVivid({
    item,
    weekNumber,
    year,
    dateRange,
    period,
    title,
  });
}

function WeeklyListPage() {
  // 주간 피드백 리스트 조회
  const {
    data: weeklyVividList = [],
    isLoading: isLoadingWeekly,
    error: weeklyError,
    refetch: refetchWeekly,
  } = useWeeklyVividList();

  const handleRefresh = useCallback(async () => {
    await refetchWeekly();
  }, [refetchWeekly]);

  // 주간 피드백을 PeriodSummary로 변환
  const weeklySummaries = useMemo(() => {
    return weeklyVividList.map(convertWeeklyVividToPeriodSummary);
  }, [weeklyVividList]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div
        className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-24`}
      >
        <AppHeader 
          title="주간 VIVID 리스트" 
          showBackButton={true}
        />

      {/* 주간 리포트 리스트 */}
      {isLoadingWeekly ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner
            message="주간 vivid를 불러오는 중..."
            size="md"
            showMessage={true}
          />
        </div>
      ) : weeklyError ? (
        <div className="py-12">
          <ErrorDisplay
            message={
              weeklyError instanceof Error
                ? weeklyError.message
                : "주간 vivid를 불러오는 중 오류가 발생했습니다."
            }
            size="md"
            onRetry={() => {
              refetchWeekly();
            }}
            retryLabel="다시 시도"
          />
        </div>
      ) : (
        <WeeklySummariesTab summaries={weeklySummaries} />
      )}
      </div>
    </PullToRefresh>
  );
}

const WeeklyListPageWithAuth = withAuth(WeeklyListPage);

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner
            message="로딩 중..."
            size="md"
            showMessage={true}
          />
        </div>
      }
    >
      <WeeklyListPageWithAuth />
    </Suspense>
  );
}
