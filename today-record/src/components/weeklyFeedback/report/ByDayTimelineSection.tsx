import { ArrowRight, CalendarDays, Inbox } from "lucide-react";
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
  const hasData = byDay && byDay.length > 0;
  const hasEmotions = emotionTrend && emotionTrend.length > 0;

  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#A3BFD9" }}
        >
          <CalendarDays className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: "#333333" }}
        >
          일별 타임라인
        </h2>
      </div>

      {/* Horizontal Scrollable Cards */}
      {hasData ? (
        <ScrollArea className="w-full">
          <div
            className="flex gap-3 sm:gap-4 pb-4 -mx-3 sm:-mx-4 px-3 sm:px-4"
            style={{ minWidth: "max-content" }}
          >
            {byDay.map((day, index) => (
              <Card
                key={index}
                className="p-4 flex-shrink-0 transition-all hover:shadow-md"
                style={{
                  backgroundColor: "white",
                  border: "1px solid #EFE9E3",
                  width: "200px",
                  minHeight: "260px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Date & Score - Fixed Height */}
                <div
                  className="flex items-center justify-between flex-shrink-0"
                  style={{ height: "48px", marginBottom: "12px" }}
                >
                  <div>
                    <p
                      className="text-xs font-medium"
                      style={{ color: "#6B7A6F" }}
                    >
                      {day.weekday}
                    </p>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "#333333" }}
                    >
                      {day.date}
                    </p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#E8EFE8" }}
                  >
                    <span
                      className="text-base font-semibold"
                      style={{ color: "#6B7A6F" }}
                    >
                      {day.integrity_score}
                    </span>
                  </div>
                </div>

                {/* One Liner - Flexible Height with Max */}
                <div
                  className="mb-3 flex-shrink-0"
                  style={{ minHeight: "60px", maxHeight: "84px" }}
                >
                  <p
                    className="text-sm leading-relaxed line-clamp-3"
                    style={{
                      color: "#333333",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {day.one_liner || "기록이 없습니다"}
                  </p>
                </div>

                {/* Key Mood Badge - Fixed Position */}
                <div
                  className="mb-3 flex-shrink-0"
                  style={{
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Badge
                    className="text-xs px-3 py-1.5"
                    style={{
                      backgroundColor: "#E5EEF5",
                      color: "#5A7A8F",
                      border: "none",
                    }}
                  >
                    {day.key_mood || "감정 없음"}
                  </Badge>
                </div>

                {/* Keywords - Flexible Height with Max */}
                <div
                  className="flex flex-wrap gap-1.5 flex-shrink-0"
                  style={{
                    minHeight: "40px",
                    maxHeight: "64px",
                    alignContent: "flex-start",
                  }}
                >
                  {day.keywords && day.keywords.length > 0 ? (
                    day.keywords.slice(0, 3).map((keyword, kidx) => (
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
                    ))
                  ) : (
                    <p
                      className="text-xs"
                      style={{ color: "#9CA3AF", fontStyle: "italic" }}
                    >
                      키워드 없음
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <Card
          className="p-8 sm:p-12"
          style={{
            backgroundColor: "white",
            border: "1px solid #EFE9E3",
            textAlign: "center",
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#F5F5F5" }}
            >
              <Inbox className="w-8 h-8" style={{ color: "#9CA3AF" }} />
            </div>
            <div>
              <p
                className="text-base font-medium mb-1"
                style={{ color: "#333333" }}
              >
                일별 데이터가 없습니다
              </p>
              <p className="text-sm" style={{ color: "#6B7A6F", opacity: 0.7 }}>
                이번 주의 일별 기록이 아직 없어요
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Emotion Trend Visualization */}
      {hasEmotions ? (
        <Card
          className="p-4 sm:p-5 mt-4"
          style={{
            backgroundColor: "white",
            border: "1px solid #EFE9E3",
          }}
        >
          <p
            className="text-xs sm:text-sm mb-3 font-medium"
            style={{ color: "#6B7A6F" }}
          >
            이번 주 감정의 흐름
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {emotionTrend.map((emotion, index) => (
              <div key={index} className="flex items-center gap-2">
                <Badge
                  className="text-sm px-3 py-1.5"
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
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: "#A8BBA8" }}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card
          className="p-6 mt-4"
          style={{
            backgroundColor: "#FAFAF8",
            border: "1px dashed #E5E7EB",
            textAlign: "center",
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm" style={{ color: "#9CA3AF" }}>
              감정 데이터가 없습니다
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
