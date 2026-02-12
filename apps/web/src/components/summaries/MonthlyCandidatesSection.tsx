import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { Sparkles, Loader2, CheckCircle } from "lucide-react";
import { useMonthlyCandidates, fetchMonthlyCandidates } from "@/hooks/useMonthlyCandidates";
import { QUERY_KEYS } from "@/constants";
import { filterMonthlyCandidatesForCreation } from "../monthlyVivid/monthly-vivid-candidate-filter";
import { getCurrentUserId } from "@/hooks/useCurrentUser";
import { useModalStore } from "@/store/useModalStore";
import type { MonthlyVivid } from "@/types/monthly-vivid";
import { COLORS } from "@/lib/design-system";
import { CandidatesNoticeBox } from "./CandidatesNoticeBox";
import { fetchMonthlyVividList } from "@/hooks/useMonthlyVivid";
import { fetchMonthlyTrends } from "@/hooks/useMonthlyTrends";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

// 월간 후보 아이템 컴포넌트
function MonthlyCandidateItem({
  candidate,
  generatingMonth,
  timerProgress,
  handleCreateFeedback,
  progress,
}: {
  candidate: { month: string; month_label: string; daily_vivid_count: number };
  generatingMonth: string | null;
  timerProgress?: number;
  handleCreateFeedback: (month: string) => void;
  progress?: { current: number; total: number; currentStep: string } | null;
}) {
  const isGenerating =
    generatingMonth === candidate.month || timerProgress !== undefined;
  const isComplete = (timerProgress ?? 0) >= 100;
  const progressPercentage = isComplete
    ? 100
    : Math.min(timerProgress ?? 0, 99);

  return (
    <div
      className="relative flex items-center justify-between p-3 sm:p-4 rounded-xl transition-all duration-200"
      style={{
        backgroundColor: COLORS.background.card,
        border: `1px solid ${COLORS.border.light}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${COLORS.monthly.primary}50`;
          e.currentTarget.style.boxShadow = `
          0 2px 8px rgba(168, 155, 196, 0.15),
          0 1px 3px rgba(0,0,0,0.04)
        `;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = COLORS.border.light;
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
      }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: COLORS.monthly.primary }}
      />
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pl-4">
        <div
          className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0 transition-all duration-300"
          style={{
            backgroundColor: COLORS.monthly.primary,
            boxShadow: `0 0 8px ${COLORS.monthly.primary}40`,
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
            {candidate.month_label}
          </p>
          <p
            className="text-xs sm:text-sm"
            style={{
              color: COLORS.text.tertiary,
              fontSize: "0.75rem",
              lineHeight: "1.4",
            }}
          >
            {candidate.daily_vivid_count || 0}개의 일일 비비드
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
        {/* 진행 상황 표시 (버튼 옆에) */}
        {timerProgress !== undefined && (
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
                  {isComplete ? "완료" : progress?.currentStep || "생성 중"}
                </span>
                <span className="hidden sm:inline">
                  {isComplete ? "완료" : progress?.currentStep || "생성 중..."}
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
                      width: `${progressPercentage}%`,
                      backgroundColor: COLORS.monthly.primary,
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
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
          </div>
        )}
        <Button
          onClick={() => handleCreateFeedback(candidate.month)}
          disabled={isGenerating}
          className="rounded-full px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-1.5 sm:gap-2 flex-shrink-0 text-xs sm:text-sm relative"
          style={{
            backgroundColor: isGenerating ? "#b5a9c6" : COLORS.monthly.primary,
            color: "white",
            fontSize: "0.7rem",
            fontWeight: "500",
            transition: "all 0.2s",
            minWidth: "70px",
          }}
          onMouseEnter={(e) => {
            if (!isGenerating) {
              e.currentTarget.style.backgroundColor = COLORS.monthly.dark;
            }
          }}
          onMouseLeave={(e) => {
            if (!isGenerating) {
              e.currentTarget.style.backgroundColor = COLORS.monthly.primary;
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

export function MonthlyCandidatesSection({
  referenceDate,
}: {
  referenceDate?: Date;
} = {}) {
  const router = useRouter();
  const { data: candidates = [], isLoading } = useMonthlyCandidates();
  const [generatingMonth, setGeneratingMonth] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { 
    monthlyCandidatesDropdown, 
    toggleMonthlyCandidatesDropdown,
    monthlyVividProgress,
    setMonthlyVividProgress,
  } = useModalStore();

  const [timerProgress, setTimerProgress] = useState<Record<string, number>>(
    {}
  );
  const timerIntervalsRef = useRef<Record<string, NodeJS.Timeout>>({});
  const completionTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
  
  // 생성 완료 모달 상태
  const [completionModal, setCompletionModal] = useState<{
    isOpen: boolean;
    monthLabel: string;
    reportId: string | null;
  }>({ isOpen: false, monthLabel: "", reportId: null });

  // 필터링 로직 적용: 기준 날짜(오늘, KST 기준)를 기준으로 생성 가능한 월간 vivid 필터링
  const candidatesForCreation = useMemo(() => {
    return filterMonthlyCandidatesForCreation(
      candidates,
      referenceDate || new Date()
    );
  }, [candidates, referenceDate]);

  const clearTimer = (month: string) => {
    if (timerIntervalsRef.current[month]) {
      clearInterval(timerIntervalsRef.current[month]);
      delete timerIntervalsRef.current[month];
    }
    if (completionTimeoutsRef.current[month]) {
      clearTimeout(completionTimeoutsRef.current[month]);
      delete completionTimeoutsRef.current[month];
    }
    setTimerProgress((prev) => {
      const next = { ...prev };
      delete next[month];
      return next;
    });
  };

  useEffect(() => {
    const intervals = timerIntervalsRef.current;
    const timeouts = completionTimeoutsRef.current;
    return () => {
      Object.values(intervals).forEach((interval) => clearInterval(interval));
      Object.values(timeouts).forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  const handleCreateFeedback = async (month: string) => {
    try {
      const userId = await getCurrentUserId();

      setGeneratingMonth(month);
      clearTimer(month);

      // 타이머 시작 (90초 동안 0% → 99%)
      const DURATION_MS = 150000;
      const TARGET_PERCENTAGE = 99;
      const UPDATE_INTERVAL = 100;
      const startTime = Date.now();

      setTimerProgress((prev) => ({ ...prev, [month]: 0 }));

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= DURATION_MS) {
          setTimerProgress((prev) => ({
            ...prev,
            [month]: TARGET_PERCENTAGE,
          }));
          clearInterval(interval);
          delete timerIntervalsRef.current[month];
          return;
        }
        const progress = (elapsed / DURATION_MS) * TARGET_PERCENTAGE;
        setTimerProgress((prev) => ({ ...prev, [month]: progress }));
      }, UPDATE_INTERVAL);

      timerIntervalsRef.current[month] = interval;

      // 진행 상황 초기화 (전역 상태)
      setMonthlyVividProgress(month, {
        month,
        current: 0,
        total: 3, // report, title, trend
        currentStep: "생성 중",
      });

      // POST 요청으로 월간 비비드 생성 (시간 측정 시작)
      const apiStartTime = Date.now();
      
      // 진행 상황 업데이트: report 생성 시작
      setMonthlyVividProgress(month, {
        month,
        current: 1,
        total: 3,
        currentStep: "리포트 생성 중...",
      });

      const response = await fetch("/api/monthly-vivid/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          month,
        }),
      });

      const apiEndTime = Date.now();
      const durationSeconds = (apiEndTime - apiStartTime) / 1000;

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "월간 VIVID 생성에 실패했습니다.");
      }

      const result = await response.json();
      const feedbackData = result.data as MonthlyVivid & { id: string };

      // 진행 상황 업데이트: 완료
      setMonthlyVividProgress(month, {
        month,
        current: 3,
        total: 3,
        currentStep: "완료",
      });

      // 생성 시간을 포함하여 다시 요청 (업데이트)
      if (feedbackData?.id) {
        try {
          await fetch("/api/monthly-vivid/generate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId,
              month,
              generation_duration_seconds: durationSeconds,
            }),
          });
        } catch (error) {
          // 업데이트 실패해도 무시 (이미 생성은 완료됨)
          console.warn("생성 시간 업데이트 실패:", error);
        }
      }

      // 완료 처리
      clearTimer(month);
      setTimerProgress((prev) => ({ ...prev, [month]: 100 }));
      
      // 진행 상황 정리
      setTimeout(() => {
        setMonthlyVividProgress(month, null);
      }, 1000);
      
      completionTimeoutsRef.current[month] = setTimeout(() => {
        clearTimer(month);
      }, 600);

      // 생성 완료 모달 표시
      const candidate = candidates.find((c) => c.month === month);
      setCompletionModal({
        isOpen: true,
        monthLabel: candidate?.month_label || month,
        reportId: feedbackData?.id || null,
      });

      // MONTHLY_CANDIDATES에서 해당 월의 monthly_vivid_id 업데이트
      queryClient.setQueryData<
        import("@/types/monthly-candidate").MonthlyCandidate[]
      >([QUERY_KEYS.MONTHLY_CANDIDATES], (oldCandidates = []) => {
        return oldCandidates.map((candidate) => {
          if (candidate.month === feedbackData.month) {
            return {
              ...candidate,
              monthly_vivid_id: feedbackData.id || null,
            };
          }
          return candidate;
        });
      });

      // 쿼리 무효화로 최신 데이터 가져오기
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MONTHLY_CANDIDATES],
      });

      // 월간 비비드 리스트 무효화하여 최신 데이터 가져오기
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MONTHLY_VIVID, "list"],
      });

      await Promise.allSettled([
        queryClient.fetchQuery({
          queryKey: [QUERY_KEYS.MONTHLY_CANDIDATES],
          queryFn: () => fetchMonthlyCandidates({ force: true }),
        }),
        queryClient.fetchQuery({
          queryKey: [QUERY_KEYS.MONTHLY_VIVID, "list"],
          queryFn: () => fetchMonthlyVividList({ force: true }),
        }),
        queryClient.fetchQuery({
          queryKey: [QUERY_KEYS.MONTHLY_VIVID, "recent-trends"],
          queryFn: () => fetchMonthlyTrends({ force: true }),
        }),
      ]);
    } catch (error) {
      console.error("월간 vivid 생성 실패:", error);

      clearTimer(month);
      
      // 진행 상황 정리
      setMonthlyVividProgress(month, null);

      alert(
        error instanceof Error
          ? error.message
          : "월간 vivid 생성에 실패했습니다. 다시 시도해주세요."
      );
    } finally {
      setGeneratingMonth(null);
    }
  };

  // 확인 버튼 클릭 시 월간 리포트 페이지로 이동
  const handleCompletionConfirm = () => {
    const { reportId } = completionModal;
    setCompletionModal({ isOpen: false, monthLabel: "", reportId: null });
    
    if (reportId) {
      router.push(`/analysis/feedback/monthly/${reportId}`);
    }
  };

  const renderCompletionModal = () => (
    <AlertDialog open={completionModal.isOpen} onOpenChange={(open) => !open && handleCompletionConfirm()}>
      <AlertDialogContent className="max-w-md" style={{ backgroundColor: COLORS.background.card }}>
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${COLORS.monthly.primary}18` }}
            >
              <CheckCircle className="w-8 h-8" style={{ color: COLORS.monthly.primary }} />
            </div>
          </div>
          <AlertDialogTitle className="text-center" style={{ color: COLORS.text.primary }}>
            생성이 완료되었습니다
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center" style={{ color: COLORS.text.secondary }}>
            {completionModal.monthLabel} 월간 VIVID가 성공적으로 생성되었습니다.
            <br />
            확인 버튼을 누르면 생성된 리포트로 이동합니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction
            onClick={handleCompletionConfirm}
            style={{ backgroundColor: COLORS.monthly.primary, color: "white" }}
          >
            확인
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (isLoading) {
    return <>{renderCompletionModal()}</>;
  }

  if (candidatesForCreation.length === 0) {
    return <>{renderCompletionModal()}</>;
  }

  return (
    <div className="mb-8">
      <CandidatesNoticeBox
        title="아직 생성되지 않은 월간 vivid가 있어요"
        description={`${candidatesForCreation.length}개의 월간 vivid를 생성할 수 있어요.`}
        isExpanded={monthlyCandidatesDropdown.isExpanded}
        onClick={toggleMonthlyCandidatesDropdown}
        accentColor={COLORS.monthly.primary}
      />

      {/* 생성 가능한 월간 vivid 리스트 (드롭다운 애니메이션) */}
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
          {candidatesForCreation.map((candidate) => (
            <MonthlyCandidateItem
              key={candidate.month}
              candidate={candidate}
              generatingMonth={generatingMonth}
              timerProgress={timerProgress[candidate.month]}
              handleCreateFeedback={handleCreateFeedback}
              progress={monthlyVividProgress[candidate.month] || null}
            />
          ))}
        </div>
      </div>

      {renderCompletionModal()}
    </div>
  );
}
