"use client";

import { useState, useCallback } from "react";

interface UseErrorModalReturn {
  isOpen: boolean;
  message: string | null;
  retryHandler: (() => void) | undefined;
  open: (message: string, onRetry?: () => void) => void;
  close: () => void;
  setMessage: (message: string) => void;
  setRetryHandler: (handler: (() => void) | undefined) => void;
}

/**
 * 에러 모달 상태를 관리하는 커스텀 훅
 * @param defaultMessage 기본 에러 메시지
 * @returns 에러 모달 상태 및 제어 함수들
 */
export function useErrorModal(
  defaultMessage: string = "오류가 발생했습니다. 다시 시도해주세요."
): UseErrorModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(defaultMessage);
  const [retryHandler, setRetryHandler] = useState<(() => void) | undefined>(
    undefined
  );

  const open = useCallback((newMessage: string, onRetry?: () => void) => {
    setMessage(newMessage);
    setRetryHandler(() => onRetry);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setMessage(null);
    setRetryHandler(undefined);
  }, []);

  const updateMessage = useCallback((newMessage: string) => {
    setMessage(newMessage);
  }, []);

  const updateRetryHandler = useCallback(
    (handler: (() => void) | undefined) => {
      setRetryHandler(() => handler);
    },
    []
  );

  return {
    isOpen,
    message,
    retryHandler,
    open,
    close,
    setMessage: updateMessage,
    setRetryHandler: updateRetryHandler,
  };
}
