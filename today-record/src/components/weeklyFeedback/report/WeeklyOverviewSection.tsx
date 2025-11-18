import { Lightbulb, Sparkles } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Card } from "../../ui/card";
import type { WeeklyReportData } from "./types";

type WeeklyOverviewSectionProps = {
  weeklyOverview: WeeklyReportData["weekly_overview"];
};

export function WeeklyOverviewSection({
  weeklyOverview,
}: WeeklyOverviewSectionProps) {
  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#A8BBA8" }}
        >
          <Lightbulb className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl" style={{ color: "#333333" }}>
          이번 주 요약
        </h2>
      </div>

      {/* Top Keywords */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {weeklyOverview.top_keywords.map((keyword, index) => (
            <Badge
              key={index}
              className="text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2.5"
              style={{
                backgroundColor: "#E8EFE8",
                color: "#6B7A6F",
                border: "none",
              }}
            >
              {keyword}
            </Badge>
          ))}
        </div>
      </div>

      {/* Repeated Themes */}
      <Card
        className="p-4 sm:p-5 mb-4"
        style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
      >
        <p
          className="text-xs sm:text-sm mb-2.5 sm:mb-3"
          style={{ color: "#6B7A6F" }}
        >
          반복되는 주제들
        </p>
        <div className="space-y-3">
          {weeklyOverview.repeated_themes.map((theme, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1.5">
                <p
                  className="text-sm sm:text-base"
                  style={{ color: "#333333" }}
                >
                  {theme.theme}
                </p>
                <p className="text-xs sm:text-sm" style={{ color: "#6B7A6F" }}>
                  {theme.count}회
                </p>
              </div>
              <div
                className="h-2 rounded-full"
                style={{ backgroundColor: "#F0F5F0" }}
              >
                <div
                  className="h-2 rounded-full"
                  style={{
                    backgroundColor: "#A8BBA8",
                    width: `${(theme.count / 7) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Overall Comment */}
      <div
        className="p-4 sm:p-5 rounded-xl flex gap-3"
        style={{ backgroundColor: "#F5F7F5", border: "1px solid #E0E5E0" }}
      >
        <Sparkles
          className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5"
          style={{ color: "#A8BBA8" }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs mb-1.5 sm:mb-2" style={{ color: "#6B7A6F" }}>
            AI 총평
          </p>
          <p
            className="text-sm sm:text-base leading-relaxed"
            style={{ color: "#4E4B46" }}
          >
            {weeklyOverview.ai_overall_comment}
          </p>
        </div>
      </div>
    </div>
  );
}
