"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  COLORS,
  TYPOGRAPHY,
  SHADOWS,
  TRANSITIONS,
  GRADIENT_UTILS,
} from "@/lib/design-system";
import { getKSTDateString, getKSTDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface ScheduleDatePickerProps {
  value: string | null; // YYYY-MM-DD
  onChange: (date: string | null) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onClear: () => void;
}

export function ScheduleDatePicker({
  value,
  onChange,
  onConfirm,
  onCancel,
  onClear,
}: ScheduleDatePickerProps) {
  const todayIso = getKSTDateString();
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    if (value) {
      const [y, m] = value.split("-").map(Number);
      return new Date(y, m - 1, 1);
    }
    const today = getKSTDate();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const calendarMatrix = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const matrix: Date[][] = [];
    const currentDate = new Date(startDate);

    for (let week = 0; week < 6; week++) {
      const weekDates: Date[] = [];
      for (let day = 0; day < 7; day++) {
        weekDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      matrix.push(weekDates);
    }
    return matrix;
  }, [currentMonth]);

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(prev.getMonth() - 1);
      return d;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(prev.getMonth() + 1);
      return d;
    });
  };

  const handleDateClick = (date: Date) => {
    const dateIso = getKSTDateString(date);
    onChange(dateIso);
  };

  const monthLabel = `${currentMonth.getFullYear()}년 ${currentMonth.getMonth() + 1}월`;

  return (
    <div className="space-y-4">
      {/* 월 네비게이션 - 심플 */}
      <div
        className="flex items-center justify-between rounded-lg px-2 py-1.5"
        style={{
          backgroundColor: GRADIENT_UTILS.cardBackground(COLORS.brand.light, 0.08),
          border: `1px solid ${GRADIENT_UTILS.borderColor(COLORS.brand.light, "20")}`,
        }}
      >
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="p-1 rounded hover:bg-black/5 transition-colors"
          style={{ color: COLORS.text.tertiary }}
          aria-label="이전 달"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span
          className={cn(TYPOGRAPHY.body.fontSize, "font-medium")}
          style={{ color: COLORS.text.primary }}
        >
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={goToNextMonth}
          className="p-1 rounded hover:bg-black/5 transition-colors"
          style={{ color: COLORS.text.tertiary }}
          aria-label="다음 달"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className={cn(TYPOGRAPHY.caption.fontSize, "text-center py-1.5 font-semibold")}
            style={{ color: COLORS.text.tertiary }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarMatrix.flat().map((date) => {
          const dateIso = getKSTDateString(date);
          const isSelected = value === dateIso;
          const isToday = dateIso === todayIso;
          const isCurrentMonth =
            date.getMonth() === currentMonth.getMonth();

          return (
            <button
              key={dateIso}
              type="button"
              onClick={() => handleDateClick(date)}
              className={cn(
                "aspect-square rounded-lg flex items-center justify-center text-sm font-medium hover:opacity-90",
                TRANSITIONS.default
              )}
              style={{
                backgroundColor: isSelected
                  ? COLORS.brand.primary
                  : isToday && !isSelected
                  ? GRADIENT_UTILS.cardBackground(COLORS.brand.light, 0.25)
                  : "transparent",
                color: isSelected
                  ? COLORS.text.white
                  : isCurrentMonth
                  ? COLORS.text.primary
                  : COLORS.text.tertiary,
                border: isSelected
                  ? `1.5px solid ${COLORS.brand.primary}`
                  : isToday && !isSelected
                  ? `1px solid ${GRADIENT_UTILS.borderColor(COLORS.brand.light, "50")}`
                  : "1px solid transparent",
                boxShadow: isSelected ? SHADOWS.elevation2 : "none",
                opacity: isCurrentMonth ? 1 : 0.45,
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2 pt-2">
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{
              color: COLORS.text.secondary,
              border: `1.5px solid ${COLORS.border.light}`,
              backgroundColor: "transparent",
            }}
          >
            일정 해제
          </button>
        )}
        <button
          type="button"
          onClick={value ? onConfirm : onCancel}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
          style={{
            backgroundColor: COLORS.brand.primary,
            color: COLORS.text.white,
            border: `1.5px solid ${COLORS.brand.primary}`,
            boxShadow: SHADOWS.elevation2,
          }}
        >
          {value ? "저장" : "취소"}
        </button>
      </div>
    </div>
  );
}
