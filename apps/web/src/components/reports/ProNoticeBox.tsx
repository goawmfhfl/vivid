"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { COLORS, SHADOWS, GRADIENT_UTILS, TYPOGRAPHY } from "@/lib/design-system";

interface ProNoticeBoxProps {
  message: string;
  className?: string;
}

/**
 * 비Pro 사용자에게 Pro 멤버십 시 얻을 수 있는 혜택을 안내하고
 * 구독하기 버튼을 제공하는 공통 Notice 박스.
 * 업데이트된 리포트 페이지 카드 디자인과 시각적으로 통일됨.
 */
export function ProNoticeBox({ message, className = "" }: ProNoticeBoxProps) {
  const router = useRouter();

  return (
    <div
      className={`rounded-xl overflow-hidden relative ${className}`}
      style={{
        background: GRADIENT_UTILS.cardBackground(COLORS.brand.light, 0.18),
        border: `1.5px solid ${GRADIENT_UTILS.borderColor(COLORS.brand.primary, "35")}`,
        borderRadius: "20px",
        boxShadow: SHADOWS.default,
      }}
    >
      {/* 배경 장식 그라디언트 */}
      <div
        className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none"
        style={{
          background: GRADIENT_UTILS.decoration(COLORS.brand.primary, 0.5),
        }}
      />
      <div className="p-4 sm:p-5 relative z-0">
        <div className="flex items-start gap-3 sm:gap-4">
          <div
            className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
            style={{
              background: GRADIENT_UTILS.iconBadge(COLORS.brand.primary, 0.08),
              boxShadow: `0 2px 8px ${COLORS.brand.primary}35`,
            }}
          >
            <Sparkles
              className="w-4 h-4 sm:w-5 sm:h-5"
              style={{ color: COLORS.brand.primary }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={TYPOGRAPHY.body.fontSize}
              style={{
                color: COLORS.text.primary,
                lineHeight: "1.6",
              }}
            >
              {message}
            </p>
            <button
              type="button"
              onClick={() => router.push("/membership")}
              className="mt-3 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98]"
              style={{
                color: COLORS.text.white,
                background: `linear-gradient(135deg, ${COLORS.brand.primary} 0%, ${COLORS.brand.dark} 100%)`,
                boxShadow: `0 2px 8px ${COLORS.brand.primary}40`,
              }}
            >
              Pro 멤버 구독하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
