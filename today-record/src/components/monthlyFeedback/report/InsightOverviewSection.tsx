"use client";

import { Brain, Lightbulb, TrendingUp } from "lucide-react";
import { Card } from "../../ui/card";
import { useCountUp } from "@/hooks/useCountUp";
import type { MonthlyReportData } from "./types";

type InsightOverviewSectionProps = {
  insight_overview: MonthlyReportData["insight_overview"];
};

export function InsightOverviewSection({
  insight_overview,
}: InsightOverviewSectionProps) {
  const [depthScore, depthScoreRef] = useCountUp({
    targetValue: insight_overview.insight_depth_score,
    duration: 1000,
    delay: 0,
    triggerOnVisible: true,
  });

  return (
    <div className="mb-10 sm:mb-12" style={{ marginTop: "32px" }}>
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#A8BBA8" }}
        >
          <Brain className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: "#333333" }}
        >
          월간 인사이트
        </h2>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card
          className="p-4 text-center"
          style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
        >
          <p className="text-xs mb-1" style={{ color: "#6B7A6F" }}>
            인사이트 일수
          </p>
          <p className="text-xl font-bold" style={{ color: "#333333" }}>
            {insight_overview.insight_days_count}
          </p>
        </Card>
        <Card
          className="p-4 text-center"
          style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
        >
          <p className="text-xs mb-1" style={{ color: "#6B7A6F" }}>
            인사이트 개수
          </p>
          <p className="text-xl font-bold" style={{ color: "#333333" }}>
            {insight_overview.insight_records_count}
          </p>
        </Card>
        <Card
          ref={depthScoreRef}
          className="p-4 text-center"
          style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
        >
          <p className="text-xs mb-1" style={{ color: "#6B7A6F" }}>
            생각 깊이
          </p>
          <p className="text-xl font-bold" style={{ color: "#A8BBA8" }}>
            {depthScore}
          </p>
        </Card>
      </div>

      {/* 인사이트 테마 */}
      {insight_overview.insight_themes &&
        insight_overview.insight_themes.length > 0 && (
          <Card
            className="p-5 mb-4"
            style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
          >
            <p className="text-xs mb-3" style={{ color: "#6B7A6F" }}>
              반복된 인사이트 주제
            </p>
            <div className="flex flex-wrap gap-2">
              {insight_overview.insight_themes.map((theme, index) => (
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

      {/* 주요 인사이트 */}
      {insight_overview.top_insights &&
        insight_overview.top_insights.length > 0 && (
          <div className="space-y-3 mb-4">
            {insight_overview.top_insights.map((insight, index) => (
              <Card
                key={index}
                className="p-4 transition-all duration-300 hover:shadow-lg"
                style={{
                  backgroundColor: "white",
                  border: "1px solid #EFE9E3",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#A8BBA8" }}
                  >
                    <Lightbulb className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-sm mb-2"
                      style={{ color: "#333333", lineHeight: "1.7" }}
                    >
                      {insight.summary}
                    </p>
                    <div
                      className="flex items-center gap-3 text-xs"
                      style={{ color: "#6B7A6F" }}
                    >
                      {insight.first_date && (
                        <span>첫 등장: {insight.first_date}</span>
                      )}
                      {insight.frequency > 1 && (
                        <span>• {insight.frequency}회 반복</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

      {/* 메타 질문 */}
      {insight_overview.meta_question_for_month && (
        <Card
          className="p-5 mb-4"
          style={{ backgroundColor: "#FDF6F0", border: "2px solid #D08C60" }}
        >
          <div className="flex items-start gap-3">
            <TrendingUp
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              style={{ color: "#D08C60" }}
            />
            <div>
              <p
                className="text-xs mb-2"
                style={{ color: "#D08C60", fontWeight: "500" }}
              >
                이번 달의 큰 질문
              </p>
              <p
                className="text-sm italic leading-relaxed"
                style={{ color: "#4E4B46", lineHeight: "1.7" }}
              >
                &ldquo;{insight_overview.meta_question_for_month}&rdquo;
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* AI 코멘트 */}
      {insight_overview.insight_ai_comment && (
        <Card
          className="p-5"
          style={{ backgroundColor: "#F5F7F5", border: "1px solid #E0E5E0" }}
        >
          <div className="flex items-start gap-3">
            <Brain
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              style={{ color: "#A8BBA8" }}
            />
            <div>
              <p className="text-xs mb-2" style={{ color: "#6B7A6F" }}>
                AI 인사이트 코멘트
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#4E4B46", lineHeight: "1.7" }}
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
