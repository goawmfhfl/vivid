import React, { useMemo } from "react";
import {
  CalendarLogMap,
  getCalendarMatrix,
  isSameDay,
  isToday,
  toISODate,
} from "./calendar-utils";

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
            const hasDailyVivid = logs[isoDate]?.hasDailyVivid || false;
            const isCurrentMonth = date.getMonth() === month - 1;
            const isTodayDate = isToday(date);
            const isSelected = isSameDay(date, selectedDate);

            // 인증 상태에 따른 스타일 결정
            const isVerified = hasDailyVivid;
            
            // 배경색 결정: 선택됨 > 인증됨 > 기본
            const getBackgroundClass = () => {
              if (isSelected) return "bg-[#6B7A6F]";
              if (isVerified) return "bg-indigo-600";
              return "";
            };
            
            // 텍스트색 결정
            const getTextColorClass = () => {
              if (isSelected || isVerified) return "text-white";
              if (isCurrentMonth) return "text-gray-900";
              return "text-gray-400 opacity-40";
            };
            
            // 호버 스타일 결정
            const getHoverClass = () => {
              if (isSelected) return "hover:bg-[#5A6A5F]";
              if (isVerified) return "hover:bg-indigo-700";
              return "hover:bg-gray-100";
            };

            return (
              <button
                key={isoDate}
                className={`
                  flex items-center justify-center
                  w-8 h-8 rounded-full text-sm font-normal
                  focus:outline-none focus:ring-2 focus:ring-gray-300
                  transition-all duration-200
                  ${getBackgroundClass()}
                  ${getTextColorClass()}
                  ${getHoverClass()}
                  ${isTodayDate && !isSelected && !isVerified ? "ring-2 ring-gray-300" : ""}
                `}
                style={{
                  boxShadow: isVerified && !isSelected 
                    ? "0 2px 8px rgba(79, 70, 229, 0.3)" 
                    : undefined,
                }}
                onClick={() => handleDateClick(date)}
                onKeyDown={(e) => handleKeyDown(e, date)}
                aria-label={`${isoDate}, ${hasLog ? "기록 있음" : "기록 없음"}${
                  hasDailyVivid ? ", AI 리뷰 있음" : ""
                }${isTodayDate ? ", 오늘" : ""}${isSelected ? ", 선택됨" : ""}`}
                tabIndex={0}
              >
                <span className="text-sm">{date.getDate()}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
