"use client";

export const HOME_ONBOARDING_PENDING_KEY = "vivid_home_onboarding_pending_v1";
export const HOME_ONBOARDING_SEEN_KEY = "vivid_home_onboarding_seen_v1";

export const HOME_ONBOARDING_TARGET_IDS = {
  welcome: "home-welcome",
  calendar: "home-calendar",
  questions: "home-questions",
  questionsGuide: "home-questions-guide",
  tabs: "home-tabs",
  aiButton: "home-ai-button",
  reportsTab: "home-reports-tab",
} as const;

export type HomeOnboardingTargetId =
  (typeof HOME_ONBOARDING_TARGET_IDS)[keyof typeof HOME_ONBOARDING_TARGET_IDS];

export interface HomeOnboardingStep {
  id: HomeOnboardingTargetId;
  title: string;
  description: string;
}

export const HOME_ONBOARDING_STEPS: HomeOnboardingStep[] = [
  {
    id: HOME_ONBOARDING_TARGET_IDS.welcome,
    title: "VIVID에 오신 것을 환영해요.",
    description: "처음이라 조금 낯설 수 있어요.\nVIVID를 차근차근 안내해드릴게요.",
  },
  {
    id: HOME_ONBOARDING_TARGET_IDS.calendar,
    title: "캘린더로 기록의 흐름을 확인해보세요.",
    description:
      "상단 날짜를 누르면 해당 날짜 기록을 바로 볼 수 있어요.\n날짜 아래 점은 기록이 있는 날을 뜻해요.",
  },
  {
    id: HOME_ONBOARDING_TARGET_IDS.questionsGuide,
    title: "기록은 두 가지 질문에서 시작돼요.",
    description: "매일 두 질문에 답변하는 시간을 가져보세요.",
  },
  {
    id: HOME_ONBOARDING_TARGET_IDS.tabs,
    title: "탭을 오가며 기록을 이어가요.",
    description:
      "VIVID에서는 방향을 기록하고, 회고에서는 하루를 돌아보고, 할 일에서는 실행을 정리할 수 있어요. 세 탭을 오가며 기록이 자연스럽게 이어집니다.",
  },
  {
    id: HOME_ONBOARDING_TARGET_IDS.aiButton,
    title: "AI로 오늘의 기록을 정리해보세요.",
    description:
      "오늘 남긴 기록을 바탕으로, 하루의 흐름을 한 번에 정리한 AI 리포트를 확인할 수 있어요.",
  },
  {
    id: HOME_ONBOARDING_TARGET_IDS.reportsTab,
    title: "기록은 리포트로 이어집니다.",
    description:
      "하단 리포트 탭에서는 쌓인 기록들이 성장 리포트로 정리돼요. 하루의 작은 기록이 주간, 월간 인사이트로 확장되는 흐름을 확인해보세요.",
  },
] as const;

function canUseStorage() {
  return typeof window !== "undefined";
}

export function markPendingHomeOnboarding() {
  if (!canUseStorage()) return;
  window.localStorage.setItem(HOME_ONBOARDING_PENDING_KEY, "true");
}

export function clearPendingHomeOnboarding() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(HOME_ONBOARDING_PENDING_KEY);
}

export function hasPendingHomeOnboarding() {
  if (!canUseStorage()) return false;
  return window.localStorage.getItem(HOME_ONBOARDING_PENDING_KEY) === "true";
}

export function markSeenHomeOnboarding() {
  if (!canUseStorage()) return;
  window.localStorage.setItem(HOME_ONBOARDING_SEEN_KEY, "true");
}

export function hasSeenHomeOnboarding() {
  if (!canUseStorage()) return false;
  return window.localStorage.getItem(HOME_ONBOARDING_SEEN_KEY) === "true";
}
