import React, { useMemo } from "react";
import {
  CalendarLogMap,
  getCalendarMatrix,
  isSameDay,
  isToday,
  toISODate,
} from "./calendar-utils";
import { COLORS } from "@/lib/design-system";

export interface CalendarProps {
  year: number;
  month: number;
  logs: CalendarLogMap;
  selectedDate: Date;
  onSelectDate?: (isoDate: string) => void;
  locale?: "ko" | "en";
  startOfWeek?: "sun" | "mon";
}

export function Calendar({
  year,
  month,
  logs,
  selectedDate,
  onSelectDate,
  locale = "ko",
  startOfWeek = "sun",
}: CalendarProps) {
  const matrix = useMemo(
    () => getCalendarMatrix(year, month, startOfWeek),
    [year, month, startOfWeek]
  );

  const weekdays =
    locale === "ko"
      ? ["일", "월", "화", "수", "목", "금", "토"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleDateClick = (date: Date) => {
    if (!onSelectDate) return;
    onSelectDate(toISODate(date));
  };

  const handleKeyDown = (event: React.KeyboardEvent, date: Date) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleDateClick(date);
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((day) => (
          <div
            key={day}
            className="text-center py-2 text-sm font-medium"
            style={{ color: "#6B7A6F" }}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {matrix.map((week, weekIndex) =>
          week.map((date, dayIndex) => {
            if (!date) {
              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className="aspect-square"
                />
              );
            }

            const isoDate = toISODate(date);
            const hasLog = logs[isoDate]?.hasLog || false;
            const hasDailyFeedback = logs[isoDate]?.hasDailyFeedback || false;
            const isCurrentMonth = date.getMonth() === month - 1;
            const isTodayDate = isToday(date);
            const isSelected = isSameDay(date, selectedDate);

            return (
              <button
                key={isoDate}
                className={`
                  relative flex flex-col items-center justify-center
                  aspect-square rounded-lg text-sm font-normal
                  focus:outline-none focus:ring-2 focus:ring-gray-300
                  ${
                    isCurrentMonth
                      ? "text-gray-900"
                      : "text-gray-400 opacity-40"
                  }
                  ${isTodayDate ? "ring-2 ring-gray-300" : ""}
                  ${
                    isSelected
                      ? "bg-[#6B7A6F] text-white hover:bg-[#5A6A5F]"
                      : "hover:bg-gray-100"
                  }
                `}
                onClick={() => handleDateClick(date)}
                onKeyDown={(e) => handleKeyDown(e, date)}
                aria-label={`${isoDate}, ${hasLog ? "기록 있음" : "기록 없음"}${
                  hasDailyFeedback ? ", AI 리뷰 있음" : ""
                }${isTodayDate ? ", 오늘" : ""}${isSelected ? ", 선택됨" : ""}`}
                tabIndex={0}
              >
                <span className="text-sm">{date.getDate()}</span>

                {/* 기록 표시 */}
                <div className="absolute bottom-2 flex gap-1">
                  {hasLog && (
                    <div
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: isSelected
                          ? COLORS.text.white
                          : COLORS.brand.primary,
                      }}
                    />
                  )}
                  {hasDailyFeedback && (
                    <div
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: "#E5B96B", // 머스터드 옐로우 (active 상태에서도 잘 보임)
                      }}
                    />
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
