"use client";

import { useRef } from "react";
import {
  COLORS,
  CARD_STYLES,
  TYPOGRAPHY,
  SPACING,
} from "@/lib/design-system";
import { cn } from "@/lib/utils";
import type { SurveySection as SurveySectionType } from "@/constants/survey";
import { SCORE_OPTIONS } from "@/constants/survey";

interface SurveySectionProps {
  section: SurveySectionType;
  sectionIndex: number;
  questionScores: Record<string, number>;
  freeComment: string;
  onScoreSelect: (questionId: string, score: number) => void;
  onFreeCommentChange: (value: string) => void;
  isActive: boolean;
  scrollMarginTop?: string;
}

export function SurveySection({
  section,
  sectionIndex,
  questionScores,
  freeComment,
  onScoreSelect,
  onFreeCommentChange,
  isActive,
  scrollMarginTop = "80px",
}: SurveySectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isFreeCommentSection = section.id === "5";

  return (
    <section
      ref={sectionRef}
      id={`survey-section-${section.id}`}
      data-section-id={section.id}
      className={cn(
        "rounded-2xl p-4 sm:p-6 lg:p-8 transition-all duration-300 min-w-0",
        isActive && "ring-2"
      )}
      style={{
        ...CARD_STYLES.default,
        scrollMarginTop,
        ...(isActive
          ? {
              ringColor: COLORS.brand.primary,
              boxShadow: `0 4px 20px ${COLORS.brand.primary}20`,
            }
          : {}),
      }}
    >
      <h3
        className={cn(
          TYPOGRAPHY.h3.fontSize,
          TYPOGRAPHY.h3.fontWeight,
          "mb-6"
        )}
        style={{ color: COLORS.text.primary }}
      >
        {section.title}
      </h3>

      <div className="space-y-6 sm:space-y-8">
        {section.questions.map((question, qIndex) => (
          <div
            key={question.id}
            data-question-index={qIndex}
            className="space-y-3 sm:space-y-4 min-w-0"
          >
            <p
              className={cn("text-xs sm:text-sm", TYPOGRAPHY.body.fontSize, "leading-relaxed break-words")}
              style={{ color: COLORS.text.secondary }}
            >
              {question.text}
            </p>

            {isFreeCommentSection ? (
              <textarea
                value={freeComment}
                onChange={(e) => onFreeCommentChange(e.target.value)}
                placeholder="자유롭게 의견을 남겨주세요."
                rows={4}
                className="w-full min-w-0 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border resize-y min-h-[100px] sm:min-h-[120px] transition-all outline-none focus:ring-2 text-sm sm:text-base"
                style={{
                  borderColor: COLORS.border.input,
                  backgroundColor: COLORS.background.base,
                  color: COLORS.text.primary,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = COLORS.brand.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${COLORS.brand.primary}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = COLORS.border.input;
                  e.target.style.boxShadow = "none";
                }}
              />
            ) : (
              <div className="flex justify-center overflow-x-auto py-1 -mx-1 px-1">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <span
                    className="text-[10px] sm:text-xs whitespace-nowrap shrink-0"
                    style={{ color: COLORS.text.muted }}
                  >
                    그렇지 않다
                  </span>
                  <div className="inline-flex gap-1 sm:gap-1.5 p-0.5 rounded-lg">
                    {SCORE_OPTIONS.map((score) => {
                      const isSelected = questionScores[question.id] === score;
                      return (
                        <button
                          key={score}
                          type="button"
                          onClick={() => {
                            onScoreSelect(question.id, score);
                            const nextQuestion = sectionRef.current?.querySelector(
                              `[data-question-index="${qIndex + 1}"]`
                            );
                            if (nextQuestion) {
                              (nextQuestion as HTMLElement).scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                              });
                            } else {
                              const nextSectionId =
                                section.id === "4"
                                  ? "survey-section-5"
                                  : `survey-section-${Number(section.id) + 1}`;
                              document
                                .getElementById(nextSectionId)
                                ?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                            }
                          }}
                          className={cn(
                            "w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md text-xs font-medium transition-all duration-150",
                            isSelected
                              ? "text-white"
                              : "hover:bg-black/5"
                          )}
                          style={{
                            backgroundColor: isSelected
                              ? COLORS.brand.primary
                              : "transparent",
                            color: isSelected
                              ? COLORS.text.white
                              : COLORS.text.tertiary,
                            border: `1px solid ${isSelected ? COLORS.brand.primary : COLORS.border.light}`,
                          }}
                        >
                          {score}
                        </button>
                      );
                    })}
                  </div>
                  <span
                    className="text-[10px] sm:text-xs whitespace-nowrap shrink-0"
                    style={{ color: COLORS.text.muted }}
                  >
                    그렇다
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
