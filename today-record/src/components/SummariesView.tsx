import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { ErrorDisplay } from "./ui/ErrorDisplay";
import type { PeriodSummary } from "@/types/Entry";
import { WeeklySummariesTab } from "./summaries/WeeklySummariesTab";
import { MonthlySummariesTab } from "./summaries/MonthlySummariesTab";
import { useWeeklyFeedbackList } from "@/hooks/useWeeklyFeedback";
import { useGetMonthlyFeedbackList } from "@/hooks/useGetMonthlyFeedback";
import type { WeeklyFeedbackListItem } from "@/types/weekly-feedback";
import {
  calculateWeekNumber,
  formatDateRange,
  formatPeriod,
  createPeriodSummaryFromWeeklyFeedback,
} from "./summaries/weekly-feedback-mapper";
import { convertMonthlyFeedbackToPeriodSummary } from "./summaries/monthly-feedback-mapper";

/**
 * 주간 피드백 리스트 아이템을 PeriodSummary로 변환
 */
function convertWeeklyFeedbackToPeriodSummary(
  item: WeeklyFeedbackListItem
): PeriodSummary {
  const startDate = new Date(item.week_range.start);
  const endDate = new Date(item.week_range.end);

  const weekNumber = calculateWeekNumber(startDate);
  const year = startDate.getFullYear();
  const dateRange = formatDateRange(startDate, endDate);
  const period = formatPeriod(startDate, weekNumber);

  return createPeriodSummaryFromWeeklyFeedback({
    item,
    weekNumber,
    year,
    dateRange,
    period,
  });
}

export function SummariesView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 쿼리 파라미터에서 탭 정보 가져오기 (기본값: weekly)
  const activeTab = (searchParams.get("tab") || "weekly") as
    | "weekly"
    | "monthly";

  // 주간 피드백 리스트 조회 (기본값이므로 항상 조회)
  const {
    data: weeklyFeedbackList = [],
    isLoading: isLoadingWeekly,
    error: weeklyError,
    refetch: refetchWeekly,
  } = useWeeklyFeedbackList();

  // 월간 피드백 리스트 조회 (월간 탭일 때만 조회)
  const {
    data: monthlyFeedbackList = [],
    isLoading: isLoadingMonthly,
    error: monthlyError,
    refetch: refetchMonthly,
  } = useGetMonthlyFeedbackList(activeTab === "monthly");

  // 탭 변경 시 URL 업데이트
  const handleTabChange = (tab: string) => {
    const newTab = tab as "weekly" | "monthly";
    if (newTab === "weekly") {
      router.push("/analysis?tab=weekly");
    } else {
      router.push("/analysis?tab=monthly");
    }
  };

  // 주간 피드백을 PeriodSummary로 변환
  const weeklySummaries = useMemo(() => {
    return weeklyFeedbackList.map(convertWeeklyFeedbackToPeriodSummary);
  }, [weeklyFeedbackList]);

  // 월간 피드백을 PeriodSummary로 변환
  const monthlySummaries = useMemo(() => {
    return monthlyFeedbackList.map(convertMonthlyFeedbackToPeriodSummary);
  }, [monthlyFeedbackList]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1
              className="mb-1"
              style={{ color: "#333333", fontSize: "1.5rem" }}
            >
              분석 & 요약
            </h1>
            <p style={{ color: "#4E4B46", opacity: 0.7, fontSize: "0.9rem" }}>
              주간 및 월간 기록을 분석하고 인사이트를 확인하세요
            </p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <TabsList
          className="grid w-full grid-cols-2 h-12 rounded-xl p-1"
          style={{ backgroundColor: "#F3F4F6" }}
        >
          <TabsTrigger
            value="weekly"
            className="flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium"
            style={{
              backgroundColor:
                activeTab === "weekly" ? "#A8BBA8" : "transparent",
              color: activeTab === "weekly" ? "white" : "#4E4B46",
              fontWeight: activeTab === "weekly" ? "600" : "500",
            }}
          >
            주간 요약
          </TabsTrigger>
          <TabsTrigger
            value="monthly"
            className="flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium"
            style={{
              backgroundColor:
                activeTab === "monthly" ? "#6B7A6F" : "transparent",
              color: activeTab === "monthly" ? "white" : "#4E4B46",
              fontWeight: activeTab === "monthly" ? "600" : "500",
            }}
          >
            월간 요약
          </TabsTrigger>
        </TabsList>

        {/* Weekly Tab */}
        <TabsContent value="weekly">
          {isLoadingWeekly ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner
                message="주간 피드백을 불러오는 중..."
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
                    : "주간 피드백을 불러오는 중 오류가 발생했습니다."
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
        </TabsContent>

        {/* Monthly Tab */}
        <TabsContent value="monthly">
          {isLoadingMonthly ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner
                message="월간 피드백을 불러오는 중..."
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
                    : "월간 피드백을 불러오는 중 오류가 발생했습니다."
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
