"use client";

import {
  BookOpen,
  Lock,
  TrendingUp,
  Calendar,
  Heart,
  Brain,
  ArrowRight,
} from "lucide-react";
import { Card } from "../../ui/card";
import type { DailyLifeReport } from "@/types/monthly-feedback-new";

// visualization 필드를 포함한 확장 타입
type DailyLifeReportWithVisualization = DailyLifeReport & {
  visualization?: {
    emotion_triggers_pie?: {
      data: Array<{
        name: string;
        value: number;
        color?: string;
      }>;
    };
  };
};
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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type DailyLifeSectionProps = {
  dailyLifeReport: DailyLifeReport;
  isPro?: boolean;
};

const DAILY_LIFE_COLOR = "#A8BBA8";

export function DailyLifeSection({
  dailyLifeReport,
  isPro = false,
}: DailyLifeSectionProps) {
  const router = useRouter();

  if (!dailyLifeReport) {
    return null;
  }

  return (
    <div className="mb-10 sm:mb-12">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-4 sm:2 mb-4 sm:mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: DAILY_LIFE_COLOR }}
        >
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: COLORS.text.primary }}
        >
          이번 달의 일상
        </h2>
      </div>

      {/* Summary - 모든 사용자 */}
      {dailyLifeReport.summary && (
        <Card
          className="mb-4 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(168, 187, 168, 0.05) 0%, rgba(255, 255, 255, 1) 100%)",
            border: "1px solid #E6E4DE",
            borderRadius: "16px",
          }}
        >
          {/* 헤더 */}
          <div
            className="p-5 sm:p-6 pb-4 border-b"
            style={{ borderColor: "rgba(168, 187, 168, 0.2)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#E8F0E8" }}
              >
                <BookOpen
                  className="w-4 h-4"
                  style={{ color: DAILY_LIFE_COLOR }}
                />
              </div>
              <p
                className="text-xs font-semibold"
                style={{ color: COLORS.text.secondary }}
              >
                요약
              </p>
            </div>
          </div>
          {/* 바디 */}
          <div className="p-5 sm:p-6 pt-4">
            <p
              className="text-sm leading-relaxed"
              style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
            >
              {dailyLifeReport.summary}
            </p>
          </div>
        </Card>
      )}

      {/* Pro 전용 섹션들 */}
      {isPro ? (
        <div className="space-y-4">
          {/* Most Frequent Events */}
          {dailyLifeReport.events_pattern?.most_frequent_events &&
            dailyLifeReport.events_pattern.most_frequent_events.length > 0 && (
              <Card
                className="relative overflow-hidden group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(168, 187, 168, 0.05) 0%, rgba(255, 255, 255, 1) 100%)",
                  border: "1px solid #E6E4DE",
                  borderRadius: "16px",
                }}
              >
                {/* 헤더 */}
                <div
                  className="p-5 sm:p-6 pb-4 border-b"
                  style={{ borderColor: "rgba(168, 187, 168, 0.2)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background:
                          "linear-gradient(135deg, #A8BBA8 0%, #8FA38F 100%)",
                      }}
                    >
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: COLORS.text.secondary }}
                    >
                      가장 자주 발생한 이벤트
                    </p>
                  </div>
                </div>
                {/* 바디 */}
                <div className="p-5 sm:p-6 pt-4">
                  <div className="flex-1">
                    <div className="space-y-3">
                      {dailyLifeReport.events_pattern.most_frequent_events.map(
                        (event, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg"
                            style={{
                              backgroundColor: "#F0F5F0",
                              border: "1px solid #E0E5E0",
                            }}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p
                                className="text-sm font-medium"
                                style={{ color: COLORS.text.primary }}
                              >
                                {event.event}
                              </p>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span
                                  className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                  style={{
                                    backgroundColor: "#E8F0E8",
                                    color: "#6B7A6F",
                                  }}
                                >
                                  {event.frequency}회
                                </span>
                              </div>
                            </div>
                            {event.context && (
                              <p
                                className="text-xs mt-1"
                                style={{ color: COLORS.text.secondary }}
                              >
                                {event.context}
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}

          {/* Behavioral Patterns */}
          {dailyLifeReport.behavioral_patterns && (
            <Card
              className="relative overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, rgba(168, 187, 168, 0.05) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #E6E4DE",
                borderRadius: "16px",
              }}
            >
              {/* 헤더 */}
              <div
                className="p-5 sm:p-6 pb-4 border-b"
                style={{ borderColor: "rgba(168, 187, 168, 0.2)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background:
                        "linear-gradient(135deg, #A8BBA8 0%, #8FA38F 100%)",
                    }}
                  >
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    행동 패턴 분석
                  </p>
                </div>
              </div>
              {/* 바디 */}
              <div className="p-5 sm:p-6 pt-4">
                <div className="flex-1">
                  {/* Avoidance */}
                  {dailyLifeReport.behavioral_patterns?.pattern_distribution
                    ?.avoidance && (
                    <div className="mb-4 p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <p
                          className="text-sm font-medium"
                          style={{ color: COLORS.text.primary }}
                        >
                          회피 행동
                        </p>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: "#E8EFE8",
                            color: "#6B7A6F",
                          }}
                        >
                          {
                            dailyLifeReport.behavioral_patterns
                              .pattern_distribution.avoidance.count
                          }
                          회
                        </span>
                      </div>
                      {dailyLifeReport.behavioral_patterns.pattern_distribution
                        .avoidance.examples &&
                        dailyLifeReport.behavioral_patterns.pattern_distribution
                          .avoidance.examples.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {dailyLifeReport.behavioral_patterns.pattern_distribution.avoidance.examples.map(
                              (example, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded text-xs"
                                  style={{
                                    backgroundColor: "#F0F5F0",
                                    color: "#6B7A6F",
                                  }}
                                >
                                  {example}
                                </span>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  )}

                  {/* Routine Attempt */}
                  {dailyLifeReport.behavioral_patterns?.pattern_distribution
                    ?.routine_attempt && (
                    <div className="mb-4 p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <p
                          className="text-sm font-medium"
                          style={{ color: COLORS.text.primary }}
                        >
                          루틴 시도
                        </p>
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: "#E8EFE8",
                              color: "#6B7A6F",
                            }}
                          >
                            {
                              dailyLifeReport.behavioral_patterns
                                .pattern_distribution.routine_attempt.count
                            }
                            회
                          </span>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: "#E8EFE8",
                              color: "#6B7A6F",
                            }}
                          >
                            비율{" "}
                            {dailyLifeReport.behavioral_patterns.pattern_distribution.routine_attempt.percentage.toFixed(
                              0
                            )}
                            %
                          </span>
                        </div>
                      </div>
                      {dailyLifeReport.behavioral_patterns.pattern_distribution
                        .routine_attempt.examples &&
                        dailyLifeReport.behavioral_patterns.pattern_distribution
                          .routine_attempt.examples.length > 0 && (
                          <div className="mt-2">
                            <p
                              className="text-xs mb-1 font-medium"
                              style={{ color: COLORS.text.secondary }}
                            >
                              루틴 예시
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {dailyLifeReport.behavioral_patterns.pattern_distribution.routine_attempt.examples.map(
                                (routine, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded text-xs"
                                    style={{
                                      backgroundColor: "#E8F0E8",
                                      color: "#6B7A6F",
                                    }}
                                  >
                                    {routine}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {/* Planned Actions */}
                  {dailyLifeReport.behavioral_patterns?.pattern_distribution
                    ?.planned && (
                    <div className="p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <p
                          className="text-sm font-medium"
                          style={{ color: COLORS.text.primary }}
                        >
                          계획된 행동
                        </p>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: "#E8EFE8",
                            color: "#6B7A6F",
                          }}
                        >
                          {
                            dailyLifeReport.behavioral_patterns
                              .pattern_distribution.planned.count
                          }
                          회
                        </span>
                      </div>
                      {dailyLifeReport.behavioral_patterns.pattern_distribution
                        .planned.examples &&
                        dailyLifeReport.behavioral_patterns.pattern_distribution
                          .planned.examples.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {dailyLifeReport.behavioral_patterns.pattern_distribution.planned.examples.map(
                              (example, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded text-xs"
                                  style={{
                                    backgroundColor: "#F0F5F0",
                                    color: "#6B7A6F",
                                  }}
                                >
                                  {example}
                                </span>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Top Keywords */}
          {dailyLifeReport.keywords_analysis?.top_keywords &&
            dailyLifeReport.keywords_analysis.top_keywords.length > 0 && (
              <Card
                className="p-5 sm:p-6 relative overflow-hidden group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(168, 187, 168, 0.05) 0%, rgba(255, 255, 255, 1) 100%)",
                  border: "1px solid #E6E4DE",
                  borderRadius: "16px",
                }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background:
                        "linear-gradient(135deg, #A8BBA8 0%, #8FA38F 100%)",
                    }}
                  >
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-xs mb-3 font-semibold"
                      style={{ color: COLORS.text.secondary }}
                    >
                      주요 키워드
                    </p>
                    <div className="space-y-3">
                      {dailyLifeReport.keywords_analysis.top_keywords.map(
                        (keywordItem, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg"
                            style={{
                              backgroundColor: "#F0F5F0",
                              border: "1px solid #E0E5E0",
                            }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <p
                                className="text-sm font-medium"
                                style={{ color: COLORS.text.primary }}
                              >
                                {keywordItem.keyword}
                              </p>
                              <span
                                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                style={{
                                  backgroundColor: "#E8EFE8",
                                  color: "#6B7A6F",
                                }}
                              >
                                {keywordItem.frequency}회
                              </span>
                            </div>
                            {keywordItem.context && (
                              <p
                                className="text-xs mb-2"
                                style={{ color: COLORS.text.secondary }}
                              >
                                {keywordItem.context}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span
                                className="px-2 py-0.5 rounded text-xs"
                                style={{
                                  backgroundColor:
                                    keywordItem.sentiment === "positive"
                                      ? "#E8F5E9"
                                      : keywordItem.sentiment === "negative"
                                      ? "#FFEBEE"
                                      : "#F5F5F5",
                                  color:
                                    keywordItem.sentiment === "positive"
                                      ? "#4CAF50"
                                      : keywordItem.sentiment === "negative"
                                      ? "#F44336"
                                      : "#757575",
                                }}
                              >
                                {keywordItem.sentiment === "positive"
                                  ? "긍정"
                                  : keywordItem.sentiment === "negative"
                                  ? "부정"
                                  : "중립"}
                              </span>
                              {keywordItem.days &&
                                keywordItem.days.length > 0 && (
                                  <span
                                    className="text-xs"
                                    style={{ color: COLORS.text.secondary }}
                                  >
                                    {keywordItem.days.length}일 기록
                                  </span>
                                )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}

          {/* Emotion Triggers Summary */}
          {dailyLifeReport.emotion_triggers_analysis && (
            <Card
              className="p-5 sm:p-6 relative overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, rgba(168, 187, 168, 0.05) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #E6E4DE",
                borderRadius: "16px",
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background:
                      "linear-gradient(135deg, #A8BBA8 0%, #8FA38F 100%)",
                  }}
                >
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    감정 트리거 분석
                  </p>

                  {dailyLifeReport.emotion_triggers_analysis.summary && (
                    <p
                      className="text-sm leading-relaxed mb-4"
                      style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
                    >
                      {dailyLifeReport.emotion_triggers_analysis.summary}
                    </p>
                  )}

                  {/* Category Distribution */}
                  {dailyLifeReport.emotion_triggers_analysis
                    .category_distribution && (
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(
                        dailyLifeReport.emotion_triggers_analysis
                          .category_distribution
                      ).map(([category, data]) => (
                        <div
                          key={category}
                          className="p-3 rounded-lg"
                          style={{
                            backgroundColor: "#F0F5F0",
                            border: "1px solid #E0E5E0",
                          }}
                        >
                          <p
                            className="text-xs font-semibold mb-2"
                            style={{ color: COLORS.text.primary }}
                          >
                            {category === "self"
                              ? "자기"
                              : category === "work"
                              ? "업무"
                              : category === "people"
                              ? "사람"
                              : "환경"}
                          </p>
                          <div className="flex items-baseline gap-1 mb-2">
                            <span
                              className="text-lg font-bold"
                              style={{ color: "#7C9A7C" }}
                            >
                              {data.percentage}%
                            </span>
                            <span
                              className="text-xs"
                              style={{ color: COLORS.text.secondary }}
                            >
                              ({data.count}회)
                            </span>
                          </div>
                          {data.top_triggers &&
                            data.top_triggers.length > 0 && (
                              <div className="space-y-1">
                                {data.top_triggers.slice(0, 2).map(
                                  (trigger, idx) =>
                                    trigger && (
                                      <p
                                        key={idx}
                                        className="text-xs"
                                        style={{ color: COLORS.text.secondary }}
                                      >
                                        • {trigger}
                                      </p>
                                    )
                                )}
                              </div>
                            )}
                          {data.insight && (
                            <p
                              className="text-xs mt-2 pt-2 border-t border-gray-200"
                              style={{ color: COLORS.text.secondary }}
                            >
                              {data.insight}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Visualization Charts */}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(dailyLifeReport as any).visualization && (
            <div className="space-y-4">
              {/* Event Frequency Bar Chart */}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(dailyLifeReport as any).visualization.event_frequency_bar && (
                <Card
                  className="p-5 sm:p-6"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(168, 187, 168, 0.05) 0%, rgba(255, 255, 255, 1) 100%)",
                    border: "1px solid #E6E4DE",
                    borderRadius: "16px",
                  }}
                >
                  <p
                    className="text-xs mb-4 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    이벤트 빈도
                  </p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (dailyLifeReport as any).visualization
                          .event_frequency_bar.data
                      }
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E5E0" />
                      <XAxis
                        dataKey="event"
                        style={{
                          fontSize: "0.75rem",
                          color: COLORS.text.secondary,
                        }}
                      />
                      <YAxis
                        style={{
                          fontSize: "0.75rem",
                          color: COLORS.text.secondary,
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: COLORS.background.card,
                          border: `1px solid ${COLORS.border.light}`,
                          borderRadius: "12px",
                        }}
                      />
                      <Bar
                        dataKey="frequency"
                        fill={DAILY_LIFE_COLOR}
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Routine Success Rate Area Chart */}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(dailyLifeReport as any).visualization
                .routine_success_rate_area && (
                <Card
                  className="p-5 sm:p-6"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(168, 187, 168, 0.05) 0%, rgba(255, 255, 255, 1) 100%)",
                    border: "1px solid #E6E4DE",
                    borderRadius: "16px",
                  }}
                >
                  <p
                    className="text-xs mb-4 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    루틴 성공률 추이
                  </p>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (dailyLifeReport as any).visualization
                          .routine_success_rate_area.data
                      }
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E5E0" />
                      <XAxis
                        dataKey="week"
                        style={{
                          fontSize: "0.75rem",
                          color: COLORS.text.secondary,
                        }}
                      />
                      <YAxis
                        domain={[0, 1]}
                        style={{
                          fontSize: "0.75rem",
                          color: COLORS.text.secondary,
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: COLORS.background.card,
                          border: `1px solid ${COLORS.border.light}`,
                          borderRadius: "12px",
                        }}
                        formatter={(value: number) =>
                          `${(value * 100).toFixed(0)}%`
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="success_rate"
                        stroke={DAILY_LIFE_COLOR}
                        fill={DAILY_LIFE_COLOR}
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Emotion Triggers Pie Chart */}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(dailyLifeReport as any).visualization.emotion_triggers_pie && (
                <Card
                  className="p-5 sm:p-6"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(168, 187, 168, 0.05) 0%, rgba(255, 255, 255, 1) 100%)",
                    border: "1px solid #E6E4DE",
                    borderRadius: "16px",
                  }}
                >
                  <p
                    className="text-xs mb-4 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    감정 트리거 분포
                  </p>
                  <div
                    className="relative"
                    style={{ width: "100%", maxWidth: "600px" }}
                  >
                    {/* 모바일용 작은 차트 */}
                    <div className="block md:hidden">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              (dailyLifeReport as any).visualization
                                .emotion_triggers_pie.data
                            }
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(props: {
                              payload?: { percentage?: number };
                            }) => {
                              const percentage = props.payload?.percentage;
                              return percentage ? `${percentage}%` : "";
                            }}
                            outerRadius={70}
                            innerRadius={0}
                            paddingAngle={3}
                            dataKey="value"
                            style={
                              {
                                fontSize: "10px",
                                fontWeight: 600,
                                fill: COLORS.text.primary,
                              } as React.CSSProperties
                            }
                          >
                            {(
                              dailyLifeReport as DailyLifeReportWithVisualization
                            ).visualization?.emotion_triggers_pie?.data.map(
                              (entry, index: number) => (
                                <Cell
                                  key={`cell-mobile-${index}`}
                                  fill={entry.color || DAILY_LIFE_COLOR}
                                />
                              )
                            )}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: COLORS.background.card,
                              border: `1px solid ${COLORS.border.light}`,
                              borderRadius: "12px",
                              padding: "6px 10px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              fontSize: "11px",
                            }}
                            labelStyle={{
                              color: COLORS.text.primary,
                              fontWeight: "bold",
                              marginBottom: "4px",
                              fontSize: "11px",
                            }}
                          />
                          <Legend
                            wrapperStyle={{
                              fontSize: "10px",
                              paddingTop: "10px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* 데스크톱용 큰 차트 */}
                    <div className="hidden md:block">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              (dailyLifeReport as any).visualization
                                .emotion_triggers_pie.data
                            }
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(props: {
                              name?: string;
                              payload?: { percentage?: number };
                            }) => {
                              const name = props.name;
                              const percentage = props.payload?.percentage;
                              return percentage
                                ? `${name}: ${percentage}%`
                                : "";
                            }}
                            outerRadius={100}
                            innerRadius={0}
                            paddingAngle={4}
                            dataKey="value"
                            style={
                              {
                                fontSize: "10px",
                                fontWeight: 600,
                                fill: COLORS.text.primary,
                              } as React.CSSProperties
                            }
                          >
                            {(
                              dailyLifeReport as DailyLifeReportWithVisualization
                            ).visualization?.emotion_triggers_pie?.data.map(
                              (entry, index: number) => (
                                <Cell
                                  key={`cell-desktop-${index}`}
                                  fill={entry.color || DAILY_LIFE_COLOR}
                                />
                              )
                            )}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: COLORS.background.card,
                              border: `1px solid ${COLORS.border.light}`,
                              borderRadius: "12px",
                              padding: "8px 12px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            }}
                            labelStyle={{
                              color: COLORS.text.primary,
                              fontWeight: "bold",
                              marginBottom: "4px",
                              fontSize: "12px",
                            }}
                          />
                          <Legend
                            wrapperStyle={{
                              fontSize: "11px",
                              paddingTop: "10px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Free 모드: Pro 업그레이드 유도 */
        <Card
          className="p-5 sm:p-6 cursor-pointer transition-all hover:scale-[1.02] relative overflow-hidden group"
          style={{
            background:
              "linear-gradient(135deg, rgba(168, 187, 168, 0.08) 0%, rgba(255, 255, 255, 1) 100%)",
            border: "1px solid #D5E3D5",
            borderRadius: "16px",
          }}
          onClick={() => router.push("/subscription")}
        >
          <div
            className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(circle, rgba(168, 187, 168, 0.8) 0%, transparent 70%)",
            }}
          />

          <div className="flex items-start gap-4 relative z-10">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
              style={{
                background:
                  "linear-gradient(135deg, rgba(168, 187, 168, 0.3) 0%, rgba(168, 187, 168, 0.15) 100%)",
                border: "1px solid rgba(168, 187, 168, 0.3)",
              }}
            >
              <Lock className="w-5 h-5" style={{ color: DAILY_LIFE_COLOR }} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p
                  className="text-xs font-semibold"
                  style={{ color: COLORS.text.primary }}
                >
                  더 깊은 일상 분석이 필요하신가요?
                </p>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    backgroundColor: "rgba(168, 187, 168, 0.2)",
                    color: "#6B7A6F",
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
                Pro 멤버십에서는 이번 달의 일상 패턴, 행동 분석, 키워드 진화,
                감정 트리거를 시각화해 드립니다. 기록을 성장으로 바꾸는 당신만의
                일상 지도를 함께 만들어보세요.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span style={{ color: COLORS.brand.primary }}>
                  Pro 멤버십으로 업그레이드
                </span>
                <ArrowRight
                  className="w-4 h-4"
                  style={{ color: DAILY_LIFE_COLOR }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
