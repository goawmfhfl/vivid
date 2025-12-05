"use client";

import type { SummaryReport } from "@/types/monthly-feedback-new";

type SummarySectionNewProps = {
  summaryReport: SummaryReport;
  isPro?: boolean;
};

export function SummarySectionNew({
  summaryReport,
  isPro = false,
}: SummarySectionNewProps) {
  // TODO: Summary Section 구현 필요
  return (
    <div>
      <h2>Summary Section</h2>
      {/* 구현 예정 */}
    </div>
  );
}
