"use client";

import { BaseModal } from "./BaseModal";
import { DialogTitle } from "../dialog";
import { LoadingSpinner } from "../LoadingSpinner";
import { COLORS } from "@/lib/design-system";
import { useCountUp } from "@/hooks/useCountUp";

interface LoadingModalProps {
  open: boolean;
  message?: string;
  closable?: boolean;
  onClose?: () => void;
  progress?: {
    current: number;
    total: number;
    currentStep: string;
  };
}

export function LoadingModal({
  open,
  message = "처리 중입니다...",
  closable = false,
  onClose,
  progress,
}: LoadingModalProps) {
  const progressPercentage = progress
    ? Math.round((progress.current / progress.total) * 100)
    : undefined;
  
  const animatedProgress = useCountUp(progressPercentage ?? 0, 1000, !!progress);

  return (
    <BaseModal open={open} closable={closable} onClose={onClose}>
      <DialogTitle className="sr-only">로딩 중</DialogTitle>
      <div className="py-8 px-6">
        <LoadingSpinner message={message} size="md" showMessage={true} />

        {progress && (
          <div className="mt-6 space-y-3">
            {/* 진행률 바 */}
            <div className="w-full">
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{
                  backgroundColor: COLORS.background.hover,
                }}
              >
                <div
                  className="h-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${animatedProgress}%`,
                    backgroundColor: COLORS.brand.primary,
                  }}
                />
              </div>
            </div>

            {/* 진행률 텍스트 */}
            <div className="text-center">
              <div
                className="text-sm font-medium"
                style={{ color: COLORS.text.primary }}
              >
                {animatedProgress}% 완료
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: COLORS.text.secondary }}
              >
                {progress.currentStep} 생성 중... ({progress.current}/
                {progress.total})
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
