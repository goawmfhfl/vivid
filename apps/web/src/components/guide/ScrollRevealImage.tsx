"use client";

import { useEffect, useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { cn } from "@/lib/utils";
import { COLORS, TRANSITIONS } from "@/lib/design-system";

interface ScrollRevealImageProps {
  src: StaticImageData;
  alt: string;
  index: number;
  className?: string;
}

/**
 * 스크롤 시 뷰포트에 진입할 때마다 순차적으로 노출되는 이미지 컴포넌트
 * - Intersection Observer 기반 레이지 로딩
 * - fade-in + slide-up 애니메이션
 */
export function ScrollRevealImage({
  src,
  alt,
  index,
  className = "",
}: ScrollRevealImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        rootMargin: "80px 0px",
        threshold: 0.05,
      }
    );

    const el = containerRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full",
        TRANSITIONS.default,
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-6",
        className
      )}
      style={{
        transitionDuration: isVisible ? "500ms" : "0ms",
        transitionDelay: isVisible ? `${index * 80}ms` : "0ms",
      }}
    >
      {isVisible ? (
        <Image
          src={src}
          alt={alt}
          width={src.width}
          height={src.height}
          className="w-full h-auto object-contain rounded-lg"
          sizes="(max-width: 768px) 100vw, 1080px"
          loading="lazy"
          placeholder="blur"
        />
      ) : (
        <div
          className="w-full rounded-lg"
          style={{
            aspectRatio: `${src.width} / ${src.height}`,
            minHeight: 180,
            backgroundColor: COLORS.background.card,
          }}
        />
      )}
    </div>
  );
}
