import { useState, useRef } from "react";
import { Calendar } from "./Calendar";
import { MonthNavigation } from "./MonthNavigation";
import type { CalendarLogMap } from "./calendar-utils";
import { COLORS, SPACING } from "@/lib/design-system";

interface CalendarSectionProps {
  year: number;
  month: number;
  monthLabel: string;
  logs: CalendarLogMap;
  selectedDate: Date;
  isLoading: boolean;
  onSelectDate: (isoDate: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function CalendarSection({
  year,
  month,
  monthLabel,
  logs,
  selectedDate,
  isLoading,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: CalendarSectionProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 최소 스와이프 거리 (픽셀)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !touchStartY) return;

    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    const deltaX = Math.abs(currentX - touchStart);
    const deltaY = Math.abs(currentY - touchStartY);

    // 수평 스와이프가 수직 스크롤보다 크면 기본 동작 방지
    if (deltaX > deltaY && deltaX > 10) {
      e.preventDefault();
    }

    setTouchEnd(currentX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && !isLoading) {
      // 왼쪽으로 스와이프 → 다음 달
      onNextMonth();
    }
    if (isRightSwipe && !isLoading) {
      // 오른쪽으로 스와이프 → 이전 달
      onPrevMonth();
    }

    // 리셋
    setTouchStart(null);
    setTouchEnd(null);
    setTouchStartY(null);
  };

  return (
    <div
      ref={containerRef}
      data-calendar-section
      className={`${SPACING.card.padding} mb-6 relative`}
      onTouchStart={(e) => {
        e.stopPropagation(); // 부모로 이벤트 전파 방지
        onTouchStart(e);
      }}
      onTouchMove={(e) => {
        e.stopPropagation(); // 부모로 이벤트 전파 방지
        onTouchMove(e);
      }}
      onTouchEnd={(e) => {
        e.stopPropagation(); // 부모로 이벤트 전파 방지
        onTouchEnd();
      }}
      style={{
        backgroundColor: "#FAFAF8",
        border: `1.5px solid ${COLORS.border.light}`,
        borderRadius: "12px",
        boxShadow: `
          0 2px 8px rgba(0,0,0,0.04),
          0 1px 3px rgba(0,0,0,0.02),
          inset 0 1px 0 rgba(255,255,255,0.6)
        `,
        position: "relative",
        overflow: "hidden",
        touchAction: "pan-y", // 수직 스크롤만 허용, 수평 스크롤 방지
        // 종이 질감 배경 패턴
        backgroundImage: `
          /* 가로 줄무늬 (프로젝트 그린 톤) */
          repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 27px,
            rgba(107, 122, 111, 0.08) 27px,
            rgba(107, 122, 111, 0.08) 28px
          ),
          /* 종이 텍스처 노이즈 */
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(107, 122, 111, 0.01) 2px,
            rgba(107, 122, 111, 0.01) 4px
          )
        `,
        backgroundSize: "100% 28px, 8px 8px",
        backgroundPosition: "0 2px, 0 0",
        filter: "contrast(1.02) brightness(1.01)",
      }}
    >
      {/* 종이 질감 오버레이 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 40%),
            radial-gradient(circle at 75% 75%, ${COLORS.brand.light}15 0%, transparent 40%)
          `,
          mixBlendMode: "overlay",
          opacity: 0.5,
        }}
      />

      {/* 내용 영역 */}
      <div className="relative z-10">
      <MonthNavigation
        monthLabel={monthLabel}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
        isLoading={isLoading}
      />

      <Calendar
        year={year}
        month={month}
        logs={logs}
        onSelectDate={onSelectDate}
        locale="ko"
        startOfWeek="sun"
        selectedDate={selectedDate}
      />
      </div>
    </div>
  );
}
