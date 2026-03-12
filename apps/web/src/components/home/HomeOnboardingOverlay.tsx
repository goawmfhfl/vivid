"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  COLORS,
  TYPOGRAPHY,
  TRANSITIONS,
  SHADOWS,
} from "@/lib/design-system";
import {
  HOME_ONBOARDING_STEPS,
  type HomeOnboardingTargetId,
} from "@/lib/onboarding";
import { cn } from "@/lib/utils";
import type { HomeTabType } from "./RecordForm";

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface HomeOnboardingOverlayProps {
  open: boolean;
  step: number;
  previewTab: HomeTabType;
  onStepChange: (step: number) => void;
  onComplete: () => void;
  onSkip: () => void;
}

function getTargetElement(targetId: HomeOnboardingTargetId) {
  return document.querySelector<HTMLElement>(`[data-onboarding-id="${targetId}"]`);
}

export function HomeOnboardingOverlay({
  open,
  step,
  previewTab,
  onStepChange,
  onComplete,
  onSkip,
}: HomeOnboardingOverlayProps) {
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [questionsGuidePhase, setQuestionsGuidePhase] = useState(0);

  const currentStep = HOME_ONBOARDING_STEPS[step];
  const isWelcomeStep = currentStep?.id === "home-welcome";
  const shouldPlaceCardTop =
    isWelcomeStep ||
    currentStep?.id === "home-questions-guide" ||
    currentStep?.id === "home-ai-button" ||
    currentStep?.id === "home-reports-tab";
  const spotlightBottom =
    highlightRect &&
    typeof highlightRect.top === "number" &&
    typeof highlightRect.height === "number"
      ? highlightRect.top + highlightRect.height
      : null;
  const isSpotlightStep =
    !isWelcomeStep &&
    !shouldPlaceCardTop &&
    (currentStep?.id === "home-calendar" ||
      currentStep?.id === "home-questions" ||
      currentStep?.id === "home-tabs");
  const shouldPlaceCardBelowSpotlight =
    spotlightBottom != null && isSpotlightStep;
  const cardMaxHeight =
    shouldPlaceCardBelowSpotlight && spotlightBottom != null
      ? `calc(100vh - ${spotlightBottom + 32}px)`
      : undefined;

  const isQuestionsGuideStep = currentStep?.id === "home-questions-guide";
  const effectiveTargetId: HomeOnboardingTargetId | undefined =
    isQuestionsGuideStep && questionsGuidePhase === 0
      ? "home-questions"
      : currentStep?.id;
  const handleNextClick = () => {
    if (isQuestionsGuideStep && questionsGuidePhase === 0) {
      setQuestionsGuidePhase(1);
    } else {
      onStepChange(Math.min(step + 1, HOME_ONBOARDING_STEPS.length - 1));
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setIsReducedMotion(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (currentStep?.id !== "home-questions-guide") {
      setQuestionsGuidePhase(0);
    }
  }, [currentStep?.id]);

  useLayoutEffect(() => {
    if (!open || !currentStep || currentStep.id === "home-welcome" || !effectiveTargetId) {
      setHighlightRect(null);
      return;
    }

    const updateHighlight = () => {
      const element = getTargetElement(effectiveTargetId);
      if (!element) {
        setHighlightRect(null);
        return;
      }

      const rect = element.getBoundingClientRect();
      const padding =
        effectiveTargetId === "home-reports-tab"
          ? 8
          : effectiveTargetId === "home-ai-button"
            ? 28
            : 12;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const rawTop = rect.top - padding;
      const rawLeft = rect.left - padding;
      const rawBottom = rect.bottom + padding;
      const rawRight = rect.right + padding;

      const top = Math.max(rawTop, 8);
      const left = Math.max(rawLeft, 8);
      const bottom = Math.min(rawBottom, viewportHeight - 8);
      const right = Math.min(rawRight, viewportWidth - 8);

      setHighlightRect({
        top,
        left,
        width: Math.max(right - left, 0),
        height: Math.max(bottom - top, 0),
      });
    };

    const scrollToTarget = () => {
      if (currentStep.id === "home-questions-guide" && questionsGuidePhase === 0) {
        // questionsGuide 1차 화면에서는 최상단 고정
        window.scrollTo({ top: 0, behavior: "auto" });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        return;
      }

      const element = getTargetElement(effectiveTargetId);
      if (!element) return;
      element.scrollIntoView({
        block: effectiveTargetId === "home-reports-tab" ? "end" : "center",
        inline: "nearest",
        behavior: isReducedMotion ? "auto" : "smooth",
      });
    };

    scrollToTarget();

    // 스텝 전환 직후 타겟이 아직 렌더링되지 않는 경우를 대비해 재시도
    let rafId: number | null = null;
    let retryCount = 0;
    const MAX_RETRY = 24; // 약 0.4초(60fps 기준)

    const tryUpdateHighlight = () => {
      updateHighlight();
      const element = getTargetElement(effectiveTargetId);
      const hasRect = !!element;
      if (!hasRect && retryCount < MAX_RETRY) {
        retryCount += 1;
        rafId = window.requestAnimationFrame(tryUpdateHighlight);
      }
    };

    tryUpdateHighlight();

    window.addEventListener("resize", updateHighlight);
    window.addEventListener("scroll", updateHighlight, { passive: true });
    const observedElement = getTargetElement(effectiveTargetId);
    const resizeObserver =
      observedElement && "ResizeObserver" in window
        ? new ResizeObserver(() => updateHighlight())
        : null;
    if (resizeObserver && observedElement) {
      resizeObserver.observe(observedElement);
    }

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("resize", updateHighlight);
      window.removeEventListener("scroll", updateHighlight);
      resizeObserver?.disconnect();
    };
  }, [currentStep, effectiveTargetId, isReducedMotion, open, questionsGuidePhase]);

  const cardBody = useMemo(() => {
    if (!currentStep) return null;

    if (currentStep.id === "home-welcome") {
      return (
        <p
          className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
          style={{ color: COLORS.text.secondary, whiteSpace: "pre-line" }}
        >
          {currentStep.description}
        </p>
      );
    }

    if (currentStep.id === "home-calendar") {
      return (
        <div className="space-y-3">
          <p
            className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
            style={{ color: COLORS.text.secondary, whiteSpace: "pre-line" }}
          >
            {currentStep.description}
          </p>
          <div className="grid grid-cols-5 gap-1 max-[380px]:gap-0.5 sm:gap-2">
            {["월", "화", "수", "목", "금"].map((label, index) => {
              const isFocused = index === 2 || index === 4;
              return (
                <div
                  key={label}
                  className="min-w-0 rounded-xl px-1 py-2 text-center sm:px-2"
                  style={{
                    backgroundColor: isFocused
                      ? COLORS.background.base
                      : COLORS.background.hoverLight,
                    border: `1px solid ${
                      isFocused ? COLORS.brand.primary : COLORS.border.light
                    }`,
                  }}
                >
                  <div
                    className="text-[11px] font-semibold"
                    style={{ color: COLORS.text.tertiary }}
                  >
                    {label}
                  </div>
                  <div
                    className="mt-1 text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    {11 + index}
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-1">
                    {isFocused ? (
                      <>
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: COLORS.brand.primary }}
                        />
                        {index === 4 ? (
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: COLORS.dailyVivid.current }}
                          />
                        ) : null}
                      </>
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full opacity-20" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (currentStep.id === "home-tabs") {
      return (
        <p
          className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
          style={{ color: COLORS.text.secondary, whiteSpace: "pre-line" }}
        >
          {currentStep.description}
        </p>
      );
    }

    if (currentStep.id === "home-ai-button") {
      return (
        <p
          className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
          style={{ color: COLORS.text.secondary, whiteSpace: "pre-line" }}
        >
          {currentStep.description}
        </p>
      );
    }

    return (
      <p
        className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
        style={{ color: COLORS.text.secondary, whiteSpace: "pre-line" }}
      >
        {currentStep.description}
      </p>
    );
  }, [currentStep, previewTab]);

  if (!open || !currentStep) return null;

  const isAiButtonStep = currentStep?.id === "home-ai-button";

  return (
    <div className="fixed inset-0 z-[130] pointer-events-none">
      <div
        className="fixed inset-0"
        style={{ pointerEvents: "auto" }}
      />

      {highlightRect ? (
        <>
          {((isQuestionsGuideStep && questionsGuidePhase === 1) || isAiButtonStep) && (
            <div
              aria-hidden="true"
              className="pointer-events-none fixed onboarding-background-pulse"
              style={{
                top: highlightRect.top - 18,
                left: highlightRect.left - 18,
                width: highlightRect.width + 36,
                height: highlightRect.height + 36,
                borderRadius: 32,
              }}
            />
          )}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed"
            style={{
              top: highlightRect.top,
              left: highlightRect.left,
              width: highlightRect.width,
              height: highlightRect.height,
              borderRadius: 24,
              boxShadow: "0 0 0 9999px rgba(24, 31, 43, 0.62)",
              border: "1.5px solid rgba(255, 255, 255, 0.92)",
              backgroundColor: COLORS.glass.surface,
              backdropFilter: "brightness(1.06) saturate(1.04)",
            }}
          />
          {isQuestionsGuideStep && questionsGuidePhase === 1 && highlightRect ? (
            <div
              className="pointer-events-none fixed onboarding-step-fade"
              style={{
                top: highlightRect.top + highlightRect.height / 2,
                left: highlightRect.left + highlightRect.width + 12,
                transform: "translateY(-50%)",
                width: "max(200px, min(260px, calc(100vw - 48px)))",
              }}
            >
              <div
                className="rounded-xl px-4 py-3 shadow-lg"
                style={{
                  backgroundColor: COLORS.background.cardElevated,
                  border: `1px solid ${COLORS.border.light}`,
                  boxShadow: SHADOWS.elevation3,
                  fontSize: "0.8125rem",
                  lineHeight: 1.5,
                  color: COLORS.text.primary,
                }}
              >
                기록을 시작하기 전 꼭 확인해주세요!
              </div>
            </div>
          ) : null}
          {isAiButtonStep && highlightRect ? (
            <div
              className="pointer-events-none fixed onboarding-step-fade"
              style={{
                top: highlightRect.top - 14,
                left: highlightRect.left + highlightRect.width / 2,
                transform: "translate(-50%, -100%)",
                width: "max(220px, min(300px, calc(100vw - 48px)))",
              }}
            >
              <div
                className="rounded-xl px-4 py-3 shadow-lg"
                style={{
                  backgroundColor: COLORS.background.cardElevated,
                  border: `1px solid ${COLORS.border.light}`,
                  boxShadow: SHADOWS.elevation3,
                  fontSize: "0.8125rem",
                  lineHeight: 1.5,
                  color: COLORS.text.primary,
                  whiteSpace: "pre-line",
                  textAlign: "center",
                }}
              >
                아래 '오늘의 비비드 생성하기' 버튼을 눌러보세요.
                {"\n"}
                실제 생성 없이 흐름만 미리 보여드려요.
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0"
          style={{ backgroundColor: "rgba(24, 31, 43, 0.62)" }}
        />
      )}

      <div
        className={cn(
          "fixed inset-x-0 flex justify-center px-3 sm:px-4",
          "pointer-events-auto",
          isWelcomeStep && "inset-y-0 items-center",
        )}
        style={
          isWelcomeStep
            ? undefined
            : shouldPlaceCardBelowSpotlight && spotlightBottom != null
              ? { top: spotlightBottom + 16, bottom: "auto" }
              : isSpotlightStep
                ? { top: 16, bottom: "auto" }
                : {
                    top: shouldPlaceCardTop ? 16 : "auto",
                    bottom: shouldPlaceCardTop
                      ? "auto"
                      : "calc(env(safe-area-inset-bottom, 0px) + 16px)",
                  }
        }
      >
        <div
          className={cn(
            "min-w-0 w-full max-w-[420px] rounded-[28px] p-4 sm:p-5",
            isWelcomeStep && "w-full max-w-[420px]",
            shouldPlaceCardBelowSpotlight && "overflow-y-auto",
          )}
          style={{
            backgroundColor: COLORS.background.cardElevated,
            border: `1px solid ${COLORS.border.light}`,
            boxShadow: SHADOWS.elevation5,
            overflowWrap: "break-word",
            ...(cardMaxHeight ? { maxHeight: cardMaxHeight } : {}),
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`${step + 1}단계 온보딩`}
        >
          <div key={currentStep.id} className={isReducedMotion ? "" : "onboarding-step-fade"}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="text-xs font-semibold"
                      style={{ color: COLORS.brand.primary }}
                    >
                      STEP {step} / {HOME_ONBOARDING_STEPS.length}
                    </div>
                    <button
                      type="button"
                      onClick={onSkip}
                      className="shrink-0 whitespace-nowrap text-xs font-medium"
                      style={{ color: COLORS.text.tertiary }}
                    >
                      건너뛰기
                    </button>
                  </div>
                  <h2
                    className={cn(
                      "mt-1",
                      TYPOGRAPHY.h3.fontSize,
                      TYPOGRAPHY.h3.fontWeight,
                      TYPOGRAPHY.h3.lineHeight,
                    )}
                    style={{
                      color: COLORS.text.primary,
                      whiteSpace: "pre-line",
                      wordBreak: "keep-all",
                    }}
                  >
                    {currentStep.title}
                  </h2>
                </div>
              </div>

              <div className="mt-4">{cardBody}</div>

              <div className="mt-5 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    if (isQuestionsGuideStep && questionsGuidePhase === 1) {
                      setQuestionsGuidePhase(0);
                    } else {
                      onStepChange(Math.max(step - 1, 0));
                    }
                  }}
                  disabled={step === 0 && questionsGuidePhase === 0}
                  className="rounded-xl"
                  style={{ color: COLORS.text.secondary }}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  이전
                </Button>

                {step === HOME_ONBOARDING_STEPS.length - 1 ? (
                  <Button
                    type="button"
                    onClick={onComplete}
                    className="rounded-xl"
                    style={{
                      backgroundColor: COLORS.brand.primary,
                      color: COLORS.text.white,
                    }}
                  >
                    <Check className="mr-1 h-4 w-4" />
                    시작하기
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNextClick}
                    className="rounded-xl"
                    style={{
                      backgroundColor: COLORS.brand.primary,
                      color: COLORS.text.white,
                    }}
                  >
                    다음
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
