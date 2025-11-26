import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkles, Loader2, AlertCircle, ChevronDown } from "lucide-react";

import { QUERY_KEYS } from "@/constants";
import { useMonthlyCandidates } from "@/hooks/useMonthlyCandidates";
import { useCreateMonthlyFeedback } from "@/hooks/useCreateMonthlyFeedback";
import { filterMonthlyCandidatesForCreation } from "../monthlyFeedback/monthly-candidate-filter";

import { Button } from "../ui/button";

interface MonthlyCandidatesSectionProps {
  referenceDate?: Date;
}

export function MonthlyCandidatesSection({
  referenceDate,
}: MonthlyCandidatesSectionProps = {}) {
  const { data: candidates = [], isLoading } = useMonthlyCandidates();
  const [generatingMonth, setGeneratingMonth] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const createMonthlyFeedback = useCreateMonthlyFeedback();
  const queryClient = useQueryClient();

  // 필터링 로직 적용: 기준 날짜(오늘 또는 테스트용 날짜, KST 기준)를 기준으로 생성 가능한 월간 피드백 필터링
  const candidatesForCreation = useMemo(() => {
    return filterMonthlyCandidatesForCreation(
      candidates,
      referenceDate || new Date()
    );
  }, [candidates, referenceDate]);

  const handleCreateFeedback = async (month: string) => {
    setGeneratingMonth(month);
    try {
      await createMonthlyFeedback.mutateAsync({
        month,
      });

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MONTHLY_CANDIDATES],
      });
    } catch (error) {
      console.error("월간 피드백 생성 실패:", error);
      alert("월간 피드백 생성에 실패했습니다. 다시 시도해주세요.");
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
        className="rounded-xl p-4 cursor-pointer transition-all hover:shadow-md"
        style={{
          backgroundColor: "#F0F2F0",
          border: "1px solid #6B7A6F",
        }}
        onClick={() => setIsExpanded(!isExpanded)}
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
                  있습니다. AI가 분석한 인사이트를 확인해보세요.
                </p>
              </div>
              <div
                className="flex-shrink-0 transition-transform duration-300"
                style={{
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
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
            const isGenerating = generatingMonth === candidate.month;
            return (
              <div
                key={candidate.month}
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
                    style={{ backgroundColor: "#6B7A6F" }}
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
                      {candidate.month_label}
                    </p>
                    {candidate.record_count !== undefined && (
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
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => handleCreateFeedback(candidate.month)}
                  disabled={isGenerating}
                  className="rounded-full px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0 text-xs"
                  style={{
                    backgroundColor: isGenerating ? "#9CA89C" : "#6B7A6F",
                    color: "white",
                    fontSize: "0.75rem",
                    fontWeight: "500",
                    transition: "all 0.2s",
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
