import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { PeriodSummary } from "@/types/Entry";
import { useMonthlyCandidates } from "@/hooks/useMonthlyCandidates";
import { filterMonthlyCandidatesForCreation } from "../monthlyVivid/monthly-vivid-candidate-filter";
import { SummaryList } from "./SummaryList";
import { MonthlyCandidatesSection } from "./MonthlyCandidatesSection";
import { EmptyState } from "./EmptyState";
import { Pagination } from "./Pagination";
import { COLORS } from "@/lib/design-system";

interface MonthlySummariesTabProps {
  summaries: PeriodSummary[];
}

const MONTHLY_COLOR = COLORS.monthly.primary;
const ITEMS_PER_PAGE = 10;

export function MonthlySummariesTab({ summaries }: MonthlySummariesTabProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const { data: candidates = [], isLoading: isLoadingCandidates } =
    useMonthlyCandidates();

  // 월간 요약만 필터링 및 정렬 (시간순: month 기준, 최신 먼저)
  const sortedSummaries = useMemo(() => {
    const monthly = summaries.filter((s) => s.type === "monthly");
    return [...monthly].sort((a, b) =>
      (b.month || "").localeCompare(a.month || "")
    );
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
          style={{ borderColor: COLORS.border.light }}
        >
          <div className="mb-4">
            <h2
              className="text-lg font-semibold mb-1"
              style={{ color: COLORS.text.primary }}
            >
              월간 vivid 리스트
            </h2>
            <p
              className="text-sm"
              style={{ color: COLORS.text.secondary }}
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
