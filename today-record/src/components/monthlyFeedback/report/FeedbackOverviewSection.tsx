"use client";

import {
  CheckCircle2,
  AlertCircle,
  Activity,
  Briefcase,
  Users,
  Heart,
  Sparkles,
} from "lucide-react";
import { Card } from "../../ui/card";
import { useCountUp } from "@/hooks/useCountUp";
import type { MonthlyReportData } from "./types";
import {
  SECTION_COLORS,
  COMMON_COLORS,
  TYPOGRAPHY,
  SPACING,
  CARD_STYLES,
} from "./design-system";

type FeedbackOverviewSectionProps = {
  feedback_overview: MonthlyReportData["feedback_overview"];
};

const HABIT_ICONS = {
  health: Activity,
  work: Briefcase,
  relationship: Users,
  self_care: Heart,
};

const HABIT_LABELS = {
  health: "건강",
  work: "일/학습",
  relationship: "관계",
  self_care: "자기 돌봄",
};

const HABIT_COLORS = {
  health: "#7C9A7C",
  work: "#D4A574",
  relationship: "#B8A082",
  self_care: "#8B9A8B",
};

const HABIT_GRADIENTS = {
  health: "linear-gradient(135deg, #7C9A7C 0%, #6B8A6B 100%)",
  work: "linear-gradient(135deg, #D4A574 0%, #C49564 100%)",
  relationship: "linear-gradient(135deg, #B8A082 0%, #A89072 100%)",
  self_care: "linear-gradient(135deg, #8B9A8B 0%, #7A8A7A 100%)",
};

type HabitScoreItemProps = {
  habitKey: keyof typeof HABIT_ICONS;
  value: number;
  reason: string;
  delay: number;
  sectionColor: string;
};

function HabitScoreItem({
  habitKey,
  value,
  reason,
  delay,
  sectionColor,
}: HabitScoreItemProps) {
  const Icon = HABIT_ICONS[habitKey];
  const [displayValue, valueRef] = useCountUp({
    targetValue: value,
    duration: 1000,
    delay,
    triggerOnVisible: true,
  });

  return (
    <div ref={valueRef}>
      <Card
        className={`${SPACING.card.padding} transition-all duration-300 hover:shadow-lg`}
        style={CARD_STYLES.withColor(sectionColor)}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: HABIT_GRADIENTS[habitKey],
              boxShadow: `0 2px 8px ${HABIT_COLORS[habitKey]}30`,
            }}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p
              className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} ${TYPOGRAPHY.label.textTransform} mb-1`}
              style={{
                color: COMMON_COLORS.text.tertiary,
                letterSpacing: "0.05em",
              }}
            >
              {HABIT_LABELS[habitKey]}
            </p>
            <div className="flex items-baseline gap-2">
              <span
                className={`${TYPOGRAPHY.number.medium.fontSize} ${TYPOGRAPHY.number.medium.fontWeight}`}
                style={{
                  background: HABIT_GRADIENTS[habitKey],
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {displayValue}
              </span>
              <span
                className={`${TYPOGRAPHY.body.fontSize} font-medium`}
                style={{ color: COMMON_COLORS.text.muted }}
              >
                / 10
              </span>
            </div>
          </div>
        </div>
        <div
          className="h-3 rounded-full overflow-hidden mb-3"
          style={{
            backgroundColor:
              COMMON_COLORS.background.cardGradient.split(" ")[2],
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              background: HABIT_GRADIENTS[habitKey],
              width: `${(displayValue / 10) * 100}%`,
              boxShadow: `0 2px 6px ${HABIT_COLORS[habitKey]}40`,
            }}
          />
        </div>
        <p
          className={`${TYPOGRAPHY.bodySmall.fontSize} ${TYPOGRAPHY.bodySmall.lineHeight}`}
          style={{ color: COMMON_COLORS.text.tertiary }}
        >
          {reason}
        </p>
      </Card>
    </div>
  );
}

export function FeedbackOverviewSection({
  feedback_overview,
}: FeedbackOverviewSectionProps) {
  const habitScores = [
    {
      key: "health" as const,
      value: feedback_overview.habit_scores.health,
      reason: feedback_overview.habit_scores.health_reason,
      delay: 0,
    },
    {
      key: "work" as const,
      value: feedback_overview.habit_scores.work,
      reason: feedback_overview.habit_scores.work_reason,
      delay: 100,
    },
    {
      key: "relationship" as const,
      value: feedback_overview.habit_scores.relationship,
      reason: feedback_overview.habit_scores.relationship_reason,
      delay: 200,
    },
    {
      key: "self_care" as const,
      value: feedback_overview.habit_scores.self_care,
      reason: feedback_overview.habit_scores.self_care_reason,
      delay: 300,
    },
  ];

  // 핵심 피드백 최대 5개
  const coreFeedbacks = feedback_overview.core_feedbacks?.slice(0, 5) || [];

  // 반복된 개선점
  const recurringImprovements =
    feedback_overview.recurring_improvements_with_frequency || [];

  const colors = SECTION_COLORS.feedback;

  return (
    <div
      className={SPACING.section.marginBottom}
      style={{ marginTop: SPACING.section.marginTop }}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: colors.gradient,
            boxShadow: `0 2px 8px ${colors.primary}30`,
          }}
        >
          <CheckCircle2 className="w-5 h-5 text-white" />
        </div>
        <h2
          className={`${TYPOGRAPHY.h2.fontSize} ${TYPOGRAPHY.h2.fontWeight}`}
          style={{ color: COMMON_COLORS.text.primary }}
        >
          월간 피드백
        </h2>
      </div>

      {/* 습관 점수 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {habitScores.map((habit) => (
          <HabitScoreItem
            key={habit.key}
            habitKey={habit.key}
            value={habit.value}
            reason={habit.reason}
            delay={habit.delay}
            sectionColor={colors.primary}
          />
        ))}
      </div>

      {/* 핵심 피드백 */}
      {coreFeedbacks.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: colors.gradient,
                boxShadow: `0 2px 8px ${colors.primary}30`,
              }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <p
              className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} ${TYPOGRAPHY.label.textTransform}`}
              style={{
                color: COMMON_COLORS.text.tertiary,
                letterSpacing: "0.05em",
              }}
            >
              핵심 피드백
            </p>
          </div>
          <div className="space-y-1.5">
            {coreFeedbacks.map((feedback, index) => (
              <div
                key={index}
                className="relative flex items-start gap-3 py-2.5 px-3 rounded-xl transition-all duration-300 group"
                style={{
                  background: `linear-gradient(to right, ${colors.primary}08 0%, transparent 100%)`,
                  borderLeft: "3px solid transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderLeftColor = colors.primary;
                  e.currentTarget.style.background = `linear-gradient(to right, ${colors.primary}15 0%, ${colors.primary}05 100%)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderLeftColor = "transparent";
                  e.currentTarget.style.background = `linear-gradient(to right, ${colors.primary}08 0%, transparent 100%)`;
                }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-semibold transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 mt-0.5"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.primary}15 100%)`,
                    border: `1.5px solid ${colors.border}`,
                    color: colors.primary,
                    fontSize: "11px",
                    fontWeight: "600",
                  }}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p
                    className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight} pt-0.5 transition-colors duration-200 group-hover:text-[#5A6B5A] mb-1`}
                    style={{
                      color: COMMON_COLORS.text.secondary,
                      letterSpacing: "0.01em",
                      fontWeight: "400",
                    }}
                  >
                    {feedback.summary}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${colors.primary}15`,
                        color: colors.primary,
                        fontWeight: "500",
                      }}
                    >
                      {feedback.frequency}회 반복
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 반복된 개선점 */}
      {recurringImprovements.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #D4A574 0%, #C49564 100%)",
                boxShadow: "0 2px 8px rgba(212, 165, 116, 0.3)",
              }}
            >
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <p
              className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} ${TYPOGRAPHY.label.textTransform}`}
              style={{
                color: COMMON_COLORS.text.tertiary,
                letterSpacing: "0.05em",
              }}
            >
              반복된 개선점
            </p>
          </div>
          <div className="space-y-1.5">
            {recurringImprovements.map((improvement, index) => (
              <div
                key={index}
                className="relative flex items-start gap-3 py-2.5 px-3 rounded-xl transition-all duration-300 group"
                style={{
                  background:
                    "linear-gradient(to right, rgba(212, 165, 116, 0.03) 0%, transparent 100%)",
                  borderLeft: "3px solid transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderLeftColor = "#D4A574";
                  e.currentTarget.style.background =
                    "linear-gradient(to right, rgba(212, 165, 116, 0.08) 0%, rgba(212, 165, 116, 0.02) 100%)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderLeftColor = "transparent";
                  e.currentTarget.style.background =
                    "linear-gradient(to right, rgba(212, 165, 116, 0.03) 0%, transparent 100%)";
                }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-semibold transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 mt-0.5"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(212, 165, 116, 0.15) 0%, rgba(196, 149, 100, 0.1) 100%)",
                    border: "1.5px solid rgba(212, 165, 116, 0.3)",
                    color: "#D4A574",
                    fontSize: "11px",
                    fontWeight: "600",
                  }}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p
                    className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight} pt-0.5 transition-colors duration-200 group-hover:text-[#B8956A] mb-1`}
                    style={{
                      color: COMMON_COLORS.text.secondary,
                      letterSpacing: "0.01em",
                      fontWeight: "400",
                    }}
                  >
                    {improvement.summary}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "rgba(212, 165, 116, 0.1)",
                        color: "#D4A574",
                        fontWeight: "500",
                      }}
                    >
                      {improvement.frequency}회 반복
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI 피드백 코멘트 */}
      {feedback_overview.feedback_ai_comment && (
        <Card
          className={`${SPACING.card.padding} transition-all duration-300 hover:shadow-lg`}
          style={CARD_STYLES.gradient}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: colors.gradient,
                boxShadow: `0 2px 8px ${colors.primary}30`,
              }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p
                className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} ${TYPOGRAPHY.label.textTransform} mb-3`}
                style={{
                  color: COMMON_COLORS.text.tertiary,
                  letterSpacing: "0.05em",
                }}
              >
                AI 피드백 코멘트
              </p>
              <p
                className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight}`}
                style={{ color: COMMON_COLORS.text.secondary }}
              >
                {feedback_overview.feedback_ai_comment}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
