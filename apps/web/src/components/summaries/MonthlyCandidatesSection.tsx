import { useState, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { Sparkles, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import { useMonthlyCandidates } from "@/hooks/useMonthlyCandidates";
import { QUERY_KEYS } from "@/constants";
import { filterMonthlyCandidatesForCreation } from "../monthlyFeedback/monthly-candidate-filter";
import { getCurrentUserId } from "@/hooks/useCurrentUser";
import { useModalStore } from "@/store/useModalStore";

export function MonthlyCandidatesSection({
  referenceDate,
}: {
  referenceDate?: Date;
} = {}) {
  const { data: candidates = [], isLoading } = useMonthlyCandidates();
  const [generatingMonth, setGeneratingMonth] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const {
    monthlyFeedbackProgress,
    setMonthlyFeedbackProgress,
    clearMonthlyFeedbackProgress,
    monthlyCandidatesDropdown,
    toggleMonthlyCandidatesDropdown,
  } = useModalStore();

  // 필터링 로직 적용: 기준 날짜(오늘, KST 기준)를 기준으로 생성 가능한 월간 피드백 필터링
  const candidatesForCreation = useMemo(() => {
    return filterMonthlyCandidatesForCreation(
      candidates,
      referenceDate || new Date()
    );
  }, [candidates, referenceDate]);

  const handleCreateFeedback = async (month: string) => {
    setGeneratingMonth(month);
    let currentEsRef: { current: EventSource | null } = { current: null };

    try {
      const userId = await getCurrentUserId();

      const sectionNames = [
        "SummaryReport",
        "DailyLifeReport",
        "EmotionReport",
        "VisionReport",
        "InsightReport",
        "ExecutionReport",
        "ClosingReport",
      ];

      // 진행 상황 초기화 (전역 상태)
      setMonthlyFeedbackProgress(month, {
        month,
        current: 0,
        total: sectionNames.length,
        currentStep: sectionNames[0],
      });

      // SSE를 사용하여 진행 상황 수신
      await new Promise<void>((resolve, reject) => {
        const params = new URLSearchParams({
          userId,
          month,
        });

        const es = new EventSource(
          `/api/monthly-feedback/generate-extream?${params.toString()}`
        );
        currentEsRef.current = es;

        // Promise 완료/실패 시 EventSource 정리
        const cleanup = () => {
          try {
            if (es && es.readyState !== EventSource.CLOSED) {
              es.close();
            }
          } catch (e) {
            // 무시
          }
          currentEsRef.current = null;
        };

        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === "progress") {
              // 진행 상황 업데이트 (서버에서 실제 섹션 생성 시점에 전송됨) - 전역 상태
              // 완료 전이므로 99%를 넘지 않도록 제한
              setMonthlyFeedbackProgress(month, {
                month,
                current: data.current,
                total: data.total,
                currentStep: data.sectionName,
              });
            } else if (data.type === "complete") {
              // 완료 처리 - 99%에서 멈추도록 설정
              setMonthlyFeedbackProgress(month, {
                month,
                current: data.total, // 전체 섹션 수
                total: data.total,
                currentStep: "완료",
              });

              cleanup();

              queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.MONTHLY_CANDIDATES],
              });

              resolve();
            } else if (data.type === "error") {
              // 에러 처리
              cleanup();
              reject(new Error(data.error));
            }
          } catch (error) {
            console.error("SSE 메시지 파싱 오류:", error);
          }
        };

        es.onerror = (error) => {
          cleanup();
          reject(error);
        };
      });
    } catch (error) {
      console.error("월간 피드백 생성 실패:", error);

      // EventSource 정리
      const esToClose = currentEsRef.current;
      try {
        if (esToClose && esToClose.readyState !== EventSource.CLOSED) {
          esToClose.close();
        }
      } catch (e) {
        // 무시
      }
      currentEsRef.current = null;

      // 진행 상황 초기화 (전역 상태)
      clearMonthlyFeedbackProgress(month);

      alert("월간 피드백 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setGeneratingMonth(null);
      // 진행 상황은 완료/에러 핸들러에서 이미 처리됨
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
          backgroundColor: "#F0F2F0",
          border: "1px solid #6B7A6F",
        }}
        onClick={toggleMonthlyCandidatesDropdown}
      >
        <div className="flex items-start gap-3">
          <div
            className="p-2 rounded-lg flex-shrink-0 mt-0.5"
            style={{ backgroundColor: "#6B7A6F" }}
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
                  아직 생성되지 않은 월간 피드백이 있어요
                </h3>
                <p
                  style={{
                    color: "#4E4B46",
                    opacity: 0.8,
                    fontSize: "0.85rem",
                    lineHeight: "1.5",
                  }}
                >
                  {candidatesForCreation.length}개의 월간 피드백을 생성할 수
                  있어요. 기록을 통해 나를 이해하고, 나답게 성장하는 시간을
                  가져보세요.
                </p>
              </div>
              <div
                className="flex-shrink-0 transition-transform duration-300"
                style={{
                  transform: monthlyCandidatesDropdown.isExpanded
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
              >
                <ChevronDown className="w-5 h-5" style={{ color: "#6B7A6F" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 생성 가능한 월간 피드백 리스트 (드롭다운 애니메이션) */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: monthlyCandidatesDropdown.isExpanded
            ? `${Math.min(candidatesForCreation.length * 80, 400)}px`
            : "0px",
          opacity: monthlyCandidatesDropdown.isExpanded ? 1 : 0,
          marginTop: monthlyCandidatesDropdown.isExpanded ? "12px" : "0px",
          transform: monthlyCandidatesDropdown.isExpanded
            ? "translateY(0)"
            : "translateY(-10px)",
        }}
      >
        <div className="space-y-2">
          {candidatesForCreation.map((candidate) => {
            const progress = monthlyFeedbackProgress[candidate.month] || null;
            // 진행 상황이 있거나 현재 생성 중이면 로딩 상태로 표시
            const isGenerating =
              generatingMonth === candidate.month || progress !== null;

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
                key={candidate.month}
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
                    style={{ backgroundColor: "#6B7A6F" }}
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
                      {candidate.month_label}
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
                      {candidate.weekly_feedback_count || 0}개의 주간 피드백
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
                                backgroundColor: "#6B7A6F",
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
                    onClick={() => handleCreateFeedback(candidate.month)}
                    disabled={isGenerating}
                    className="rounded-full px-2 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1 sm:gap-1.5 flex-shrink-0 text-xs relative"
                    style={{
                      backgroundColor: isGenerating ? "#9CA89C" : "#6B7A6F",
                      color: "white",
                      fontSize: "0.7rem",
                      fontWeight: "500",
                      transition: "all 0.2s",
                      minWidth: "70px",
                    }}
                    onMouseEnter={(e) => {
                      if (!isGenerating) {
                        e.currentTarget.style.backgroundColor = "#5A675A";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isGenerating) {
                        e.currentTarget.style.backgroundColor = "#6B7A6F";
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
