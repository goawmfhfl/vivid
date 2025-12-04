import { CalendarDays, TrendingUp } from "lucide-react";
import type { SummaryReport } from "@/types/weekly-feedback";

type ReportHeaderProps = {
  weekRange: {
    start: string; // "2025.10.28"
    end: string; // "2025.11.03"
  };
  summaryReport: SummaryReport;
};

export function ReportHeader({ weekRange, summaryReport }: ReportHeaderProps) {
  return (
    <div className="mb-8 sm:mb-10">
      {/* Main Header Card */}
      <div
        className="p-6 sm:p-8 rounded-3xl"
        style={{
          background: "linear-gradient(135deg, #A8BBA8 0%, #6B7A6F 100%)",
          color: "white",
        }}
      >
        {/* Week Range & Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-5 h-5" style={{ opacity: 0.9 }} />
            <p className="text-xs" style={{ opacity: 0.9 }}>
              주간 리포트
            </p>
          </div>
          <h1 className="text-2xl sm:text-3xl mb-2 font-semibold">
            {weekRange.start} – {weekRange.end}
          </h1>
        </div>

        {/* Summary */}
        {summaryReport.summary && (
          <div
            className="py-5 px-6 rounded-2xl mb-5"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
          >
            <div className="flex items-start gap-3">
              <TrendingUp
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                style={{ opacity: 0.9 }}
              />
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs mb-2"
                  style={{ opacity: 0.85, fontWeight: 500 }}
                >
                  이번 주를 돌아보니
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ opacity: 0.95 }}
                >
                  {summaryReport.summary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Key Points */}
        {summaryReport.key_points && summaryReport.key_points.length > 0 && (
          <div className="mb-5">
            <p
              className="text-xs mb-2"
              style={{ opacity: 0.85, fontWeight: 500 }}
            >
              핵심 포인트
            </p>
            <div className="flex flex-wrap gap-2">
              {summaryReport.key_points.map((point, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.25)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  {point}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Trend Analysis (Pro 전용) */}
        {summaryReport.trend_analysis && (
          <div
            className="py-4 px-5 rounded-xl"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs mb-2"
                  style={{ opacity: 0.85, fontWeight: 500 }}
                >
                  트렌드 분석
                </p>
                <p className="text-sm font-medium leading-relaxed whitespace-pre-line">
                  {summaryReport.trend_analysis}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
