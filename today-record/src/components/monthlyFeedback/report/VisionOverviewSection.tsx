"use client";

import { Target, Sparkles, TrendingUp } from "lucide-react";
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

type VisionOverviewSectionProps = {
  vision_overview: MonthlyReportData["vision_overview"];
};

export function VisionOverviewSection({
  vision_overview,
}: VisionOverviewSectionProps) {
  const [consistency, consistencyRef] = useCountUp({
    targetValue: vision_overview.vision_consistency_score,
    duration: 1000,
    delay: 0,
    triggerOnVisible: true,
  });

  // 핵심 비전 최대 7개
  const coreVisions = vision_overview.core_visions?.slice(0, 7) || [];

  // AI 피드백 최대 5개
  const aiFeedbacks = vision_overview.vision_ai_feedbacks?.slice(0, 5) || [];

  const colors = SECTION_COLORS.vision;

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
          <Target className="w-5 h-5 text-white" />
        </div>
        <h2
          className={`${TYPOGRAPHY.h2.fontSize} ${TYPOGRAPHY.h2.fontWeight}`}
          style={{ color: COMMON_COLORS.text.primary }}
        >
          월간 비전
        </h2>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card
          className={`${SPACING.card.padding} text-center transition-all duration-300 hover:shadow-lg`}
          style={CARD_STYLES.withColor(colors.primary)}
        >
          <p
            className={`${TYPOGRAPHY.label.fontSize} mb-2 ${TYPOGRAPHY.label.textTransform}`}
            style={{
              color: COMMON_COLORS.text.tertiary,
              letterSpacing: "0.05em",
            }}
          >
            비전 일수
          </p>
          <p
            className={`${TYPOGRAPHY.number.medium.fontSize} ${TYPOGRAPHY.number.medium.fontWeight}`}
            style={{
              background: colors.gradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {vision_overview.vision_days_count}
          </p>
        </Card>
        <Card
          className={`${SPACING.card.padding} text-center transition-all duration-300 hover:shadow-lg`}
          style={CARD_STYLES.withColor(colors.primary)}
        >
          <p
            className={`${TYPOGRAPHY.label.fontSize} mb-2 ${TYPOGRAPHY.label.textTransform}`}
            style={{
              color: COMMON_COLORS.text.tertiary,
              letterSpacing: "0.05em",
            }}
          >
            비전 개수
          </p>
          <p
            className={`${TYPOGRAPHY.number.medium.fontSize} ${TYPOGRAPHY.number.medium.fontWeight}`}
            style={{
              background: colors.gradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {vision_overview.vision_records_count}
          </p>
        </Card>
        <Card
          ref={consistencyRef}
          className={`${SPACING.card.padding} text-center transition-all duration-300 hover:shadow-lg`}
          style={CARD_STYLES.withColor(colors.primary)}
        >
          <p
            className={`${TYPOGRAPHY.label.fontSize} mb-2 ${TYPOGRAPHY.label.textTransform}`}
            style={{
              color: COMMON_COLORS.text.tertiary,
              letterSpacing: "0.05em",
            }}
          >
            일관성 점수
          </p>
          <div className="flex items-baseline justify-center gap-1">
            <p
              className={`${TYPOGRAPHY.number.medium.fontSize} ${TYPOGRAPHY.number.medium.fontWeight}`}
              style={{
                background: colors.gradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {consistency}
            </p>
            <span
              className={`${TYPOGRAPHY.body.fontSize} font-medium`}
              style={{ color: COMMON_COLORS.text.muted }}
            >
              / 10
            </span>
          </div>
        </Card>
      </div>

      {/* 핵심 비전 */}
      {coreVisions.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: colors.gradient,
                boxShadow: `0 2px 8px ${colors.primary}30`,
              }}
            >
              <Target className="w-5 h-5 text-white" />
            </div>
            <p
              className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} ${TYPOGRAPHY.label.textTransform}`}
              style={{
                color: COMMON_COLORS.text.tertiary,
                letterSpacing: "0.05em",
              }}
            >
              핵심 비전
            </p>
          </div>
          <div className="space-y-1.5">
            {coreVisions.map((vision, index) => (
              <div
                key={index}
                className="relative flex items-start gap-3 py-3 px-4 rounded-xl transition-all duration-300 group"
                style={{
                  background:
                    "linear-gradient(to right, rgba(124, 154, 124, 0.03) 0%, transparent 100%)",
                  borderLeft: "3px solid transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderLeftColor = "#7C9A7C";
                  e.currentTarget.style.background =
                    "linear-gradient(to right, rgba(124, 154, 124, 0.08) 0%, rgba(124, 154, 124, 0.02) 100%)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderLeftColor = "transparent";
                  e.currentTarget.style.background =
                    "linear-gradient(to right, rgba(124, 154, 124, 0.03) 0%, transparent 100%)";
                }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-semibold transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 mt-0.5"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(2, 9, 2, 0.15) 0%, rgba(107, 138, 107, 0.1) 100%)",
                    border: "1.5px solid rgba(124, 154, 124, 0.3)",
                    color: "#7C9A7C",
                    fontSize: "11px",
                    fontWeight: "600",
                  }}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p
                    className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight} pt-0.5 transition-colors duration-200 group-hover:text-[#5A6B5A] mb-2`}
                    style={{
                      color: COMMON_COLORS.text.secondary,
                      letterSpacing: "0.01em",
                      fontWeight: "400",
                    }}
                  >
                    {vision.summary}
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
                      {vision.frequency}회 반복
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 비전 진행 코멘트 */}
      {vision_overview.vision_progress_comment && (
        <Card
          className={`${SPACING.card.padding} mb-8 transition-all duration-300 hover:shadow-lg`}
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
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p
                className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} ${TYPOGRAPHY.label.textTransform} mb-3`}
                style={{
                  color: COMMON_COLORS.text.tertiary,
                  letterSpacing: "0.05em",
                }}
              >
                비전 진행 상황
              </p>
              <p
                className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight}`}
                style={{ color: COMMON_COLORS.text.secondary }}
              >
                {vision_overview.vision_progress_comment}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* AI 비전 피드백 */}
      {aiFeedbacks.length > 0 && (
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
              AI 비전 피드백
            </p>
          </div>
          <div className="space-y-1.5">
            {aiFeedbacks.map((feedback, index) => (
              <div
                key={index}
                className="relative flex items-start gap-3 py-3 px-4 rounded-xl transition-all duration-300 group"
                style={{
                  background:
                    "linear-gradient(to right, rgba(124, 154, 124, 0.03) 0%, transparent 100%)",
                  borderLeft: "3px solid transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderLeftColor = "#7C9A7C";
                  e.currentTarget.style.background =
                    "linear-gradient(to right, rgba(124, 154, 124, 0.08) 0%, rgba(124, 154, 124, 0.02) 100%)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderLeftColor = "transparent";
                  e.currentTarget.style.background =
                    "linear-gradient(to right, rgba(124, 154, 124, 0.03) 0%, transparent 100%)";
                }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-semibold transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 mt-0.5"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(124, 154, 124, 0.15) 0%, rgba(107, 138, 107, 0.1) 100%)",
                    border: "1.5px solid rgba(124, 154, 124, 0.3)",
                    color: "#7C9A7C",
                    fontSize: "11px",
                    fontWeight: "600",
                  }}
                >
                  {index + 1}
                </div>
                <p
                  className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight} flex-1 pt-0.5 transition-colors duration-200 group-hover:text-[#5A6B5A]`}
                  style={{
                    color: COMMON_COLORS.text.secondary,
                    letterSpacing: "0.01em",
                    fontWeight: "400",
                  }}
                >
                  {feedback}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
