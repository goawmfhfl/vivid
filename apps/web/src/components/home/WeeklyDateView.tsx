"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getKSTDateString, getKSTDate } from "@/lib/date-utils";
import { getMondayOfWeek } from "@/components/weeklyVivid/weekly-vivid-candidate-filter";
import { COLORS, TRANSITIONS, SHADOWS, GRADIENT_UTILS } from "@/lib/design-system";
import { motion, AnimatePresence } from "framer-motion";
import { DateButtonSkeleton } from "@/components/ui/Skeleton";

interface WeeklyDateViewProps {
  selectedDate?: string; // YYYY-MM-DD 형식
  onDateSelect?: (date: string) => void;
  recordDates?: string[]; // 기록이 있는 날짜 목록
  aiFeedbackDates?: string[]; // AI 피드백이 생성된 날짜 목록
  vividFeedbackDates?: string[]; // 비비드 AI 피드백이 생성된 날짜 목록
  reviewFeedbackDates?: string[]; // 회고 AI 피드백이 생성된 날짜 목록
  onMonthChange?: (year: number, month: number) => void; // 월 변경 콜백
  isLoading?: boolean; // 데이터 로딩 상태
}

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

/** 애니메이션 완료 대기 최대 시간 (ms) - onExitComplete 미호출 시 복구 */
const TRANSITION_TIMEOUT_MS = 600;

export function WeeklyDateView({
  selectedDate,
  onDateSelect,
  recordDates: _recordDates = [],
  aiFeedbackDates = [],
  vividFeedbackDates,
  reviewFeedbackDates = [],
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

  // 전환 완료 핸들러 (onExitComplete 미호출 시 타임아웃으로 복구)
  const clearTransitioning = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  // 이전 주로 이동
  const goToPreviousWeek = () => {
    if (isTransitioning) return;
    setDirection("right");
    setIsTransitioning(true);
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      return newDate;
    });
  };

  // 다음 주로 이동
  const goToNextWeek = () => {
    if (isTransitioning) return;
    setDirection("left");
    setIsTransitioning(true);
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 7);
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
    if (touchStart === null) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (touchStart === null || touchEnd === null) {
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }

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
    if (mouseStart === null || !isDragging) return;
    setMouseEnd(e.clientX);
  };

  const onMouseUp = () => {
    if (mouseStart === null || mouseEnd === null) {
      setMouseStart(null);
      setMouseEnd(null);
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

  // selectedDate가 변경되면 해당 주로 이동 (날짜 클릭/URL 변경 시)
  useEffect(() => {
    if (selectedDate) {
      const selected = getKSTDate(new Date(selectedDate));
      const weekStart = getMondayOfWeek(selected);
      setCurrentWeekStart(weekStart);
      setDirection(null);
      setIsTransitioning(false); // 전환 상태 초기화
    }
  }, [selectedDate]);

  // isTransitioning 시 안전 타임아웃 - onExitComplete 미호출 시 복구
  useEffect(() => {
    if (!isTransitioning) return;
    const timeoutId = setTimeout(clearTransitioning, TRANSITION_TIMEOUT_MS);
    return () => clearTimeout(timeoutId);
  }, [isTransitioning, clearTransitioning]);

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

  const effectiveVividFeedbackDates =
    vividFeedbackDates !== undefined ? vividFeedbackDates : aiFeedbackDates;

  return (
    <div
      ref={containerRef}
      className="relative mb-6 pb-3 md:pb-4 overflow-hidden -mx-4 px-4 max-[411px]:px-2"
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
      {/* 주간 날짜 그리드 - isLoading 시에만 스켈레톤, 슬라이드 전환은 애니메이션만 사용 */}
      <AnimatePresence
        mode="wait"
        custom={direction}
        initial={false}
        onExitComplete={clearTransitioning}
      >
        {isLoading && !isDragging ? (
          // 스켈레톤 UI 표시
          <motion.div
            key="skeleton"
            className="grid grid-cols-7 gap-2 max-[411px]:gap-1.5 md:gap-4"
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
            className="grid grid-cols-7 gap-2 max-[411px]:gap-1.5 md:gap-4"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              WebkitFontSmoothing: "antialiased",
              textRendering: "optimizeLegibility",
            }}
          >
            {weekDates.map((date, index) => {
              const dateIso = getKSTDateString(date);
              const isActive = dateIso === activeDate;
              const hasDailyVivid =
                effectiveVividFeedbackDates.includes(dateIso);
              const hasReviewFeedback = reviewFeedbackDates.includes(dateIso);
              const vividDotColor = isActive
                ? COLORS.text.white
                : COLORS.brand.primary;
              const reviewDotColor = isActive
                ? COLORS.brand.light
                : COLORS.brand.primary;
              const dayOfWeek = WEEKDAYS[index];
              const dayNumber = date.getDate();

              return (
                <div
                  key={dateIso}
                  className="flex flex-col items-center gap-1 max-[411px]:gap-0.5 md:gap-2"
                >
                  {/* 요일 */}
                  <div
                    className={`text-xs max-[411px]:text-[11px] md:text-sm font-semibold ${TRANSITIONS.colors}`}
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

                  {/* 날짜 버튼 — 리포트 카드와 동일한 박스 스타일 */}
                  <button
                    onClick={() => handleDateClick(date)}
                    className={`w-12 h-12 max-[411px]:w-10 max-[411px]:h-10 md:w-16 md:h-16 rounded-xl max-[411px]:rounded-lg md:rounded-2xl flex items-center justify-center text-sm max-[411px]:text-[13px] md:text-base font-semibold ${TRANSITIONS.default} relative`}
                    style={{
                      background: isActive
                        ? COLORS.brand.primary
                        : GRADIENT_UTILS.cardBackground(COLORS.brand.light, 0.15),
                      color: isActive ? COLORS.text.white : COLORS.text.primary,
                      border: isActive
                        ? `1.5px solid ${COLORS.brand.primary}`
                        : `1.5px solid ${GRADIENT_UTILS.borderColor(COLORS.brand.light, "30")}`,
                      boxShadow: isActive ? SHADOWS.elevation3 : SHADOWS.default,
                      transform: "none",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background =
                          GRADIENT_UTILS.cardBackground(COLORS.brand.light, 0.22);
                        e.currentTarget.style.boxShadow = SHADOWS.elevation2;
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.borderColor = GRADIENT_UTILS.borderColor(
                          COLORS.brand.light,
                          "50"
                        );
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background =
                          GRADIENT_UTILS.cardBackground(COLORS.brand.light, 0.15);
                        e.currentTarget.style.boxShadow = SHADOWS.default;
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.borderColor = GRADIENT_UTILS.borderColor(
                          COLORS.brand.light,
                          "30"
                        );
                      }
                    }}
                  >
                    {dayNumber}
                    {/* daily-vivid dot 표시 */}
                    {(hasDailyVivid || hasReviewFeedback) && (
                      <div
                        className="absolute bottom-1 max-[411px]:bottom-0.5 md:bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 md:gap-1"
                        style={{ pointerEvents: "none" }}
                      >
                        {hasDailyVivid && (
                          <div
                            className="w-1 h-1 max-[411px]:w-[3px] max-[411px]:h-[3px] md:w-1.5 md:h-1.5 rounded-full"
                            style={{
                              backgroundColor: vividDotColor,
                            }}
                          />
                        )}
                        {hasReviewFeedback && (
                          <div
                            className="w-1 h-1 max-[411px]:w-[3px] max-[411px]:h-[3px] md:w-1.5 md:h-1.5 rounded-full"
                            style={{
                              backgroundColor: reviewDotColor,
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
