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

interface WeeklyVividProgress {
  weekStart: string;
  current: number;
  total: number;
  currentStep: string;
}

interface DailyVividProgress {
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

interface MonthlyVividProgress {
  month: string;
  current: number;
  total: number;
  currentStep: string;
}

interface MonthlyCandidatesDropdownState {
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

  // Weekly Vivid Progress (전역 상태)
  weeklyVividProgress: Record<string, WeeklyVividProgress>; // weekStart를 키로 사용
  setWeeklyVividProgress: (
    weekStart: string,
    progress: WeeklyVividProgress | null
  ) => void;
  clearWeeklyVividProgress: (weekStart: string) => void;
  clearAllWeeklyVividProgress: () => void;

  // Daily Vivid Progress (전역 상태)
  dailyVividProgress: Record<string, DailyVividProgress>; // date를 키로 사용
  setDailyVividProgress: (
    date: string,
    progress: DailyVividProgress | null
  ) => void;
  clearDailyVividProgress: (date: string) => void;
  clearAllDailyVividProgress: () => void;

  // Weekly Candidates Dropdown (전역 상태)
  weeklyCandidatesDropdown: WeeklyCandidatesDropdownState;
  toggleWeeklyCandidatesDropdown: () => void;
  setWeeklyCandidatesDropdownExpanded: (expanded: boolean) => void;

  // Monthly Vivid Progress (전역 상태)
  monthlyVividProgress: Record<string, MonthlyVividProgress>; // month를 키로 사용
  setMonthlyVividProgress: (
    month: string,
    progress: MonthlyVividProgress | null
  ) => void;
  clearMonthlyVividProgress: (month: string) => void;
  clearAllMonthlyVividProgress: () => void;

  // Monthly Candidates Dropdown (전역 상태)
  monthlyCandidatesDropdown: MonthlyCandidatesDropdownState;
  toggleMonthlyCandidatesDropdown: () => void;
  setMonthlyCandidatesDropdownExpanded: (expanded: boolean) => void;
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

  // Weekly Vivid Progress 초기 상태
  weeklyVividProgress: {},

  setWeeklyVividProgress: (weekStart, progress) =>
    set((state) => {
      if (progress === null) {
        const { [weekStart]: _, ...rest } = state.weeklyVividProgress;
        return { weeklyVividProgress: rest };
      }
      return {
        weeklyVividProgress: {
          ...state.weeklyVividProgress,
          [weekStart]: progress,
        },
      };
    }),

  clearWeeklyVividProgress: (weekStart) =>
    set((state) => {
      const { [weekStart]: _, ...rest } = state.weeklyVividProgress;
      return { weeklyVividProgress: rest };
    }),

  clearAllWeeklyVividProgress: () => set({ weeklyVividProgress: {} }),

  // Daily Vivid Progress 초기 상태
  dailyVividProgress: {},
  setDailyVividProgress: (date, progress) =>
    set((state) => {
      if (progress === null) {
        const { [date]: _, ...rest } = state.dailyVividProgress;
        return { dailyVividProgress: rest };
      }
      return {
        dailyVividProgress: {
          ...state.dailyVividProgress,
          [date]: progress,
        },
      };
    }),

  clearDailyVividProgress: (date) =>
    set((state) => {
      const { [date]: _, ...rest } = state.dailyVividProgress;
      return { dailyVividProgress: rest };
    }),

  clearAllDailyVividProgress: () => set({ dailyVividProgress: {} }),

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

  // Monthly Vivid Progress 초기 상태
  monthlyVividProgress: {},

  setMonthlyVividProgress: (month, progress) =>
    set((state) => {
      if (progress === null) {
        const { [month]: _, ...rest } = state.monthlyVividProgress;
        return { monthlyVividProgress: rest };
      }
      return {
        monthlyVividProgress: {
          ...state.monthlyVividProgress,
          [month]: progress,
        },
      };
    }),

  clearMonthlyVividProgress: (month) =>
    set((state) => {
      const { [month]: _, ...rest } = state.monthlyVividProgress;
      return { monthlyVividProgress: rest };
    }),

  clearAllMonthlyVividProgress: () => set({ monthlyVividProgress: {} }),

  // Monthly Candidates Dropdown 초기 상태
  monthlyCandidatesDropdown: {
    isExpanded: false,
    toggle: () =>
      set((state) => ({
        monthlyCandidatesDropdown: {
          ...state.monthlyCandidatesDropdown,
          isExpanded: !state.monthlyCandidatesDropdown.isExpanded,
        },
      })),
    setExpanded: (expanded) =>
      set((state) => ({
        monthlyCandidatesDropdown: {
          ...state.monthlyCandidatesDropdown,
          isExpanded: expanded,
        },
      })),
  },

  toggleMonthlyCandidatesDropdown: () =>
    set((state) => ({
      monthlyCandidatesDropdown: {
        ...state.monthlyCandidatesDropdown,
        isExpanded: !state.monthlyCandidatesDropdown.isExpanded,
      },
    })),

  setMonthlyCandidatesDropdownExpanded: (expanded) =>
    set((state) => ({
      monthlyCandidatesDropdown: {
        ...state.monthlyCandidatesDropdown,
        isExpanded: expanded,
      },
    })),
}));
