"use client";

import { Sparkles, TrendingUp, Activity, Heart, Users } from "lucide-react";
import { Card } from "../../ui/card";
import { useCountUp } from "@/hooks/useCountUp";
import type { MonthlyReportData } from "./types";

type SummaryOverviewSectionProps = {
  summary_overview: MonthlyReportData["summary_overview"];
};

export function SummaryOverviewSection({
  summary_overview,
}: SummaryOverviewSectionProps) {
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
      label: "생활 밸런스",
      value: lifeBalance,
      ref: lifeBalanceRef,
      icon: Activity,
      color: "#A8BBA8",
    },
    {
      label: "실행력",
      value: execution,
      ref: executionRef,
      icon: TrendingUp,
      color: "#E5B96B",
    },
    {
      label: "휴식/회복",
      value: rest,
      ref: restRef,
      icon: Heart,
      color: "#B89A7A",
    },
    {
      label: "관계/소통",
      value: relationship,
      ref: relationshipRef,
      icon: Users,
      color: "#6B7A6F",
    },
  ];

  return (
    <div className="mb-10 sm:mb-12" style={{ marginTop: "32px" }}>
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#D08C60" }}
        >
          <Sparkles className="w-4 h-4 text-white" />
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
            className="p-5 mb-4"
            style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
          >
            <p className="text-xs mb-3" style={{ color: "#6B7A6F" }}>
              이번 달 주요 테마
            </p>
            <div className="flex flex-wrap gap-2">
              {summary_overview.main_themes.map((theme, index) => (
                <span
                  key={index}
                  className="text-sm px-3 py-1.5 rounded-full"
                  style={{
                    backgroundColor: "#E8EFE8",
                    color: "#6B7A6F",
                    fontWeight: "500",
                  }}
                >
                  {theme}
                </span>
              ))}
            </div>
          </Card>
        )}

      {/* 점수 카드들 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {scoreItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card
              key={index}
              ref={item.ref}
              className="p-4 transition-all duration-300 hover:shadow-lg"
              style={{
                backgroundColor: "white",
                border: `1.5px solid ${item.color}30`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: item.color }} />
                <p className="text-xs" style={{ color: "#6B7A6F" }}>
                  {item.label}
                </p>
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-2xl font-bold"
                  style={{ color: item.color }}
                >
                  {item.value}
                </span>
                <span className="text-sm" style={{ color: "#6B7A6F" }}>
                  / 10
                </span>
              </div>
              {/* 진행 바 */}
              <div
                className="mt-3 h-1.5 rounded-full"
                style={{ backgroundColor: "#F0F5F0" }}
              >
                <div
                  className="h-1.5 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    backgroundColor: item.color,
                    width: `${(item.value / 10) * 100}%`,
                  }}
                />
              </div>
            </Card>
          );
        })}
      </div>

      {/* AI 코멘트 */}
      {summary_overview.summary_ai_comment && (
        <Card
          className="p-5"
          style={{ backgroundColor: "#F5F7F5", border: "1px solid #E0E5E0" }}
        >
          <div className="flex items-start gap-3">
            <Sparkles
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              style={{ color: "#A8BBA8" }}
            />
            <div>
              <p className="text-xs mb-2" style={{ color: "#6B7A6F" }}>
                AI 종합 코멘트
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#4E4B46", lineHeight: "1.7" }}
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
