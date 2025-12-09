"use client";

import {
  Target,
  Lock,
  ArrowRight,
  Lightbulb,
  Sparkles,
  User,
} from "lucide-react";
import { Card } from "../../ui/card";
import type { VisionReport } from "@/types/monthly-feedback-new";
import { COLORS } from "@/lib/design-system";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from "recharts";

type VisionSectionProps = {
  visionReport: VisionReport;
  isPro?: boolean;
};

const VISION_COLOR = "#A3BFD9";

// 차트용 색상 팔레트 - 각 비전 항목을 구분하기 위한 다양한 색상
const CHART_COLORS = [
  "#6B7A6F", // 다크 그린
  "#7C9A7C", // 미드 그린
  "#A8BBA8", // 라이트 그린
  "#5A7A9A", // 블루 그레이
  "#8FA8C7", // 라이트 블루
  "#A3BFD9", // 파스텔 블루
  "#B8D4E3", // 매우 연한 블루
  "#6B8A6B", // 포레스트 그린
  "#7C9A7C", // 세이지 그린
  "#9CAF9C", // 민트 그린
];

export function VisionSection({
  visionReport,
  isPro = false,
}: VisionSectionProps) {
  const router = useRouter();

  if (!visionReport) {
    return null;
  }

  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: VISION_COLOR }}
        >
          <Target className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: COLORS.text.primary }}
        >
          이번 달의 비전
        </h2>
      </div>

      {/* 비전 진행 상황 요약 - 모든 사용자 */}
      {visionReport.vision_progress_comment && (
        <Card
          className="mb-4 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(163, 191, 217, 0.08) 0%, rgba(255, 255, 255, 1) 100%)",
            border: "1px solid rgba(163, 191, 217, 0.3)",
            borderRadius: "20px",
            boxShadow: "0 4px 20px rgba(163, 191, 217, 0.08)",
          }}
        >
          {/* 헤더 */}
          <div
            className="p-5 sm:p-6 pb-4 border-b"
            style={{ borderColor: "rgba(163, 191, 217, 0.2)" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, #A3BFD9 0%, #8FA8C7 100%)",
                  boxShadow: "0 4px 12px rgba(163, 191, 217, 0.3)",
                }}
              >
                <Target className="w-5 h-5 text-white" />
              </div>
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: COLORS.text.secondary }}
              >
                비전 진행 상황
              </p>
            </div>
          </div>
          {/* 바디 */}
          <div className="p-5 sm:p-6 pt-4">
            <p
              className="text-sm leading-relaxed"
              style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
            >
              {visionReport.vision_progress_comment}
            </p>
          </div>
        </Card>
      )}

      {/* Pro 전용 섹션들 */}
      {isPro ? (
        <div className="space-y-4">
          {/* 핵심 비전 (Core Visions) - 막대 차트 포함 */}
          {visionReport.core_visions &&
            visionReport.core_visions.length > 0 && (
              <Card
                className="relative overflow-hidden group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(163, 191, 217, 0.12) 0%, rgba(255, 255, 255, 1) 100%)",
                  border: "1px solid #C5D5E5",
                  borderRadius: "20px",
                  boxShadow: "0 4px 20px rgba(163, 191, 217, 0.08)",
                }}
              >
                {/* 헤더 */}
                <div
                  className="p-5 sm:p-6 pb-4 border-b"
                  style={{ borderColor: "rgba(163, 191, 217, 0.2)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background:
                          "linear-gradient(135deg, #A3BFD9 0%, #8FA8C7 100%)",
                        boxShadow: "0 4px 12px rgba(163, 191, 217, 0.3)",
                      }}
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wide flex-1"
                      style={{ color: COLORS.text.secondary }}
                    >
                      핵심 비전 ({visionReport.core_visions.length}개)
                    </p>
                  </div>
                </div>

                {/* 바디 */}
                <div className="p-5 sm:p-6 pt-4">
                  {/* 막대 차트 - 모바일/데스크톱 반응형 */}
                  <div className="mb-4 md:mb-6" style={{ height: "280px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={visionReport.core_visions
                          .map((v, idx) => ({
                            name: v.summary,
                            frequency: v.frequency,
                            fullName: v.summary,
                            color: CHART_COLORS[idx % CHART_COLORS.length],
                          }))
                          .sort((a, b) => b.frequency - a.frequency)}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(163, 191, 217, 0.2)"
                          horizontal={true}
                          vertical={false}
                        />
                        <XAxis
                          type="number"
                          tick={{
                            fill: COLORS.text.tertiary,
                            fontSize: 12,
                            fontWeight: 500,
                          }}
                          tickLine={{ stroke: "rgba(163, 191, 217, 0.3)" }}
                          axisLine={{ stroke: "rgba(163, 191, 217, 0.3)" }}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{
                            fill: COLORS.text.primary,
                            fontSize: 11,
                            fontWeight: 500,
                          }}
                          tickLine={false}
                          axisLine={false}
                          width={140}
                          interval={0}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: `1px solid ${VISION_COLOR}40`,
                            borderRadius: "12px",
                            padding: "8px 12px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                          labelStyle={{
                            color: COLORS.text.primary,
                            fontWeight: "bold",
                            marginBottom: "4px",
                            fontSize: "13px",
                          }}
                          formatter={(
                            value: number,
                            name: string,
                            entry?: { payload?: { fullName?: string } }
                          ) => [
                            `${value}회`,
                            (entry?.payload as { fullName?: string })
                              ?.fullName ||
                              name ||
                              "",
                          ]}
                        />
                        <Bar
                          dataKey="frequency"
                          radius={[0, 8, 8, 0]}
                          fill={VISION_COLOR}
                        >
                          {visionReport.core_visions
                            .sort((a, b) => b.frequency - a.frequency)
                            .map((_, idx) => (
                              <Cell
                                key={`cell-${idx}`}
                                fill={CHART_COLORS[idx % CHART_COLORS.length]}
                              />
                            ))}
                          <LabelList
                            dataKey="frequency"
                            position="right"
                            style={{
                              fill: COLORS.text.primary,
                              fontSize: "13px",
                              fontWeight: "600",
                            }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 모바일/데스크톱 공통 비전 리스트 - 모바일 친화적 디자인 */}
                  <div className="space-y-2">
                    {visionReport.core_visions
                      .sort((a, b) => b.frequency - a.frequency)
                      .map((vision, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 p-3 rounded-lg transition-all duration-200 hover:bg-white/60"
                          style={{
                            backgroundColor: `${
                              CHART_COLORS[idx % CHART_COLORS.length]
                            }08`,
                            border: `1px solid ${
                              CHART_COLORS[idx % CHART_COLORS.length]
                            }30`,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                          }}
                        >
                          {/* 색상 인디케이터 */}
                          <div
                            className="w-1 h-full rounded-full flex-shrink-0 mt-0.5"
                            style={{
                              backgroundColor:
                                CHART_COLORS[idx % CHART_COLORS.length],
                              minHeight: "20px",
                            }}
                          />
                          {/* 내용 */}
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-xs sm:text-sm font-medium mb-1.5"
                              style={{ color: COLORS.text.primary }}
                            >
                              {vision.summary}
                            </p>
                            <div className="flex items-center gap-1.5">
                              <div
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{
                                  backgroundColor:
                                    CHART_COLORS[idx % CHART_COLORS.length],
                                }}
                              />
                              <span
                                className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: `${
                                    CHART_COLORS[idx % CHART_COLORS.length]
                                  }20`,
                                  color:
                                    CHART_COLORS[idx % CHART_COLORS.length],
                                }}
                              >
                                {vision.frequency}회 기록
                              </span>
                            </div>
                          </div>
                          {/* 빈도 배지 */}
                          <div
                            className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold"
                            style={{
                              backgroundColor:
                                CHART_COLORS[idx % CHART_COLORS.length],
                              color: "white",
                              fontSize: "13px",
                              boxShadow: `0 1px 4px ${
                                CHART_COLORS[idx % CHART_COLORS.length]
                              }40`,
                            }}
                          >
                            {vision.frequency}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </Card>
            )}

          {/* 내가 되고싶은 사람 */}
          {visionReport.desired_self &&
            visionReport.desired_self.characteristics &&
            visionReport.desired_self.characteristics.length > 0 && (
              <Card
                className="relative overflow-hidden group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(163, 191, 217, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                  border: "1px solid #D5E3D5",
                  borderRadius: "20px",
                  boxShadow: "0 4px 20px rgba(163, 191, 217, 0.08)",
                }}
              >
                {/* 헤더 */}
                <div
                  className="p-5 sm:p-6 pb-4 border-b"
                  style={{ borderColor: "rgba(163, 191, 217, 0.2)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(163, 191, 217, 0.4) 0%, rgba(163, 191, 217, 0.2) 100%)",
                        boxShadow: "0 4px 12px rgba(163, 191, 217, 0.2)",
                      }}
                    >
                      <User
                        className="w-4 h-4"
                        style={{ color: VISION_COLOR }}
                      />
                    </div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wide flex-1"
                      style={{ color: COLORS.text.secondary }}
                    >
                      내가 되고싶은 사람
                    </p>
                  </div>
                </div>

                {/* 바디 */}
                <div className="p-5 sm:p-6 pt-4">
                  {/* 특성 리스트 */}
                  <div className="space-y-3 mb-6">
                    {visionReport.desired_self.characteristics.map(
                      (char, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl transition-all duration-200 hover:shadow-md"
                          style={{
                            backgroundColor: "rgba(163, 191, 217, 0.06)",
                            border: "1px solid rgba(163, 191, 217, 0.15)",
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{
                                background:
                                  "linear-gradient(135deg, #A3BFD9 0%, #8FA8C7 100%)",
                              }}
                            >
                              <span
                                className="text-xs font-bold text-white"
                                style={{ fontSize: "10px" }}
                              >
                                {idx + 1}
                              </span>
                            </div>
                            <p
                              className="text-sm font-semibold flex-1"
                              style={{
                                color: COLORS.text.primary,
                                lineHeight: "1.6",
                              }}
                            >
                              {char.trait}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {/* 역사적 위인 */}
                  {visionReport.desired_self.historical_figure && (
                    <div
                      className="p-4 rounded-xl"
                      style={{
                        backgroundColor: "rgba(163, 191, 217, 0.08)",
                        border: "1px solid rgba(163, 191, 217, 0.2)",
                      }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background:
                              "linear-gradient(135deg, #A3BFD9 0%, #8FA8C7 100%)",
                          }}
                        >
                          <Target className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p
                            className="text-xs font-semibold mb-1 uppercase tracking-wide"
                            style={{ color: COLORS.text.secondary }}
                          >
                            대표하는 역사적 위인
                          </p>
                          <p
                            className="text-lg font-bold mb-2"
                            style={{ color: COLORS.text.primary }}
                          >
                            {visionReport.desired_self.historical_figure.name}
                          </p>
                          {visionReport.desired_self.historical_figure
                            .reason && (
                            <p
                              className="text-sm leading-relaxed"
                              style={{
                                color: COLORS.text.secondary,
                                lineHeight: "1.7",
                              }}
                            >
                              {
                                visionReport.desired_self.historical_figure
                                  .reason
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

          {/* AI 피드백 */}
          {visionReport.vision_ai_feedbacks &&
            visionReport.vision_ai_feedbacks.length > 0 && (
              <Card
                className="relative overflow-hidden group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(163, 191, 217, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                  border: "1px solid #D5E3D5",
                  borderRadius: "20px",
                  boxShadow: "0 4px 20px rgba(163, 191, 217, 0.08)",
                }}
              >
                {/* 헤더 */}
                <div
                  className="p-5 sm:p-6 pb-4 border-b"
                  style={{ borderColor: "rgba(163, 191, 217, 0.2)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(163, 191, 217, 0.4) 0%, rgba(163, 191, 217, 0.2) 100%)",
                        boxShadow: "0 4px 12px rgba(163, 191, 217, 0.2)",
                      }}
                    >
                      <Sparkles
                        className="w-4 h-4"
                        style={{ color: VISION_COLOR }}
                      />
                    </div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wide flex-1"
                      style={{ color: COLORS.text.secondary }}
                    >
                      AI 비전 피드백
                    </p>
                  </div>
                </div>

                {/* 바디 */}
                <div className="p-5 sm:p-6 pt-4">
                  <ul className="space-y-3">
                    {visionReport.vision_ai_feedbacks.map((feedback, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-lg transition-all duration-300 hover:scale-[1.01]"
                        style={{
                          backgroundColor: "rgba(163, 191, 217, 0.06)",
                          border: "1px solid rgba(163, 191, 217, 0.15)",
                        }}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{
                            background:
                              "linear-gradient(135deg, #A3BFD9 0%, #8FA8C7 100%)",
                          }}
                        >
                          <span
                            className="text-xs font-bold text-white"
                            style={{ fontSize: "10px" }}
                          >
                            {idx + 1}
                          </span>
                        </div>
                        <p
                          className="text-sm leading-relaxed flex-1"
                          style={{ color: COLORS.text.primary }}
                        >
                          {feedback}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            )}
        </div>
      ) : (
        /* Free 모드: Pro 업그레이드 유도 */
        <Card
          className="p-5 sm:p-6 cursor-pointer transition-all hover:scale-[1.02] relative overflow-hidden group"
          style={{
            background:
              "linear-gradient(135deg, rgba(163, 191, 217, 0.08) 0%, rgba(255, 255, 255, 1) 100%)",
            border: "1px solid #D5E3D5",
            borderRadius: "16px",
          }}
          onClick={() => router.push("/subscription")}
        >
          <div
            className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(circle, rgba(163, 191, 217, 0.8) 0%, transparent 70%)",
            }}
          />

          <div className="flex items-start gap-4 relative z-10">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
              style={{
                background:
                  "linear-gradient(135deg, rgba(163, 191, 217, 0.3) 0%, rgba(163, 191, 217, 0.15) 100%)",
                border: "1px solid rgba(163, 191, 217, 0.3)",
              }}
            >
              <Lock className="w-5 h-5" style={{ color: VISION_COLOR }} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p
                  className="text-xs font-semibold"
                  style={{ color: COLORS.text.primary }}
                >
                  더 깊은 비전 분석이 필요하신가요?
                </p>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    backgroundColor: "rgba(163, 191, 217, 0.2)",
                    color: "#5A7A9A",
                    letterSpacing: "0.5px",
                  }}
                >
                  PRO
                </span>
              </div>
              <p
                className="text-xs mb-3 leading-relaxed"
                style={{
                  color: COLORS.text.secondary,
                  lineHeight: "1.6",
                }}
              >
                Pro 멤버십에서는 이번 달의 핵심 비전 분석, AI 피드백을 확인할 수
                있습니다. 기록을 성장으로 바꾸는 당신만의 비전 지도를 함께
                만들어보세요.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span style={{ color: COLORS.brand.primary }}>
                  Pro 멤버십으로 업그레이드
                </span>
                <ArrowRight
                  className="w-4 h-4"
                  style={{ color: VISION_COLOR }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
