"use client";

import {
  Lightbulb,
  Lock,
  TrendingUp,
  ArrowRight,
  Calendar,
  FileText,
  Sparkles,
} from "lucide-react";
import { Card } from "../../ui/card";
import type { MonthlyInsightReport } from "@/types/monthly-feedback";
import { COLORS, SPACING } from "@/lib/design-system";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type InsightReport = MonthlyInsightReport;
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
    <div className={cn(SPACING.section.marginBottom)}>
      {/* 헤더 */}
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

      {/* 통계 정보 - Pro 전용 */}
      {isPro &&
        (insightReport.insight_days_count !== undefined ||
          insightReport.insight_records_count !== undefined) && (
          <Card
            className={cn(SPACING.card.padding, "mb-4")}
            style={{
              backgroundColor: COLORS.background.card,
              border: `1px solid ${COLORS.border.light}`,
              borderRadius: "16px",
            }}
          >
            <div className="flex items-center gap-4">
              {insightReport.insight_days_count !== undefined && (
                <div className="flex items-center gap-2">
                  <Calendar
                    className="w-4 h-4"
                    style={{ color: INSIGHT_COLOR }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: COLORS.text.secondary }}
                  >
                    기록한 날: {insightReport.insight_days_count}일
                  </span>
                </div>
              )}
              {insightReport.insight_records_count !== undefined && (
                <div className="flex items-center gap-2">
                  <FileText
                    className="w-4 h-4"
                    style={{ color: INSIGHT_COLOR }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: COLORS.text.secondary }}
                  >
                    총 인사이트: {insightReport.insight_records_count}개
                  </span>
                </div>
              )}
            </div>
          </Card>
        )}

      {/* 종합 인사이트 요약 - Pro 전용 */}
      {isPro && insightReport.insight_comprehensive_summary && (
        <Card
          className={cn(SPACING.card.padding, "mb-4")}
          style={{
            backgroundColor: COLORS.background.card,
            border: `1px solid ${COLORS.border.light}`,
            borderRadius: "16px",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#F5E6C8" }}
            >
              <Sparkles className="w-4 h-4" style={{ color: INSIGHT_COLOR }} />
            </div>
            <div className="flex-1">
              <p
                className="text-xs mb-2 font-semibold"
                style={{ color: COLORS.text.secondary }}
              >
                종합 인사이트 분석
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: COLORS.text.primary,
                  lineHeight: "1.6",
                }}
              >
                {insightReport.insight_comprehensive_summary}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Core Insights - 모든 사용자 (최대 3개) */}
      {Array.isArray(insightReport.core_insights) &&
        insightReport.core_insights.length > 0 && (
          <Card
            className={cn(SPACING.card.padding, "mb-4")}
            style={{
              backgroundColor: COLORS.background.card,
              border: `1px solid ${COLORS.border.light}`,
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
                  {insightReport.core_insights.map((insight, idx) => {
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

      {/* Top Insights - Pro 전용 */}
      {isPro ? (
        <div className="space-y-4">
          {insightReport.top_insights &&
            insightReport.top_insights.length > 0 && (
              <Card
                className={cn(
                  SPACING.card.padding,
                  "relative overflow-hidden group"
                )}
                style={{
                  background:
                    "linear-gradient(135deg, rgba(229, 185, 107, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                  border: `1px solid ${COLORS.border.light}`,
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
                      주요 인사이트
                    </p>
                    <div className="space-y-3">
                      {insightReport.top_insights
                        .slice(0, 10)
                        .map((insight, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg"
                            style={{
                              backgroundColor: "#F5E6C8",
                              border: `1px solid ${COLORS.border.light}`,
                            }}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p
                                className="text-sm font-medium flex-1"
                                style={{ color: COLORS.text.primary }}
                              >
                                {insight.summary}
                              </p>
                              {insight.frequency > 0 && (
                                <span
                                  className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                                  style={{
                                    backgroundColor: "rgba(229, 185, 107, 0.2)",
                                    color: INSIGHT_COLOR_DARK,
                                  }}
                                >
                                  {insight.frequency}회
                                </span>
                              )}
                            </div>
                            {(insight.first_date || insight.last_date) && (
                              <div className="flex items-center gap-2 mt-1">
                                {insight.first_date && (
                                  <span
                                    className="text-[10px]"
                                    style={{ color: COLORS.text.tertiary }}
                                  >
                                    시작: {insight.first_date}
                                  </span>
                                )}
                                {insight.first_date &&
                                  insight.last_date &&
                                  insight.first_date !== insight.last_date && (
                                    <span
                                      className="text-[10px]"
                                      style={{ color: COLORS.text.tertiary }}
                                    >
                                      ·
                                    </span>
                                  )}
                                {insight.last_date &&
                                  insight.first_date !== insight.last_date && (
                                    <span
                                      className="text-[10px]"
                                      style={{ color: COLORS.text.tertiary }}
                                    >
                                      마지막: {insight.last_date}
                                    </span>
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

          {/* AI 코멘트 */}
          {insightReport.insight_ai_comment && (
            <Card
              className={cn(SPACING.card.padding)}
              style={{
                backgroundColor: COLORS.background.card,
                border: `1px solid ${COLORS.border.light}`,
                borderRadius: "16px",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#F5E6C8" }}
                >
                  <Sparkles
                    className="w-4 h-4"
                    style={{ color: INSIGHT_COLOR }}
                  />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-2 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    AI 코멘트
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      color: COLORS.text.primary,
                      lineHeight: "1.6",
                    }}
                  >
                    {insightReport.insight_ai_comment}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      ) : (
        /* Free 모드: Pro 업그레이드 유도 */
        <Card
          className={cn(
            SPACING.card.padding,
            "cursor-pointer transition-all hover:scale-[1.02] relative overflow-hidden group"
          )}
          style={{
            background:
              "linear-gradient(135deg, rgba(229, 185, 107, 0.08) 0%, rgba(255, 255, 255, 1) 100%)",
            border: `1px solid ${COLORS.border.light}`,
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
                Pro 멤버십에서는 이번 달의 주요 인사이트, 종합 분석, 통계 정보를
                확인할 수 있습니다. 기록을 성장으로 바꾸는 당신만의 인사이트
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
