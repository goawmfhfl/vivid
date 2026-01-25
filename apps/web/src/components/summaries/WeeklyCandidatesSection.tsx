import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { Sparkles, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import { useWeeklyCandidates } from "@/hooks/useWeeklyCandidates";
import { useCreateWeeklyVivid } from "@/hooks/useWeeklyVivid";
import { QUERY_KEYS } from "@/constants";
import { filterWeeklyCandidatesForCreation } from "../weeklyVivid/weekly-vivid-candidate-filter";
import { getKSTDateString } from "@/lib/date-utils";
import { useAIRequestStore } from "@/store/useAIRequestStore";
import { useEnvironment } from "@/hooks/useEnvironment";
import { useModalStore } from "@/store/useModalStore";
import { getMondayOfWeek } from "../weeklyVivid/weekly-vivid-candidate-filter";
import { COLORS, GRADIENT_UTILS } from "@/lib/design-system";
import { useCountUp } from "@/hooks/useCountUp";

// 주간 후보 아이템 컴포넌트
function WeeklyCandidateItem({
  candidate,
  generatingWeek,
  progress,
  timerProgress,
  handleCreateFeedback,
  getWeekRange,
}: {
  candidate: { week_start: string; record_count: number };
  generatingWeek: string | null;
  progress: { current: number; total: number; currentStep: string } | null;
  timerProgress: number | null;
  handleCreateFeedback: (weekStart: string) => void;
  getWeekRange: (weekStart: string) => string;
}) {
  const isGenerating = generatingWeek === candidate.week_start;

  // 현재 아이템이 생성 중인 주차와 일치할 때만 progress 값 사용
  const currentTimerProgress = isGenerating ? (timerProgress ?? 0) : 0;

  const serverPercentage = progress
    ? Math.round((progress.current / progress.total) * 100)
    : 0;
  
  const isComplete = progress && progress.current >= progress.total;
  const progressPercentage = isComplete
    ? 100
    : Math.min(Math.max(currentTimerProgress, serverPercentage), 99);
  
  // useCountUp 제거하고 progressPercentage 직접 사용
  const animatedProgress = progressPercentage;

  return (
    <div
      className="flex items-center justify-between p-3 sm:p-4 rounded-xl transition-all duration-300 relative overflow-hidden group"
      style={{
        backgroundColor: COLORS.background.base,
        border: `1.5px solid ${COLORS.border.light}`,
        borderRadius: "12px",
        boxShadow: `
          0 2px 8px rgba(0,0,0,0.04),
          0 1px 3px rgba(0,0,0,0.02),
          inset 0 1px 0 rgba(255,255,255,0.6)
        `,
        backgroundImage: `
          repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 27px,
            rgba(127, 143, 122, 0.06) 27px,
            rgba(127, 143, 122, 0.06) 28px
          ),
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(127, 143, 122, 0.01) 2px,
            rgba(127, 143, 122, 0.01) 4px
          )
        `,
        backgroundSize: "100% 28px, 8px 8px",
        backgroundPosition: "0 2px, 0 0",
        filter: "contrast(1.02) brightness(1.01)",
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = `${COLORS.brand.primary}60`;
        e.currentTarget.style.boxShadow = `
          0 4px 16px rgba(127, 143, 122, 0.12),
          0 2px 6px rgba(0,0,0,0.04),
          inset 0 1px 0 rgba(255,255,255,0.6)
        `;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = COLORS.border.light;
        e.currentTarget.style.boxShadow = `
          0 2px 8px rgba(0,0,0,0.04),
          0 1px 3px rgba(0,0,0,0.02),
          inset 0 1px 0 rgba(255,255,255,0.6)
        `;
      }}
    >
      {/* 종이 질감 오버레이 */}
      <div
        className="absolute inset-0 pointer-events-none rounded-xl"
        style={{
          background: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 40%),
            radial-gradient(circle at 75% 75%, ${COLORS.brand.light}15 0%, transparent 40%)
          `,
          mixBlendMode: "overlay",
          opacity: 0.5,
        }}
      />

      {/* 왼쪽 브랜드 컬러 액센트 라인 */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-all duration-300"
        style={{
          backgroundColor: COLORS.brand.primary,
          opacity: 0.6,
        }}
      />

      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 relative z-10 pl-4">
        <div
          className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0 transition-all duration-300"
          style={{
            backgroundColor: COLORS.brand.primary,
            boxShadow: `0 0 8px ${COLORS.brand.primary}40`,
          }}
        />
        <div className="flex-1 min-w-0">
          <p
            className="truncate text-sm sm:text-base mb-0.5"
            style={{
              color: COLORS.text.primary,
              fontSize: "0.9rem",
              fontWeight: "600",
              lineHeight: "1.4",
            }}
          >
            {getWeekRange(candidate.week_start)}
          </p>
          <p
            className="text-xs sm:text-sm"
            style={{
              color: COLORS.text.tertiary,
              fontSize: "0.75rem",
              lineHeight: "1.4",
            }}
          >
            {candidate.record_count}개의 VIVID 기록
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
        {/* 진행 상황 표시 (버튼 옆에) */}
        {(progress || (isGenerating && timerProgress !== null)) && (
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex flex-col items-end gap-0.5 sm:gap-1">
              <p
                className="text-xs sm:text-sm"
                style={{
                  color: COLORS.text.secondary,
                  fontSize: "0.6rem",
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                }}
              >
                <span className="sm:hidden">
                  {progress?.currentStep || "생성 중"}
                </span>
                <span className="hidden sm:inline">
                  {progress?.currentStep || "생성 중"}
                </span>
              </p>
              <div className="flex items-center gap-1 sm:gap-2">
                <div
                  className="h-1 sm:h-1.5 rounded-full overflow-hidden"
                  style={{
                    width: "60px",
                    backgroundColor: COLORS.border.light,
                  }}
                >
                  <div
                    className="h-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${animatedProgress}%`,
                      backgroundColor: COLORS.brand.primary,
                    }}
                  />
                </div>
                <span
                  className="text-xs"
                  style={{
                    color: COLORS.text.secondary,
                    fontSize: "0.65rem",
                    fontWeight: "600",
                    minWidth: "28px",
                    textAlign: "right",
                  }}
                >
                  {Math.round(animatedProgress)}%
                </span>
              </div>
            </div>
          </div>
        )}
        <Button
          onClick={() => handleCreateFeedback(candidate.week_start)}
          disabled={isGenerating}
          className="rounded-full px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-1.5 sm:gap-2 flex-shrink-0 text-xs sm:text-sm relative"
          style={{
            backgroundColor: isGenerating ? "#9CA89C" : COLORS.brand.primary,
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
              e.currentTarget.style.backgroundColor = COLORS.brand.primary;
            }
          }}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
              <span className="hidden sm:inline">생성 중</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">생성하기</span>
              <span className="sm:hidden">생성</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export function WeeklyCandidatesSection() {
  const router = useRouter();
  const { data: candidates = [], isLoading } = useWeeklyCandidates();
  const [generatingWeek, setGeneratingWeek] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const createWeeklyVivid = useCreateWeeklyVivid();
  const { requests, openModal } = useAIRequestStore();
  const { isTest } = useEnvironment();
  const {
    weeklyVividProgress,
    setWeeklyVividProgress,
    clearWeeklyVividProgress,
    weeklyCandidatesDropdown,
    toggleWeeklyCandidatesDropdown,
    openErrorModal,
    openSuccessModal,
  } = useModalStore();

  // 타이머 기반 progress 상태 (주별로 관리 -> 현재 생성중인 주차에 대해서만 단일 값 관리)
  const [timerProgress, setTimerProgress] = useState<number | null>(null);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);

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

  // 타이머 로직 (Home.tsx 참고하여 useEffect로 관리)
  useEffect(() => {
    if (!generatingWeek || timerStartTime === null) return;

    const DURATION_MS = 80000; // 80초
    const TARGET_PERCENTAGE = 99; // 최대 99%
    const UPDATE_INTERVAL = 100; // 100ms마다 업데이트

    // 초기값 설정
    setTimerProgress(0);

    const interval = setInterval(() => {
      const elapsed = Date.now() - timerStartTime;
      
      if (elapsed >= DURATION_MS) {
        setTimerProgress(TARGET_PERCENTAGE);
        clearInterval(interval);
        return;
      }
      
      // 15초 이내일 때만 진행률 계산
      const calculatedProgress = (elapsed / DURATION_MS) * TARGET_PERCENTAGE;
      setTimerProgress(calculatedProgress);
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [generatingWeek, timerStartTime]);

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
    // 이미 생성 중이면 무시
    if (generatingWeek) return;

    const isDev = process.env.NEXT_PUBLIC_NODE_ENV === "development";

    setGeneratingWeek(weekStart);
    setTimerStartTime(Date.now());
    setTimerProgress(0);

    // 진행 상황 초기화 (전역 상태)
    setWeeklyVividProgress(weekStart, {
      weekStart,
      current: 0,
      total: 2,
      currentStep: "생성 중",
    });

    try {
      if (isDev) {
        // 개발 환경 테스트용 Mock
        console.log("Development mode: Mocking API call");
        await new Promise((resolve) => setTimeout(resolve, 15000));
        
        // Mock 성공 데이터
        const weekEnd = getWeekEnd(weekStart);
        const mockFeedbackData = {
          id: "999",
          week_range: { start: weekStart, end: weekEnd },
          is_ai_generated: true,
        };

        // 성공 처리 로직 재사용
        setTimerStartTime(null);
        setTimerProgress(100);
        setWeeklyVividProgress(weekStart, {
          weekStart,
          current: 2,
          total: 2,
          currentStep: "완료",
        });
        
        openSuccessModal(
          `[TEST] ${weekStart} ~ ${weekEnd} 주간 VIVID 생성 완료 (Mock)`,
          () => console.log("Mock success modal closed")
        );
        
        clearWeeklyVividProgress(weekStart);
        return;
      }

      const weekEnd = getWeekEnd(weekStart);
      const apiStartTime = Date.now();

      // 일반 API 호출
      const feedbackData = await createWeeklyVivid.mutateAsync({
        start: weekStart,
        end: weekEnd,
        timezone: "Asia/Seoul",
      });

      const apiEndTime = Date.now();
      const durationSeconds = (apiEndTime - apiStartTime) / 1000;

      // 생성 시간을 포함하여 다시 요청 (업데이트)
      if (feedbackData?.id) {
        try {
          await createWeeklyVivid.mutateAsync({
            start: weekStart,
            end: weekEnd,
            timezone: "Asia/Seoul",
            generation_duration_seconds: durationSeconds,
          });
        } catch (error) {
          // 업데이트 실패해도 무시 (이미 생성은 완료됨)
          console.warn("생성 시간 업데이트 실패:", error);
        }
      }

      // 타이머 정리 및 완료 표시
      setTimerStartTime(null);
      setTimerProgress(100);

      // 진행 상황 완료 (100%로 설정)
      setWeeklyVividProgress(weekStart, {
        weekStart,
        current: 2,
        total: 2,
        currentStep: "완료",
      });

        // WEEKLY_CANDIDATES에서 해당 주의 weekly_vivid_id 업데이트
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
                  weekly_vivid_id: feedbackData.id
                    ? parseInt(feedbackData.id, 10)
                    : null,
                  is_ai_generated: feedbackData.is_ai_generated ?? true,
                };
              }
              return candidate;
            });
          });

          // 주간 피드백 리스트 무효화하여 최신 데이터 가져오기
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.WEEKLY_VIVID, "list"],
          });

          // 성공 시 전역 모달로 알림 및 라우팅
          const weekRange = `${feedbackData.week_range.start} ~ ${feedbackData.week_range.end}`;
          openSuccessModal(
            `${weekRange} 주간 VIVID가 생성되었습니다!\n확인 버튼을 누르면 VIVID를 확인할 수 있습니다.`,
            () => {
              router.push(`/analysis/feedback/weekly/${feedbackData.id}`);
            }
          );
        }

      // 진행 상황 초기화
      clearWeeklyVividProgress(weekStart);
    } catch (error) {
      console.error("주간 vivid 생성 실패:", error);

      // 타이머 정리
      setTimerStartTime(null);
      setTimerProgress(null);

      // 진행 상황 초기화 (전역 상태)
      clearWeeklyVividProgress(weekStart);

      // 에러 메시지 추출
      const errorMessage =
        error instanceof Error
          ? error.message
          : "주간 VIVID 생성에 실패했습니다.";

      // 전역 에러 모달 표시 (재시도 없음)
      openErrorModal(errorMessage);
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
        className="rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg"
        style={{
          backgroundColor: COLORS.background.card,
          border: `1.5px solid ${COLORS.brand.primary}40`,
          boxShadow: `0 2px 8px ${COLORS.brand.primary}15`,
        }}
        onClick={toggleWeeklyCandidatesDropdown}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `${COLORS.brand.primary}60`;
          e.currentTarget.style.boxShadow = `0 4px 12px ${COLORS.brand.primary}20`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = `${COLORS.brand.primary}40`;
          e.currentTarget.style.boxShadow = `0 2px 8px ${COLORS.brand.primary}15`;
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="p-2 rounded-lg flex-shrink-0 mt-0.5 transition-all duration-300"
            style={{
              background: GRADIENT_UTILS.iconBadge(COLORS.brand.primary),
              boxShadow: `0 2px 8px ${COLORS.brand.primary}30`,
            }}
          >
            <AlertCircle className="w-4 h-4" style={{ color: "white" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3
                  className="mb-1"
                  style={{
                    color: COLORS.text.primary,
                    fontSize: "0.95rem",
                    fontWeight: "600",
                  }}
                >
                  아직 생성되지 않은 주간 vivid가 있어요
                </h3>
                <p
                  style={{
                    color: COLORS.text.secondary,
                    fontSize: "0.85rem",
                    lineHeight: "1.5",
                  }}
                >
                  기록으로 만든 이번 주의 비비드를 확인해보세요.
                </p>
              </div>
              <div
                className="flex-shrink-0 transition-transform duration-300"
                style={{
                  transform: weeklyCandidatesDropdown.isExpanded
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  color: COLORS.brand.primary,
                }}
              >
                <ChevronDown className="w-5 h-5" style={{ color: COLORS.brand.primary }} />
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
          {candidatesForCreation.map((candidate) => (
            <WeeklyCandidateItem
              key={candidate.week_start}
              candidate={candidate}
              generatingWeek={generatingWeek}
              progress={weeklyVividProgress[candidate.week_start] || null}
              timerProgress={timerProgress}
              handleCreateFeedback={handleCreateFeedback}
              getWeekRange={getWeekRange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
