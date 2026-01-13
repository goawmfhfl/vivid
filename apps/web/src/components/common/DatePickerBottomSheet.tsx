"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getKSTDateString, getKSTDate } from "@/lib/date-utils";
import { COLORS, CARD_STYLES, TRANSITIONS } from "@/lib/design-system";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DatePickerBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string; // YYYY-MM-DD
  onDateSelect?: (date: string) => void;
  recordDates?: string[]; // 기록이 있는 날짜 목록
  aiFeedbackDates?: string[]; // AI 피드백이 생성된 날짜 목록
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function DatePickerBottomSheet({
  isOpen,
  onClose,
  selectedDate,
  onDateSelect,
  recordDates = [],
  aiFeedbackDates = [],
}: DatePickerBottomSheetProps) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const today = getKSTDate();
    if (selectedDate) {
      const selected = getKSTDate(new Date(selectedDate));
      return new Date(selected.getFullYear(), selected.getMonth(), 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const todayIso = getKSTDateString();
  const activeDate = selectedDate || todayIso;

  // 달력 매트릭스 생성
  const calendarMatrix = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // 주의 시작(일요일)

    const matrix: Date[][] = [];
    const currentDate = new Date(startDate);

    // 항상 6주(42일) 고정
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

  // 이전 달
  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  // 다음 달
  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  // 날짜 선택
  const handleDateClick = (date: Date) => {
    const dateIso = getKSTDateString(date);
    // 먼저 바텀 시트를 닫음
    onClose();
    // 약간의 지연 후 페이지 이동 (애니메이션이 시작되도록)
    setTimeout(() => {
      if (onDateSelect) {
        onDateSelect(dateIso);
      } else {
        router.push(`/${dateIso}`);
      }
    }, 100);
  };

  // 오늘 날짜로 이동
  const goToToday = () => {
    const today = getKSTDate();
    const todayIso = getKSTDateString(today);

    // 오늘 날짜의 월로 이동
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));

    // 먼저 바텀 시트를 닫음
    onClose();
    // 약간의 지연 후 페이지 이동 (애니메이션이 시작되도록)
    setTimeout(() => {
      if (onDateSelect) {
        onDateSelect(todayIso);
      } else {
        router.push(`/${todayIso}`);
      }
    }, 100);
  };

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-date-picker-sheet]")) return;
      onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const monthLabel = `${currentMonth.getFullYear()}년 ${
    currentMonth.getMonth() + 1
  }월`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="date-picker-sheet"
          data-date-picker-sheet
          className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden max-w-md mx-auto"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1, pointerEvents: "auto" }}
          exit={{ y: "100%", opacity: 0, pointerEvents: "none" }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          style={{
            ...CARD_STYLES.default,
            maxHeight: "80vh",
            backgroundColor: COLORS.background.base,
          }}
        >
          {/* 헤더 */}
          <div
            className="flex items-center justify-between p-4 border-b"
            style={{ borderColor: COLORS.border.light }}
          >
            <button
              onClick={onClose}
              className="p-2 rounded-full"
              style={{
                color: COLORS.text.secondary,
              }}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={goToPreviousMonth}
                className="p-1.5 rounded-full"
                style={{
                  color: COLORS.text.secondary,
                }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <h3
                className="text-lg font-semibold"
                style={{ color: COLORS.text.primary }}
              >
                {monthLabel}
              </h3>

              <button
                onClick={goToNextMonth}
                className="p-1.5 rounded-full"
                style={{
                  color: COLORS.text.secondary,
                }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={goToToday}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${TRANSITIONS.default}`}
              style={{
                backgroundColor: COLORS.brand.primary,
                color: "white",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.brand.dark;
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.brand.primary;
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              오늘
            </button>
          </div>

          {/* 달력 */}
          <div
            className="p-6 overflow-y-auto max-w-2xl mx-auto"
            style={{ maxHeight: "calc(80vh - 80px)" }}
          >
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-3 mb-4">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold py-2"
                  style={{
                    color: COLORS.text.secondary,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-3">
              {calendarMatrix.map((week) =>
                week.map((date) => {
                  const dateIso = getKSTDateString(date);
                  const isActive = dateIso === activeDate;
                  const isToday = dateIso === todayIso;
                  const isCurrentMonth =
                    date.getMonth() === currentMonth.getMonth();
                  const hasRecord = recordDates.includes(dateIso);
                  const hasAiFeedback = aiFeedbackDates.includes(dateIso);

                  return (
                    <button
                      key={dateIso}
                      onClick={() => handleDateClick(date)}
                      className={`aspect-square rounded-xl flex items-center justify-center text-sm font-semibold ${TRANSITIONS.default} relative`}
                      style={{
                        backgroundColor: isActive
                          ? COLORS.brand.primary
                          : isToday
                          ? COLORS.brand.light + "15"
                          : COLORS.background.card,
                        color: isActive
                          ? "white"
                          : isCurrentMonth
                          ? COLORS.text.primary
                          : COLORS.text.tertiary,
                        border: isActive
                          ? `1.5px solid ${COLORS.brand.primary}`
                          : isToday && !isActive
                          ? `1px solid ${COLORS.brand.primary}40`
                          : `1px solid ${COLORS.border.light}`,
                        boxShadow: isActive
                          ? "0 4px 12px rgba(107, 122, 111, 0.2)"
                          : "0 1px 3px rgba(0, 0, 0, 0.05)",
                        opacity: isCurrentMonth ? 1 : 0.4,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor =
                            COLORS.background.hover;
                          e.currentTarget.style.boxShadow =
                            "0 2px 6px rgba(0, 0, 0, 0.1)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = isToday
                            ? COLORS.brand.light + "15"
                            : COLORS.background.card;
                          e.currentTarget.style.boxShadow =
                            "0 1px 3px rgba(0, 0, 0, 0.05)";
                        }
                      }}
                    >
                      {date.getDate()}
                      {/* 기록/AI 피드백 dot 표시 */}
                      {(hasRecord || hasAiFeedback) && (
                        <div
                          className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-0.5"
                          style={{ pointerEvents: "none" }}
                        >
                          {hasRecord && (
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                backgroundColor: isActive
                                  ? COLORS.accent[300] // 액티브 상태에서는 더 연한 파란색
                                  : COLORS.accent[500], // 더스티 블루
                              }}
                            />
                          )}
                          {hasAiFeedback && (
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                backgroundColor: "#E5B96B", // 머스터드 옐로우 (active 상태에서도 잘 보임)
                              }}
                            />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
