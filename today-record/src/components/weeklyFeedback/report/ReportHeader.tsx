import { CalendarDays } from "lucide-react";
import { Badge } from "../../ui/badge";
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
      <div
        className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl"
        style={{
          background: "linear-gradient(135deg, #A8BBA8 0%, #8FA894 100%)",
          color: "white",
        }}
      >
        {/* Week Range & Integrity */}
        <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays
                className="w-4 h-4 sm:w-5 sm:h-5"
                style={{ opacity: 0.9 }}
              />
              <p className="text-sm sm:text-base" style={{ opacity: 0.9 }}>
                주간 리포트
              </p>
            </div>
            <h1 className="text-xl sm:text-2xl mb-1.5">
              {weekRange.start} – {weekRange.end}
            </h1>
            <p className="text-sm sm:text-base" style={{ opacity: 0.85 }}>
              평균 정합도 {integrity.average}점 {integrity.trend}
            </p>
          </div>

          {/* Next Week Focus Badge */}
          <Badge
            className="text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2.5"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.25)",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              whiteSpace: "nowrap",
            }}
          >
            {nextWeekFocus}
          </Badge>
        </div>

        {/* Weekly One-Liner - Hero Summary */}
        <div
          className="py-4 px-4 sm:py-5 sm:px-6 rounded-xl sm:rounded-2xl"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
        >
          <p
            className="text-base sm:text-lg leading-relaxed"
            style={{ opacity: 0.95 }}
          >
            {narrative}
          </p>
        </div>
      </div>
    </div>
  );
}

