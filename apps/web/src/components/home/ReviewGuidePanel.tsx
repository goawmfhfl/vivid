"use client";

import { X } from "lucide-react";
import { COLORS, CARD_STYLES } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface ReviewGuidePanelProps {
  open: boolean;
  onClose: () => void;
}

export function ReviewGuidePanel({ open, onClose }: ReviewGuidePanelProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200"
      role="dialog"
      aria-label="회고 탭 가이드"
    >
      {/* 배경 딤 (클릭 시 닫기) */}
      <button
        type="button"
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
        aria-label="가이드 닫기"
      />

      {/* 중앙 패널: viewport 365 기준 컴팩트 크기 */}
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
            오늘의 나는 어떤 하루를 보냈을까?
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
              회고란은 어떤걸 적는건가요?
            </h3>
            <p style={{ color: COLORS.text.secondary }}>
              회고란은 오늘의 나는 어떤 하루를 보냈을까?라는 질문에 대한 답변을
              적는 칸입니다.
            </p>
          </section>

          <section>
            <h3
              className="text-xs font-semibold mb-1"
              style={{ color: COLORS.text.primary }}
            >
              회고를 적으면?
            </h3>
            <p style={{ color: COLORS.text.secondary }}>
              이 칸에 오늘의 회고를 적어 주시면,
              {" "}
              <strong style={{ color: COLORS.brand.primary }}>
                오늘의 회고 생성하기
              </strong>
              를 눌러 리포트를 만들 수 있습니다.
            </p>
          </section>

          <section>
            <h3
              className="text-xs font-semibold mb-1"
              style={{ color: COLORS.text.primary }}
            >
              어떤 인사이트를 주나요?
            </h3>
            <p style={{ color: COLORS.text.secondary }}>
              비비드 기록과 합쳐진 인사이트와, 오늘 보낸 하루에 대한 정리, 그리고{" "}
              <strong style={{ color: COLORS.brand.primary }}>
                할 일 달성률
              </strong>{" "}
              인사이트를 얻을 수 있습니다.
            </p>
          </section>

          <section>
            <h3
              className="text-xs font-semibold mb-1"
              style={{ color: COLORS.text.primary }}
            >
              생성하기가 비활성화된 이유
            </h3>
            <p style={{ color: COLORS.text.secondary }}>
              오늘의 회고를 생성하려면 먼저{" "}
              <strong style={{ color: COLORS.brand.primary }}>비비드 탭</strong>에서
              &quot;오늘의 비비드&quot; 기록이 있어야 하고, 그다음 이{" "}
              <strong style={{ color: COLORS.brand.primary }}>회고 탭</strong>에서
              회고를 작성해 주셔야 합니다.
              <br/>
              두 가지가 모두 있을 때만 버튼이
              활성화됩니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
