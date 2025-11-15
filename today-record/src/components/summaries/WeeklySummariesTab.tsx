import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { PeriodSummary } from "@/types/Entry";
import { WeeklyCandidatesSection } from "../WeeklyCandidatesSection";
import { SummaryList } from "./SummaryList";
import { EmptyState } from "./EmptyState";
import { Pagination } from "./Pagination";

interface WeeklySummariesTabProps {
  summaries: PeriodSummary[];
}

const WEEKLY_COLOR = "#A8BBA8";
const ITEMS_PER_PAGE = 10;

export function WeeklySummariesTab({ summaries }: WeeklySummariesTabProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  // 주간 요약만 필터링 및 정렬
  const sortedSummaries = useMemo(() => {
    const weekly = summaries.filter((s) => s.type === "weekly");
    return [...weekly].sort((a, b) => {
      if (a.year !== b.year) return (b.year || 0) - (a.year || 0);
      return (b.weekNumber || 0) - (a.weekNumber || 0);
    });
  }, [summaries]);

  // 페이지네이션
  const totalPages = Math.ceil(sortedSummaries.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentSummaries = sortedSummaries.slice(startIndex, endIndex);

  const handleSummaryClick = (summary: PeriodSummary) => {
    router.push(`/analysis/feedback/weekly/${summary.id}`);
  };

  return (
    <div className="space-y-4">
      <WeeklyCandidatesSection />

      {currentSummaries.length > 0 ? (
        <>
          <SummaryList
            summaries={currentSummaries}
            color={WEEKLY_COLOR}
            onSummaryClick={handleSummaryClick}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            color={WEEKLY_COLOR}
          />
        </>
      ) : (
        <EmptyState type="weekly" />
      )}
    </div>
  );
}
