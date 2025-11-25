"use client";

import {
  CheckCircle2,
  AlertCircle,
  Activity,
  Briefcase,
  Users,
  Heart,
} from "lucide-react";
import { Card } from "../../ui/card";
import { useCountUp } from "@/hooks/useCountUp";
import type { MonthlyReportData } from "./types";

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
  health: "#A8BBA8",
  work: "#E5B96B",
  relationship: "#B89A7A",
  self_care: "#6B7A6F",
};

export function FeedbackOverviewSection({
  feedback_overview,
}: FeedbackOverviewSectionProps) {
  const habitScores = [
    {
      key: "health" as const,
      value: feedback_overview.habit_scores.health,
      delay: 0,
    },
    {
      key: "work" as const,
      value: feedback_overview.habit_scores.work,
      delay: 100,
    },
    {
      key: "relationship" as const,
      value: feedback_overview.habit_scores.relationship,
      delay: 200,
    },
    {
      key: "self_care" as const,
      value: feedback_overview.habit_scores.self_care,
      delay: 300,
    },
  ];

  return (
    <div className="mb-10 sm:mb-12" style={{ marginTop: "32px" }}>
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#D08C60" }}
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: "#333333" }}
        >
          월간 피드백
        </h2>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card
          className="p-4 text-center"
          style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
        >
          <p className="text-xs mb-1" style={{ color: "#6B7A6F" }}>
            피드백 일수
          </p>
          <p className="text-xl font-bold" style={{ color: "#333333" }}>
            {feedback_overview.feedback_days_count}
          </p>
        </Card>
        <Card
          className="p-4 text-center"
          style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
        >
          <p className="text-xs mb-1" style={{ color: "#6B7A6F" }}>
            피드백 개수
          </p>
          <p className="text-xl font-bold" style={{ color: "#333333" }}>
            {feedback_overview.feedback_records_count}
          </p>
        </Card>
      </div>

      {/* 습관 점수 */}
      <Card
        className="p-5 mb-4"
        style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
      >
        <p className="text-xs mb-4" style={{ color: "#6B7A6F" }}>
          습관 점수
        </p>
        <div className="grid grid-cols-2 gap-4">
          {habitScores.map((habit) => {
            const Icon = HABIT_ICONS[habit.key];
            const [displayValue, valueRef] = useCountUp({
              targetValue: habit.value,
              duration: 1000,
              delay: habit.delay,
              triggerOnVisible: true,
            });

            return (
              <div key={habit.key} ref={valueRef}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon
                    className="w-4 h-4"
                    style={{ color: HABIT_COLORS[habit.key] }}
                  />
                  <p className="text-xs" style={{ color: "#6B7A6F" }}>
                    {HABIT_LABELS[habit.key]}
                  </p>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span
                    className="text-xl font-bold"
                    style={{ color: HABIT_COLORS[habit.key] }}
                  >
                    {displayValue}
                  </span>
                  <span className="text-sm" style={{ color: "#6B7A6F" }}>
                    / 10
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full"
                  style={{ backgroundColor: "#F0F5F0" }}
                >
                  <div
                    className="h-1.5 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      backgroundColor: HABIT_COLORS[habit.key],
                      width: `${(displayValue / 10) * 100}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 반복된 긍정/개선점 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* 잘한 점 */}
        {feedback_overview.recurring_positives &&
          feedback_overview.recurring_positives.length > 0 && (
            <Card
              className="p-5"
              style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2
                  className="w-4 h-4"
                  style={{ color: "#A8BBA8" }}
                />
                <p
                  className="text-xs font-semibold"
                  style={{ color: "#6B7A6F" }}
                >
                  반복된 잘한 점
                </p>
              </div>
              <ul className="space-y-2">
                {feedback_overview.recurring_positives.map(
                  (positive, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span
                        className="text-xs mt-1"
                        style={{ color: "#A8BBA8" }}
                      >
                        •
                      </span>
                      <span
                        className="text-sm"
                        style={{ color: "#4E4B46", lineHeight: "1.6" }}
                      >
                        {positive}
                      </span>
                    </li>
                  )
                )}
              </ul>
            </Card>
          )}

        {/* 개선점 */}
        {feedback_overview.recurring_improvements &&
          feedback_overview.recurring_improvements.length > 0 && (
            <Card
              className="p-5"
              style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4" style={{ color: "#B89A7A" }} />
                <p
                  className="text-xs font-semibold"
                  style={{ color: "#6B7A6F" }}
                >
                  반복된 개선점
                </p>
              </div>
              <ul className="space-y-2">
                {feedback_overview.recurring_improvements.map(
                  (improvement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span
                        className="text-xs mt-1"
                        style={{ color: "#B89A7A" }}
                      >
                        •
                      </span>
                      <span
                        className="text-sm"
                        style={{ color: "#4E4B46", lineHeight: "1.6" }}
                      >
                        {improvement}
                      </span>
                    </li>
                  )
                )}
              </ul>
            </Card>
          )}
      </div>

      {/* 핵심 피드백 */}
      {feedback_overview.core_feedback_for_month && (
        <Card
          className="p-5 mb-4"
          style={{ backgroundColor: "#FDF6F0", border: "2px solid #D08C60" }}
        >
          <div className="flex items-start gap-3">
            <CheckCircle2
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              style={{ color: "#D08C60" }}
            />
            <div>
              <p
                className="text-xs mb-2"
                style={{ color: "#D08C60", fontWeight: "500" }}
              >
                이번 달 핵심 피드백
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#4E4B46", lineHeight: "1.7" }}
              >
                {feedback_overview.core_feedback_for_month}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* AI 코멘트 */}
      {feedback_overview.feedback_ai_comment && (
        <Card
          className="p-5"
          style={{ backgroundColor: "#F5F7F5", border: "1px solid #E0E5E0" }}
        >
          <div className="flex items-start gap-3">
            <CheckCircle2
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              style={{ color: "#A8BBA8" }}
            />
            <div>
              <p className="text-xs mb-2" style={{ color: "#6B7A6F" }}>
                AI 피드백 코멘트
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#4E4B46", lineHeight: "1.7" }}
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
