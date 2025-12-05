"use client";

import {
  Lightbulb,
  Lock,
  TrendingUp,
  BarChart3,
  Target,
  Sparkles,
  ArrowRight,
  Star,
} from "lucide-react";
import { Card } from "../../ui/card";
import type { MonthlyInsightReport } from "@/types/monthly-feedback";

type InsightReport = MonthlyInsightReport;
import { COLORS } from "@/lib/design-system";
import { useRouter } from "next/navigation";

type InsightSectionProps = {
  insightReport: InsightReport;
  isPro?: boolean;
};

const INSIGHT_COLOR = "#E5B96B";
const INSIGHT_COLOR_DARK = "#D4A85A";

export function InsightSection({
  insightReport,
  isPro = false,
}: InsightSectionProps) {
  const router = useRouter();

  if (!insightReport) {
    return null;
  }

  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${INSIGHT_COLOR} 0%, ${INSIGHT_COLOR_DARK} 100%)`,
          }}
        >
          <Lightbulb className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: COLORS.text.primary }}
        >
          이번 달의 인사이트
        </h2>
      </div>

      {/* Core Insights - 모든 사용자 */}
      {Array.isArray(insightReport.core_insights) &&
        insightReport.core_insights.length > 0 && (
          <Card
            className="p-5 sm:p-6 mb-4"
            style={{
              backgroundColor: COLORS.background.card,
              border: "1px solid #E6E4DE",
              borderRadius: "16px",
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#F5E6C8" }}
              >
                <Lightbulb
                  className="w-4 h-4"
                  style={{ color: INSIGHT_COLOR }}
                />
              </div>
              <div className="flex-1">
                <p
                  className="text-xs mb-2 font-semibold"
                  style={{ color: COLORS.text.secondary }}
                >
                  핵심 인사이트
                </p>
                <ul className="space-y-3">
                  {insightReport.core_insights
                    .slice(0, isPro ? 10 : 5)
                    .map((insight, idx) => {
                      // core_insights가 객체인 경우 (월간 피드백)
                      const insightSummary =
                        typeof insight === "string"
                          ? insight
                          : insight.summary || "";
                      const insightExplanation =
                        typeof insight === "object" && insight.explanation
                          ? insight.explanation
                          : null;

                      return (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm"
                          style={{ color: COLORS.text.primary }}
                        >
                          <span
                            className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: INSIGHT_COLOR }}
                          />
                          <div className="flex-1 space-y-1">
                            <span style={{ lineHeight: "1.6" }}>
                              {insightSummary}
                            </span>
                            {insightExplanation && (
                              <p
                                className="text-xs"
                                style={{
                                  color: COLORS.text.secondary,
                                  lineHeight: "1.5",
                                  marginTop: "0.25rem",
                                }}
                              >
                                {insightExplanation}
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                </ul>
              </div>
            </div>
          </Card>
        )}

      {/* Pro 전용 섹션들 */}
      {isPro ? (
        <div className="space-y-4">
          {/* Pattern Discoveries */}
          {insightReport.pattern_discoveries &&
            insightReport.pattern_discoveries.length > 0 && (
              <Card
                className="p-5 sm:p-6 relative overflow-hidden group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(229, 185, 107, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                  border: "1px solid #E6D5C3",
                  borderRadius: "16px",
                }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${INSIGHT_COLOR} 0%, ${INSIGHT_COLOR_DARK} 100%)`,
                    }}
                  >
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-xs mb-3 font-semibold"
                      style={{ color: COLORS.text.secondary }}
                    >
                      패턴 발견
                    </p>
                    <div className="space-y-3">
                      {insightReport.pattern_discoveries.map((pattern, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg"
                          style={{
                            backgroundColor: "#F5E6C8",
                            border: "1px solid #E6D5C3",
                          }}
                        >
                          <p
                            className="text-sm font-medium mb-1"
                            style={{ color: COLORS.text.primary }}
                          >
                            {pattern.pattern_name}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: COLORS.text.secondary }}
                          >
                            {pattern.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

          {/* Growth Areas */}
          {insightReport.growth_areas &&
            insightReport.growth_areas.length > 0 && (
              <Card
                className="p-5 sm:p-6 relative overflow-hidden group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(229, 185, 107, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                  border: "1px solid #E6D5C3",
                  borderRadius: "16px",
                }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${INSIGHT_COLOR} 0%, ${INSIGHT_COLOR_DARK} 100%)`,
                    }}
                  >
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-xs mb-3 font-semibold"
                      style={{ color: COLORS.text.secondary }}
                    >
                      성장 영역
                    </p>
                    <div className="space-y-3">
                      {insightReport.growth_areas.map((area, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg"
                          style={{
                            backgroundColor: "#F5E6C8",
                            border: "1px solid #E6D5C3",
                          }}
                        >
                          <p
                            className="text-sm font-medium mb-1"
                            style={{ color: COLORS.text.primary }}
                          >
                            {area.area_name}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: COLORS.text.secondary }}
                          >
                            {area.description}
                          </p>
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
              "linear-gradient(135deg, rgba(229, 185, 107, 0.08) 0%, rgba(255, 255, 255, 1) 100%)",
            border: "1px solid #E6D5C3",
            borderRadius: "16px",
          }}
          onClick={() => router.push("/subscription")}
        >
          <div
            className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(circle, rgba(229, 185, 107, 0.8) 0%, transparent 70%)",
            }}
          />

          <div className="flex items-start gap-4 relative z-10">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
              style={{
                background:
                  "linear-gradient(135deg, rgba(229, 185, 107, 0.3) 0%, rgba(229, 185, 107, 0.15) 100%)",
                border: "1px solid rgba(229, 185, 107, 0.3)",
              }}
            >
              <Lock className="w-5 h-5" style={{ color: INSIGHT_COLOR }} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p
                  className="text-xs font-semibold"
                  style={{ color: COLORS.text.primary }}
                >
                  더 깊은 인사이트 분석이 필요하신가요?
                </p>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    backgroundColor: "rgba(229, 185, 107, 0.2)",
                    color: INSIGHT_COLOR_DARK,
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
                Pro 멤버십에서는 이번 달의 패턴 발견, 성장 영역, 변화 추세를
                시각화해 드립니다. 기록을 성장으로 바꾸는 당신만의 인사이트
                지도를 함께 만들어보세요.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span style={{ color: INSIGHT_COLOR }}>
                  Pro 멤버십으로 업그레이드
                </span>
                <ArrowRight
                  className="w-4 h-4"
                  style={{ color: INSIGHT_COLOR }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
