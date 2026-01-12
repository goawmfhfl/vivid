"use client";

import { Target, Lock, ArrowRight, Sparkles, User } from "lucide-react";
import type { VisionReport } from "@/types/monthly-feedback-new";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { GradientCard } from "@/components/common/feedback";

type VisionSectionProps = {
  visionReport: VisionReport;
  isPro?: boolean;
};

// Vision 섹션 전용 색상 (네이비 블루)
const VISION_COLOR = COLORS.section.vision.primary; // "#2e3a4f"
const VISION_COLOR_RGB = "46, 58, 79";

// 차트용 색상 팔레트 - 각 비전 항목을 구분하기 위한 다양한 색상
const CHART_COLORS = [
  "#5e7085", // 다크 블루 그레이
  "#6f859c", // 더스티 블루
  "#8fa8c7", // 라이트 블루
  "#a3bfd9", // 파스텔 블루
  "#b8d4e3", // 매우 연한 블루
  "#7f8f7a", // 세이지 그린
  "#9da688", // 라이트 그린
  "#b9c0a3", // 매우 연한 그린
  "#6f7f68", // 미드 그린
  "#5f6b3a", // 올리브 그린
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
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${VISION_COLOR}, ${VISION_COLOR}dd)`,
            border: `2px solid ${VISION_COLOR}40`,
            boxShadow: `0 2px 8px ${VISION_COLOR}20`,
          }}
        >
          <Target className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2
            className={cn(
              TYPOGRAPHY.h2.fontSize,
              TYPOGRAPHY.h2.fontWeight,
              "mb-1"
            )}
            style={{ color: COLORS.text.primary }}
          >
            이번 달의 비전
          </h2>
          <p
            className={cn(TYPOGRAPHY.bodySmall.fontSize)}
            style={{ color: COLORS.text.secondary }}
          >
            한 달간 기록한 비전을 종합적으로 분석합니다
          </p>
        </div>
      </div>

      {/* 비전 진행 상황 요약 - 모든 사용자 */}
      {visionReport.vision_progress_comment && (
        <GradientCard gradientColor={VISION_COLOR_RGB}>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${VISION_COLOR}, ${VISION_COLOR}dd)`,
                boxShadow: `0 4px 12px ${VISION_COLOR}30`,
              }}
            >
              <Target className="w-5 h-5 text-white" />
            </div>
            <p
              className={cn(
                TYPOGRAPHY.label.fontSize,
                TYPOGRAPHY.label.fontWeight
              )}
              style={{ color: COLORS.text.secondary }}
            >
              비전 진행 상황
            </p>
          </div>
          <p
            className={cn(
              TYPOGRAPHY.body.fontSize,
              TYPOGRAPHY.body.lineHeight
            )}
            style={{ color: COLORS.text.primary }}
          >
            {visionReport.vision_progress_comment}
          </p>
        </GradientCard>
      )}

      {/* Pro 전용 섹션들 */}
      {isPro ? (
        <div className="space-y-6">
          {/* 핵심 비전 (Core Visions) - 막대 차트 포함 */}
          {visionReport.core_visions &&
            visionReport.core_visions.length > 0 && (
              <GradientCard gradientColor={VISION_COLOR_RGB}>
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${VISION_COLOR}, ${VISION_COLOR}dd)`,
                      boxShadow: `0 4px 12px ${VISION_COLOR}30`,
                    }}
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p
                      className={cn(
                        TYPOGRAPHY.h3.fontSize,
                        TYPOGRAPHY.h3.fontWeight
                      )}
                      style={{ color: COLORS.text.primary }}
                    >
                      핵심 비전
                    </p>
                    <p
                      className={cn(TYPOGRAPHY.bodySmall.fontSize)}
                      style={{ color: COLORS.text.secondary }}
                    >
                      {visionReport.core_visions.length}개의 주요 비전
                    </p>
                  </div>
                </div>

                {/* 막대 차트 */}
                <div className="mb-6" style={{ height: "280px" }}>
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
                        stroke={`${VISION_COLOR}20`}
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
                        tickLine={{ stroke: `${VISION_COLOR}30` }}
                        axisLine={{ stroke: `${VISION_COLOR}30` }}
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

                {/* 비전 리스트 */}
                <div className="space-y-3">
                  {visionReport.core_visions
                    .sort((a, b) => b.frequency - a.frequency)
                    .map((vision, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-4 rounded-xl transition-all duration-200"
                        style={{
                          backgroundColor: `${
                            CHART_COLORS[idx % CHART_COLORS.length]
                          }08`,
                          border: `1px solid ${
                            CHART_COLORS[idx % CHART_COLORS.length]
                          }30`,
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
                            className={cn(
                              TYPOGRAPHY.body.fontSize,
                              TYPOGRAPHY.body.fontWeight,
                              "mb-2"
                            )}
                            style={{ color: COLORS.text.primary }}
                          >
                            {vision.summary}
                          </p>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor:
                                  CHART_COLORS[idx % CHART_COLORS.length],
                              }}
                            />
                            <span
                              className={cn(
                                TYPOGRAPHY.bodySmall.fontSize,
                                "px-2 py-0.5 rounded-full font-semibold"
                              )}
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
              </GradientCard>
            )}

          {/* 내가 되고싶은 사람 */}
          {visionReport.desired_self &&
            visionReport.desired_self.characteristics &&
            visionReport.desired_self.characteristics.length > 0 && (
              <GradientCard gradientColor={VISION_COLOR_RGB}>
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${VISION_COLOR}, ${VISION_COLOR}dd)`,
                      boxShadow: `0 4px 12px ${VISION_COLOR}30`,
                    }}
                  >
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <p
                    className={cn(
                      TYPOGRAPHY.h3.fontSize,
                      TYPOGRAPHY.h3.fontWeight
                    )}
                    style={{ color: COLORS.text.primary }}
                  >
                    내가 되고싶은 사람
                  </p>
                </div>

                {/* 특성 리스트 */}
                <div className="space-y-3 mb-6">
                  {visionReport.desired_self.characteristics.map(
                    (char, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl transition-all duration-200"
                        style={{
                          backgroundColor: `${VISION_COLOR}08`,
                          border: `1px solid ${VISION_COLOR}20`,
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${VISION_COLOR}, ${VISION_COLOR}dd)`,
                            }}
                          >
                            <span
                              className={cn(
                                TYPOGRAPHY.bodySmall.fontSize,
                                TYPOGRAPHY.bodySmall.fontWeight
                              )}
                              style={{ color: "white" }}
                            >
                              {idx + 1}
                            </span>
                          </div>
                          <p
                            className={cn(
                              TYPOGRAPHY.body.fontSize,
                              TYPOGRAPHY.body.fontWeight
                            )}
                            style={{
                              color: COLORS.text.primary,
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
                      backgroundColor: `${VISION_COLOR}08`,
                      border: `1px solid ${VISION_COLOR}25`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${VISION_COLOR}, ${VISION_COLOR}dd)`,
                        }}
                      >
                        <Target className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p
                          className={cn(
                            TYPOGRAPHY.label.fontSize,
                            TYPOGRAPHY.label.fontWeight,
                            "mb-2"
                          )}
                          style={{ color: COLORS.text.secondary }}
                        >
                          대표하는 역사적 위인
                        </p>
                        <p
                          className={cn(
                            TYPOGRAPHY.body.fontSize,
                            TYPOGRAPHY.body.fontWeight,
                            "mb-3"
                          )}
                          style={{ color: COLORS.text.primary }}
                        >
                          {visionReport.desired_self.historical_figure.name}
                        </p>
                        {visionReport.desired_self.historical_figure
                          .reason && (
                          <p
                            className={cn(
                              TYPOGRAPHY.body.fontSize,
                              TYPOGRAPHY.body.lineHeight
                            )}
                            style={{
                              color: COLORS.text.secondary,
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
              </GradientCard>
            )}

          {/* AI 피드백 */}
          {visionReport.vision_ai_feedbacks &&
            visionReport.vision_ai_feedbacks.length > 0 && (
              <GradientCard gradientColor={VISION_COLOR_RGB}>
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${VISION_COLOR}, ${VISION_COLOR}dd)`,
                      boxShadow: `0 4px 12px ${VISION_COLOR}30`,
                    }}
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <p
                    className={cn(
                      TYPOGRAPHY.h3.fontSize,
                      TYPOGRAPHY.h3.fontWeight
                    )}
                    style={{ color: COLORS.text.primary }}
                  >
                    AI 비전 피드백
                  </p>
                </div>

                <ul className="space-y-3">
                  {visionReport.vision_ai_feedbacks.map((feedback, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 p-4 rounded-xl transition-all duration-200"
                      style={{
                        backgroundColor: `${VISION_COLOR}08`,
                        border: `1px solid ${VISION_COLOR}20`,
                      }}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${VISION_COLOR}, ${VISION_COLOR}dd)`,
                        }}
                      >
                        <span
                          className={cn(
                            TYPOGRAPHY.bodySmall.fontSize,
                            TYPOGRAPHY.bodySmall.fontWeight
                          )}
                          style={{ color: "white" }}
                        >
                          {idx + 1}
                        </span>
                      </div>
                      <p
                        className={cn(
                          TYPOGRAPHY.body.fontSize,
                          TYPOGRAPHY.body.lineHeight
                        )}
                        style={{ color: COLORS.text.primary }}
                      >
                        {feedback}
                      </p>
                    </li>
                  ))}
                </ul>
              </GradientCard>
            )}
        </div>
      ) : (
        /* Free 모드: Pro 업그레이드 유도 */
        <GradientCard gradientColor={VISION_COLOR_RGB}>
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${VISION_COLOR}40, ${VISION_COLOR}20)`,
                border: `1px solid ${VISION_COLOR}40`,
              }}
            >
              <Lock className="w-5 h-5" style={{ color: VISION_COLOR }} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <p
                  className={cn(
                    TYPOGRAPHY.body.fontSize,
                    TYPOGRAPHY.body.fontWeight
                  )}
                  style={{ color: COLORS.text.primary }}
                >
                  더 깊은 비전 분석이 필요하신가요?
                </p>
                <span
                  className={cn(
                    TYPOGRAPHY.bodySmall.fontSize,
                    "px-2 py-0.5 rounded-full font-semibold"
                  )}
                  style={{
                    backgroundColor: `${VISION_COLOR}20`,
                    color: VISION_COLOR,
                  }}
                >
                  PRO
                </span>
              </div>
              <p
                className={cn(
                  TYPOGRAPHY.body.fontSize,
                  TYPOGRAPHY.body.lineHeight,
                  "mb-4"
                )}
                style={{
                  color: COLORS.text.secondary,
                }}
              >
                Pro 멤버십에서는 이번 달의 핵심 비전 분석, AI 피드백을 확인할 수
                있습니다. 기록을 성장으로 바꾸는 당신만의 비전 지도를 함께
                만들어보세요.
              </p>
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => router.push("/subscription")}
              >
                <span
                  className={cn(
                    TYPOGRAPHY.body.fontSize,
                    TYPOGRAPHY.body.fontWeight
                  )}
                  style={{ color: COLORS.brand.primary }}
                >
                  Pro 멤버십으로 업그레이드
                </span>
                <ArrowRight
                  className="w-4 h-4"
                  style={{ color: VISION_COLOR }}
                />
              </div>
            </div>
          </div>
        </GradientCard>
      )}
    </div>
  );
}
