"use client";

import { X } from "lucide-react";
import { COLORS, CARD_STYLES } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface TodoGuidePanelProps {
  open: boolean;
  onClose: () => void;
}

export function TodoGuidePanel({ open, onClose }: TodoGuidePanelProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200"
      role="dialog"
      aria-label="할 일 탭 가이드"
    >
      {/* 배경 딤 (클릭 시 닫기) */}
      <button
        type="button"
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
        aria-label="가이드 닫기"
      />

      {/* 중앙 패널 */}
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
            할 일을 체크하고 관리하면?
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
              회고 생성 시
            </h3>
            <p style={{ color: COLORS.text.secondary }}>
              할 일을 체크하고 관리하면,{" "}
              <strong style={{ color: COLORS.brand.primary }}>
                회고 생성 시 유의미한 인사이트
              </strong>
              가 반영됩니다.
            </p>
          </section>

          <section>
            <h3
              className="text-xs font-semibold mb-1"
              style={{ color: COLORS.text.primary }}
            >
              리포트에 반영
            </h3>
            <p style={{ color: COLORS.text.secondary }}>
              실행한 할 일과 미룬 할 일에 관한 인사이트가 { " " }
              <strong style={{ color: COLORS.brand.primary }}>
                 리포트에 반영
              </strong>
               됩니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
