"use client";

import { create } from "zustand";

interface OnboardingState {
  isVisible: boolean;
  step: number;
  setOnboarding: (isVisible: boolean, step: number) => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  isVisible: false,
  step: -1,
  setOnboarding: (isVisible, step) => set({ isVisible, step }),
}));
