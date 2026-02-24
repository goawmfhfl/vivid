"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { StaticImageData } from "next/image";

interface LazyMembershipImageProps {
  src: string | StaticImageData;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function LazyMembershipImage({
  src,
  alt,
  className = "",
  priority = false,
}: LazyMembershipImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(priority);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        rootMargin: "100px 0px",
        threshold: 0.01,
      }
    );

    const el = containerRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [priority]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className} transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {isVisible ? (
        <Image
          src={src}
          alt={alt}
          width={800}
          height={600}
          className="w-full h-auto object-contain"
          sizes="(max-width: 768px) 100vw, 800px"
          loading={priority ? "eager" : "lazy"}
          priority={priority}
        />
      ) : (
        <div
          className="w-full"
          style={{
            aspectRatio: "4/3",
            minHeight: 200,
            backgroundColor: "var(--color-bg-card, #f5f3ee)",
          }}
        />
      )}
    </div>
  );
}
