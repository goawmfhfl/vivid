import { ArrowRight, CalendarDays } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Card } from "../../ui/card";
import { ScrollArea } from "../../ui/scroll-area";
import type { WeeklyReportData } from "./types";

type ByDayTimelineSectionProps = {
  byDay: WeeklyReportData["by_day"];
  emotionTrend: string[];
};

export function ByDayTimelineSection({
  byDay,
  emotionTrend,
}: ByDayTimelineSectionProps) {
  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#A3BFD9" }}
        >
          <CalendarDays className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl" style={{ color: "#333333" }}>
          일별 타임라인
        </h2>
      </div>

      {/* Horizontal Scrollable Cards */}
      <ScrollArea className="w-full">
        <div
          className="flex gap-3 sm:gap-4 pb-4 -mx-3 sm:-mx-4 px-3 sm:px-4"
          style={{ minWidth: "max-content" }}
        >
          {byDay.map((day, index) => (
            <Card
              key={index}
              className="p-3.5 sm:p-4 flex-shrink-0"
              style={{
                backgroundColor: "white",
                border: "1px solid #EFE9E3",
                width: "200px",
              }}
            >
              {/* Date & Score */}
              <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                <div>
                  <p className="text-xs" style={{ color: "#6B7A6F" }}>
                    {day.weekday}
                  </p>
                  <p className="text-sm" style={{ color: "#333333" }}>
                    {day.date}
                  </p>
                </div>
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#E8EFE8" }}
                >
                  <span
                    className="text-sm sm:text-base"
                    style={{ color: "#6B7A6F" }}
                  >
                    {day.integrity_score}
                  </span>
                </div>
              </div>

              {/* One Liner */}
              <p
                className="text-sm sm:text-base leading-relaxed mb-2.5"
                style={{ color: "#333333" }}
              >
                {day.one_liner}
              </p>

              {/* Key Mood Badge */}
              <Badge
                className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 mb-2.5"
                style={{
                  backgroundColor: "#E5EEF5",
                  color: "#5A7A8F",
                }}
              >
                {day.key_mood}
              </Badge>

              {/* Keywords */}
              <div className="flex flex-wrap gap-1.5">
                {day.keywords.slice(0, 3).map((keyword, kidx) => (
                  <Badge
                    key={kidx}
                    className="text-xs px-2 py-1"
                    style={{
                      backgroundColor: "#FAFAF8",
                      color: "#6B7A6F",
                      border: "1px solid #EFE9E3",
                    }}
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Emotion Trend Visualization */}
      <Card
        className="p-4 sm:p-5 mt-4"
        style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
      >
        <p
          className="text-xs sm:text-sm mb-2.5 sm:mb-3"
          style={{ color: "#6B7A6F" }}
        >
          이번 주 감정의 흐름
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {emotionTrend.map((emotion, index) => (
            <div key={index} className="flex items-center gap-2">
              <Badge
                className="text-sm sm:text-base px-3 py-1.5 sm:px-4 sm:py-2"
                style={{
                  backgroundColor: "#E8EFE8",
                  color: "#6B7A6F",
                  border: "none",
                }}
              >
                {emotion}
              </Badge>
              {index < emotionTrend.length - 1 && (
                <ArrowRight
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
                  style={{ color: "#A8BBA8" }}
                />
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
