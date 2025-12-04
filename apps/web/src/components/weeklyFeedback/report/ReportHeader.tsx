import { CalendarDays, TrendingUp } from "lucide-react";
import type { WeeklyOverview } from "@/types/weekly-feedback";
import { COLORS, TYPOGRAPHY, SPACING } from "@/lib/design-system";

type ReportHeaderProps = {
  weekRange: {
    start: string; // "2025.10.28"
    end: string; // "2025.11.03"
  };
  integrityScore: number; // 0-10
  weeklyOverview: WeeklyOverview;
};

export function ReportHeader({
  weekRange,
  integrityScore,
  weeklyOverview,
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
            <p className="text-xs" style={{ opacity: 0.9 }}>
              주간 리포트
            </p>
          </div>
          <h1 className="text-2xl sm:text-3xl mb-2 font-semibold">
            {weekRange.start} – {weekRange.end}
          </h1>
          {/* Weekly Title */}
          {weeklyOverview.title && weeklyOverview.title.trim() && (
            <div className="mt-4 mb-2">
              <div
                className="inline-block px-4 py-2 rounded-xl"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.25)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <p className="text-base sm:text-lg font-semibold leading-relaxed">
                  {weeklyOverview.title}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-2">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
              >
                <span className="text-xl font-semibold">
                  {Math.round(integrityScore * 10) / 10}
                </span>
              </div>
              <div>
                <p className="text-xs" style={{ opacity: 0.8 }}>
                  평균 정합도
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Narrative - AI Summary */}
        {weeklyOverview.narrative && (
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
                  {weeklyOverview.narrative}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Top Keywords */}
        {weeklyOverview.top_keywords &&
          weeklyOverview.top_keywords.length > 0 && (
            <div className="mb-5">
              <p
                className="text-xs mb-2"
                style={{ opacity: 0.85, fontWeight: 500 }}
              >
                이번 주 키워드
              </p>
              <div className="flex flex-wrap gap-2">
                {weeklyOverview.top_keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.25)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* AI Overall Comment */}
        {weeklyOverview.ai_overall_comment && (
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
                  AI 종합 코멘트
                </p>
                <p className="text-sm font-medium leading-relaxed">
                  {weeklyOverview.ai_overall_comment}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
