import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { ErrorDisplay } from "../ui/ErrorDisplay";
import type { PeriodSummary } from "@/types/Entry";
import { WeeklySummariesTab } from "./WeeklySummariesTab";
import { MonthlySummariesTab } from "./MonthlySummariesTab";
import { useWeeklyFeedbackList } from "@/hooks/useWeeklyFeedback";
import { useGetMonthlyFeedbackList } from "@/hooks/useGetMonthlyFeedback";
import type { WeeklyFeedbackListItem } from "@/types/weekly-feedback";
import {
  calculateWeekNumber,
  formatDateRange,
  formatPeriod,
  createPeriodSummaryFromWeeklyFeedback,
} from "./weekly-feedback-mapper";
import { convertMonthlyFeedbackToPeriodSummary } from "./monthly-feedback-mapper";
import { COLORS, SPACING } from "@/lib/design-system";
import { AppHeader } from "../common/AppHeader";

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
    <div
      className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-24`}
    >
      {/* Header */}
      <AppHeader
        title="분석 & 요약"
        subtitle="주간 및 월간 기록을 분석하고 인사이트를 확인하세요"
      />

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <TabsList
          className="grid w-full grid-cols-2 h-12 rounded-xl p-1 relative"
          style={{
            backgroundColor: "#FAFAF8",
            border: `1.5px solid ${COLORS.border.light}`,
            boxShadow: `
              0 2px 8px rgba(0,0,0,0.04),
              0 1px 3px rgba(0,0,0,0.02),
              inset 0 1px 0 rgba(255,255,255,0.6)
            `,
            overflow: "hidden",
            // 종이 질감 배경 패턴
            backgroundImage: `
              /* 가로 줄무늬 (프로젝트 그린 톤) */
              repeating-linear-gradient(
                to bottom,
                transparent 0px,
                transparent 27px,
                rgba(107, 122, 111, 0.08) 27px,
                rgba(107, 122, 111, 0.08) 28px
              ),
              /* 종이 텍스처 노이즈 */
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 2px,
                rgba(107, 122, 111, 0.01) 2px,
                rgba(107, 122, 111, 0.01) 4px
              )
            `,
            backgroundSize: "100% 28px, 8px 8px",
            backgroundPosition: "0 2px, 0 0",
            filter: "contrast(1.02) brightness(1.01)",
          }}
        >
          {/* 종이 질감 오버레이 */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 40%),
                radial-gradient(circle at 75% 75%, ${COLORS.brand.light}15 0%, transparent 40%)
              `,
              mixBlendMode: "overlay",
              opacity: 0.5,
            }}
          />
          <TabsTrigger
            value="weekly"
            className="flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium relative z-10"
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
            className="flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium relative z-10"
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
        </TabsContent>

        {/* Monthly Tab */}
        <TabsContent value="monthly">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
