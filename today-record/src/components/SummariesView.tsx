import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PeriodSummary } from "@/types/Entry";
import { WeeklySummariesTab } from "./summaries/WeeklySummariesTab";
import { MonthlySummariesTab } from "./summaries/MonthlySummariesTab";
import { useWeeklyFeedbackList } from "@/hooks/useWeeklyFeedback";
import type { WeeklyFeedbackListItem } from "@/types/weekly-feedback";
import {
  calculateWeekNumber,
  formatDateRange,
  formatPeriod,
  createPeriodSummaryFromWeeklyFeedback,
} from "./summaries/weekly-feedback-mapper";

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
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");

  // 주간 피드백 리스트 조회
  const {
    data: weeklyFeedbackList = [],
    isLoading: isLoadingWeekly,
    error: weeklyError,
  } = useWeeklyFeedbackList();

  // 주간 피드백을 PeriodSummary로 변환
  const weeklySummaries = useMemo(() => {
    return weeklyFeedbackList.map(convertWeeklyFeedbackToPeriodSummary);
  }, [weeklyFeedbackList]);

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
          <Button
            onClick={() => {
              const now = new Date();
              const currentYear = now.getFullYear();
              const currentWeek = Math.ceil(
                ((now.getTime() - new Date(currentYear, 0, 1).getTime()) /
                  86400000 +
                  new Date(currentYear, 0, 1).getDay() +
                  1) /
                  7
              );

              // TODO: 샘플 생성 로직 구현
            }}
            className="rounded-full flex-shrink-0"
            style={{
              backgroundColor: activeTab === "weekly" ? "#A8BBA8" : "#6B7A6F",
              color: "white",
              padding: "0.5rem 1rem",
              fontSize: "0.85rem",
            }}
          >
            샘플 생성
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v: string) => setActiveTab(v as "weekly" | "monthly")}
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
              <p style={{ color: "#4E4B46", opacity: 0.7 }}>
                주간 피드백을 불러오는 중...
              </p>
            </div>
          ) : weeklyError ? (
            <div className="flex justify-center items-center py-12">
              <p style={{ color: "#DC2626" }}>
                주간 피드백을 불러오는 중 오류가 발생했습니다.
              </p>
            </div>
          ) : (
            <WeeklySummariesTab summaries={weeklySummaries} />
          )}
        </TabsContent>

        {/* Monthly Tab */}
        <TabsContent value="monthly">
          <MonthlySummariesTab summaries={[]} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
