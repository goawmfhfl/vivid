import { useState, useEffect } from "react";

/**
 * 숫자를 0에서 목표값까지 카운트업하는 훅
 */
export function useCountUp(
  targetValue: number,
  duration: number = 1000,
  enabled: boolean = true
): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setCount(targetValue);
      return;
    }

    setCount(0);
    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutCubic easing function
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + (targetValue - startValue) * easeOutCubic);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(targetValue);
      }
    };

    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [targetValue, duration, enabled]);

  return count;
}
