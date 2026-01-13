"use client";

import { create } from "zustand";

interface ToastState {
  message: string;
  isVisible: boolean;
  duration: number;
}

interface ToastStore {
  toast: ToastState;
  showToast: (message: string, duration?: number) => void;
  hideToast: () => void;
}

const defaultDuration = 3000;

export const useToastStore = create<ToastStore>((set) => ({
  toast: {
    message: "",
    isVisible: false,
    duration: defaultDuration,
  },

  showToast: (message, duration = defaultDuration) =>
    set({
      toast: {
        message,
        isVisible: true,
        duration,
      },
    }),

  hideToast: () =>
    set((state) => ({
      toast: {
        ...state.toast,
        isVisible: false,
      },
    })),
}));
