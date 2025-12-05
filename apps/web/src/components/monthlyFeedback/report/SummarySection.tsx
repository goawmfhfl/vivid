"use client";

import type { SummaryReport } from "@/types/monthly-feedback";

type SummarySectionProps = {
  summaryReport: SummaryReport;
  isPro?: boolean;
};

export function SummarySection({
  summaryReport,
  isPro = false,
}: SummarySectionProps) {
  // TODO: Summary Section 구현 필요
  return (
    <div>
      <h2>Summary Section</h2>
      {/* 구현 예정 */}
    </div>
  );
}
