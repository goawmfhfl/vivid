"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { COLORS, CARD_STYLES, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface VividGuidePanelProps {
  open: boolean;
  onClose: () => void;
}

export function VividGuidePanel({ open, onClose }: VividGuidePanelProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200"
      role="dialog"
      aria-label="VIVID 탭 가이드"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
        aria-label="가이드 닫기"
      />

      <div
        className={cn(
          "relative z-10 mx-3 rounded-xl shadow-lg overflow-hidden p-3 w-full"
        )}
        style={{
          ...CARD_STYLES.default,
          backgroundColor: COLORS.background.cardElevated,
          border: `1.5px solid ${COLORS.border.light}`,
          boxShadow: `
            0 4px 24px rgba(0,0,0,0.08),
            0 2px 8px rgba(0,0,0,0.04),
            inset 0 1px 0 rgba(255,255,255,0.8)
          `,
          maxWidth: "min(365px, calc(100vw - 24px))",
        }}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <h2
            className="text-base font-semibold leading-tight"
            style={{ color: COLORS.brand.primary }}
          >
            VIVID 가이드북
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md transition-colors hover:opacity-80 flex-shrink-0"
            style={{
              backgroundColor: COLORS.background.hover,
              color: COLORS.text.secondary,
            }}
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          className="space-y-3"
          style={{
            color: COLORS.text.primary,
            fontSize: "0.75rem",
            lineHeight: 1.5,
          }}
        >
          <section>
            <h3
              className="text-xs font-semibold mb-1"
              style={{ color: COLORS.text.primary }}
            >
              오늘 하루를 어떻게 보낼까?
            </h3>
            <p style={{ color: COLORS.text.secondary }}>
              오늘의 계획과 의도를 미리 생각해 적어보세요. 하루를 어떻게 보낼지
              정해두면 더 의미 있는 하루가 되고, 주간·월간 리포트에서 나다운 삶에
              대한 인사이트를 얻을 수 있습니다.
            </p>
          </section>

          <section>
            <h3
              className="text-xs font-semibold mb-1"
              style={{ color: COLORS.text.primary }}
            >
              앞으로의 나는 어떤 모습일까?
            </h3>
            <p style={{ color: COLORS.text.secondary }}>
              꿈, 목표, 되고 싶은 모습을 자유롭게 기록해보세요. 미래의 나에 대한
              생각을 꾸준히 적으면 VIVID 리포트에서 나를 선명하게 보여주는
              인사이트로 이어집니다.
            </p>
          </section>
        </div>

        <Link
          href="/guide/recording"
          onClick={onClose}
          className={cn(
            "mt-4 w-full flex items-center justify-center py-2.5 rounded-xl transition-all hover:opacity-90 active:scale-[0.98]",
            TYPOGRAPHY.body.fontSize,
            TYPOGRAPHY.body.fontWeight
          )}
          style={{
            backgroundColor: COLORS.brand.primary,
            color: COLORS.text.white,
            border: `1.5px solid ${COLORS.brand.primary}`,
          }}
        >
          왜 VIVID 기록을 하나요?
        </Link>
      </div>
    </div>
  );
}
