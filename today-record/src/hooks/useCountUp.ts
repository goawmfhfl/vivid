import { useState, useEffect, useRef, RefObject } from "react";

interface UseCountUpOptions {
  targetValue: number;
  duration?: number;
  delay?: number;
  startValue?: number;
  easing?: (progress: number) => number;
  triggerOnVisible?: boolean;
  threshold?: number;
  rootMargin?: string;
}

// 기본 easing 함수 (ease-out cubic)
const defaultEasing = (progress: number) => 1 - Math.pow(1 - progress, 3);

export function useCountUp({
  targetValue,
  duration = 1000,
  delay = 0,
  startValue = 0,
  easing = defaultEasing,
  triggerOnVisible = false,
  threshold = 0.3,
  rootMargin = "0px 0px -50px 0px",
}: UseCountUpOptions): [number, RefObject<HTMLDivElement | null>] {
  const [count, setCount] = useState(startValue);
  const [hasStarted, setHasStarted] = useState(false);
  const animationIdRef = useRef<number | null>(null);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const easingRef = useRef(easing);
  const containerRef = useRef<HTMLDivElement>(null);

  // easing 함수 업데이트 (dependency 문제 방지)
  useEffect(() => {
    easingRef.current = easing;
  }, [easing]);

  // Intersection Observer 설정
  useEffect(() => {
    if (!triggerOnVisible || hasStarted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [triggerOnVisible, hasStarted, threshold, rootMargin]);

  // 애니메이션 시작
  useEffect(() => {
    // triggerOnVisible이 true이고 아직 시작하지 않았으면 대기
    if (triggerOnVisible && !hasStarted) return;

    // 기존 애니메이션 정리
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }

    setCount(startValue);

    // 지연 후 애니메이션 시작
    timeoutIdRef.current = setTimeout(() => {
      const startTime = Date.now();
      const endValue = targetValue;

      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easedProgress = easingRef.current(progress);
        const currentValue = Math.floor(
          startValue + (endValue - startValue) * easedProgress
        );

        setCount(currentValue);

        if (progress < 1) {
          animationIdRef.current = requestAnimationFrame(animate);
        } else {
          setCount(endValue);
          animationIdRef.current = null;
        }
      };

      animationIdRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [targetValue, duration, delay, startValue, triggerOnVisible, hasStarted]);

  return [count, containerRef];
}
