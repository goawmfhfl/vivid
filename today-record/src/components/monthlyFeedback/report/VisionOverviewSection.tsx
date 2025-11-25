"use client";

import { Target, Sparkles, TrendingUp } from "lucide-react";
import { Card } from "../../ui/card";
import { useCountUp } from "@/hooks/useCountUp";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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

  // 비전 빈도 차트 데이터
  const visionChartData = vision_overview.main_visions
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 7)
    .map((vision) => ({
      name:
        vision.summary.length > 15
          ? vision.summary.substring(0, 15) + "..."
          : vision.summary,
      frequency: vision.frequency,
      fullName: vision.summary,
    }));

  return (
    <div className="mb-10 sm:mb-12" style={{ marginTop: "32px" }}>
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#A3BFD9" }}
        >
          <Target className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: "#333333" }}
        >
          월간 비전
        </h2>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card
          className="p-4 text-center"
          style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
        >
          <p className="text-xs mb-1" style={{ color: "#6B7A6F" }}>
            비전 일수
          </p>
          <p className="text-xl font-bold" style={{ color: "#333333" }}>
            {vision_overview.vision_days_count}
          </p>
        </Card>
        <Card
          className="p-4 text-center"
          style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
        >
          <p className="text-xs mb-1" style={{ color: "#6B7A6F" }}>
            비전 개수
          </p>
          <p className="text-xl font-bold" style={{ color: "#333333" }}>
            {vision_overview.vision_records_count}
          </p>
        </Card>
        <Card
          ref={consistencyRef}
          className="p-4 text-center"
          style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
        >
          <p className="text-xs mb-1" style={{ color: "#6B7A6F" }}>
            일관성 점수
          </p>
          <p className="text-xl font-bold" style={{ color: "#A3BFD9" }}>
            {consistency}
          </p>
        </Card>
      </div>

      {/* 비전 빈도 차트 */}
      {visionChartData.length > 0 && (
        <Card
          className="p-5 mb-4"
          style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
        >
          <p className="text-xs mb-4" style={{ color: "#6B7A6F" }}>
            주요 비전 빈도
          </p>
          <div style={{ marginLeft: "-8px", marginRight: "-8px" }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={visionChartData}
                margin={{ top: 5, right: 5, left: -10, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{
                    fontSize: 9,
                    fill: "#6B7A6F",
                    fontWeight: 500,
                  }}
                  axisLine={{ stroke: "#E0E0E0", strokeWidth: 1.5 }}
                  tickLine={{ stroke: "#E0E0E0" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6B7A6F", fontWeight: 500 }}
                  axisLine={{ stroke: "#E0E0E0", strokeWidth: 1.5 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #EFE9E3",
                    borderRadius: "8px",
                    fontSize: "0.8rem",
                    color: "#333333",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                  labelStyle={{
                    color: "#A3BFD9",
                    fontWeight: 500,
                    marginBottom: "4px",
                  }}
                  formatter={(value: number, name: string, props: any) => [
                    `${value}회`,
                    props.payload.fullName,
                  ]}
                  labelFormatter={() => ""}
                />
                <Bar
                  dataKey="frequency"
                  fill="#A3BFD9"
                  radius={[8, 8, 0, 0]}
                  minPointSize={5}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* 비전 진행 코멘트 */}
      {vision_overview.vision_progress_comment && (
        <Card
          className="p-5 mb-4"
          style={{ backgroundColor: "#F5F7F5", border: "1px solid #E0E5E0" }}
        >
          <div className="flex items-start gap-3">
            <TrendingUp
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              style={{ color: "#A3BFD9" }}
            />
            <div>
              <p className="text-xs mb-2" style={{ color: "#6B7A6F" }}>
                비전 진행 상황
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#4E4B46", lineHeight: "1.7" }}
              >
                {vision_overview.vision_progress_comment}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* 다음 달 리마인더 */}
      {vision_overview.reminder_sentence_for_next_month && (
        <Card
          className="p-5 mb-4"
          style={{ backgroundColor: "#FDF6F0", border: "2px solid #D08C60" }}
        >
          <div className="flex items-start gap-3">
            <Sparkles
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              style={{ color: "#D08C60" }}
            />
            <div>
              <p
                className="text-xs mb-2"
                style={{ color: "#D08C60", fontWeight: "500" }}
              >
                다음 달 리마인더
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#4E4B46", lineHeight: "1.7" }}
              >
                {vision_overview.reminder_sentence_for_next_month}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* AI 피드백 */}
      {vision_overview.vision_ai_feedback && (
        <Card
          className="p-5"
          style={{ backgroundColor: "#F5F7F5", border: "1px solid #E0E5E0" }}
        >
          <div className="flex items-start gap-3">
            <Target
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              style={{ color: "#A3BFD9" }}
            />
            <div>
              <p className="text-xs mb-2" style={{ color: "#6B7A6F" }}>
                AI 비전 피드백
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#4E4B46", lineHeight: "1.7" }}
              >
                {vision_overview.vision_ai_feedback}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
