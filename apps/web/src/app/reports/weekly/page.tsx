"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/common/AppHeader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { WeeklySummariesTab } from "@/components/summaries/WeeklySummariesTab";
import { WeeklyTrendsSection } from "@/components/reports/WeeklyTrendsSection";
import { useWeeklyFeedbackList } from "@/hooks/useWeeklyFeedback";
import { useWeeklyTrends } from "@/hooks/useWeeklyTrends";
import type { WeeklyFeedbackListItem } from "@/types/weekly-feedback";
import type { PeriodSummary } from "@/types/Entry";
import {
  formatDateRange,
  formatPeriod,
  createPeriodSummaryFromWeeklyFeedback,
  calculateWeekNumberInMonth,
} from "@/components/summaries/weekly-feedback-mapper";
import { COLORS, SPACING } from "@/lib/design-system";
import { withAuth } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

/**
 * 주간 피드백 리스트 아이템을 PeriodSummary로 변환
 */
function convertWeeklyFeedbackToPeriodSummary(
  item: WeeklyFeedbackListItem
): PeriodSummary {
  const startDate = new Date(item.week_range.start);
  const endDate = new Date(item.week_range.end);

  const dateRange = formatDateRange(startDate, endDate);
  const period = formatPeriod(startDate, endDate);
  
  // 월 기준 주차 계산
  const result = calculateWeekNumberInMonth(startDate, endDate);
  const { weekNumber, year } = result;
  
  const title = item.title;

  return createPeriodSummaryFromWeeklyFeedback({
    item,
    weekNumber,
    year,
    dateRange,
    period,
    title,
  });
}

function WeeklyReportsPage() {
  const router = useRouter();

  // 주간 피드백 리스트 조회
  const {
    data: weeklyFeedbackList = [],
    isLoading: isLoadingWeekly,
    error: weeklyError,
    refetch: refetchWeekly,
  } = useWeeklyFeedbackList();

  // 주간 흐름 데이터 조회
  const {
    data: weeklyTrendsData,
    isLoading: isLoadingTrends,
    error: trendsError,
  } = useWeeklyTrends();

  // 주간 피드백을 PeriodSummary로 변환
  const weeklySummaries = useMemo(() => {
    return weeklyFeedbackList.map(convertWeeklyFeedbackToPeriodSummary);
  }, [weeklyFeedbackList]);

  return (
    <div
      className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-24`}
    >
      <AppHeader title="주간 리포트" />

      {/* 월간 리포트 보기 버튼 */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push("/reports/monthly")}
          className="w-full sm:w-auto"
          style={{
            borderColor: COLORS.brand.primary,
            color: COLORS.brand.primary,
          }}
        >
          <Calendar className="w-4 h-4 mr-2" />
          월간 리포트 보기
        </Button>
      </div>

      {/* 나의 주간 흐름 */}
      <div className="mb-12">
        <WeeklyTrendsSection
          data={weeklyTrendsData}
          isLoading={isLoadingTrends}
          error={trendsError}
        />
      </div>

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
  );
}

export default withAuth(WeeklyReportsPage);
