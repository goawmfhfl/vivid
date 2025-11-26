"use client";

import { Target, Sparkles, TrendingUp } from "lucide-react";
import { Card } from "../../ui/card";
import { useCountUp } from "@/hooks/useCountUp";
import type { MonthlyReportData } from "./types";

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

  return (
    <div className="mb-10 sm:mb-12" style={{ marginTop: "32px" }}>
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #7C9A7C 0%, #6B8A6B 100%)",
            boxShadow: "0 4px 12px rgba(124, 154, 124, 0.3)",
          }}
        >
          <Target className="w-6 h-6 text-white" />
        </div>
        <h2
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: "#333333" }}
        >
          월간 비전
        </h2>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card
          className="p-5 text-center transition-all duration-300 hover:shadow-lg"
          style={{
            backgroundColor: "white",
            border: "1px solid #E8E8E8",
            borderRadius: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <p
            className="text-xs mb-2 uppercase tracking-wide"
            style={{ color: "#6B7A6F", letterSpacing: "0.05em" }}
          >
            비전 일수
          </p>
          <p
            className="text-2xl font-bold"
            style={{
              background: "linear-gradient(135deg, #7C9A7C 0%, #6B8A6B 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {vision_overview.vision_days_count}
          </p>
        </Card>
        <Card
          className="p-5 text-center transition-all duration-300 hover:shadow-lg"
          style={{
            backgroundColor: "white",
            border: "1px solid #E8E8E8",
            borderRadius: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <p
            className="text-xs mb-2 uppercase tracking-wide"
            style={{ color: "#6B7A6F", letterSpacing: "0.05em" }}
          >
            비전 개수
          </p>
          <p
            className="text-2xl font-bold"
            style={{
              background: "linear-gradient(135deg, #7C9A7C 0%, #6B8A6B 100%)",
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
          className="p-5 text-center transition-all duration-300 hover:shadow-lg"
          style={{
            backgroundColor: "white",
            border: "1px solid #E8E8E8",
            borderRadius: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <p
            className="text-xs mb-2 uppercase tracking-wide"
            style={{ color: "#6B7A6F", letterSpacing: "0.05em" }}
          >
            일관성 점수
          </p>
          <div className="flex items-baseline justify-center gap-1">
            <p
              className="text-2xl font-bold"
              style={{
                background: "linear-gradient(135deg, #7C9A7C 0%, #6B8A6B 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {consistency}
            </p>
            <span className="text-sm font-medium" style={{ color: "#9CA3AF" }}>
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
                background: "linear-gradient(135deg, #7C9A7C 0%, #6B8A6B 100%)",
                boxShadow: "0 2px 8px rgba(124, 154, 124, 0.3)",
              }}
            >
              <Target className="w-5 h-5 text-white" />
            </div>
            <p
              className="text-sm font-semibold uppercase tracking-wide"
              style={{ color: "#4E4B46", letterSpacing: "0.05em" }}
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
                    className="text-sm leading-relaxed pt-0.5 transition-colors duration-200 group-hover:text-[#5A6B5A] mb-2"
                    style={{
                      color: "#4E4B46",
                      lineHeight: "1.65",
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
                        backgroundColor: "rgba(124, 154, 124, 0.1)",
                        color: "#7C9A7C",
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
          className="p-6 mb-8 transition-all duration-300 hover:shadow-lg"
          style={{
            backgroundColor: "white",
            border: "1px solid #E8E8E8",
            borderRadius: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #7C9A7C 0%, #6B8A6B 100%)",
                boxShadow: "0 2px 8px rgba(124, 154, 124, 0.3)",
              }}
            >
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p
                className="text-sm font-semibold mb-3 uppercase tracking-wide"
                style={{ color: "#4E4B46", letterSpacing: "0.05em" }}
              >
                비전 진행 상황
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#4E4B46", lineHeight: "1.8" }}
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
                background: "linear-gradient(135deg, #7C9A7C 0%, #6B8A6B 100%)",
                boxShadow: "0 2px 8px rgba(124, 154, 124, 0.3)",
              }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <p
              className="text-sm font-semibold uppercase tracking-wide"
              style={{ color: "#4E4B46", letterSpacing: "0.05em" }}
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
                  className="flex-1 text-sm leading-relaxed pt-0.5 transition-colors duration-200 group-hover:text-[#5A6B5A]"
                  style={{
                    color: "#4E4B46",
                    lineHeight: "1.65",
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
