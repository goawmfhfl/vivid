"use client";

import {
  Target,
  Lock,
  ArrowRight,
  TrendingUp,
  Lightbulb,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { Card } from "../../ui/card";
import type { VisionReport } from "@/types/monthly-feedback";
import { COLORS } from "@/lib/design-system";
import { useRouter } from "next/navigation";

type VisionSectionProps = {
  visionReport: VisionReport;
  isPro?: boolean;
};

const VISION_COLOR = "#A3BFD9";
const VISION_COLOR_DARK = "#8FA8C7";

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

      {/* Summary - 모든 사용자 */}
      {visionReport.summary && (
        <Card
          className="p-5 sm:p-6 mb-4"
          style={{
            backgroundColor: "white",
            border: "1px solid #E6E4DE",
            borderRadius: "16px",
          }}
        >
          <div className="flex items-start gap-3 mb-3">
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
                비전 요약
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
              >
                {visionReport.summary}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Pro 전용 섹션들 */}
      {isPro ? (
        <div className="space-y-4">
          {/* Vision Consistency */}
          {visionReport.vision_consistency && (
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
                    비전 일관성
                  </p>

                  {visionReport.vision_consistency.core_theme && (
                    <div className="mb-3 p-3 rounded-lg bg-gray-50">
                      <p
                        className="text-xs font-medium mb-1"
                        style={{ color: COLORS.text.secondary }}
                      >
                        핵심 테마
                      </p>
                      <p
                        className="text-base font-semibold"
                        style={{ color: COLORS.text.primary }}
                      >
                        {visionReport.vision_consistency.core_theme}
                      </p>
                    </div>
                  )}

                  {visionReport.vision_consistency.consistency_score !==
                    undefined && (
                    <div className="mb-3 p-3 rounded-lg bg-gray-50">
                      <p
                        className="text-xs font-medium mb-1"
                        style={{ color: COLORS.text.secondary }}
                      >
                        일관성 점수
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: VISION_COLOR }}
                      >
                        {visionReport.vision_consistency.consistency_score.toFixed(
                          1
                        )}
                        /10
                      </p>
                    </div>
                  )}

                  {/* Theme Evolution */}
                  {visionReport.vision_consistency.theme_evolution &&
                    visionReport.vision_consistency.theme_evolution.length >
                      0 && (
                      <div className="space-y-3">
                        {visionReport.vision_consistency.theme_evolution.map(
                          (evolution, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-lg"
                              style={{
                                backgroundColor: "#F0F5F8",
                                border: "1px solid #E0E5E8",
                              }}
                            >
                              <p
                                className="text-sm font-medium mb-1"
                                style={{ color: COLORS.text.primary }}
                              >
                                {evolution.period}
                              </p>
                              <p
                                className="text-xs mb-2"
                                style={{ color: COLORS.text.secondary }}
                              >
                                {evolution.theme}
                              </p>
                              {evolution.key_phrases &&
                                evolution.key_phrases.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {evolution.key_phrases.map(
                                      (phrase, pIdx) => (
                                        <span
                                          key={pIdx}
                                          className="px-2 py-0.5 rounded text-xs"
                                          style={{
                                            backgroundColor: "#E8F0F8",
                                            color: "#5A7A9A",
                                          }}
                                        >
                                          {phrase}
                                        </span>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                          )
                        )}
                      </div>
                    )}
                </div>
              </div>
            </Card>
          )}

          {/* Vision Keywords Trend */}
          {visionReport.vision_consistency?.vision_keywords_trend &&
            visionReport.vision_consistency.vision_keywords_trend.length >
              0 && (
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
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-xs mb-3 font-semibold"
                      style={{ color: COLORS.text.secondary }}
                    >
                      비전 키워드 트렌드
                    </p>
                    <div className="space-y-3">
                      {visionReport.vision_consistency.vision_keywords_trend
                        .slice(0, isPro ? 10 : 5)
                        .map((keyword, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg"
                            style={{
                              backgroundColor: "#FAFAF8",
                              border: "1px solid #EFE9E3",
                            }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className="text-sm font-semibold"
                                style={{ color: COLORS.text.primary }}
                              >
                                {keyword.keyword}
                              </span>
                              <span
                                className="px-2 py-0.5 rounded text-xs"
                                style={{
                                  backgroundColor: "#E8F0F8",
                                  color: "#5A7A9A",
                                }}
                              >
                                {keyword.frequency}회
                              </span>
                            </div>
                            {keyword.context && (
                              <p
                                className="text-xs mb-2"
                                style={{ color: COLORS.text.secondary }}
                              >
                                {keyword.context}
                              </p>
                            )}
                            {keyword.related_keywords &&
                              keyword.related_keywords.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {keyword.related_keywords.map(
                                    (related, rIdx) => (
                                      <span
                                        key={rIdx}
                                        className="px-2 py-0.5 rounded text-xs"
                                        style={{
                                          backgroundColor: "#E8F0F8",
                                          color: "#5A7A9A",
                                        }}
                                      >
                                        {related}
                                      </span>
                                    )
                                  )}
                                </div>
                              )}
                          </div>
                        ))}
                    </div>
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
                Pro 멤버십에서는 이번 달의 비전 일관성, 목표 패턴, 정체성 정렬을
                시각화해 드립니다. 기록을 성장으로 바꾸는 당신만의 비전 지도를
                함께 만들어보세요.
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
