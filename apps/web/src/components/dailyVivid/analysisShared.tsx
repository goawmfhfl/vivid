import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { COLORS, SHADOWS, hexToRgba } from "@/lib/design-system";

type ChartGlassCardProps = {
  gradientColor: string;
  children: ReactNode;
};

export function ChartGlassCard({ gradientColor, children }: ChartGlassCardProps) {
  return (
    <div
      className="p-6 sm:p-7 relative overflow-hidden group transition-transform duration-300 hover:-translate-y-0.5"
      style={{
        background: `linear-gradient(135deg, rgba(${gradientColor}, 0.18) 0%, rgba(${gradientColor}, 0.08) 45%, ${COLORS.glass.surface} 100%)`,
        border: `1px solid rgba(${gradientColor}, 0.35)`,
        borderRadius: "24px",
        boxShadow: `${SHADOWS.glowSoft}, inset 0 1px 0 ${COLORS.glass.highlight}`,
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
      }}
    >
      <div
        className="absolute top-0 right-0 w-64 h-64 opacity-12 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 80% 20%, rgba(${gradientColor}, 0.28) 0%, transparent 60%)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-48 h-48 opacity-8 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 20% 80%, rgba(${gradientColor}, 0.2) 0%, transparent 50%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          background:
            `linear-gradient(120deg, ${hexToRgba(
              COLORS.text.white,
              0.35
            )} 0%, ${hexToRgba(
              COLORS.text.white,
              0.08
            )} 35%, transparent 60%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function useInViewOnce<T extends HTMLElement>(
  threshold: number = 0.2,
  rootMargin: string = "0px 0px -10% 0px"
) {
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || isInView) return;

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

    observer.observe(element);
    return () => observer.disconnect();
  }, [isInView, threshold, rootMargin]);

  return { ref, isInView };
}
