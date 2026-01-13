"use client";

import { useCallback } from "react";
import { useToastStore } from "@/store/useToastStore";

/**
 * Toast 메시지를 표시하기 위한 커스텀 훅
 * 어디서든 간편하게 Toast를 사용할 수 있습니다.
 *
 * @example
 * ```tsx
 * const { showToast } = useToast();
 *
 * const handleSuccess = () => {
 *   showToast("작업이 완료되었습니다!");
 * };
 * ```
 */
export function useToast() {
  const showToast = useToastStore((state) => state.showToast);
  const hideToast = useToastStore((state) => state.hideToast);
  const toast = useToastStore((state) => state.toast);

  const show = useCallback(
    (message: string, duration?: number) => {
      showToast(message, duration);
    },
    [showToast]
  );

  const hide = useCallback(() => {
    hideToast();
  }, [hideToast]);

  return {
    showToast: show,
    hideToast: hide,
    toast,
  };
}
