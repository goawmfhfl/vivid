"use client";

import { useRef, useState, useEffect } from "react";

export function useInViewOnce<T extends HTMLElement>(
  threshold: number = 0.15,
  rootMargin: string = "0px 0px -10% 0px"
) {
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isInView, threshold, rootMargin]);

  return { ref, isInView };
}
