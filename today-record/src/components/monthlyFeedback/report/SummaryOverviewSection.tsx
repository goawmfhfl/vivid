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

  return (
    <div className="mb-10 sm:mb-12" style={{ marginTop: "32px" }}>
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
          style={{
            background: "linear-gradient(135deg, #D08C60 0%, #C77A4F 100%)",
          }}
        >
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: "#333333" }}
        >
          월간 요약
        </h2>
      </div>

      {/* 주요 테마 */}
      {summary_overview.main_themes &&
        summary_overview.main_themes.length > 0 && (
          <Card
            className="p-6 mb-6 transition-all duration-300 hover:shadow-md"
            style={{
              backgroundColor: "white",
              border: "1px solid #EFE9E3",
              borderRadius: "16px",
            }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p
                  className="text-xs font-semibold mb-3 uppercase tracking-wide"
                  style={{ color: "#6B7A6F", letterSpacing: "0.05em" }}
                >
                  이번 달 주요 테마
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {summary_overview.main_themes.map((theme, index) => (
                    <span
                      key={index}
                      className="text-sm px-4 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105"
                      style={{
                        background:
                          "linear-gradient(135deg, #E8EFE8 0%, #D8E5D8 100%)",
                        color: "#6B7A6F",
                        border: "1px solid #C8D5C8",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
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
                style={{ borderColor: "#EFE9E3" }}
              >
                <div className="flex items-start gap-2">
                  <Info
                    className="w-4 h-4 flex-shrink-0 mt-0.5"
                    style={{ color: "#A8BBA8" }}
                  />
                  <div>
                    <p
                      className="text-xs font-medium mb-1.5"
                      style={{ color: "#6B7A6F" }}
                    >
                      이 테마를 선택한 이유
                    </p>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "#4E4B46", lineHeight: "1.6" }}
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

          return (
            <Card
              key={item.id}
              ref={item.ref}
              className="transition-all duration-300 hover:shadow-lg cursor-pointer overflow-hidden"
              style={{
                backgroundColor: "white",
                border: `1.5px solid ${item.color}40`,
                borderRadius: "16px",
              }}
              onClick={() => toggleExpand(item.id)}
            >
              {/* 점수 헤더 */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: `${item.color}15`,
                        border: `1.5px solid ${item.color}30`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "#6B7A6F", letterSpacing: "0.05em" }}
                    >
                      {item.label}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp
                      className="w-4 h-4 transition-transform duration-200"
                      style={{ color: item.color }}
                    />
                  ) : (
                    <ChevronDown
                      className="w-4 h-4 transition-transform duration-200"
                      style={{ color: "#9CA3AF" }}
                    />
                  )}
                </div>

                {/* 점수 표시 */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span
                    className="text-3xl font-bold"
                    style={{
                      color: item.color,
                      textShadow: `0 2px 4px ${item.color}20`,
                    }}
                  >
                    {item.value}
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "#9CA3AF" }}
                  >
                    / 10
                  </span>
                </div>

                {/* 진행 바 */}
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: "#F0F5F0" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}CC 100%)`,
                      width: `${(item.value / 10) * 100}%`,
                      boxShadow: `0 2px 4px ${item.color}30`,
                    }}
                  />
                </div>
              </div>

              {/* 확장 영역: 이유 및 피드백 */}
              {isExpanded && (
                <div
                  className="px-5 pb-5 pt-0 border-t animate-in slide-in-from-top-2 duration-300"
                  style={{
                    borderColor: `${item.color}20`,
                    backgroundColor: `${item.color}05`,
                  }}
                >
                  {/* 점수 이유 */}
                  {item.reason && (
                    <div className="pt-4 pb-3">
                      <div className="flex items-start gap-2.5 mb-2">
                        <Info
                          className="w-4 h-4 flex-shrink-0 mt-0.5"
                          style={{ color: item.color }}
                        />
                        <p
                          className="text-xs font-semibold uppercase tracking-wide"
                          style={{ color: "#6B7A6F", letterSpacing: "0.05em" }}
                        >
                          점수 근거
                        </p>
                      </div>
                      <p
                        className="text-sm leading-relaxed pl-6"
                        style={{ color: "#4E4B46", lineHeight: "1.7" }}
                      >
                        {item.reason}
                      </p>
                    </div>
                  )}

                  {/* 피드백 */}
                  {item.feedback && (
                    <div className="pt-3 pb-2">
                      <div className="flex items-start gap-2.5 mb-2">
                        <Sparkles
                          className="w-4 h-4 flex-shrink-0 mt-0.5"
                          style={{ color: item.color }}
                        />
                        <p
                          className="text-xs font-semibold uppercase tracking-wide"
                          style={{ color: "#6B7A6F", letterSpacing: "0.05em" }}
                        >
                          AI 피드백
                        </p>
                      </div>
                      <p
                        className="text-sm leading-relaxed pl-6"
                        style={{ color: "#4E4B46", lineHeight: "1.7" }}
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
                className="text-xs font-semibold mb-3 uppercase tracking-wide"
                style={{ color: "#6B7A6F", letterSpacing: "0.05em" }}
              >
                AI 종합 코멘트
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#4E4B46", lineHeight: "1.8" }}
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
