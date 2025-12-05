"use client";

import {
  CheckCircle2,
  Lock,
  TrendingUp,
  ArrowRight,
  Star,
  Heart,
  Briefcase,
  Users,
  Sparkles,
  Target,
  MessageSquare,
} from "lucide-react";
import { Card } from "../../ui/card";
import type { ExecutionReport } from "@/types/monthly-feedback-new";
import { COLORS } from "@/lib/design-system";
import { useRouter } from "next/navigation";

type ExecutionSectionProps = {
  executionReport: ExecutionReport;
  isPro?: boolean;
};

const EXECUTION_COLOR = COLORS.brand.primary; // #6B7A6F

// 습관 카테고리별 아이콘과 라벨
const HABIT_CATEGORIES = {
  health: {
    icon: Heart,
    label: "건강",
    color: "#EF4444",
  },
  work: {
    icon: Briefcase,
    label: "업무",
    color: "#3B82F6",
  },
  relationship: {
    icon: Users,
    label: "관계",
    color: "#8B5CF6",
  },
  self_care: {
    icon: Sparkles,
    label: "자기계발",
    color: "#F59E0B",
  },
} as const;

export function ExecutionSection({
  executionReport,
  isPro = false,
}: ExecutionSectionProps) {
  const router = useRouter();

  if (!executionReport) {
    return null;
  }

  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: EXECUTION_COLOR }}
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: COLORS.text.primary }}
        >
          이번 달의 피드백
        </h2>
      </div>

      {/* Recurring Positives - 모든 사용자 */}
      {Array.isArray(executionReport.recurring_positives) &&
        executionReport.recurring_positives.length > 0 && (
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
                style={{ backgroundColor: "#E8EFE8" }}
              >
                <Star className="w-4 h-4" style={{ color: EXECUTION_COLOR }} />
              </div>
              <div className="flex-1">
                <p
                  className="text-xs mb-2 font-semibold"
                  style={{ color: COLORS.text.secondary }}
                >
                  반복되는 잘한 점
                </p>
                <ul className="space-y-2">
                  {executionReport.recurring_positives
                    .slice(0, isPro ? 10 : 5)
                    .map((positive, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm"
                        style={{ color: COLORS.text.primary }}
                      >
                        <span
                          className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: EXECUTION_COLOR }}
                        />
                        <span style={{ lineHeight: "1.6" }}>{positive}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

      {/* Pro 전용 섹션들 */}
      {isPro ? (
        <div className="space-y-4">
          {/* Core Feedback for Month */}
          {executionReport.core_feedback_for_month && (
            <Card
              className="p-5 sm:p-6 relative overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #D5E3D5",
                borderRadius: "16px",
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${EXECUTION_COLOR} 0%, ${COLORS.brand.dark} 100%)`,
                  }}
                >
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    이번 달 핵심 피드백
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
                  >
                    {executionReport.core_feedback_for_month}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Habit Scores */}
          {executionReport.habit_scores && (
            <Card
              className="p-5 sm:p-6 relative overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #D5E3D5",
                borderRadius: "16px",
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${EXECUTION_COLOR} 0%, ${COLORS.brand.dark} 100%)`,
                  }}
                >
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    습관 점수
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(
                      ["health", "work", "relationship", "self_care"] as const
                    ).map((category) => {
                      const categoryInfo = HABIT_CATEGORIES[category];
                      const score = executionReport.habit_scores[category];
                      const reason = executionReport.habit_scores[
                        `${category}_reason` as keyof typeof executionReport.habit_scores
                      ] as string | undefined;

                      if (score === undefined) return null;

                      const Icon = categoryInfo.icon;

                      return (
                        <div
                          key={category}
                          className="p-3 rounded-lg"
                          style={{
                            backgroundColor: "#FAFAF8",
                            border: "1px solid #EFE9E3",
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Icon
                              className="w-4 h-4"
                              style={{ color: categoryInfo.color }}
                            />
                            <span
                              className="text-xs font-semibold"
                              style={{ color: COLORS.text.primary }}
                            >
                              {categoryInfo.label}
                            </span>
                            <span
                              className="ml-auto text-sm font-bold"
                              style={{ color: EXECUTION_COLOR }}
                            >
                              {score}/10
                            </span>
                          </div>
                          {reason && (
                            <p
                              className="text-xs mt-1"
                              style={{ color: COLORS.text.secondary }}
                            >
                              {reason}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Core Feedbacks */}
          {Array.isArray(executionReport.core_feedbacks) &&
            executionReport.core_feedbacks.length > 0 && (
              <Card
                className="p-5 sm:p-6 relative overflow-hidden group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                  border: "1px solid #D5E3D5",
                  borderRadius: "16px",
                }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${EXECUTION_COLOR} 0%, ${COLORS.brand.dark} 100%)`,
                    }}
                  >
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-xs mb-3 font-semibold"
                      style={{ color: COLORS.text.secondary }}
                    >
                      핵심 피드백
                    </p>
                    <ul className="space-y-2">
                      {executionReport.core_feedbacks.map((feedback, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm"
                          style={{ color: COLORS.text.primary }}
                        >
                          <CheckCircle2
                            className="w-4 h-4 flex-shrink-0 mt-0.5"
                            style={{ color: EXECUTION_COLOR }}
                          />
                          <div className="flex-1">
                            <span style={{ lineHeight: "1.6" }}>
                              {feedback.summary}
                            </span>
                            {feedback.frequency > 1 && (
                              <span
                                className="ml-2 text-xs"
                                style={{ color: COLORS.text.muted }}
                              >
                                ({feedback.frequency}회)
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            )}

          {/* Recurring Improvements with Frequency */}
          {Array.isArray(
            executionReport.recurring_improvements_with_frequency
          ) &&
            executionReport.recurring_improvements_with_frequency.length >
              0 && (
              <Card
                className="p-5 sm:p-6 relative overflow-hidden group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                  border: "1px solid #D5E3D5",
                  borderRadius: "16px",
                }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${EXECUTION_COLOR} 0%, ${COLORS.brand.dark} 100%)`,
                    }}
                  >
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-xs mb-3 font-semibold"
                      style={{ color: COLORS.text.secondary }}
                    >
                      개선이 필요한 영역
                    </p>
                    <ul className="space-y-2">
                      {executionReport.recurring_improvements_with_frequency.map(
                        (improvement, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm"
                            style={{ color: COLORS.text.primary }}
                          >
                            <span
                              className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: EXECUTION_COLOR }}
                            />
                            <div className="flex-1">
                              <span style={{ lineHeight: "1.6" }}>
                                {improvement.summary}
                              </span>
                              {improvement.frequency > 1 && (
                                <span
                                  className="ml-2 text-xs"
                                  style={{ color: COLORS.text.muted }}
                                >
                                  ({improvement.frequency}회)
                                </span>
                              )}
                            </div>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </Card>
            )}

          {/* AI Comment */}
          {executionReport.feedback_ai_comment && (
            <Card
              className="p-5 sm:p-6 relative overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #D5E3D5",
                borderRadius: "16px",
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${EXECUTION_COLOR} 0%, ${COLORS.brand.dark} 100%)`,
                  }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    AI 종합 코멘트
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
                  >
                    {executionReport.feedback_ai_comment}
                  </p>
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
              "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
            border: "1px solid #D5E3D5",
            borderRadius: "16px",
          }}
          onClick={() => router.push("/subscription")}
        >
          <div
            className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(circle, rgba(107, 122, 111, 0.8) 0%, transparent 70%)",
            }}
          />

          <div className="flex items-start gap-4 relative z-10">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
              style={{
                background:
                  "linear-gradient(135deg, rgba(107, 122, 111, 0.3) 0%, rgba(107, 122, 111, 0.15) 100%)",
                border: "1px solid rgba(107, 122, 111, 0.3)",
              }}
            >
              <Lock className="w-5 h-5" style={{ color: EXECUTION_COLOR }} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p
                  className="text-xs font-semibold"
                  style={{ color: COLORS.text.primary }}
                >
                  더 깊은 피드백 분석이 필요하신가요?
                </p>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    backgroundColor: "rgba(107, 122, 111, 0.2)",
                    color: EXECUTION_COLOR,
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
                Pro 멤버십에서는 이번 달의 습관 점수, 핵심 피드백, 개선 영역을
                시각화해 드립니다. 기록을 성장으로 바꾸는 당신만의 피드백 지도를
                함께 만들어보세요.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span style={{ color: COLORS.brand.primary }}>
                  Pro 멤버십으로 업그레이드
                </span>
                <ArrowRight
                  className="w-4 h-4"
                  style={{ color: EXECUTION_COLOR }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
