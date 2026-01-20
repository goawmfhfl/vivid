import React from "react";
import { Card } from "../../ui/card";
import { cn } from "@/lib/utils";

export interface GradientCardProps {
  /** 그라디언트 색상 (RGB 값, 예: "229, 185, 107") */
  gradientColor: string;
  /** 카드 내용 */
  children: React.ReactNode;
  /** 추가 클래스명 */
  className?: string;
  /** 추가 스타일 */
  style?: React.CSSProperties;
  /** 호버 효과 활성화 */
  hover?: boolean;
}

/**
 * 그라디언트 배경을 가진 카드 컴포넌트
 * 데일리/주간/월간 비비드에서 공통으로 사용
 */
export function GradientCard({
  gradientColor,
  children,
  className,
  style,
  hover = true,
}: GradientCardProps) {
  return (
    <Card
      className={cn(
        "p-5 sm:p-6 relative overflow-hidden group transition-all duration-300",
        hover && "hover:shadow-xl hover:-translate-y-0.5",
        className
      )}
      style={{
        background: `linear-gradient(135deg, rgba(${gradientColor}, 0.12) 0%, rgba(${gradientColor}, 0.06) 50%, rgb(255, 255, 255) 100%)`,
        border: `1.5px solid rgba(${gradientColor}, 0.25)`,
        borderRadius: "20px",
        boxShadow: `0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(${gradientColor}, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)`,
        ...style,
      }}
    >
      {/* 배경 장식 */}
      <div
        className="absolute top-0 right-0 w-64 h-64 opacity-8 group-hover:opacity-12 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 80% 20%, rgba(${gradientColor}, 0.25) 0%, transparent 60%)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-48 h-48 opacity-5 group-hover:opacity-8 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 20% 80%, rgba(${gradientColor}, 0.15) 0%, transparent 50%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </Card>
  );
}
