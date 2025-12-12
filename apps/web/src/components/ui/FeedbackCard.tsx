"use client";

import { Card } from "@/components/ui/card";
import {
  COLORS,
  SPACING,
  SHADOWS,
  TRANSITIONS,
  GRADIENT_UTILS,
} from "@/lib/design-system";
import { cn } from "@/lib/utils";

export interface FeedbackCardProps {
  // 헤더
  icon: React.ReactNode;
  iconColor: string; // 아이콘 배경색
  title: string;
  subtitle?: string; // 선택적 부제목

  // 스타일 커스터마이징
  gradientColor?: string; // 그라디언트 시작 색상 (기본: brand.primary)
  borderColor?: string; // 테두리 색상
  variant?: "default" | "compact"; // 크기 변형

  // 콘텐츠
  children: React.ReactNode;

  // 옵션
  showHeader?: boolean; // 헤더 표시 여부 (기본: true)
  showBackgroundDecoration?: boolean; // 배경 장식 표시 여부 (기본: true)
  className?: string;
}

/**
 * 피드백 리포트에서 사용하는 공통 Card 컴포넌트
 * 월간 피드백의 Card 디자인 패턴을 재사용 가능한 컴포넌트로 추출
 */
export function FeedbackCard({
  icon,
  iconColor,
  title,
  subtitle,
  gradientColor,
  borderColor,
  variant = "default",
  children,
  showHeader = true,
  showBackgroundDecoration = true,
  className,
}: FeedbackCardProps) {
  // 기본 색상 설정
  const defaultGradientColor = gradientColor || COLORS.brand.primary;
  const defaultBorderColor =
    borderColor || GRADIENT_UTILS.borderColor(defaultGradientColor);

  // 그라디언트 배경 생성
  const gradientBackground = GRADIENT_UTILS.cardBackground(
    defaultGradientColor,
    0.12
  );

  // 배경 장식 그라디언트
  const decorationGradient = GRADIENT_UTILS.decoration(
    defaultGradientColor,
    0.8
  );

  // 패딩 설정
  const padding = variant === "compact" ? "p-4 sm:p-5" : SPACING.card.padding;

  return (
    <Card
      className={cn(
        "relative overflow-hidden group",
        padding,
        TRANSITIONS.default,
        className
      )}
      style={{
        background: gradientBackground,
        border: `1.5px solid ${defaultBorderColor}`,
        borderRadius: "20px",
        boxShadow: SHADOWS.lg,
      }}
    >
      {/* 배경 장식 */}
      {showBackgroundDecoration && (
        <div
          className="absolute top-0 right-0 w-48 h-48 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
          style={{
            background: decorationGradient,
          }}
        />
      )}

      {/* 헤더 */}
      {showHeader && (
        <div
          className={cn("pb-4 mb-4 border-b relative z-10")}
          style={{ borderColor: `${defaultGradientColor}20` }}
        >
          <div className="flex items-center gap-4">
            {/* 아이콘 */}
            <div
              className={cn(
                "rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110",
                variant === "compact" ? "w-10 h-10" : "w-12 h-12"
              )}
              style={{
                background: GRADIENT_UTILS.iconBadge(iconColor, 0.1),
                boxShadow: `0 4px 12px ${iconColor}30`,
              }}
            >
              <div className="text-white">
                {variant === "compact" ? (
                  <div className="w-5 h-5">{icon}</div>
                ) : (
                  <div className="w-6 h-6">{icon}</div>
                )}
              </div>
            </div>

            {/* 제목 영역 */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p
                  className={cn(
                    "font-semibold",
                    variant === "compact" ? "text-sm" : "text-sm"
                  )}
                  style={{ color: COLORS.text.primary }}
                >
                  {title}
                </p>
              </div>
              {subtitle && (
                <p
                  className={cn(
                    "mt-1",
                    variant === "compact" ? "text-xs" : "text-xs"
                  )}
                  style={{ color: COLORS.text.secondary }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 바디 */}
      <div className="relative z-10">{children}</div>
    </Card>
  );
}
