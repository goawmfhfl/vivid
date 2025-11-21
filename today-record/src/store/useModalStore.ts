"use client";

import { create } from "zustand";

interface LoadingModalState {
  isOpen: boolean;
  message: string;
  isManual: boolean; // 수동으로 열린 경우 자동 닫기 방지
}

interface ErrorModalState {
  isOpen: boolean;
  message: string | null;
  retryHandler: (() => void) | undefined;
}

interface ModalStore {
  // Loading Modal
  loadingModal: LoadingModalState;
  openLoadingModal: (message?: string, isManual?: boolean) => void;
  closeLoadingModal: () => void;
  setLoadingMessage: (message: string) => void;

  // Error Modal
  errorModal: ErrorModalState;
  openErrorModal: (message: string, onRetry?: () => void) => void;
  closeErrorModal: () => void;
  setErrorMessage: (message: string) => void;
  setErrorRetryHandler: (handler: (() => void) | undefined) => void;
}

const defaultLoadingMessage = "처리 중입니다...";

export const useModalStore = create<ModalStore>((set) => ({
  // Loading Modal 초기 상태
  loadingModal: {
    isOpen: false,
    message: defaultLoadingMessage,
    isManual: false,
  },

  openLoadingModal: (message, isManual = false) =>
    set((state) => ({
      loadingModal: {
        isOpen: true,
        message: message || state.loadingModal.message,
        isManual,
      },
    })),

  closeLoadingModal: () =>
    set((state) => ({
      loadingModal: {
        ...state.loadingModal,
        isOpen: false,
        isManual: false,
      },
    })),

  setLoadingMessage: (message) =>
    set((state) => ({
      loadingModal: {
        ...state.loadingModal,
        message,
      },
    })),

  // Error Modal 초기 상태
  errorModal: {
    isOpen: false,
    message: null,
    retryHandler: undefined,
  },

  openErrorModal: (message, onRetry) =>
    set({
      errorModal: {
        isOpen: true,
        message,
        retryHandler: onRetry,
      },
    }),

  closeErrorModal: () =>
    set({
      errorModal: {
        isOpen: false,
        message: null,
        retryHandler: undefined,
      },
    }),

  setErrorMessage: (message) =>
    set((state) => ({
      errorModal: {
        ...state.errorModal,
        message,
      },
    })),

  setErrorRetryHandler: (handler) =>
    set((state) => ({
      errorModal: {
        ...state.errorModal,
        retryHandler: handler,
      },
    })),
}));
