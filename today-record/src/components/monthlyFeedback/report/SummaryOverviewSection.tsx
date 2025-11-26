"use client";

import { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  Activity,
  Heart,
  Users,
  ChevronDown,
  ChevronUp,
  Info,
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

type SummaryOverviewSectionProps = {
  summary_overview: MonthlyReportData["summary_overview"];
};

export function SummaryOverviewSection({
  summary_overview,
}: SummaryOverviewSectionProps) {
  const [expandedScore, setExpandedScore] = useState<string | null>(null);

  const [lifeBalance, lifeBalanceRef] = useCountUp({
    targetValue: summary_overview.life_balance_score,
    duration: 1000,
    delay: 0,
    triggerOnVisible: true,
  });

  const [execution, executionRef] = useCountUp({
    targetValue: summary_overview.execution_score,
    duration: 1000,
    delay: 100,
    triggerOnVisible: true,
  });

  const [rest, restRef] = useCountUp({
    targetValue: summary_overview.rest_score,
    duration: 1000,
    delay: 200,
    triggerOnVisible: true,
  });

  const [relationship, relationshipRef] = useCountUp({
    targetValue: summary_overview.relationship_score,
    duration: 1000,
    delay: 300,
    triggerOnVisible: true,
  });

  const scoreItems = [
    {
      id: "life_balance",
      label: "생활 밸런스",
      value: lifeBalance,
      ref: lifeBalanceRef,
      icon: Activity,
      color: "#A8BBA8",
      reason: summary_overview.life_balance_reason,
      feedback: summary_overview.life_balance_feedback,
    },
    {
      id: "execution",
      label: "실행력",
      value: execution,
      ref: executionRef,
      icon: TrendingUp,
      color: "#E5B96B",
      reason: summary_overview.execution_reason,
      feedback: summary_overview.execution_feedback,
    },
    {
      id: "rest",
      label: "휴식/회복",
      value: rest,
      ref: restRef,
      icon: Heart,
      color: "#B89A7A",
      reason: summary_overview.rest_reason,
      feedback: summary_overview.rest_feedback,
    },
    {
      id: "relationship",
      label: "관계/소통",
      value: relationship,
      ref: relationshipRef,
      icon: Users,
      color: "#6B7A6F",
      reason: summary_overview.relationship_reason,
      feedback: summary_overview.relationship_feedback,
    },
  ];

  const toggleExpand = (id: string) => {
    setExpandedScore(expandedScore === id ? null : id);
  };

  const colors = SECTION_COLORS.summary;

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
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h2
          className={`${TYPOGRAPHY.h2.fontSize} ${TYPOGRAPHY.h2.fontWeight}`}
          style={{ color: COMMON_COLORS.text.primary }}
        >
          월간 요약
        </h2>
      </div>

      {/* 주요 테마 */}
      {summary_overview.main_themes &&
        summary_overview.main_themes.length > 0 && (
          <Card
            className={`${SPACING.card.padding} mb-6 transition-all duration-300 hover:shadow-lg`}
            style={CARD_STYLES.withColor(colors.primary)}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <p
                  className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} ${TYPOGRAPHY.label.textTransform} mb-4`}
                  style={{
                    color: COMMON_COLORS.text.tertiary,
                    letterSpacing: "0.05em",
                  }}
                >
                  이번 달 주요 테마
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {summary_overview.main_themes.map((theme, index) => (
                    <span
                      key={index}
                      className="text-sm px-4 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.primary}10 100%)`,
                        color: colors.primary,
                        border: `1px solid ${colors.border}`,
                        boxShadow: `0 1px 3px ${colors.primary}10`,
                      }}
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 주요 테마 이유 */}
            {summary_overview.main_themes_reason && (
              <div
                className="mt-4 pt-4 border-t"
                style={{ borderColor: COMMON_COLORS.border.light }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: colors.gradient,
                      boxShadow: `0 2px 4px ${colors.primary}30`,
                    }}
                  >
                    <Info className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} mb-2`}
                      style={{ color: COMMON_COLORS.text.tertiary }}
                    >
                      이 테마를 선택한 이유
                    </p>
                    <p
                      className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight}`}
                      style={{ color: COMMON_COLORS.text.secondary }}
                    >
                      {summary_overview.main_themes_reason}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

      {/* 점수 카드들 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {scoreItems.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedScore === item.id;
          // 각 점수 항목의 색상을 섹션 컬러에 맞게 조정
          const itemColor = colors.primary;

          return (
            <Card
              key={item.id}
              ref={item.ref}
              className="transition-all duration-300 hover:shadow-lg cursor-pointer overflow-hidden"
              style={CARD_STYLES.withColor(itemColor)}
              onClick={() => toggleExpand(item.id)}
            >
              {/* 점수 헤더 */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${itemColor}20 0%, ${itemColor}10 100%)`,
                        border: `1.5px solid ${itemColor}30`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: itemColor }} />
                    </div>
                    <p
                      className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} ${TYPOGRAPHY.label.textTransform}`}
                      style={{
                        color: COMMON_COLORS.text.tertiary,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {item.label}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp
                      className="w-4 h-4 transition-transform duration-200"
                      style={{ color: itemColor }}
                    />
                  ) : (
                    <ChevronDown
                      className="w-4 h-4 transition-transform duration-200"
                      style={{ color: COMMON_COLORS.text.muted }}
                    />
                  )}
                </div>

                {/* 점수 표시 */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span
                    className={`${TYPOGRAPHY.number.large.fontSize} ${TYPOGRAPHY.number.large.fontWeight}`}
                    style={{
                      color: itemColor,
                      textShadow: `0 2px 4px ${itemColor}20`,
                    }}
                  >
                    {item.value}
                  </span>
                  <span
                    className={`${TYPOGRAPHY.body.fontSize} font-medium`}
                    style={{ color: COMMON_COLORS.text.muted }}
                  >
                    / 10
                  </span>
                </div>

                {/* 진행 바 */}
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{
                    backgroundColor:
                      COMMON_COLORS.background.cardGradient.split(" ")[2],
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      background: `linear-gradient(90deg, ${itemColor} 0%, ${itemColor}CC 100%)`,
                      width: `${(item.value / 10) * 100}%`,
                      boxShadow: `0 2px 4px ${itemColor}30`,
                    }}
                  />
                </div>
              </div>

              {/* 확장 영역: 이유 및 피드백 */}
              {isExpanded && (
                <div
                  className="px-5 pb-5 pt-0 border-t animate-in slide-in-from-top-2 duration-300"
                  style={{
                    borderColor: `${itemColor}20`,
                    backgroundColor: `${itemColor}05`,
                  }}
                >
                  {/* 점수 이유 */}
                  {item.reason && (
                    <div className="pt-4 pb-3">
                      <div className="flex items-start gap-3 mb-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${itemColor} 0%, ${itemColor}DD 100%)`,
                            boxShadow: `0 2px 4px ${itemColor}30`,
                          }}
                        >
                          <Info className="w-4 h-4 text-white" />
                        </div>
                        <p
                          className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} ${TYPOGRAPHY.label.textTransform}`}
                          style={{
                            color: COMMON_COLORS.text.tertiary,
                            letterSpacing: "0.05em",
                          }}
                        >
                          점수 근거
                        </p>
                      </div>
                      <p
                        className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight} pl-11`}
                        style={{ color: COMMON_COLORS.text.secondary }}
                      >
                        {item.reason}
                      </p>
                    </div>
                  )}

                  {/* 피드백 */}
                  {item.feedback && (
                    <div className="pt-3 pb-2">
                      <div className="flex items-start gap-3 mb-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${itemColor} 0%, ${itemColor}DD 100%)`,
                            boxShadow: `0 2px 4px ${itemColor}30`,
                          }}
                        >
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <p
                          className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} ${TYPOGRAPHY.label.textTransform}`}
                          style={{
                            color: COMMON_COLORS.text.tertiary,
                            letterSpacing: "0.05em",
                          }}
                        >
                          AI 피드백
                        </p>
                      </div>
                      <p
                        className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight} pl-11`}
                        style={{ color: COMMON_COLORS.text.secondary }}
                      >
                        {item.feedback}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* AI 종합 코멘트 */}
      {summary_overview.summary_ai_comment && (
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
                AI 종합 코멘트
              </p>
              <p
                className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight}`}
                style={{ color: COMMON_COLORS.text.secondary }}
              >
                {summary_overview.summary_ai_comment}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
