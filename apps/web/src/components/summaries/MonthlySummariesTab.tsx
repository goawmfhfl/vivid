import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { PeriodSummary } from "@/types/Entry";
import { useMonthlyCandidates } from "@/hooks/useMonthlyCandidates";
import { filterMonthlyCandidatesForCreation } from "../monthlyVivid/monthly-vivid-candidate-filter";
import { SummaryList } from "./SummaryList";
import { MonthlyCandidatesSection } from "./MonthlyCandidatesSection";
import { EmptyState } from "./EmptyState";
import { Pagination } from "./Pagination";
interface MonthlySummariesTabProps {
  summaries: PeriodSummary[];
}

const MONTHLY_COLOR = "#6B7A6F";
const ITEMS_PER_PAGE = 10;

export function MonthlySummariesTab({ summaries }: MonthlySummariesTabProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const { data: candidates = [], isLoading: isLoadingCandidates } =
    useMonthlyCandidates();

  // 월간 요약만 필터링 및 정렬
  const sortedSummaries = useMemo(() => {
    const monthly = summaries.filter((s) => s.type === "monthly");
    return [...monthly].sort((a, b) => {
      if (a.year !== b.year) return (b.year || 0) - (a.year || 0);
      return (b.monthNumber || 0) - (a.monthNumber || 0);
    });
  }, [summaries]);

  // 페이지네이션
  const totalPages = Math.ceil(sortedSummaries.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentSummaries = sortedSummaries.slice(startIndex, endIndex);

  // MonthlyCandidatesSection이 표시되는지 확인
  const hasCandidatesSection = useMemo(() => {
    if (isLoadingCandidates) return false;
    const candidatesForCreation = filterMonthlyCandidatesForCreation(
      candidates,
      new Date()
    );
    return candidatesForCreation.length > 0;
  }, [candidates, isLoadingCandidates]);

  const handleSummaryClick = (summary: PeriodSummary) => {
    router.push(`/analysis/feedback/monthly/${summary.id}`);
  };

  return (
    <div className="space-y-6">
      <MonthlyCandidatesSection />

      {/* 월간 VIVID 리스트 섹션 */}
      {currentSummaries.length > 0 && (
        <div
          className={hasCandidatesSection ? "pt-6 border-t" : "pt-0"}
          style={{ borderColor: "#EFE9E3" }}
        >
          <div className="mb-4">
            <h2
              style={{
                color: "#333333",
                fontSize: "1.1rem",
                fontWeight: "600",
                marginBottom: "4px",
              }}
            >
              월간 vivid 리스트
            </h2>
            <p
              style={{
                color: "#4E4B46",
                opacity: 0.7,
                fontSize: "0.85rem",
              }}
            >
              AI가 분석한 월간 인사이트와 VIVID를 확인하세요
            </p>
          </div>
          <SummaryList
            summaries={currentSummaries}
            color={MONTHLY_COLOR}
            onSummaryClick={handleSummaryClick}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            color={MONTHLY_COLOR}
          />
        </div>
      )}

      {currentSummaries.length === 0 && (
        <div className="pt-6">
          <EmptyState type="monthly" />
        </div>
      )}
    </div>
  );
}
