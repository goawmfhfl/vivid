import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { PeriodSummary } from "@/types/Entry";
import { WeeklyCandidatesSection } from "./WeeklyCandidatesSection";
import { useWeeklyCandidates } from "@/hooks/useWeeklyCandidates";
import { filterWeeklyCandidatesForCreation } from "../weeklyFeedback/weekly-candidate-filter";
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
  const { data: candidates = [], isLoading: isLoadingCandidates } =
    useWeeklyCandidates();

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

  // WeeklyCandidatesSection이 표시되는지 확인
  const hasCandidatesSection = useMemo(() => {
    if (isLoadingCandidates) return false;
    const candidatesForCreation = filterWeeklyCandidatesForCreation(
      candidates,
      new Date()
    );
    return candidatesForCreation.length > 0;
  }, [candidates, isLoadingCandidates]);

  const handleSummaryClick = (summary: PeriodSummary) => {
    router.push(`/analysis/feedback/weekly/${summary.id}`);
  };

  return (
    <div className="space-y-6">
      <WeeklyCandidatesSection />

      {/* 주간 피드백 리스트 섹션 */}
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
              주간 vivid 리스트
            </h2>
            <p
              style={{
                color: "#4E4B46",
                opacity: 0.7,
                fontSize: "0.85rem",
              }}
            >
              AI가 분석한 주간 인사이트와 피드백을 확인하세요
            </p>
          </div>
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
        </div>
      )}

      {currentSummaries.length === 0 && (
        <div className="pt-6">
          <EmptyState type="weekly" />
        </div>
      )}
    </div>
  );
}
