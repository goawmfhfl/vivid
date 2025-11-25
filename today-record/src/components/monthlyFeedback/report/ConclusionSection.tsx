"use client";

import { Sparkles, ArrowRight, Target } from "lucide-react";
import { Card } from "../../ui/card";
import type { MonthlyReportData } from "./types";

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

  return (
    <div className="mb-10 sm:mb-12" style={{ marginTop: "32px" }}>
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, #D08C60 0%, #E5B96B 50%, #A8BBA8 100%)",
            boxShadow: "0 4px 12px rgba(208, 140, 96, 0.3)",
          }}
        >
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: "#333333" }}
        >
          {conclusion_overview.monthly_title}
        </h2>
      </div>

      {/* 월간 요약 */}
      <Card
        className="p-6 mb-4"
        style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
      >
        <p
          className="text-sm leading-relaxed"
          style={{ color: "#4E4B46", lineHeight: "1.7" }}
        >
          {conclusion_overview.monthly_summary}
        </p>
      </Card>

      {/* 전환점 */}
      {conclusion_overview.turning_points &&
        conclusion_overview.turning_points.length > 0 && (
          <Card
            className="p-5 mb-4"
            style={{ backgroundColor: "#F5F7F5", border: "1px solid #E0E5E0" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <ArrowRight className="w-4 h-4" style={{ color: "#A8BBA8" }} />
              <p className="text-xs font-semibold" style={{ color: "#6B7A6F" }}>
                중요한 전환점
              </p>
            </div>
            <ul className="space-y-2">
              {conclusion_overview.turning_points.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-xs mt-1" style={{ color: "#A8BBA8" }}>
                    •
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: "#4E4B46", lineHeight: "1.6" }}
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
          className="p-5 mb-4"
          style={{ backgroundColor: "#FDF6F0", border: "2px solid #D08C60" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4" style={{ color: "#D08C60" }} />
            <p className="text-xs font-semibold" style={{ color: "#D08C60" }}>
              다음 달 집중 포인트
            </p>
          </div>
          <ul className="space-y-2">
            {focusItems.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span
                  className="text-xs mt-1 font-semibold"
                  style={{ color: "#D08C60" }}
                >
                  {index + 1}
                </span>
                <span
                  className="text-sm"
                  style={{ color: "#4E4B46", lineHeight: "1.6" }}
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
        className="p-6"
        style={{
          background: "linear-gradient(135deg, #A8BBA8 0%, #6B7A6F 100%)",
          color: "white",
          border: "none",
        }}
      >
        <div className="flex items-start gap-3">
          <Sparkles
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            style={{ opacity: 0.9 }}
          />
          <div>
            <p
              className="text-xs mb-2"
              style={{ opacity: 0.85, fontWeight: 500 }}
            >
              AI 응원 메시지
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ opacity: 0.95, lineHeight: "1.7" }}
            >
              {conclusion_overview.ai_encouragement_message}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
