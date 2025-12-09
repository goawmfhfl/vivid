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
      {Array.isArray(dailyLifeReport.summary) &&
        dailyLifeReport.summary.length > 0 && (
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
              <ul className="space-y-3">
                {dailyLifeReport.summary.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3"
                    style={{ color: COLORS.text.primary }}
                  >
                    <div
                      className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: DAILY_LIFE_COLOR }}
                    />
                    <p
                      className="text-sm leading-relaxed flex-1"
                      style={{ lineHeight: "1.7" }}
                    >
                      {item}
                    </p>
                  </li>
                ))}
              </ul>
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
                <div className="space-y-4">
                  {/* 패턴별 카드 - 일관된 스타일 */}
                  {[
                    {
                      key: "avoidance",
                      label: "회피 행동",
                      data: dailyLifeReport.behavioral_patterns
                        ?.pattern_distribution?.avoidance,
                    },
                    {
                      key: "routine_attempt",
                      label: "루틴 시도",
                      data: dailyLifeReport.behavioral_patterns
                        ?.pattern_distribution?.routine_attempt,
                    },
                    {
                      key: "routine_failure",
                      label: "루틴 실패",
                      data: dailyLifeReport.behavioral_patterns
                        ?.pattern_distribution?.routine_failure,
                    },
                    {
                      key: "impulsive",
                      label: "즉흥 행동",
                      data: dailyLifeReport.behavioral_patterns
                        ?.pattern_distribution?.impulsive,
                    },
                    {
                      key: "planned",
                      label: "계획된 행동",
                      data: dailyLifeReport.behavioral_patterns
                        ?.pattern_distribution?.planned,
                    },
                  ]
                    .filter((item) => item.data)
                    .map((item) => (
                      <div
                        key={item.key}
                        className="p-4 rounded-xl transition-all duration-200 hover:shadow-md"
                        style={{
                          backgroundColor: COLORS.background.card,
                          border: `1px solid ${COLORS.border.light}`,
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <p
                            className="text-sm font-semibold"
                            style={{ color: COLORS.text.primary }}
                          >
                            {item.label}
                          </p>
                          <div className="flex items-center gap-2">
                            <span
                              className="px-2.5 py-1 rounded-full text-xs font-semibold"
                              style={{
                                backgroundColor: `${DAILY_LIFE_COLOR}20`,
                                color: DAILY_LIFE_COLOR,
                              }}
                            >
                              {item.data?.count || 0}회
                            </span>
                            {item.data?.percentage !== undefined && (
                              <span
                                className="px-2.5 py-1 rounded-full text-xs font-semibold"
                                style={{
                                  backgroundColor: `${DAILY_LIFE_COLOR}15`,
                                  color: COLORS.text.secondary,
                                }}
                              >
                                {item.data.percentage.toFixed(0)}%
                              </span>
                            )}
                          </div>
                        </div>
                        {item.data?.examples &&
                          item.data.examples.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {item.data.examples.map((example, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1.5 rounded-lg text-xs"
                                  style={{
                                    backgroundColor: `${DAILY_LIFE_COLOR}10`,
                                    color: COLORS.text.primary,
                                    border: `1px solid ${DAILY_LIFE_COLOR}30`,
                                  }}
                                >
                                  {example}
                                </span>
                              ))}
                            </div>
                          )}
                        {item.data?.insight && (
                          <p
                            className="text-xs mt-3 pt-3 border-t"
                            style={{
                              color: COLORS.text.secondary,
                              borderColor: COLORS.border.light,
                              lineHeight: "1.6",
                            }}
                          >
                            {item.data.insight}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </Card>
          )}

          {/* Top Keywords */}
          {dailyLifeReport.keywords_analysis?.top_keywords &&
            dailyLifeReport.keywords_analysis.top_keywords.length > 0 && (
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
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: COLORS.text.secondary }}
                    >
                      주요 키워드
                    </p>
                  </div>
                </div>
                {/* 바디 */}
                <div className="p-5 sm:p-6 pt-4">
                  {/* 긍정 키워드 */}
                  {dailyLifeReport.keywords_analysis.top_keywords.filter(
                    (k) => k.sentiment === "positive"
                  ).length > 0 && (
                    <div className="mb-6">
                      <p
                        className="text-xs font-semibold mb-3 uppercase tracking-wide"
                        style={{ color: COLORS.text.secondary }}
                      >
                        긍정 키워드
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {dailyLifeReport.keywords_analysis.top_keywords
                          .filter((k) => k.sentiment === "positive")
                          .map((keywordItem, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-xl transition-all duration-200 hover:shadow-md"
                              style={{
                                backgroundColor: COLORS.background.card,
                                border: `1px solid ${COLORS.border.light}`,
                              }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p
                                  className="text-sm font-semibold"
                                  style={{ color: COLORS.text.primary }}
                                >
                                  {keywordItem.keyword}
                                </p>
                                <span
                                  className="px-2.5 py-1 rounded-full text-xs font-semibold"
                                  style={{
                                    backgroundColor: "#4CAF5020",
                                    color: "#4CAF50",
                                  }}
                                >
                                  {keywordItem.frequency}회
                                </span>
                              </div>
                              {keywordItem.context && (
                                <p
                                  className="text-xs mt-2"
                                  style={{
                                    color: COLORS.text.secondary,
                                    lineHeight: "1.6",
                                  }}
                                >
                                  {keywordItem.context}
                                </p>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* 부정 키워드 */}
                  {dailyLifeReport.keywords_analysis.top_keywords.filter(
                    (k) => k.sentiment === "negative"
                  ).length > 0 && (
                    <div>
                      <p
                        className="text-xs font-semibold mb-3 uppercase tracking-wide"
                        style={{ color: COLORS.text.secondary }}
                      >
                        부정 키워드
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {dailyLifeReport.keywords_analysis.top_keywords
                          .filter((k) => k.sentiment === "negative")
                          .map((keywordItem, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-xl transition-all duration-200 hover:shadow-md"
                              style={{
                                backgroundColor: COLORS.background.card,
                                border: `1px solid ${COLORS.border.light}`,
                              }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p
                                  className="text-sm font-semibold"
                                  style={{ color: COLORS.text.primary }}
                                >
                                  {keywordItem.keyword}
                                </p>
                                <span
                                  className="px-2.5 py-1 rounded-full text-xs font-semibold"
                                  style={{
                                    backgroundColor: "#F4433620",
                                    color: "#F44336",
                                  }}
                                >
                                  {keywordItem.frequency}회
                                </span>
                              </div>
                              {keywordItem.context && (
                                <p
                                  className="text-xs mt-2"
                                  style={{
                                    color: COLORS.text.secondary,
                                    lineHeight: "1.6",
                                  }}
                                >
                                  {keywordItem.context}
                                </p>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* 중립 키워드 (있는 경우) */}
                  {dailyLifeReport.keywords_analysis.top_keywords.filter(
                    (k) => k.sentiment === "neutral" || !k.sentiment
                  ).length > 0 && (
                    <div className="mt-6">
                      <p
                        className="text-xs font-semibold mb-3 uppercase tracking-wide"
                        style={{ color: COLORS.text.secondary }}
                      >
                        중립 키워드
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {dailyLifeReport.keywords_analysis.top_keywords
                          .filter(
                            (k) => k.sentiment === "neutral" || !k.sentiment
                          )
                          .map((keywordItem, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-xl transition-all duration-200 hover:shadow-md"
                              style={{
                                backgroundColor: COLORS.background.card,
                                border: `1px solid ${COLORS.border.light}`,
                              }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p
                                  className="text-sm font-semibold"
                                  style={{ color: COLORS.text.primary }}
                                >
                                  {keywordItem.keyword}
                                </p>
                                <span
                                  className="px-2.5 py-1 rounded-full text-xs font-semibold"
                                  style={{
                                    backgroundColor: `${COLORS.text.muted}20`,
                                    color: COLORS.text.secondary,
                                  }}
                                >
                                  {keywordItem.frequency}회
                                </span>
                              </div>
                              {keywordItem.context && (
                                <p
                                  className="text-xs mt-2"
                                  style={{
                                    color: COLORS.text.secondary,
                                    lineHeight: "1.6",
                                  }}
                                >
                                  {keywordItem.context}
                                </p>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

          {/* Emotion Triggers Summary */}
          {dailyLifeReport.emotion_triggers_analysis && (
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
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    감정 트리거 분석
                  </p>
                </div>
              </div>
              {/* 바디 */}
              <div className="p-5 sm:p-6 pt-4">
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
                        {data.top_triggers && data.top_triggers.length > 0 && (
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
