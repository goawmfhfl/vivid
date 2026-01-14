import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { Sparkles, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import { useMonthlyCandidates } from "@/hooks/useMonthlyCandidates";
import { QUERY_KEYS } from "@/constants";
import { filterMonthlyCandidatesForCreation } from "../monthlyFeedback/monthly-candidate-filter";
import { getCurrentUserId } from "@/hooks/useCurrentUser";
import { useModalStore } from "@/store/useModalStore";
import type { MonthlyFeedbackNew } from "@/types/monthly-feedback-new";
import { useCountUp } from "@/hooks/useCountUp";
import { COLORS, GRADIENT_UTILS } from "@/lib/design-system";

// 월간 후보 아이템 컴포넌트
function MonthlyCandidateItem({
  candidate,
  generatingMonth,
  progress,
  handleCreateFeedback,
}: {
  candidate: { month: string; month_label: string; daily_feedback_count: number };
  generatingMonth: string | null;
  progress: { current: number; total: number; currentStep: string } | null;
  handleCreateFeedback: (month: string) => void;
}) {
  const isGenerating = generatingMonth === candidate.month || progress !== null;

  const actualPercentage = progress
    ? Math.round((progress.current / progress.total) * 100)
    : 0;
  const progressPercentage = Math.min(actualPercentage, 99);
  
  const animatedProgress = useCountUp(progressPercentage, 1000, isGenerating);

  const getSectionNameKR = (sectionName: string) => {
    const names: Record<string, string> = {
      vivid_report: "비비드 리포트",
      title: "제목",
      완료: "완료",
    };
    return names[sectionName] || sectionName;
  };

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
            {candidate.daily_feedback_count || 0}개의 일일 피드백
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
                  color: COLORS.text.secondary,
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
          onClick={() => handleCreateFeedback(candidate.month)}
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

  // 필터링 로직 적용: 기준 날짜(오늘, KST 기준)를 기준으로 생성 가능한 월간 vivid 필터링
  const candidatesForCreation = useMemo(() => {
    return filterMonthlyCandidatesForCreation(
      candidates,
      referenceDate || new Date()
    );
  }, [candidates, referenceDate]);

  const handleCreateFeedback = async (month: string) => {
    try {
      const userId = await getCurrentUserId();

      // 진행 상황 초기화 (전역 상태)
      setMonthlyFeedbackProgress(month, {
        month,
        current: 0,
        total: 2, // vivid_report, title
        currentStep: "vivid_report",
      });

      // POST 요청으로 월간 피드백 생성
      const response = await fetch("/api/monthly-feedback/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          month,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "월간 VIVID 생성에 실패했습니다.");
      }

      const result = await response.json();
      const feedbackData = result.data as MonthlyFeedbackNew & { id: string };

      // 완료 처리
      setMonthlyFeedbackProgress(month, {
        month,
        current: 2,
        total: 2,
        currentStep: "완료",
      });

      // MONTHLY_CANDIDATES에서 해당 월의 monthly_feedback_id 업데이트
      queryClient.setQueryData<
        import("@/types/monthly-candidate").MonthlyCandidate[]
      >([QUERY_KEYS.MONTHLY_CANDIDATES], (oldCandidates = []) => {
        return oldCandidates.map((candidate) => {
          if (candidate.month === feedbackData.month) {
            return {
              ...candidate,
              monthly_feedback_id: feedbackData.id || null,
            };
          }
          return candidate;
        });
      });

      // 쿼리 무효화로 최신 데이터 가져오기
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MONTHLY_CANDIDATES],
      });

      // 월간 피드백 리스트 무효화하여 최신 데이터 가져오기
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MONTHLY_FEEDBACK, "list"],
      });
    } catch (error) {
      console.error("월간 vivid 생성 실패:", error);

      // 진행 상황 초기화 (전역 상태)
      clearMonthlyFeedbackProgress(month);

      alert(
        error instanceof Error
          ? error.message
          : "월간 vivid 생성에 실패했습니다. 다시 시도해주세요."
      );
    } finally {
      setGeneratingMonth(null);
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
        onClick={toggleMonthlyCandidatesDropdown}
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
                  아직 생성되지 않은 월간 vivid가 있어요
                </h3>
                <p
                  style={{
                    color: COLORS.text.secondary,
                    fontSize: "0.85rem",
                    lineHeight: "1.5",
                  }}
                >
                  {candidatesForCreation.length}개의 월간 vivid를 생성할 수
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
                  color: COLORS.brand.primary,
                }}
              >
                <ChevronDown className="w-5 h-5" style={{ color: COLORS.brand.primary }} />
              </div>
            </div>
          </div>
        </div>
      </div>

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
              progress={monthlyFeedbackProgress[candidate.month] || null}
              handleCreateFeedback={handleCreateFeedback}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
