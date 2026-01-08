import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { Sparkles, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import { useWeeklyCandidates } from "@/hooks/useWeeklyCandidates";
import { useCreateWeeklyFeedback } from "@/hooks/useWeeklyFeedback";
import { QUERY_KEYS } from "@/constants";
import { filterWeeklyCandidatesForCreation } from "../weeklyFeedback/weekly-candidate-filter";
import { getKSTDateString } from "@/lib/date-utils";
import { useAIRequestStore } from "@/store/useAIRequestStore";
import { useEnvironment } from "@/hooks/useEnvironment";
import { useModalStore } from "@/store/useModalStore";
import { getMondayOfWeek } from "../weeklyFeedback/weekly-candidate-filter";

export function WeeklyCandidatesSection() {
  const { data: candidates = [], isLoading } = useWeeklyCandidates();
  const [generatingWeek, setGeneratingWeek] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const createWeeklyFeedback = useCreateWeeklyFeedback();
  const { requests, openModal } = useAIRequestStore();
  const { isTest } = useEnvironment();
  const {
    weeklyFeedbackProgress,
    setWeeklyFeedbackProgress,
    clearWeeklyFeedbackProgress,
    weeklyCandidatesDropdown,
    toggleWeeklyCandidatesDropdown,
  } = useModalStore();

  // 진행 상태 추적 (테스트 환경에서만 - 요금 모달 자동 열기용)
  useEffect(() => {
    if (!isTest || requests.length === 0) return;

    const completedCount = requests.filter(
      (r) => r.endTime !== undefined || r.error !== undefined
    ).length;
    const totalCount = requests.length;

    if (completedCount === totalCount && totalCount > 0) {
      // 모든 요청 완료 시 요금 모달 자동으로 열기
      setTimeout(() => {
        openModal();
      }, 300);
    }
  }, [requests, isTest, openModal]);

  // 필터링 로직 적용: 기준 날짜(오늘, KST 기준)를 기준으로 생성 가능한 주간 vivid 필터링
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

      // 진행 상황 초기화 (전역 상태)
      setWeeklyFeedbackProgress(weekStart, {
        weekStart,
        current: 0,
        total: 2,
        currentStep: "생성 중",
      });

      // 일반 API 호출
      const feedbackData = await createWeeklyFeedback.mutateAsync({
        start: weekStart,
        end: weekEnd,
        timezone: "Asia/Seoul",
      });

      // 진행 상황 완료
      setWeeklyFeedbackProgress(weekStart, {
        weekStart,
        current: 2,
        total: 2,
        currentStep: "완료",
      });

      // WEEKLY_CANDIDATES에서 해당 주의 weekly_feedback_id 업데이트
      if (feedbackData.id) {
        const weekStartDate = new Date(feedbackData.week_range.start);
        const weekStartDateObj = getMondayOfWeek(weekStartDate);
        const weekStartStr = weekStartDateObj.toISOString().split("T")[0];

        queryClient.setQueryData<
          import("@/types/weekly-candidate").WeeklyCandidateWithFeedback[]
        >([QUERY_KEYS.WEEKLY_CANDIDATES], (oldCandidates = []) => {
          return oldCandidates.map((candidate) => {
            if (candidate.week_start === weekStartStr) {
              return {
                ...candidate,
                weekly_feedback_id: feedbackData.id
                  ? parseInt(feedbackData.id, 10)
                  : null,
                is_ai_generated: feedbackData.is_ai_generated ?? true,
              };
            }
            return candidate;
          });
        });
      }

      // 진행 상황 초기화
      clearWeeklyFeedbackProgress(weekStart);
    } catch (error) {
      console.error("주간 vivid 생성 실패:", error);

      // 진행 상황 초기화 (전역 상태)
      clearWeeklyFeedbackProgress(weekStart);

      alert("주간 vivid 생성에 실패했습니다. 다시 시도해주세요.");
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
        onClick={toggleWeeklyCandidatesDropdown}
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
                  아직 생성되지 않은 주간 vivid가 있어요
                </h3>
                <p
                  style={{
                    color: "#4E4B46",
                    opacity: 0.8,
                    fontSize: "0.85rem",
                    lineHeight: "1.5",
                  }}
                >
                  {candidatesForCreation.length}개의 주간 vivid를 생성할 수
                  있어요. 기록을 통해 나를 이해하고, 나답게 성장하는 시간을
                  가져보세요.
                </p>
              </div>
              <div
                className="flex-shrink-0 transition-transform duration-300"
                style={{
                  transform: weeklyCandidatesDropdown.isExpanded
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
              >
                <ChevronDown className="w-5 h-5" style={{ color: "#A8BBA8" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 생성 가능한 주간 vivid 리스트 (드롭다운 애니메이션) */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: weeklyCandidatesDropdown.isExpanded
            ? `${Math.min(candidatesForCreation.length * 80, 400)}px`
            : "0px",
          opacity: weeklyCandidatesDropdown.isExpanded ? 1 : 0,
          marginTop: weeklyCandidatesDropdown.isExpanded ? "12px" : "0px",
          transform: weeklyCandidatesDropdown.isExpanded
            ? "translateY(0)"
            : "translateY(-10px)",
        }}
      >
        <div className="space-y-2">
          {candidatesForCreation.map((candidate) => {
            const progress =
              weeklyFeedbackProgress[candidate.week_start] || null;
            // 진행 상황이 있거나 현재 생성 중이면 로딩 상태로 표시
            const isGenerating =
              generatingWeek === candidate.week_start || progress !== null;

            // 서버 응답값으로만 진행률 계산 (최대 99%)
            const actualPercentage = progress
              ? Math.round((progress.current / progress.total) * 100)
              : 0;
            const progressPercentage = Math.min(actualPercentage, 99);

            // 섹션 이름을 한글로 변환 (브랜딩 컨셉에 맞게 친절하게)
            const getSectionNameKR = (sectionName: string) => {
              const names: Record<string, string> = {
                SummaryReport: "전체 요약",
                DailyLifeReport: "일상 분석",
                EmotionReport: "감정 분석",
                VisionReport: "비전 분석",
                InsightReport: "인사이트",
                ExecutionReport: "실행 분석",
                ClosingReport: "최종 정리",
              };
              return names[sectionName] || sectionName;
            };

            return (
              <div
                key={candidate.week_start}
                className="flex items-center justify-between p-2 sm:p-3 rounded-lg transition-all hover:shadow-sm"
                style={{
                  backgroundColor: "white",
                  border: "1px solid #EFE9E3",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: "#A8BBA8" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="truncate text-sm sm:text-base"
                      style={{
                        color: "#333333",
                        fontSize: "0.85rem",
                        fontWeight: "500",
                      }}
                    >
                      {getWeekRange(candidate.week_start)}
                    </p>
                    <p
                      className="text-xs sm:text-sm"
                      style={{
                        color: "#4E4B46",
                        opacity: 0.6,
                        fontSize: "0.7rem",
                        marginTop: "2px",
                      }}
                    >
                      {candidate.record_count}개의 일일 피드백
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
                  {/* 진행 상황 표시 (버튼 옆에) */}
                  {progress && (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="flex flex-col items-end gap-0.5 sm:gap-1">
                        <p
                          className="text-xs sm:text-sm"
                          style={{
                            color: "#6B7A6F",
                            fontSize: "0.6rem",
                            fontWeight: "500",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span className="sm:hidden">
                            {getSectionNameKR(progress.currentStep)}
                          </span>
                          <span className="hidden sm:inline">
                            {getSectionNameKR(progress.currentStep)} 생성 중...
                          </span>
                        </p>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <div
                            className="h-1 sm:h-1.5 rounded-full overflow-hidden"
                            style={{
                              width: "60px",
                              backgroundColor: "#EFE9E3",
                            }}
                          >
                            <div
                              className="h-full transition-all duration-500 ease-out"
                              style={{
                                width: `${progressPercentage}%`,
                                backgroundColor: "#A8BBA8",
                              }}
                            />
                          </div>
                          <span
                            className="text-xs"
                            style={{
                              color: "#6B7A6F",
                              fontSize: "0.65rem",
                              fontWeight: "600",
                              minWidth: "28px",
                              textAlign: "right",
                            }}
                          >
                            {progressPercentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <Button
                    onClick={() => handleCreateFeedback(candidate.week_start)}
                    disabled={isGenerating}
                    className="rounded-full px-2 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1 sm:gap-1.5 flex-shrink-0 text-xs relative"
                    style={{
                      backgroundColor: isGenerating ? "#C4D4C4" : "#A8BBA8",
                      color: "white",
                      fontSize: "0.7rem",
                      fontWeight: "500",
                      transition: "all 0.2s",
                      minWidth: "70px",
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
                        <Loader2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-spin" />
                        <span className="text-[0.65rem] sm:text-[0.7rem]">
                          생성 중
                        </span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span className="text-[0.65rem] sm:text-[0.7rem]">
                          생성하기
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
