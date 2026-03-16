import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { PeriodSummary } from "@/types/Entry";
import { WeeklyCandidatesSection } from "./WeeklyCandidatesSection";
import { useWeeklyCandidates } from "@/hooks/useWeeklyCandidates";
import { filterWeeklyCandidatesForCreation } from "../weeklyVivid/weekly-vivid-candidate-filter";
import { SummaryList } from "./SummaryList";
import { EmptyState } from "./EmptyState";
import { Pagination } from "./Pagination";
import { COLORS } from "@/lib/design-system";

interface WeeklySummariesTabProps {
  summaries: PeriodSummary[];
}

const WEEKLY_COLOR = COLORS.weekly.primary;
const ITEMS_PER_PAGE = 10;

export function WeeklySummariesTab({ summaries }: WeeklySummariesTabProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const { data: candidates = [], isLoading: isLoadingCandidates } =
    useWeeklyCandidates();

  // 주간 요약만 필터링 및 정렬 (시간순: week_start 기준, 최신 먼저)
  const sortedSummaries = useMemo(() => {
    const weekly = summaries.filter((s) => s.type === "weekly");
    return [...weekly].sort((a, b) =>
      (b.week_start || "").localeCompare(a.week_start || "")
    );
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

      {/* 주간 VIVID 리스트 섹션 */}
      {currentSummaries.length > 0 && (
        <div
          className={hasCandidatesSection ? "pt-6 border-t" : "pt-0"}
          style={{ borderColor: COLORS.border.light }}
        >
          <div className="mb-4">
            <h2
              className="text-lg font-semibold mb-1"
              style={{
                color: COLORS.text.primary,
              }}
            >
              주간 vivid 리스트
            </h2>
            <p
              className="text-sm"
              style={{
                color: COLORS.text.secondary,
              }}
            >
              AI가 분석한 주간 vivid를 확인하세요
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
