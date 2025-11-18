import { CalendarDays, Target, TrendingUp } from "lucide-react";
import type { WeeklyReportData } from "./types";

type ReportHeaderProps = {
  weekRange: WeeklyReportData["week_range"];
  integrity: WeeklyReportData["integrity"];
  nextWeekFocus: string;
  narrative: string;
};

export function ReportHeader({
  weekRange,
  integrity,
  nextWeekFocus,
  narrative,
}: ReportHeaderProps) {
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
            <p className="text-sm" style={{ opacity: 0.9 }}>
              주간 리포트
            </p>
          </div>
          <h1 className="text-2xl sm:text-3xl mb-2 font-semibold">
            {weekRange.start} – {weekRange.end}
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
              >
                <span className="text-xl font-semibold">
                  {integrity.average}
                </span>
              </div>
              <div>
                <p className="text-xs" style={{ opacity: 0.8 }}>
                  평균 정합도
                </p>
                <p className="text-sm font-medium">{integrity.trend}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Narrative - AI Summary */}
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
                AI 트렌드 요약
              </p>
              <p
                className="text-base sm:text-lg leading-relaxed"
                style={{ opacity: 0.95 }}
              >
                {narrative}
              </p>
            </div>
          </div>
        </div>

        {/* Next Week Focus - Clear Callout */}
        <div
          className="py-4 px-5 rounded-xl"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
        >
          <div className="flex items-start gap-3">
            <Target
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              style={{ opacity: 0.9 }}
            />
            <div className="flex-1 min-w-0">
              <p
                className="text-xs mb-2"
                style={{ opacity: 0.85, fontWeight: 500 }}
              >
                다음 주 집중 포인트
              </p>
              <p className="text-base sm:text-lg font-medium leading-relaxed">
                {nextWeekFocus}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
