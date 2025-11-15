import { useState } from "react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Entry, PeriodSummary } from "@/types/Entry";
import { WeeklySummariesTab } from "./summaries/WeeklySummariesTab";
import { MonthlySummariesTab } from "./summaries/MonthlySummariesTab";

type SummariesViewProps = {
  entries: Entry[];
  summaries: PeriodSummary[];
  onGenerateSummary: (
    type: "weekly" | "monthly",
    weekNumber?: number,
    monthNumber?: number,
    year?: number
  ) => void;
  onSelectSummary: (summary: PeriodSummary) => void;
  onCreateWeeklyFeedback?: (weekStart: string) => Promise<void>;
};

export function SummariesView({
  entries: _entries, // eslint-disable-line @typescript-eslint/no-unused-vars
  summaries,
  onGenerateSummary,
  onSelectSummary: _onSelectSummary, // eslint-disable-line @typescript-eslint/no-unused-vars
  onCreateWeeklyFeedback: _onCreateWeeklyFeedback, // eslint-disable-line @typescript-eslint/no-unused-vars
}: SummariesViewProps) {
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");

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
              const currentMonth = now.getMonth() + 1;

              if (activeTab === "weekly") {
                onGenerateSummary(
                  "weekly",
                  currentWeek,
                  undefined,
                  currentYear
                );
              } else {
                onGenerateSummary(
                  "monthly",
                  undefined,
                  currentMonth,
                  currentYear
                );
              }
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
          <WeeklySummariesTab summaries={summaries} />
        </TabsContent>

        {/* Monthly Tab */}
        <TabsContent value="monthly">
          <MonthlySummariesTab summaries={summaries} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
