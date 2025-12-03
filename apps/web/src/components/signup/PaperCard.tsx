import { ReactNode } from "react";
import { COLORS } from "@/lib/design-system";

interface PaperCardProps {
  children: ReactNode;
  className?: string;
}

export function PaperCard({ children, className = "" }: PaperCardProps) {
  return (
    <div
      className={`relative ${className}`}
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
        overflow: "visible",
      }}
    >
      {/* 종이 질감 배경 패턴 (내부 컨테이너) */}
      <div
        className="absolute inset-0 pointer-events-none rounded-[12px]"
        style={{
          overflow: "hidden",
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
      />

      {/* 종이 질감 오버레이 */}
      <div
        className="absolute inset-0 pointer-events-none rounded-[12px]"
        style={{
          background: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 40%),
            radial-gradient(circle at 75% 75%, ${COLORS.brand.light}15 0%, transparent 40%)
          `,
          mixBlendMode: "overlay",
          opacity: 0.5,
          overflow: "hidden",
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
