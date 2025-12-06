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
import type { DailyLifeReport } from "@/types/weekly-feedback";
import { COLORS } from "@/lib/design-system";
import { useRouter } from "next/navigation";

type DailyLifeSectionProps = {
  dailyLifeReport: DailyLifeReport;
  isPro?: boolean;
};

export function DailyLifeSection({
  dailyLifeReport,
  isPro = false,
}: DailyLifeSectionProps) {
  const router = useRouter();

  // dailyLifeReport가 null이거나 undefined인 경우 렌더링하지 않음
  if (!dailyLifeReport) {
    return null;
  }

  return (
    <div className="mb-10 sm:mb-12">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#A8BBA8" }}
        >
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: COLORS.text.primary }}
        >
          이번 주의 일상
        </h2>
      </div>

      {/* Summary - 모든 사용자 */}
      {dailyLifeReport.summary && (
        <Card
          className="p-5 sm:p-6 mb-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(168, 187, 168, 0.05) 0%, rgba(255, 255, 255, 1) 100%)",
            border: "1px solid #E6E4DE",
            borderRadius: "16px",
          }}
        >
          <div className="flex items-start gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#E8F0E8" }}
            >
              <BookOpen className="w-4 h-4" style={{ color: "#A8BBA8" }} />
            </div>
            <div className="flex-1">
              <p
                className="text-xs mb-2 font-semibold"
                style={{ color: COLORS.text.secondary }}
              >
                요약
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
              >
                {dailyLifeReport.summary}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Daily Summaries Trend - 모든 사용자 */}
      {dailyLifeReport.daily_summaries_trend && (
        <Card
          className="p-5 sm:p-6 mb-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(168, 187, 168, 0.05) 0%, rgba(255, 255, 255, 1) 100%)",
            border: "1px solid #E6E4DE",
            borderRadius: "16px",
          }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#E8F0E8" }}
            >
              <TrendingUp className="w-4 h-4" style={{ color: "#A8BBA8" }} />
            </div>
            <div className="flex-1">
              <p
                className="text-xs mb-2 font-semibold"
                style={{ color: COLORS.text.secondary }}
              >
                일상 흐름
              </p>
              <p
                className="text-sm leading-relaxed mb-3"
                style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
              >
                {dailyLifeReport.daily_summaries_trend?.overall_narrative}
              </p>
              {Array.isArray(
                dailyLifeReport.daily_summaries_trend.key_highlights
              ) &&
                dailyLifeReport.daily_summaries_trend.key_highlights.length >
                  0 && (
                  <ul className="space-y-2 mt-3">
                    {dailyLifeReport.daily_summaries_trend.key_highlights.map(
                      (highlight, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm"
                          style={{ color: COLORS.text.primary }}
                        >
                          <span
                            className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: "#A8BBA8" }}
                          />
                          <span style={{ lineHeight: "1.6" }}>{highlight}</span>
                        </li>
                      )
                    )}
                  </ul>
                )}
            </div>
          </div>
        </Card>
      )}

      {/* Pro 전용 섹션들 */}
      {isPro ? (
        <div className="space-y-4">
          {/* Events Pattern */}
          {dailyLifeReport.events_pattern && (
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
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    주요 일상 패턴
                  </p>

                  {/* Most Frequent Events */}
                  {dailyLifeReport.events_pattern.most_frequent_events &&
                    dailyLifeReport.events_pattern.most_frequent_events.length >
                      0 && (
                      <div className="space-y-3 mb-4">
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
                                <span
                                  className="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
                                  style={{
                                    backgroundColor: "#E8F0E8",
                                    color: "#6B7A6F",
                                  }}
                                >
                                  {event.frequency}회
                                </span>
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
                    )}

                  {/* Event Categories */}
                  {dailyLifeReport.events_pattern.event_categories &&
                    dailyLifeReport.events_pattern.event_categories.length >
                      0 && (
                      <div className="mt-4">
                        <p
                          className="text-xs mb-2 font-medium"
                          style={{ color: COLORS.text.secondary }}
                        >
                          일상 카테고리
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {dailyLifeReport.events_pattern.event_categories.map(
                            (category, idx) => (
                              <div
                                key={idx}
                                className="px-3 py-1.5 rounded-lg"
                                style={{
                                  backgroundColor: "#E8F0E8",
                                  border: "1px solid #E0E5E0",
                                }}
                              >
                                <span
                                  className="text-xs font-medium"
                                  style={{ color: "#6B7A6F" }}
                                >
                                  {category.category}
                                </span>
                                <span
                                  className="text-xs ml-1.5"
                                  style={{ color: COLORS.text.secondary }}
                                >
                                  ({category.count})
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </Card>
          )}

          {/* Emotion Triggers Analysis */}
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
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Behavioral Patterns */}
          {dailyLifeReport.behavioral_patterns && (
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
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    행동 패턴
                  </p>

                  {dailyLifeReport.behavioral_patterns.summary && (
                    <p
                      className="text-sm leading-relaxed mb-4"
                      style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
                    >
                      {dailyLifeReport.behavioral_patterns.summary}
                    </p>
                  )}

                  {/* Pattern Distribution */}
                  {dailyLifeReport.behavioral_patterns.pattern_distribution && (
                    <div className="space-y-3">
                      {Object.entries(
                        dailyLifeReport.behavioral_patterns.pattern_distribution
                      ).map(([pattern, data]) => (
                        <div
                          key={pattern}
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
                              {pattern === "planned"
                                ? "계획적"
                                : pattern === "impulsive"
                                ? "충동적"
                                : pattern === "routine_attempt"
                                ? "루틴 시도"
                                : pattern === "avoidance"
                                ? "회피"
                                : "루틴 실패"}
                            </p>
                            <span
                              className="px-2 py-0.5 rounded-full text-xs font-semibold"
                              style={{
                                backgroundColor: "#E8EFE8",
                                color: "#6B7A6F",
                              }}
                            >
                              {data.percentage}%
                            </span>
                          </div>
                          {data.insight && (
                            <p
                              className="text-xs mt-1"
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

          {/* Daily Rhythm */}
          {dailyLifeReport.daily_rhythm && (
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
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    일상 리듬
                  </p>

                  {dailyLifeReport.daily_rhythm.summary && (
                    <p
                      className="text-sm leading-relaxed mb-4"
                      style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
                    >
                      {dailyLifeReport.daily_rhythm.summary}
                    </p>
                  )}

                  {/* Time Patterns */}
                  {dailyLifeReport.daily_rhythm.time_patterns &&
                    dailyLifeReport.daily_rhythm.time_patterns.length > 0 && (
                      <div className="space-y-3">
                        {dailyLifeReport.daily_rhythm.time_patterns.map(
                          (pattern, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-lg"
                              style={{
                                backgroundColor: "#F0F5F0",
                                border: "1px solid #E0E5E0",
                              }}
                            >
                              <p
                                className="text-xs font-semibold mb-1"
                                style={{ color: "#7C9A7C" }}
                              >
                                {pattern.time_period}
                              </p>
                              {pattern.pattern_description && (
                                <p
                                  className="text-xs mt-1"
                                  style={{ color: COLORS.text.secondary }}
                                >
                                  {pattern.pattern_description}
                                </p>
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

          {/* Growth Insights */}
          {dailyLifeReport.growth_insights && (
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
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    성장 인사이트
                  </p>

                  {/* Strengths */}
                  {dailyLifeReport.growth_insights.strengths_highlighted &&
                    dailyLifeReport.growth_insights.strengths_highlighted
                      .length > 0 && (
                      <div className="mb-4">
                        <p
                          className="text-xs mb-2 font-medium"
                          style={{ color: COLORS.text.secondary }}
                        >
                          강점
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {dailyLifeReport.growth_insights.strengths_highlighted.map(
                            (strength, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 rounded-lg text-xs"
                                style={{
                                  backgroundColor: "#E8EFE8",
                                  color: "#6B7A6F",
                                }}
                              >
                                {strength}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Improvement Opportunities */}
                  {dailyLifeReport.growth_insights.improvement_opportunities &&
                    dailyLifeReport.growth_insights.improvement_opportunities
                      .length > 0 && (
                      <div className="space-y-2">
                        {dailyLifeReport.growth_insights.improvement_opportunities.map(
                          (opp, idx) => (
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
                                  {opp.area}
                                </p>
                                <span
                                  className="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
                                  style={{
                                    backgroundColor:
                                      opp.priority === "high"
                                        ? "#FFF5F5"
                                        : opp.priority === "medium"
                                        ? "#FFFBF0"
                                        : "#F0F5F0",
                                    color:
                                      opp.priority === "high"
                                        ? "#D97777"
                                        : opp.priority === "medium"
                                        ? "#D4A574"
                                        : "#6B7A6F",
                                  }}
                                >
                                  {opp.priority === "high"
                                    ? "높음"
                                    : opp.priority === "medium"
                                    ? "보통"
                                    : "낮음"}
                                </span>
                              </div>
                              {opp.suggestion && (
                                <p
                                  className="text-xs mt-1"
                                  style={{ color: COLORS.text.secondary }}
                                >
                                  {opp.suggestion}
                                </p>
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

          {/* Next Week Suggestions */}
          {dailyLifeReport.next_week_suggestions && (
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
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    다음 주 제안
                  </p>

                  {/* Focus Areas */}
                  {dailyLifeReport.next_week_suggestions.focus_areas &&
                    dailyLifeReport.next_week_suggestions.focus_areas.length >
                      0 && (
                      <div className="space-y-3 mb-4">
                        {dailyLifeReport.next_week_suggestions.focus_areas.map(
                          (area, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-lg"
                              style={{
                                backgroundColor: "#F0F5F0",
                                border: "1px solid #E0E5E0",
                              }}
                            >
                              <p
                                className="text-sm font-medium mb-1"
                                style={{ color: COLORS.text.primary }}
                              >
                                {area.area}
                              </p>
                              {area.reason && (
                                <p
                                  className="text-xs mb-2"
                                  style={{ color: COLORS.text.secondary }}
                                >
                                  {area.reason}
                                </p>
                              )}
                              {area.suggested_actions &&
                                area.suggested_actions.length > 0 && (
                                  <ul className="space-y-1.5 mt-2">
                                    {area.suggested_actions.map(
                                      (action, aIdx) => (
                                        <li
                                          key={aIdx}
                                          className="flex items-start gap-2 text-xs"
                                          style={{
                                            color: COLORS.text.secondary,
                                          }}
                                        >
                                          <span
                                            className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                                            style={{
                                              backgroundColor: "#7C9A7C",
                                            }}
                                          />
                                          <span style={{ lineHeight: "1.6" }}>
                                            {action}
                                          </span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                )}
                            </div>
                          )
                        )}
                      </div>
                    )}

                  {/* Maintain Strengths */}
                  {dailyLifeReport.next_week_suggestions.maintain_strengths &&
                    dailyLifeReport.next_week_suggestions.maintain_strengths
                      .length > 0 && (
                      <div>
                        <p
                          className="text-xs mb-2 font-medium"
                          style={{ color: COLORS.text.secondary }}
                        >
                          유지할 강점
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {dailyLifeReport.next_week_suggestions.maintain_strengths.map(
                            (strength, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 rounded-lg text-xs"
                                style={{
                                  backgroundColor: "#E8EFE8",
                                  color: "#6B7A6F",
                                }}
                              >
                                {strength}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
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
              "linear-gradient(135deg, rgba(168, 187, 168, 0.08) 0%, rgba(255, 255, 255, 1) 100%)",
            border: "1px solid #E6E4DE",
            borderRadius: "16px",
          }}
          onClick={() => router.push("/subscription")}
        >
          {/* 장식 요소 */}
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
              <Lock className="w-5 h-5" style={{ color: "#A8BBA8" }} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p
                  className="text-xs font-semibold"
                  style={{ color: COLORS.text.primary }}
                >
                  이번 주의 패턴을 더 깊이 이해하고 싶으신가요?
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
                Pro 멤버십에서는 이번 주의 일상 속에서 나타나는 감정 트리거,
                행동 패턴, 키워드 분석, 일상 리듬, 성장 인사이트를 시각화해
                드립니다. 지금 기록을 성장으로 바꿔보세요.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span style={{ color: "#7C9A7C" }}>
                  Pro 멤버십으로 업그레이드
                </span>
                <ArrowRight className="w-4 h-4" style={{ color: "#A8BBA8" }} />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
