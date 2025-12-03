import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { Sparkles, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import { useWeeklyCandidates } from "@/hooks/useWeeklyCandidates";
import { useCreateWeeklyFeedback } from "@/hooks/useWeeklyFeedback";
import { QUERY_KEYS } from "@/constants";
import { filterWeeklyCandidatesForCreation } from "../weeklyFeedback/weekly-candidate-filter";
import { getKSTDateString } from "@/lib/date-utils";

export function WeeklyCandidatesSection() {
  const { data: candidates = [], isLoading } = useWeeklyCandidates();
  const [generatingWeek, setGeneratingWeek] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const createWeeklyFeedback = useCreateWeeklyFeedback();
  const queryClient = useQueryClient();

  // 필터링 로직 적용: 기준 날짜(오늘, KST 기준)를 기준으로 생성 가능한 주간 피드백 필터링
  const candidatesForCreation = useMemo(() => {
    return filterWeeklyCandidatesForCreation(candidates, new Date());
  }, [candidates]);

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
    const startDate = new Date(weekStart + "T00:00:00+09:00"); // KST 기준
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return getKSTDateString(endDate);
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

  if (isLoading || candidatesForCreation.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      {/* Notice 형태의 알림 박스 (클릭 가능) */}
      <div
        className="rounded-xl p-4 cursor-pointer transition-all hover:shadow-md"
        style={{
          backgroundColor: "#F0F7F0",
          border: "1px solid #A8BBA8",
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3">
          <div
            className="p-2 rounded-lg flex-shrink-0 mt-0.5"
            style={{ backgroundColor: "#A8BBA8" }}
          >
            <AlertCircle className="w-4 h-4" style={{ color: "white" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3
                  className="mb-1"
                  style={{
                    color: "#333333",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                  }}
                >
                  아직 생성되지 않은 주간 피드백이 있어요
                </h3>
                <p
                  style={{
                    color: "#4E4B46",
                    opacity: 0.8,
                    fontSize: "0.85rem",
                    lineHeight: "1.5",
                  }}
                >
                  {candidatesForCreation.length}개의 주간 피드백을 생성할 수
                  있습니다. AI가 분석한 인사이트를 확인해보세요.
                </p>
              </div>
              <div
                className="flex-shrink-0 transition-transform duration-300"
                style={{
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <ChevronDown className="w-5 h-5" style={{ color: "#A8BBA8" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 생성 가능한 주간 피드백 리스트 (드롭다운 애니메이션) */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isExpanded
            ? `${Math.min(candidatesForCreation.length * 80, 400)}px`
            : "0px",
          opacity: isExpanded ? 1 : 0,
          marginTop: isExpanded ? "12px" : "0px",
          transform: isExpanded ? "translateY(0)" : "translateY(-10px)",
        }}
      >
        <div className="space-y-2">
          {candidatesForCreation.map((candidate) => {
            const isGenerating = generatingWeek === candidate.week_start;
            return (
              <div
                key={candidate.week_start}
                className="flex items-center justify-between p-3 rounded-lg transition-all hover:shadow-sm"
                style={{
                  backgroundColor: "white",
                  border: "1px solid #EFE9E3",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: "#A8BBA8" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="truncate"
                      style={{
                        color: "#333333",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                      }}
                    >
                      {getWeekRange(candidate.week_start)}
                    </p>
                    <p
                      style={{
                        color: "#4E4B46",
                        opacity: 0.6,
                        fontSize: "0.75rem",
                        marginTop: "2px",
                      }}
                    >
                      {candidate.record_count}개의 기록
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleCreateFeedback(candidate.week_start)}
                  disabled={isGenerating}
                  className="rounded-full px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0 text-xs"
                  style={{
                    backgroundColor: isGenerating ? "#C4D4C4" : "#A8BBA8",
                    color: "white",
                    fontSize: "0.75rem",
                    fontWeight: "500",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isGenerating) {
                      e.currentTarget.style.backgroundColor = "#95A995";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isGenerating) {
                      e.currentTarget.style.backgroundColor = "#A8BBA8";
                    }
                  }}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      생성 중
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      생성하기
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
