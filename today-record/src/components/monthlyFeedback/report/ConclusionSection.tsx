"use client";

import { Sparkles, ArrowRight, Target } from "lucide-react";
import { Card } from "../../ui/card";
import type { MonthlyReportData } from "./types";
import {
  SECTION_COLORS,
  COMMON_COLORS,
  TYPOGRAPHY,
  SPACING,
  CARD_STYLES,
} from "./design-system";

type ConclusionSectionProps = {
  conclusion_overview: MonthlyReportData["conclusion_overview"];
};

export function ConclusionSection({
  conclusion_overview,
}: ConclusionSectionProps) {
  // next_month_focus를 파싱하여 리스트로 변환
  const parseFocusList = (focus: string): string[] => {
    // "1) ~, 2) ~, 3) ~" 형식을 파싱
    const items = focus
      .split(/\d+\)/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0 && !item.startsWith(","));
    return items;
  };

  const focusItems = parseFocusList(conclusion_overview.next_month_focus);
  const colors = SECTION_COLORS.conclusion;

  return (
    <div
      className={SPACING.section.marginBottom}
      style={{ marginTop: SPACING.section.marginTop }}
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
        <h2
          className={`${TYPOGRAPHY.h2.fontSize} ${TYPOGRAPHY.h2.fontWeight}`}
          style={{ color: COMMON_COLORS.text.primary }}
        >
          {conclusion_overview.monthly_title}
        </h2>
      </div>

      {/* 월간 요약 */}
      <Card
        className={`${SPACING.card.padding} mb-6`}
        style={CARD_STYLES.withColor(colors.primary)}
      >
        <p
          className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight}`}
          style={{ color: COMMON_COLORS.text.secondary }}
        >
          {conclusion_overview.monthly_summary}
        </p>
      </Card>

      {/* 전환점 */}
      {conclusion_overview.turning_points &&
        conclusion_overview.turning_points.length > 0 && (
          <Card
            className={`${SPACING.card.padding} mb-6`}
            style={CARD_STYLES.gradient}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: colors.gradient,
                  boxShadow: `0 2px 4px ${colors.primary}30`,
                }}
              >
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
              <p
                className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} ${TYPOGRAPHY.label.textTransform}`}
                style={{
                  color: COMMON_COLORS.text.tertiary,
                  letterSpacing: "0.05em",
                }}
              >
                중요한 전환점
              </p>
            </div>
            <ul className="space-y-2">
              {conclusion_overview.turning_points.map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: colors.gradient,
                      boxShadow: `0 2px 4px ${colors.primary}30`,
                    }}
                  >
                    <span className="text-xs font-bold text-white">
                      {index + 1}
                    </span>
                  </div>
                  <span
                    className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight} flex-1`}
                    style={{ color: COMMON_COLORS.text.secondary }}
                  >
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

      {/* 다음 달 포커스 */}
      {focusItems.length > 0 && (
        <Card
          className={`${SPACING.card.padding} mb-6`}
          style={{
            background: `linear-gradient(135deg, ${colors.primary}12 0%, ${colors.primary}08 100%)`,
            border: `1.5px solid ${colors.border}`,
            borderRadius: "16px",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: colors.gradient,
                boxShadow: `0 2px 4px ${colors.primary}30`,
              }}
            >
              <Target className="w-4 h-4 text-white" />
            </div>
            <p
              className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} ${TYPOGRAPHY.label.textTransform}`}
              style={{ color: colors.primary, letterSpacing: "0.05em" }}
            >
              다음 달 집중 포인트
            </p>
          </div>
          <ul className="space-y-2">
            {focusItems.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: colors.gradient,
                    boxShadow: `0 2px 4px ${colors.primary}30`,
                  }}
                >
                  <span className="text-xs font-bold text-white">
                    {index + 1}
                  </span>
                </div>
                <span
                  className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight} flex-1`}
                  style={{ color: COMMON_COLORS.text.secondary }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* 응원 메시지 */}
      <Card
        className={`${SPACING.card.padding}`}
        style={{
          background: colors.gradient,
          color: "white",
          border: "none",
          boxShadow: `0 4px 16px ${colors.primary}30`,
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              boxShadow: "0 2px 8px rgba(255, 255, 255, 0.1)",
            }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p
              className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} ${TYPOGRAPHY.label.textTransform} mb-3`}
              style={{ opacity: 0.9, letterSpacing: "0.05em" }}
            >
              AI 응원 메시지
            </p>
            <p
              className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight}`}
              style={{ opacity: 0.95 }}
            >
              {conclusion_overview.ai_encouragement_message}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
