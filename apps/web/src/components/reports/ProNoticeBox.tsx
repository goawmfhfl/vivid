"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { COLORS, SHADOWS } from "@/lib/design-system";

interface ProNoticeBoxProps {
  message: string;
  className?: string;
}

/**
 * 비Pro 사용자에게 Pro 멤버십 시 얻을 수 있는 혜택을 안내하고
 * 구독하기 버튼을 제공하는 공통 Notice 박스.
 */
export function ProNoticeBox({ message, className = "" }: ProNoticeBoxProps) {
  const router = useRouter();

  return (
    <div
      className={`rounded-xl overflow-hidden ${className}`}
      style={{
        backgroundColor: COLORS.background.cardElevated,
        border: `1px solid ${COLORS.border.light}`,
        boxShadow: SHADOWS.default,
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: `${COLORS.brand.primary}18`,
            }}
          >
            <Sparkles
              className="w-4 h-4"
              style={{ color: COLORS.brand.primary }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-sm leading-relaxed"
              style={{ color: COLORS.text.primary }}
            >
              {message}
            </p>
            <button
              type="button"
              onClick={() => router.push("/membership")}
              className="mt-3 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98]"
              style={{
                color: COLORS.text.white,
                backgroundColor: COLORS.brand.primary,
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
