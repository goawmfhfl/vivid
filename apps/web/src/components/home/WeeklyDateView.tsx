"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getKSTDateString, getKSTDate } from "@/lib/date-utils";
import { getMondayOfWeek } from "@/components/weeklyFeedback/weekly-candidate-filter";
import { COLORS, TRANSITIONS, SHADOWS } from "@/lib/design-system";
import { motion, AnimatePresence } from "framer-motion";
import { DateButtonSkeleton } from "@/components/ui/Skeleton";

interface WeeklyDateViewProps {
  selectedDate?: string; // YYYY-MM-DD 형식
  onDateSelect?: (date: string) => void;
  recordDates?: string[]; // 기록이 있는 날짜 목록
  aiFeedbackDates?: string[]; // AI 피드백이 생성된 날짜 목록
  onMonthChange?: (year: number, month: number) => void; // 월 변경 콜백
  isLoading?: boolean; // 데이터 로딩 상태
}

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

export function WeeklyDateView({
  selectedDate,
  onDateSelect,
  recordDates = [],
  aiFeedbackDates = [],
  onMonthChange,
  isLoading = false,
}: WeeklyDateViewProps) {
  const router = useRouter();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = getKSTDate();
    const selected = selectedDate ? getKSTDate(new Date(selectedDate)) : today;
    return getMondayOfWeek(selected);
  });
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [mouseStart, setMouseStart] = useState<number | null>(null);
  const [mouseEnd, setMouseEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const todayIso = getKSTDateString();
  const activeDate = selectedDate || todayIso;

  // 주간 날짜 배열 생성
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + i);
    return date;
  });

  // 이전 주로 이동
  const goToPreviousWeek = () => {
    setDirection("right");
    setIsTransitioning(true);
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      // 월 변경 콜백은 useEffect에서 처리됨
      return newDate;
    });
  };

  // 다음 주로 이동
  const goToNextWeek = () => {
    setDirection("left");
    setIsTransitioning(true);
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 7);
      // 월 변경 콜백은 useEffect에서 처리됨
      return newDate;
    });
  };

  // 스와이프/드래그 처리
  const minSwipeDistance = 50;

  // 터치 이벤트
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNextWeek();
    }
    if (isRightSwipe) {
      goToPreviousWeek();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // 마우스 드래그 이벤트
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setMouseEnd(null);
    setMouseStart(e.clientX);
    setIsDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!mouseStart || !isDragging) return;
    setMouseEnd(e.clientX);
  };

  const onMouseUp = () => {
    if (!mouseStart || !mouseEnd) {
      setIsDragging(false);
      return;
    }

    const distance = mouseStart - mouseEnd;
    const isLeftDrag = distance > minSwipeDistance;
    const isRightDrag = distance < -minSwipeDistance;

    if (isLeftDrag) {
      goToNextWeek();
    }
    if (isRightDrag) {
      goToPreviousWeek();
    }

    setMouseStart(null);
    setMouseEnd(null);
    setIsDragging(false);
  };

  // 마우스가 컨테이너 밖으로 나갔을 때 처리
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseLeave = () => {
      setMouseStart(null);
      setMouseEnd(null);
      setIsDragging(false);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [isDragging]);

  // currentWeekStart가 변경될 때 월 변경 콜백 호출 (onMonthChange는 dependency에서 제거하여 무한 루프 방지)
  useEffect(() => {
    if (onMonthChange) {
      onMonthChange(
        currentWeekStart.getFullYear(),
        currentWeekStart.getMonth() + 1
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeekStart]);

  // 날짜 선택 핸들러
  const handleDateClick = (date: Date) => {
    const dateIso = getKSTDateString(date);
    if (onDateSelect) {
      onDateSelect(dateIso);
    } else {
      router.push(`/${dateIso}`);
    }
  };

  // selectedDate가 변경되면 해당 주로 이동
  useEffect(() => {
    if (selectedDate) {
      const selected = getKSTDate(new Date(selectedDate));
      const weekStart = getMondayOfWeek(selected);
      setCurrentWeekStart(weekStart);
      setDirection(null); // 직접 선택 시 애니메이션 방지
      // 월 변경 콜백은 currentWeekStart 변경 시 자동으로 호출됨
    }
  }, [selectedDate]);

  // 애니메이션 variants
  const slideVariants = {
    enter: (direction: "left" | "right" | null) => ({
      x: direction === "left" ? 300 : direction === "right" ? -300 : 0,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: "left" | "right" | null) => ({
      x: direction === "left" ? -300 : direction === "right" ? 300 : 0,
      opacity: 0,
    }),
  };

  return (
    <div
      ref={containerRef}
      className="relative mb-6 pb-3 md:pb-4 overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      style={{
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
      }}
    >
      {/* 주간 날짜 그리드 */}
      <AnimatePresence
        mode="wait"
        custom={direction}
        initial={false}
        onExitComplete={() => setIsTransitioning(false)}
      >
        {(isLoading || isTransitioning) && !isDragging ? (
          // 스켈레톤 UI 표시
          <motion.div
            key="skeleton"
            className="grid grid-cols-7 gap-2 md:gap-4"
          >
            {Array.from({ length: 7 }).map((_, index) => (
              <DateButtonSkeleton key={`skeleton-${index}`} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key={currentWeekStart.getTime()}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: {
                type: "spring",
                stiffness: 1200,
                damping: 60,
                duration: 0.1,
              },
            }}
            className="grid grid-cols-7 gap-2 md:gap-4"
            style={{
              transform:
                isDragging && mouseStart && mouseEnd
                  ? `translateX(${mouseEnd - mouseStart}px)`
                  : undefined,
            }}
          >
            {weekDates.map((date, index) => {
              const dateIso = getKSTDateString(date);
              const isActive = dateIso === activeDate;
              const hasRecord = recordDates.includes(dateIso);
              const hasAiFeedback = aiFeedbackDates.includes(dateIso);
              const dayOfWeek = WEEKDAYS[index];
              const dayNumber = date.getDate();

              return (
                <div
                  key={dateIso}
                  className="flex flex-col items-center gap-1 md:gap-2"
                >
                  {/* 요일 */}
                  <div
                    className={`text-xs md:text-sm font-semibold ${TRANSITIONS.colors}`}
                    style={{
                      color: isActive
                        ? COLORS.text.primary
                        : COLORS.text.secondary,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {dayOfWeek}
                  </div>

                  {/* 날짜 버튼 */}
                  <button
                    onClick={() => handleDateClick(date)}
                    className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center text-sm md:text-base font-semibold ${TRANSITIONS.default} relative`}
                    style={{
                      backgroundColor: isActive
                        ? COLORS.brand.primary
                        : COLORS.background.card,
                      color: isActive ? COLORS.text.white : COLORS.text.primary,
                      border: isActive
                        ? `1.5px solid ${COLORS.brand.primary}`
                        : `1px solid ${COLORS.border.light}`,
                      boxShadow: isActive
                        ? SHADOWS.elevation3
                        : SHADOWS.elevation1,
                      transform: isActive
                        ? "scale(1.05) md:scale(1.08)"
                        : "scale(1)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor =
                          COLORS.background.hover;
                        e.currentTarget.style.boxShadow = SHADOWS.elevation2;
                        e.currentTarget.style.transform = "scale(1.02)";
                        e.currentTarget.style.borderColor = COLORS.brand.primary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor =
                          COLORS.background.card;
                        e.currentTarget.style.boxShadow = SHADOWS.elevation1;
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.borderColor = COLORS.border.light;
                      }
                    }}
                  >
                    {dayNumber}
                    {/* 기록/AI 피드백 dot 표시 */}
                    {(hasRecord || hasAiFeedback) && (
                      <div
                        className="absolute bottom-1 md:bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 md:gap-1"
                        style={{ pointerEvents: "none" }}
                      >
                        {hasRecord && (
                          <div
                            className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full"
                            style={{
                              backgroundColor: isActive
                                ? COLORS.text.white
                                : COLORS.brand.primary,
                            }}
                          />
                        )}
                        {hasAiFeedback && (
                          <div
                            className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full"
                            style={{
                              backgroundColor: "#E5B96B", // 머스터드 옐로우 (active 상태에서도 잘 보임)
                            }}
                          />
                        )}
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
