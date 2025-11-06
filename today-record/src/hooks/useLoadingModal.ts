"use client";

import { useState, useCallback } from "react";

interface UseLoadingModalReturn {
  isOpen: boolean;
  message: string;
  open: (message?: string) => void;
  close: () => void;
  setMessage: (message: string) => void;
}

/**
 * 로딩 모달 상태를 관리하는 커스텀 훅
 * @param defaultMessage 기본 메시지
 * @returns 로딩 모달 상태 및 제어 함수들
 */
export function useLoadingModal(
  defaultMessage: string = "처리 중입니다..."
): UseLoadingModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(defaultMessage);

  const open = useCallback((newMessage?: string) => {
    if (newMessage) {
      setMessage(newMessage);
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const updateMessage = useCallback((newMessage: string) => {
    setMessage(newMessage);
  }, []);

  return {
    isOpen,
    message,
    open,
    close,
    setMessage: updateMessage,
  };
}
