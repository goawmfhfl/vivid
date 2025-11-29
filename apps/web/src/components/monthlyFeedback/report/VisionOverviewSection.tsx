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

  const [visionDays, visionDaysRef] = useCountUp({
    targetValue: vision_overview.vision_days_count,
    duration: 1000,
    delay: 0,
    triggerOnVisible: true,
  });

  const [visionRecords, visionRecordsRef] = useCountUp({
    targetValue: vision_overview.vision_records_count,
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
          ref={visionDaysRef}
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
            {visionDays}
          </p>
        </Card>
        <Card
          ref={visionRecordsRef}
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
            {visionRecords}
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
        <Card
          className={`${SPACING.card.padding} mb-8 transition-all duration-300 hover:shadow-lg`}
          style={CARD_STYLES.withColor(colors.primary)}
        >
          <div className="flex items-center gap-3 mb-6">
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
          <div className="space-y-3">
            {coreVisions.map((vision, index) => (
              <div
                key={index}
                className="relative flex items-start gap-4 p-4 rounded-xl transition-all duration-300 group cursor-pointer"
                style={{
                  backgroundColor: "#FAFAF8",
                  border: `1.5px solid rgba(124, 154, 124, 0.15)`,
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.primary;
                  e.currentTarget.style.backgroundColor =
                    "rgba(124, 154, 124, 0.08)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(124, 154, 124, 0.15)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(124, 154, 124, 0.15)";
                  e.currentTarget.style.backgroundColor = "#FAFAF8";
                  e.currentTarget.style.boxShadow =
                    "0 1px 3px rgba(0, 0, 0, 0.05)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-semibold transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{
                    background: colors.gradient,
                    boxShadow: `0 2px 6px ${colors.primary}30`,
                    color: "white",
                    fontSize: "13px",
                    fontWeight: "700",
                  }}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p
                    className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight} mb-3 transition-colors duration-200`}
                    style={{
                      color: COMMON_COLORS.text.primary,
                      letterSpacing: "0.01em",
                      fontWeight: "500",
                    }}
                  >
                    {vision.summary}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: `${colors.primary}15`,
                        color: colors.primary,
                        fontWeight: "600",
                        border: `1px solid ${colors.primary}30`,
                      }}
                    >
                      {vision.frequency}회 반복
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
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
        <Card
          className={`${SPACING.card.padding} mb-8 transition-all duration-300 hover:shadow-lg`}
          style={CARD_STYLES.withColor(colors.primary)}
        >
          <div className="flex items-center gap-3 mb-6">
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
          <div className="space-y-3">
            {aiFeedbacks.map((feedback, index) => (
              <div
                key={index}
                className="relative flex items-start gap-4 p-4 rounded-xl transition-all duration-300 group cursor-pointer"
                style={{
                  backgroundColor: "#FAFAF8",
                  border: `1.5px solid rgba(124, 154, 124, 0.15)`,
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.primary;
                  e.currentTarget.style.backgroundColor =
                    "rgba(124, 154, 124, 0.08)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(124, 154, 124, 0.15)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(124, 154, 124, 0.15)";
                  e.currentTarget.style.backgroundColor = "#FAFAF8";
                  e.currentTarget.style.boxShadow =
                    "0 1px 3px rgba(0, 0, 0, 0.05)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-semibold transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{
                    background: colors.gradient,
                    boxShadow: `0 2px 6px ${colors.primary}30`,
                    color: "white",
                    fontSize: "13px",
                    fontWeight: "700",
                  }}
                >
                  {index + 1}
                </div>
                <p
                  className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight} flex-1 pt-1 transition-colors duration-200`}
                  style={{
                    color: COMMON_COLORS.text.primary,
                    letterSpacing: "0.01em",
                    fontWeight: "500",
                  }}
                >
                  {feedback}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
