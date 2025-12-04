"use client";

import { create } from "zustand";

interface LoadingModalState {
  isOpen: boolean;
  message: string;
  isManual: boolean; // 수동으로 열린 경우 자동 닫기 방지
  progress?: {
    current: number;
    total: number;
    currentStep: string;
  };
}

interface ErrorModalState {
  isOpen: boolean;
  message: string | null;
  retryHandler: (() => void) | undefined;
}

interface SuccessModalState {
  isOpen: boolean;
  message: string | null;
  onConfirm: (() => void) | undefined;
}

interface FeedbackGenerationState {
  generatingDates: string[]; // 생성 중인 날짜들
  startGenerating: (date: string) => void;
  finishGenerating: (date: string) => void;
}

interface WeeklyFeedbackProgress {
  weekStart: string;
  current: number;
  total: number;
  currentStep: string;
}

interface DailyFeedbackProgress {
  date: string;
  current: number;
  total: number;
  currentStep: string;
}

interface WeeklyCandidatesDropdownState {
  isExpanded: boolean;
  toggle: () => void;
  setExpanded: (expanded: boolean) => void;
}

interface ModalStore {
  // Loading Modal
  loadingModal: LoadingModalState;
  openLoadingModal: (message?: string, isManual?: boolean) => void;
  closeLoadingModal: () => void;
  setLoadingMessage: (message: string) => void;
  setLoadingProgress: (progress: {
    current: number;
    total: number;
    currentStep: string;
  }) => void;

  // Error Modal
  errorModal: ErrorModalState;
  openErrorModal: (message: string, onRetry?: () => void) => void;
  closeErrorModal: () => void;
  setErrorMessage: (message: string) => void;
  setErrorRetryHandler: (handler: (() => void) | undefined) => void;

  // Success Modal
  successModal: SuccessModalState;
  openSuccessModal: (message: string, onConfirm?: () => void) => void;
  closeSuccessModal: () => void;

  // Feedback Generation State
  feedbackGeneration: FeedbackGenerationState;

  // Weekly Feedback Progress (전역 상태)
  weeklyFeedbackProgress: Record<string, WeeklyFeedbackProgress>; // weekStart를 키로 사용
  setWeeklyFeedbackProgress: (
    weekStart: string,
    progress: WeeklyFeedbackProgress | null
  ) => void;
  clearWeeklyFeedbackProgress: (weekStart: string) => void;
  clearAllWeeklyFeedbackProgress: () => void;

  // Daily Feedback Progress (전역 상태)
  dailyFeedbackProgress: Record<string, DailyFeedbackProgress>; // date를 키로 사용
  setDailyFeedbackProgress: (
    date: string,
    progress: DailyFeedbackProgress | null
  ) => void;
  clearDailyFeedbackProgress: (date: string) => void;
  clearAllDailyFeedbackProgress: () => void;

  // Weekly Candidates Dropdown (전역 상태)
  weeklyCandidatesDropdown: WeeklyCandidatesDropdownState;
  toggleWeeklyCandidatesDropdown: () => void;
  setWeeklyCandidatesDropdownExpanded: (expanded: boolean) => void;
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

  setLoadingProgress: (progress) =>
    set((state) => ({
      loadingModal: {
        ...state.loadingModal,
        progress,
        message: `${progress.currentStep} 생성 중... (${progress.current}/${progress.total})`,
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

  // Success Modal 초기 상태
  successModal: {
    isOpen: false,
    message: null,
    onConfirm: undefined,
  },

  openSuccessModal: (message, onConfirm) =>
    set({
      successModal: {
        isOpen: true,
        message,
        onConfirm,
      },
    }),

  closeSuccessModal: () =>
    set({
      successModal: {
        isOpen: false,
        message: null,
        onConfirm: undefined,
      },
    }),

  // Feedback Generation State 초기 상태
  feedbackGeneration: {
    generatingDates: [],
    startGenerating: (date) =>
      set((state) => {
        const dates = state.feedbackGeneration.generatingDates;
        if (!dates.includes(date)) {
          return {
            feedbackGeneration: {
              ...state.feedbackGeneration,
              generatingDates: [...dates, date],
            },
          };
        }
        return state;
      }),
    finishGenerating: (date) =>
      set((state) => {
        const dates = state.feedbackGeneration.generatingDates;
        return {
          feedbackGeneration: {
            ...state.feedbackGeneration,
            generatingDates: dates.filter((d) => d !== date),
          },
        };
      }),
  },

  // Weekly Feedback Progress 초기 상태
  weeklyFeedbackProgress: {},

  setWeeklyFeedbackProgress: (weekStart, progress) =>
    set((state) => {
      if (progress === null) {
        const { [weekStart]: _, ...rest } = state.weeklyFeedbackProgress;
        return { weeklyFeedbackProgress: rest };
      }
      return {
        weeklyFeedbackProgress: {
          ...state.weeklyFeedbackProgress,
          [weekStart]: progress,
        },
      };
    }),

  clearWeeklyFeedbackProgress: (weekStart) =>
    set((state) => {
      const { [weekStart]: _, ...rest } = state.weeklyFeedbackProgress;
      return { weeklyFeedbackProgress: rest };
    }),

  clearAllWeeklyFeedbackProgress: () => set({ weeklyFeedbackProgress: {} }),

  // Daily Feedback Progress 초기 상태
  dailyFeedbackProgress: {},
  setDailyFeedbackProgress: (date, progress) =>
    set((state) => {
      if (progress === null) {
        const { [date]: _, ...rest } = state.dailyFeedbackProgress;
        return { dailyFeedbackProgress: rest };
      }
      return {
        dailyFeedbackProgress: {
          ...state.dailyFeedbackProgress,
          [date]: progress,
        },
      };
    }),

  clearDailyFeedbackProgress: (date) =>
    set((state) => {
      const { [date]: _, ...rest } = state.dailyFeedbackProgress;
      return { dailyFeedbackProgress: rest };
    }),

  clearAllDailyFeedbackProgress: () => set({ dailyFeedbackProgress: {} }),

  // Weekly Candidates Dropdown 초기 상태
  weeklyCandidatesDropdown: {
    isExpanded: false,
    toggle: () =>
      set((state) => ({
        weeklyCandidatesDropdown: {
          ...state.weeklyCandidatesDropdown,
          isExpanded: !state.weeklyCandidatesDropdown.isExpanded,
        },
      })),
    setExpanded: (expanded) =>
      set((state) => ({
        weeklyCandidatesDropdown: {
          ...state.weeklyCandidatesDropdown,
          isExpanded: expanded,
        },
      })),
  },

  toggleWeeklyCandidatesDropdown: () =>
    set((state) => ({
      weeklyCandidatesDropdown: {
        ...state.weeklyCandidatesDropdown,
        isExpanded: !state.weeklyCandidatesDropdown.isExpanded,
      },
    })),

  setWeeklyCandidatesDropdownExpanded: (expanded) =>
    set((state) => ({
      weeklyCandidatesDropdown: {
        ...state.weeklyCandidatesDropdown,
        isExpanded: expanded,
      },
    })),
}));
