"use client";

import {
  Target,
  Lock,
  ArrowRight,
  TrendingUp,
  Lightbulb,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Card } from "../../ui/card";
import type { VisionReport } from "@/types/monthly-feedback-new";
import { COLORS } from "@/lib/design-system";
import { useRouter } from "next/navigation";

type VisionSectionProps = {
  visionReport: VisionReport;
  isPro?: boolean;
};

const VISION_COLOR = "#A3BFD9";

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
          className="p-5 sm:p-6 mb-4"
          style={{
            backgroundColor: "white",
            border: "1px solid #E6E4DE",
            borderRadius: "16px",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#E8F0F8" }}
            >
              <Target className="w-4 h-4" style={{ color: VISION_COLOR }} />
            </div>
            <div className="flex-1">
              <p
                className="text-xs mb-2 font-semibold"
                style={{ color: COLORS.text.secondary }}
              >
                비전 진행 상황
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
              >
                {visionReport.vision_progress_comment}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Pro 전용 섹션들 */}
      {isPro ? (
        <div className="space-y-4">
          {/* 비전 일관성 점수 */}
          <Card
            className="p-5 sm:p-6 relative overflow-hidden group"
            style={{
              background:
                "linear-gradient(135deg, rgba(163, 191, 217, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
              border: "1px solid #C5D5E5",
              borderRadius: "16px",
            }}
          >
            <div className="flex items-start gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                style={{
                  background:
                    "linear-gradient(135deg, #A3BFD9 0%, #8FA8C7 100%)",
                }}
              >
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p
                  className="text-xs mb-3 font-semibold"
                  style={{ color: COLORS.text.secondary }}
                >
                  비전 일관성 점수
                </p>
                <div className="flex items-baseline gap-2 mb-2">
                  <p
                    className="text-3xl font-bold"
                    style={{ color: VISION_COLOR }}
                  >
                    {visionReport.vision_consistency_score.toFixed(1)}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: COLORS.text.secondary }}
                  >
                    /10
                  </p>
                </div>
                <p className="text-xs" style={{ color: COLORS.text.secondary }}>
                  비전 기록 일수: {visionReport.vision_days_count}일 (
                  {visionReport.vision_records_count}개 기록)
                </p>
              </div>
            </div>
          </Card>

          {/* 핵심 비전 (Core Visions) */}
          {visionReport.core_visions &&
            visionReport.core_visions.length > 0 && (
              <Card
                className="p-5 sm:p-6 relative overflow-hidden group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(163, 191, 217, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                  border: "1px solid #C5D5E5",
                  borderRadius: "16px",
                }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background:
                        "linear-gradient(135deg, #A3BFD9 0%, #8FA8C7 100%)",
                    }}
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-xs mb-3 font-semibold"
                      style={{ color: COLORS.text.secondary }}
                    >
                      핵심 비전 ({visionReport.core_visions.length}개)
                    </p>
                    <div className="space-y-3">
                      {visionReport.core_visions.map((vision, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg"
                          style={{
                            backgroundColor: "#F0F5F8",
                            border: "1px solid #E0E5E8",
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <CheckCircle2
                              className="w-4 h-4 mt-0.5 flex-shrink-0"
                              style={{ color: VISION_COLOR }}
                            />
                            <div className="flex-1">
                              <p
                                className="text-sm font-medium mb-1"
                                style={{ color: COLORS.text.primary }}
                              >
                                {vision.summary}
                              </p>
                              <div className="flex items-center gap-2">
                                <span
                                  className="px-2 py-0.5 rounded text-xs"
                                  style={{
                                    backgroundColor: "#E8F0F8",
                                    color: "#5A7A9A",
                                  }}
                                >
                                  {vision.frequency}회 언급
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

          {/* 주요 비전 (Main Visions) - 핵심 비전 외의 추가 비전들 */}
          {visionReport.main_visions &&
            visionReport.main_visions.length > 0 && (
              <Card
                className="p-5 sm:p-6 relative overflow-hidden group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(163, 191, 217, 0.05) 0%, rgba(255, 255, 255, 1) 100%)",
                  border: "1px solid #D5E3E5",
                  borderRadius: "16px",
                }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(163, 191, 217, 0.3) 0%, rgba(163, 191, 217, 0.15) 100%)",
                    }}
                  >
                    <Lightbulb
                      className="w-5 h-5"
                      style={{ color: VISION_COLOR }}
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-xs mb-3 font-semibold"
                      style={{ color: COLORS.text.secondary }}
                    >
                      주요 비전 ({visionReport.main_visions.length}개)
                    </p>
                    <div className="space-y-2">
                      {visionReport.main_visions.map((vision, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg"
                          style={{
                            backgroundColor: "#FAFAF8",
                            border: "1px solid #EFE9E3",
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <p
                              className="text-sm"
                              style={{ color: COLORS.text.primary }}
                            >
                              {vision.summary}
                            </p>
                            <span
                              className="px-2 py-0.5 rounded text-xs ml-2 flex-shrink-0"
                              style={{
                                backgroundColor: "#E8F0F8",
                                color: "#5A7A9A",
                              }}
                            >
                              {vision.frequency}회
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

          {/* AI 피드백 */}
          {visionReport.vision_ai_feedbacks &&
            visionReport.vision_ai_feedbacks.length > 0 && (
              <Card
                className="p-5 sm:p-6 relative overflow-hidden group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(163, 191, 217, 0.08) 0%, rgba(255, 255, 255, 1) 100%)",
                  border: "1px solid #D5E3D5",
                  borderRadius: "16px",
                }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(163, 191, 217, 0.3) 0%, rgba(163, 191, 217, 0.15) 100%)",
                    }}
                  >
                    <Sparkles
                      className="w-5 h-5"
                      style={{ color: VISION_COLOR }}
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-xs mb-3 font-semibold"
                      style={{ color: COLORS.text.secondary }}
                    >
                      AI 비전 피드백
                    </p>
                    <ul className="space-y-2">
                      {visionReport.vision_ai_feedbacks.map((feedback, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2"
                          style={{ color: COLORS.text.primary }}
                        >
                          <span
                            className="text-xs mt-1 flex-shrink-0"
                            style={{ color: VISION_COLOR }}
                          >
                            •
                          </span>
                          <p className="text-sm leading-relaxed">{feedback}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
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
                Pro 멤버십에서는 이번 달의 비전 일관성 점수, 핵심 비전 분석, AI
                피드백을 확인할 수 있습니다. 기록을 성장으로 바꾸는 당신만의
                비전 지도를 함께 만들어보세요.
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
