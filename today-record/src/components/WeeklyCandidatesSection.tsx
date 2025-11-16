import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Calendar, Sparkles, Loader2, FileText } from "lucide-react";
import { useWeeklyCandidates } from "@/hooks/useWeeklyCandidates";
import { useCreateWeeklyFeedback } from "@/hooks/useWeeklyFeedback";
import { QUERY_KEYS } from "@/constants";

export function WeeklyCandidatesSection() {
  const { data: candidates = [], isLoading } = useWeeklyCandidates();
  const [generatingWeek, setGeneratingWeek] = useState<string | null>(null);
  const createWeeklyFeedback = useCreateWeeklyFeedback();
  const queryClient = useQueryClient();

  const candidatesWithoutFeedback = candidates.filter(
    (candidate) => candidate.weekly_feedback_id === null
  );

  const candidatesWithRecords = candidatesWithoutFeedback.filter(
    (candidate) => candidate.record_count > 0
  );

  const formatWeekStart = (weekStart: string) => {
    const date = new Date(weekStart);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
  };

  const getWeekRange = (weekStart: string) => {
    const startDate = new Date(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const startMonth = startDate.getMonth() + 1;
    const startDay = startDate.getDate();
    const endMonth = endDate.getMonth() + 1;
    const endDay = endDate.getDate();

    if (startMonth === endMonth) {
      return `${startMonth}월 ${startDay}일 - ${endDay}일`;
    } else {
      return `${startMonth}월 ${startDay}일 - ${endMonth}월 ${endDay}일`;
    }
  };

  const getWeekEnd = (weekStart: string): string => {
    const startDate = new Date(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return endDate.toISOString().split("T")[0];
  };

  const handleCreateFeedback = async (weekStart: string) => {
    setGeneratingWeek(weekStart);
    try {
      const weekEnd = getWeekEnd(weekStart);

      await createWeeklyFeedback.mutateAsync({
        start: weekStart,
        end: weekEnd,
        timezone: "Asia/Seoul",
      });

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.WEEKLY_CANDIDATES],
      });
    } catch (error) {
      console.error("주간 피드백 생성 실패:", error);
      alert("주간 피드백 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setGeneratingWeek(null);
    }
  };

  if (isLoading || candidatesWithRecords.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h2
        className="mb-4"
        style={{ color: "#333333", fontSize: "1.1rem", fontWeight: "600" }}
      >
        주간 피드백 생성 가능
      </h2>
      <div className="space-y-3">
        {candidatesWithRecords.map((candidate) => {
          const isGenerating = generatingWeek === candidate.week_start;
          return (
            <Card
              key={candidate.week_start}
              className="p-4"
              style={{
                backgroundColor: "white",
                border: "1px solid #EFE9E3",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="p-2 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: "#A8BBA8" }}
                  >
                    <Calendar className="w-4 h-4" style={{ color: "white" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="truncate"
                      style={{ color: "#333333", fontSize: "1rem" }}
                    >
                      {getWeekRange(candidate.week_start)}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <FileText
                        className="w-3 h-3"
                        style={{ color: "#4E4B46", opacity: 0.6 }}
                      />
                      <p
                        style={{
                          color: "#4E4B46",
                          opacity: 0.7,
                          fontSize: "0.8rem",
                        }}
                      >
                        {candidate.record_count}개의 기록
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleCreateFeedback(candidate.week_start)}
                  disabled={isGenerating}
                  className="rounded-full px-4 py-2 flex items-center gap-2 flex-shrink-0"
                  style={{
                    backgroundColor: "#A8BBA8",
                    color: "white",
                    fontSize: "0.85rem",
                    fontWeight: "500",
                  }}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      생성하기
                    </>
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
