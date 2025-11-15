import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { PeriodSummary } from "@/types/Entry";
import { SummaryList } from "./SummaryList";
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

  const handleSummaryClick = (summary: PeriodSummary) => {
    router.push(`/analysis/feedback/monthly/${summary.id}`);
  };

  return (
    <div className="space-y-4">
      {currentSummaries.length > 0 ? (
        <>
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
        </>
      ) : (
        <EmptyState type="monthly" />
      )}
    </div>
  );
}
