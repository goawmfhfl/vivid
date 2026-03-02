"use client";

import { X } from "lucide-react";
import { COLORS, CARD_STYLES, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTodoCompletionSetting, getExcludeTodoCompletion } from "@/hooks/useTodoCompletionSetting";

interface TodoSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function TodoSettingsModal({ open, onClose }: TodoSettingsModalProps) {
  const { data: user } = useCurrentUser();
  const updateSetting = useTodoCompletionSetting();
  const excludeTodoCompletion = getExcludeTodoCompletion(user?.user_metadata);

  if (!open) return null;

  const handleToggle = () => {
    updateSetting.mutate(!excludeTodoCompletion, {
      onError: (err) => {
        console.error("설정 업데이트 실패:", err);
      },
    });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200"
      role="dialog"
      aria-label="할 일 설정"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
        aria-label="설정 닫기"
      />

      <div
        className={cn(
          "relative z-10 mx-3 rounded-xl shadow-lg overflow-hidden p-4 w-full"
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
        <div className="flex items-start justify-between gap-2 mb-4">
          <h2
            className="text-base font-semibold leading-tight"
            style={{ color: COLORS.brand.primary }}
          >
            할 일 설정
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

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium"
                style={{ color: COLORS.text.primary }}
              >
                할 일 달성률 계산하지 않기
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: COLORS.text.muted }}
              >
                활성화 시 주간·월간·일간 리포트와 회고에서 할 일 달성률이 표시되지 않습니다.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={excludeTodoCompletion}
              onClick={handleToggle}
              disabled={updateSetting.isPending}
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50"
            style={{
              backgroundColor: excludeTodoCompletion
                ? COLORS.primary[600]
                : COLORS.border.light,
            }}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  excludeTodoCompletion ? "translate-x-5" : "translate-x-0.5"
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
