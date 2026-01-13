"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { COLORS, TYPOGRAPHY, SHADOWS } from "@/lib/design-system";
import { cn } from "@/lib/utils";

export interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number; // 표시 시간 (ms)
}

/**
 * 하단 팝업 메시지 컴포넌트
 * 타이머 완료 등 간단한 알림에 사용
 */
export function Toast({
  message,
  isVisible,
  onClose,
  duration = 3000,
}: ToastProps) {
  const [isShowing, setIsShowing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible && message) {
      // 약간의 지연 후 표시 시작 (애니메이션을 자연스럽게)
      const showTimer = setTimeout(() => {
        setIsShowing(true);
        setIsAnimating(true);
      }, 10);

      const hideTimer = setTimeout(() => {
        // 애니메이션을 위해 먼저 isAnimating을 false로 설정
        setIsAnimating(false);
        // 애니메이션 완료 후 상태 초기화 및 onClose 호출
        setTimeout(() => {
          setIsShowing(false);
          onClose();
        }, 350); // transition duration과 맞춤
      }, duration);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    } else {
      // isVisible이 false가 되면 즉시 숨김
      setIsAnimating(false);
      const hideTimer = setTimeout(() => {
        setIsShowing(false);
      }, 350);
      return () => clearTimeout(hideTimer);
    }
  }, [isVisible, message, duration, onClose]);

  // message가 없거나, isVisible이 false이고 애니메이션도 끝났으면 렌더링하지 않음
  if (!message || (!isVisible && !isShowing)) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed left-1/2 -translate-x-1/2",
        "flex items-center gap-3 px-4 py-3 rounded-xl",
        "pointer-events-auto"
      )}
      style={{
        bottom: "5.5rem", // 바텀 네비게이션 위에 표시 (약 88px)
        zIndex: 9999, // 바텀 네비게이션(z-100)보다 훨씬 높게
        backgroundColor: COLORS.background.cardElevated,
        border: `1.5px solid ${COLORS.border.default}`,
        boxShadow: SHADOWS.elevation4,
        minWidth: "200px",
        maxWidth: "90vw",
        ...TYPOGRAPHY.body,
        color: COLORS.text.primary,
        opacity: isAnimating ? 1 : 0,
        transform: isAnimating
          ? "translateY(0) scale(1)"
          : "translateY(1rem) scale(0.95)",
        transition: "opacity 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <CheckCircle2
        className="w-5 h-5 flex-shrink-0"
        style={{ color: COLORS.status.success }}
      />
      <span 
        className="flex-1 text-center"
        style={{ whiteSpace: "nowrap" }}
      >
        {message}
      </span>
    </div>
  );
}
