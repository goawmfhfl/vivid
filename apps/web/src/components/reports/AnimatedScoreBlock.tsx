"use client";

import { useCountUp } from "@/hooks/useCountUp";
import { useInViewOnce } from "@/hooks/useInViewOnce";
import { COLORS } from "@/lib/design-system";

interface AnimatedScoreBlockProps {
  score: number;
  accentColor: string;
  trackColor?: string;
  durationMs?: number;
  /** stacked: 점수 위, 그래프 아래. inline: 한 줄에 왼쪽 점수, 오른쪽 그래프(작은 크기) */
  layout?: "stacked" | "inline";
  className?: string;
}

/**
 * 점수 + 차오르는 막대 게이지. 뷰포트에 들어오면 숫자 카운트업 + 게이지 채우기 애니메이션.
 * layout=inline: 제목 아래 일열 배치(왼쪽 점수, 오른쪽 작은 그래프).
 */
export function AnimatedScoreBlock({
  score,
  accentColor,
  trackColor = COLORS.border.light,
  durationMs = 1200,
  layout = "stacked",
  className = "",
}: AnimatedScoreBlockProps) {
  const { ref, isInView } = useInViewOnce<HTMLDivElement>(0.1, "0px 0px -5% 0px");
  const displayValue = useCountUp(score, durationMs, isInView);
  const percent = Math.min(100, Math.max(0, score));
  const animatedPercent = isInView ? percent : 0;

  const isInline = layout === "inline";

  return (
    <div
      ref={ref}
      className={className}
      style={{
        display: "flex",
        flexDirection: isInline ? "row" : "column",
        alignItems: isInline ? "center" : "stretch",
        justifyContent: isInline ? "space-between" : undefined,
        gap: isInline ? 8 : undefined,
      }}
    >
      <div className="flex items-baseline gap-0.5 sm:gap-1 flex-shrink-0">
        <span
          className="font-semibold tabular-nums tracking-tight"
          style={{
            color: accentColor,
            fontSize: isInline ? undefined : "2.25rem",
          }}
        >
          {isInline ? (
            <span className="text-base sm:text-xl">{displayValue}</span>
          ) : (
            displayValue
          )}
        </span>
        <span
          className="font-medium text-xs sm:text-sm"
          style={{
            color: COLORS.text.muted,
            fontSize: !isInline ? "1rem" : undefined,
          }}
        >
          / 100
        </span>
      </div>
      <div
        className="rounded-full overflow-hidden flex-shrink-0 h-1.5 w-16 sm:h-2 sm:w-[88px]"
        style={{
          height: isInline ? undefined : 12,
          width: isInline ? undefined : "100%",
          backgroundColor: trackColor,
        }}
        role="progressbar"
        aria-valuenow={displayValue}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${animatedPercent}%`,
            backgroundColor: accentColor,
            transitionProperty: "width",
          }}
        />
      </div>
    </div>
  );
}
