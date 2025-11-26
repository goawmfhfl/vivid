"use client";

import { useState } from "react";
import {
  Brain,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp,
  BarChart3,
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

type InsightOverviewSectionProps = {
  insight_overview: MonthlyReportData["insight_overview"];
};

export function InsightOverviewSection({
  insight_overview,
}: InsightOverviewSectionProps) {
  const [expandedInsights, setExpandedInsights] = useState(false);

  const [daysCount, daysCountRef] = useCountUp({
    targetValue: insight_overview.insight_days_count,
    duration: 1000,
    delay: 0,
    triggerOnVisible: true,
  });

  const [recordsCount, recordsCountRef] = useCountUp({
    targetValue: insight_overview.insight_records_count,
    duration: 1000,
    delay: 100,
    triggerOnVisible: true,
  });

  const toggleInsights = () => {
    setExpandedInsights(!expandedInsights);
  };

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return date.replace(/-/g, ".");
  };

  const colors = SECTION_COLORS.insight;

  return (
    <div
      className={SPACING.section.marginBottom}
      style={{ marginTop: SPACING.section.marginTop }}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: colors.gradient,
            boxShadow: `0 2px 8px ${colors.primary}30`,
          }}
        >
          <Brain className="w-5 h-5 text-white" />
        </div>
        <h2
          className={`${TYPOGRAPHY.h2.fontSize} ${TYPOGRAPHY.h2.fontWeight}`}
          style={{ color: COMMON_COLORS.text.primary }}
        >
          월간 인사이트
        </h2>
      </div>

      {/* 대시보드 스타일 통계 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* 인사이트 일수 */}
        <Card
          ref={daysCountRef}
          className={`${SPACING.card.padding} transition-all duration-300 hover:shadow-lg`}
          style={CARD_STYLES.withColor(colors.primary)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} mb-2 ${TYPOGRAPHY.label.textTransform}`}
                style={{
                  color: COMMON_COLORS.text.tertiary,
                  letterSpacing: "0.05em",
                }}
              >
                인사이트 일수
              </p>
              <p
                className={`${TYPOGRAPHY.number.large.fontSize} ${TYPOGRAPHY.number.large.fontWeight}`}
                style={{
                  color: colors.primary,
                  textShadow: `0 2px 4px ${colors.primary}20`,
                }}
              >
                {daysCount}
              </p>
              <p
                className={`${TYPOGRAPHY.bodySmall.fontSize} mt-1`}
                style={{ color: COMMON_COLORS.text.muted }}
              >
                일
              </p>
            </div>
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, #A8BBA820 0%, #A8BBA810 100%)",
              }}
            >
              <BarChart3 className="w-8 h-8" style={{ color: "#A8BBA8" }} />
            </div>
          </div>
        </Card>

        {/* 인사이트 개수 */}
        <Card
          ref={recordsCountRef}
          className={`${SPACING.card.padding} transition-all duration-300 hover:shadow-lg`}
          style={CARD_STYLES.withColor(colors.primary)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} mb-2 ${TYPOGRAPHY.label.textTransform}`}
                style={{
                  color: COMMON_COLORS.text.tertiary,
                  letterSpacing: "0.05em",
                }}
              >
                인사이트 개수
              </p>
              <p
                className={`${TYPOGRAPHY.number.large.fontSize} ${TYPOGRAPHY.number.large.fontWeight}`}
                style={{
                  color: colors.primary,
                  textShadow: `0 2px 4px ${colors.primary}20`,
                }}
              >
                {recordsCount}
              </p>
              <p
                className={`${TYPOGRAPHY.bodySmall.fontSize} mt-1`}
                style={{ color: COMMON_COLORS.text.muted }}
              >
                개
              </p>
            </div>
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, #A8BBA820 0%, #A8BBA810 100%)",
              }}
            >
              <Lightbulb className="w-8 h-8" style={{ color: "#A8BBA8" }} />
            </div>
          </div>
        </Card>
      </div>

      {/* 핵심 인사이트 */}
      {insight_overview.core_insights &&
        insight_overview.core_insights.length > 0 && (
          <div className="mb-6">
            <p
              className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} mb-4 ${TYPOGRAPHY.label.textTransform}`}
              style={{
                color: COMMON_COLORS.text.tertiary,
                letterSpacing: "0.05em",
              }}
            >
              핵심 인사이트
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insight_overview.core_insights.map((insight, index) => (
                <Card
                  key={index}
                  className={`${SPACING.card.padding} transition-all duration-300 hover:shadow-lg`}
                  style={CARD_STYLES.withColor(colors.primary)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: colors.gradient,
                        boxShadow: `0 2px 4px ${colors.primary}30`,
                      }}
                    >
                      <span
                        className={`${TYPOGRAPHY.bodySmall.fontSize} font-bold text-white`}
                      >
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p
                        className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.fontWeight} mb-2 ${TYPOGRAPHY.body.lineHeight}`}
                        style={{ color: COMMON_COLORS.text.primary }}
                      >
                        {insight.summary}
                      </p>
                      <p
                        className={`${TYPOGRAPHY.bodySmall.fontSize} ${TYPOGRAPHY.bodySmall.lineHeight}`}
                        style={{ color: COMMON_COLORS.text.tertiary }}
                      >
                        {insight.explanation}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

      {/* 인사이트 목록 (Dropdown) */}
      {insight_overview.top_insights &&
        insight_overview.top_insights.length > 0 && (
          <Card
            className="mb-6 transition-all duration-300 hover:shadow-md overflow-hidden"
            style={{
              backgroundColor: "white",
              border: "1px solid #EFE9E3",
              borderRadius: "16px",
            }}
          >
            <button
              onClick={toggleInsights}
              className="w-full p-5 flex items-center justify-between transition-all duration-200 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #A8BBA8 0%, #98AB98 100%)",
                  }}
                >
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p
                    className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} ${TYPOGRAPHY.label.textTransform} mb-1`}
                    style={{
                      color: COMMON_COLORS.text.tertiary,
                      letterSpacing: "0.05em",
                    }}
                  >
                    전체 인사이트 목록
                  </p>
                  <p
                    className={TYPOGRAPHY.body.fontSize}
                    style={{ color: COMMON_COLORS.text.secondary }}
                  >
                    총 {insight_overview.top_insights.length}개의 인사이트
                  </p>
                </div>
              </div>
              {expandedInsights ? (
                <ChevronUp className="w-5 h-5" style={{ color: "#6B7A6F" }} />
              ) : (
                <ChevronDown className="w-5 h-5" style={{ color: "#6B7A6F" }} />
              )}
            </button>

            {expandedInsights && (
              <div className="px-5 pb-5 pt-0 border-t animate-in slide-in-from-top-2 duration-300">
                <div className="mt-4 space-y-3">
                  {insight_overview.top_insights.map((insight, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl transition-all duration-200 hover:bg-gray-50"
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? "#FAFAF8" : "transparent",
                        border: "1px solid #EFE9E3",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{
                            background:
                              "linear-gradient(135deg, #A8BBA8 0%, #98AB98 100%)",
                            boxShadow: "0 2px 4px rgba(168, 187, 168, 0.3)",
                          }}
                        >
                          <span
                            className={`${TYPOGRAPHY.bodySmall.fontSize} font-bold text-white`}
                          >
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p
                            className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight} mb-2`}
                            style={{ color: COMMON_COLORS.text.secondary }}
                          >
                            {insight.summary}
                          </p>
                          <div className="flex items-center gap-4 text-xs">
                            {insight.first_date && (
                              <span style={{ color: "#6B7A6F" }}>
                                첫 등장: {formatDate(insight.first_date)}
                              </span>
                            )}
                            {insight.frequency > 1 && (
                              <span
                                className="px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: "#A8BBA820",
                                  color: "#A8BBA8",
                                  fontWeight: "600",
                                }}
                              >
                                {insight.frequency}회 반복
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

      {/* 종합 인사이트 분석 */}
      {insight_overview.insight_comprehensive_summary && (
        <Card
          className="p-6 mb-6 transition-all duration-300 hover:shadow-md"
          style={{
            background: "linear-gradient(135deg, #F5F7F5 0%, #F0F5F0 100%)",
            border: "1px solid #E0E5E0",
            borderRadius: "16px",
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #A8BBA8 0%, #98AB98 100%)",
                boxShadow: "0 2px 8px rgba(168, 187, 168, 0.3)",
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
                종합 인사이트 분석
              </p>
              <p
                className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight}`}
                style={{ color: COMMON_COLORS.text.secondary }}
              >
                {insight_overview.insight_comprehensive_summary}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* AI 인사이트 코멘트 */}
      {insight_overview.insight_ai_comment && (
        <Card
          className="p-6 transition-all duration-300 hover:shadow-md"
          style={{
            background: "linear-gradient(135deg, #F5F7F5 0%, #F0F5F0 100%)",
            border: "1px solid #E0E5E0",
            borderRadius: "16px",
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #A8BBA8 0%, #98AB98 100%)",
                boxShadow: "0 2px 8px rgba(168, 187, 168, 0.3)",
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
                AI 인사이트 코멘트
              </p>
              <p
                className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight}`}
                style={{ color: COMMON_COLORS.text.secondary }}
              >
                {insight_overview.insight_ai_comment}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
