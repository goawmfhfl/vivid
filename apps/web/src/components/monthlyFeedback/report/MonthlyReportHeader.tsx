"use client";

import { CalendarDays, TrendingUp, Sparkles, Lock } from "lucide-react";
import type { SummaryReport } from "@/types/monthly-feedback-new";

type MonthlyReportHeaderProps = {
  monthLabel: string;
  dateRange: {
    start_date: string;
    end_date: string;
  };
  summaryReport: SummaryReport;
  isPro?: boolean;
};

export function MonthlyReportHeader({
  monthLabel,
  dateRange,
  summaryReport,
  isPro = false,
}: MonthlyReportHeaderProps) {
  // 날짜 포맷팅 (YYYY-MM-DD -> YYYY.MM.DD)
  const formatDate = (dateStr: string) => {
    return dateStr.replace(/-/g, ".");
  };

  console.log("[MonthlyReportHeader] summaryReport:", summaryReport);

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
        {/* Month Range & Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-5 h-5" style={{ opacity: 0.9 }} />
            <p className="text-xs" style={{ opacity: 0.9 }}>
              월간 리포트
            </p>
          </div>
          <h1 className="text-2xl sm:text-3xl mb-2 font-semibold">
            {summaryReport?.summary_title || monthLabel}
          </h1>
          <p className="text-sm" style={{ opacity: 0.85 }}>
            {formatDate(dateRange.start_date)} –{" "}
            {formatDate(dateRange.end_date)}
          </p>
        </div>

        {/* Monthly Summary Description */}
        {summaryReport?.summary_description && (
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
                  이번 달을 돌아보니
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ opacity: 0.95 }}
                >
                  {summaryReport.summary_description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Themes */}
        {Array.isArray(summaryReport?.main_themes) &&
          summaryReport.main_themes.length > 0 && (
            <div className="mb-5">
              <p
                className="text-xs mb-3"
                style={{ opacity: 0.85, fontWeight: 500 }}
              >
                핵심 테마
              </p>
              <ul className="space-y-2">
                {summaryReport.main_themes
                  .slice(0, isPro ? 10 : 5)
                  .map((theme, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm"
                      style={{ color: "rgba(255, 255, 255, 0.95)" }}
                    >
                      <span
                        className="flex-shrink-0 mt-1"
                        style={{
                          color: "rgba(255, 255, 255, 0.8)",
                          fontWeight: 600,
                        }}
                      >
                        •
                      </span>
                      <span style={{ lineHeight: "1.6" }}>{theme}</span>
                    </li>
                  ))}
              </ul>
              {!isPro && summaryReport.main_themes.length > 5 && (
                <div className="mt-3 flex items-center gap-2 text-xs opacity-75">
                  <Lock className="w-3 h-3" />
                  <span>
                    {summaryReport.main_themes.length - 5}개의 테마 더 보기
                  </span>
                </div>
              )}
            </div>
          )}

        {/* Monthly Scores */}
        {summaryReport && (
          <div
            className="py-5 px-6 rounded-2xl relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            <div className="flex items-start gap-4 relative z-10">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                <Sparkles className="w-5 h-5" style={{ opacity: 0.95 }} />
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-semibold mb-2"
                  style={{ opacity: 0.95 }}
                >
                  월간 점수
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs opacity-75">종합 점수</p>
                    <p className="text-lg font-semibold">
                      {summaryReport.monthly_score}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs opacity-75">일관성</p>
                    <p className="text-lg font-semibold">
                      {summaryReport.integrity_average.toFixed(1)}
                    </p>
                  </div>
                  {isPro && (
                    <>
                      <div>
                        <p className="text-xs opacity-75">생활 밸런스</p>
                        <p className="text-lg font-semibold">
                          {summaryReport.life_balance_score}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs opacity-75">실행력</p>
                        <p className="text-lg font-semibold">
                          {summaryReport.execution_score}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs opacity-75">휴식/회복</p>
                        <p className="text-lg font-semibold">
                          {summaryReport.rest_score}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs opacity-75">관계/소통</p>
                        <p className="text-lg font-semibold">
                          {summaryReport.relationship_score}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Comment */}
        {summaryReport?.summary_ai_comment && (
          <div
            className="mt-5 py-4 px-6 rounded-2xl"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
          >
            <p
              className="text-sm leading-relaxed"
              style={{ opacity: 0.95, fontStyle: "italic" }}
            >
              {summaryReport.summary_ai_comment}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
