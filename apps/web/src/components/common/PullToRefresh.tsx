 "use client";
 
 import { useEffect, useRef, useState } from "react";
import {
  COLORS,
  GRADIENT_UTILS,
  ICON_BADGE_STYLES,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from "@/lib/design-system";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type PullToRefreshProps = {
  children: React.ReactNode;
  threshold?: number;
  onRefresh?: () => Promise<void> | void;
};

export function PullToRefresh({
  children,
  threshold = 60,
  onRefresh,
}: PullToRefreshProps) {
  const startYRef = useRef<number | null>(null);
  const pullingRef = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      if (isRefreshing) return;
      if (window.scrollY > 0) return;
      startYRef.current = event.touches[0]?.clientY ?? null;
      pullingRef.current = true;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!pullingRef.current || startYRef.current === null) return;
      const currentY = event.touches[0]?.clientY ?? 0;
      const distance = Math.max(0, currentY - startYRef.current);

      if (distance > 0) {
        const nextDistance = Math.min(distance, threshold * 1.6);
        setPullDistance(nextDistance);
        setIsReady(nextDistance >= threshold);
      }
    };

    const handleTouchEnd = () => {
      if (!pullingRef.current) return;
      pullingRef.current = false;

      if (pullDistance >= threshold && !isRefreshing && onRefresh) {
        setIsRefreshing(true);
        setIsReady(false);
        setPullDistance(threshold);
        Promise.resolve(onRefresh()).finally(() => {
          const settleDistance = Math.max(18, threshold * 0.35);
          setPullDistance(settleDistance);
          setTimeout(() => {
            setPullDistance(0);
          }, 120);
          setTimeout(() => {
            setIsRefreshing(false);
          }, 220);
        });
      } else {
        setPullDistance(0);
        setIsReady(false);
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isRefreshing, pullDistance, threshold, onRefresh]);
 
   useEffect(() => {
     if (!isRefreshing && pullDistance === 0) return;
     if (isRefreshing) return;
 
     const resetTimeout = setTimeout(() => {
       setPullDistance(0);
       setIsReady(false);
     }, 200);
 
     return () => clearTimeout(resetTimeout);
   }, [pullDistance, isRefreshing]);
 
  const progress = Math.min(1, pullDistance / threshold);
  const badgeStyle = ICON_BADGE_STYLES.small(COLORS.brand.primary);

  return (
     <div>
       <div
         className="flex items-center justify-center"
         style={{
           height: pullDistance,
           transition: isRefreshing ? "height 0.2s ease" : undefined,
         }}
       >
         {(pullDistance > 10 || isRefreshing) && (
           <div
            className={cn(
              "flex items-center",
              SPACING.element.gapSmall,
              "px-4 py-2"
            )}
             style={{
              opacity: Math.min(1, progress + 0.2),
              color: COLORS.text.secondary,
              background: GRADIENT_UTILS.cardBackground(
                COLORS.brand.primary,
                0.08,
                COLORS.background.cardElevated
              ),
              border: `1px solid ${COLORS.border.light}`,
              borderRadius: "999px",
              boxShadow: SHADOWS.elevation1,
              transform: `translateY(${Math.min(12, pullDistance / 6)}px) scale(${
                0.92 + progress * 0.08
              })`,
              transition: "transform 0.2s ease, opacity 0.2s ease",
             }}
           >
            <div
              className={cn(
                "flex items-center justify-center",
                badgeStyle.width,
                badgeStyle.borderRadius
              )}
              style={{
                background: badgeStyle.background,
                boxShadow: badgeStyle.boxShadow,
              }}
            >
              <Loader2
                className={cn(
                  "w-4 h-4",
                  isRefreshing ? "animate-spin" : "transition-transform"
                )}
                style={{
                  color: COLORS.text.white,
                  transform: isRefreshing
                    ? undefined
                    : `rotate(${Math.min(180, progress * 180)}deg)`,
                }}
              />
            </div>
            <span
              className={cn(
                TYPOGRAPHY.bodySmall.fontSize,
                TYPOGRAPHY.bodySmall.fontWeight,
                TYPOGRAPHY.bodySmall.lineHeight
              )}
            >
              { isRefreshing && "새로고침 중..."}
             </span>
           </div>
         )}
       </div>
       {children}
     </div>
   );
 }
