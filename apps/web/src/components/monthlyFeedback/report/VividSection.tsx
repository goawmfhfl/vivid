"use client";

import {
  Target,
  TrendingUp,
  BarChart3,
  Calendar,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Sparkles,
  Users,
  Zap,
  CheckCircle2,
  XCircle,
  Minus,
  Rocket,
  Repeat,
  FlaskConical,
} from "lucide-react";
import type { VividReport } from "@/types/monthly-feedback-new";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  SectionHeader,
  GradientCard,
} from "@/components/common/feedback";

type VividSectionProps = {
  vividReport: VividReport;
  isPro?: boolean;
};

/**
 * 월간 비비드 리포트 섹션
 * 5개 주요 섹션을 포함: 비전 진화, 일치도 분석, 패턴 인사이트, 특성 매칭, 다음 달 플랜
 */
export function VividSection({
  vividReport,
  isPro: _isPro = false,
}: VividSectionProps) {
  const vividColor = "#A3BFD9"; // 파스텔 블루

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={Target}
        iconGradient="#A3BFD9"
        title="이번 달의 비비드"
        description="한 달간의 비비드 기록을 종합한 월간 분석"
      />

      {/* 1. 비전 진화 스토리 (30%) */}
      {vividReport.vision_evolution && (
        <div className="space-y-5">
          <GradientCard gradientColor="163, 191, 217">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: `${vividColor}20`,
                  border: `1.5px solid ${vividColor}40`,
                }}
              >
                <Target className="w-4 h-4" style={{ color: vividColor }} />
              </div>
              <p
                className={cn(
                  TYPOGRAPHY.label.fontSize,
                  TYPOGRAPHY.label.fontWeight,
                  TYPOGRAPHY.label.letterSpacing,
                  "uppercase"
                )}
                style={{ color: COLORS.text.secondary }}
              >
                비전 진화 스토리
              </p>
            </div>

            {/* 핵심 비전들 */}
            {vividReport.vision_evolution.core_visions &&
              vividReport.vision_evolution.core_visions.length > 0 && (
                <div className="space-y-4 mb-6">
                  {vividReport.vision_evolution.core_visions.map(
                    (vision, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.6)",
                          border: "1px solid rgba(163, 191, 217, 0.2)",
                        }}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <p
                            className={cn(
                              TYPOGRAPHY.body.fontSize,
                              "font-semibold flex-1"
                            )}
                            style={{ color: COLORS.text.primary }}
                          >
                            {vision.vision}
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span
                              className={cn(
                                TYPOGRAPHY.bodySmall.fontSize,
                                "px-2 py-0.5 rounded"
                              )}
                              style={{
                                backgroundColor: "#E8F0F8",
                                color: "#5A7A9A",
                              }}
                            >
                              일관성: {Math.round(vision.consistency * 100)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-3 h-3" style={{ color: COLORS.text.tertiary }} />
                          <p
                            className={cn(TYPOGRAPHY.bodySmall.fontSize)}
                            style={{ color: COLORS.text.secondary }}
                          >
                            {vision.first_date} ~ {vision.last_date}
                          </p>
                        </div>
                        <p
                          className={cn(
                            TYPOGRAPHY.body.fontSize,
                            TYPOGRAPHY.body.lineHeight,
                            "mt-2"
                          )}
                          style={{ color: COLORS.text.secondary }}
                        >
                          {vision.evolution_story}
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}

            {/* 명확도 추세 */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <p
                  className={cn(
                    TYPOGRAPHY.label.fontSize,
                    TYPOGRAPHY.label.fontWeight,
                    "uppercase"
                  )}
                  style={{ color: COLORS.text.secondary }}
                >
                  명확도 추세:
                </p>
                <span
                  className={cn(TYPOGRAPHY.body.fontSize, "font-semibold")}
                  style={{
                    color:
                      vividReport.vision_evolution.clarity_trend === "구체화"
                        ? "#4CAF50"
                        : vividReport.vision_evolution.clarity_trend === "모호해짐"
                        ? "#FF9800"
                        : COLORS.text.primary,
                  }}
                >
                  {vividReport.vision_evolution.clarity_trend}
                </span>
              </div>
              <p
                className={cn(
                  TYPOGRAPHY.body.fontSize,
                  TYPOGRAPHY.body.lineHeight
                )}
                style={{ color: COLORS.text.secondary }}
              >
                {vividReport.vision_evolution.clarity_explanation}
              </p>
            </div>

            {/* 우선순위 변화 */}
            {vividReport.vision_evolution.priority_shifts &&
              vividReport.vision_evolution.priority_shifts.length > 0 && (
                <div>
                  <p
                    className={cn(
                      TYPOGRAPHY.label.fontSize,
                      TYPOGRAPHY.label.fontWeight,
                      TYPOGRAPHY.label.letterSpacing,
                      "mb-3 uppercase"
                    )}
                    style={{ color: COLORS.text.secondary }}
                  >
                    우선순위 변화
                  </p>
                  <div className="space-y-3">
                    {vividReport.vision_evolution.priority_shifts.map(
                      (shift, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.6)",
                            border: "1px solid rgba(163, 191, 217, 0.2)",
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={cn(
                                TYPOGRAPHY.bodySmall.fontSize,
                                "font-medium"
                              )}
                              style={{ color: COLORS.text.primary }}
                            >
                              {shift.from}
                            </span>
                            <ArrowRight className="w-4 h-4" style={{ color: COLORS.text.tertiary }} />
                            <span
                              className={cn(
                                TYPOGRAPHY.bodySmall.fontSize,
                                "font-medium"
                              )}
                              style={{ color: COLORS.text.primary }}
                            >
                              {shift.to}
                            </span>
                          </div>
                          <p
                            className={cn(
                              TYPOGRAPHY.bodySmall.fontSize,
                              "mb-1"
                            )}
                            style={{ color: COLORS.text.tertiary }}
                          >
                            {shift.when}
                          </p>
                          <p
                            className={cn(
                              TYPOGRAPHY.body.fontSize,
                              TYPOGRAPHY.body.lineHeight
                            )}
                            style={{ color: COLORS.text.secondary }}
                          >
                            {shift.why}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </GradientCard>
        </div>
      )}

      {/* 2. 현재-미래 일치도 분석 (25%) */}
      {vividReport.alignment_analysis && (
        <div className="space-y-5">
          <GradientCard gradientColor="163, 191, 217">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: `${vividColor}20`,
                  border: `1.5px solid ${vividColor}40`,
                }}
              >
                <BarChart3 className="w-4 h-4" style={{ color: vividColor }} />
              </div>
              <p
                className={cn(
                  TYPOGRAPHY.label.fontSize,
                  TYPOGRAPHY.label.fontWeight,
                  TYPOGRAPHY.label.letterSpacing,
                  "uppercase"
                )}
                style={{ color: COLORS.text.secondary }}
              >
                현재-미래 일치도 분석
              </p>
            </div>

            {/* 점수 타임라인 */}
            {vividReport.alignment_analysis.score_timeline &&
              vividReport.alignment_analysis.score_timeline.length > 0 && (
                <div className="mb-6">
                  <div style={{ height: "200px", marginTop: "1rem" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={vividReport.alignment_analysis.score_timeline.map(
                          (item) => ({
                            week: `${item.week}주`,
                            score: item.average_score,
                            trend: item.trend,
                          })
                        )}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#F0F0F0"
                        />
                        <XAxis
                          dataKey="week"
                          tick={{ fontSize: 11, fill: COLORS.text.secondary }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fontSize: 11, fill: COLORS.text.secondary }}
                        />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke={vividColor}
                          strokeWidth={2}
                          dot={{ fill: vividColor, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

            {/* 개선/악화 영역 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {vividReport.alignment_analysis.score_drivers
                .improved_areas &&
                vividReport.alignment_analysis.score_drivers.improved_areas
                  .length > 0 && (
                  <div
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: "rgba(76, 175, 80, 0.1)",
                      border: "1px solid rgba(76, 175, 80, 0.3)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowUp
                        className="w-4 h-4"
                        style={{ color: "#4CAF50" }}
                      />
                      <p
                        className={cn(
                          TYPOGRAPHY.label.fontSize,
                          TYPOGRAPHY.label.fontWeight,
                          "uppercase"
                        )}
                        style={{ color: "#4CAF50" }}
                      >
                        개선된 영역
                      </p>
                    </div>
                    <div className="space-y-3">
                      {vividReport.alignment_analysis.score_drivers.improved_areas.map(
                        (area, idx) => (
                          <div key={idx}>
                            <p
                              className={cn(
                                TYPOGRAPHY.body.fontSize,
                                "font-semibold mb-1"
                              )}
                              style={{ color: COLORS.text.primary }}
                            >
                              {area.area}
                            </p>
                            <p
                              className={cn(
                                TYPOGRAPHY.bodySmall.fontSize,
                                TYPOGRAPHY.body.lineHeight
                              )}
                              style={{ color: COLORS.text.secondary }}
                            >
                              {area.impact}
                            </p>
                            {area.evidence && area.evidence.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {area.evidence.map((ev, eIdx) => (
                                  <span
                                    key={eIdx}
                                    className={cn(
                                      TYPOGRAPHY.caption.fontSize,
                                      "px-2 py-0.5 rounded"
                                    )}
                                    style={{
                                      backgroundColor: "rgba(76, 175, 80, 0.15)",
                                      color: "#4CAF50",
                                    }}
                                  >
                                    {ev}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {vividReport.alignment_analysis.score_drivers
                .declined_areas &&
                vividReport.alignment_analysis.score_drivers.declined_areas
                  .length > 0 && (
                  <div
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: "rgba(255, 152, 0, 0.1)",
                      border: "1px solid rgba(255, 152, 0, 0.3)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowDown
                        className="w-4 h-4"
                        style={{ color: "#FF9800" }}
                      />
                      <p
                        className={cn(
                          TYPOGRAPHY.label.fontSize,
                          TYPOGRAPHY.label.fontWeight,
                          "uppercase"
                        )}
                        style={{ color: "#FF9800" }}
                      >
                        악화된 영역
                      </p>
                    </div>
                    <div className="space-y-3">
                      {vividReport.alignment_analysis.score_drivers.declined_areas.map(
                        (area, idx) => (
                          <div key={idx}>
                            <p
                              className={cn(
                                TYPOGRAPHY.body.fontSize,
                                "font-semibold mb-1"
                              )}
                              style={{ color: COLORS.text.primary }}
                            >
                              {area.area}
                            </p>
                            <p
                              className={cn(
                                TYPOGRAPHY.bodySmall.fontSize,
                                TYPOGRAPHY.body.lineHeight
                              )}
                              style={{ color: COLORS.text.secondary }}
                            >
                              {area.reason}
                            </p>
                            {area.evidence && area.evidence.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {area.evidence.map((ev, eIdx) => (
                                  <span
                                    key={eIdx}
                                    className={cn(
                                      TYPOGRAPHY.caption.fontSize,
                                      "px-2 py-0.5 rounded"
                                    )}
                                    style={{
                                      backgroundColor: "rgba(255, 152, 0, 0.15)",
                                      color: "#FF9800",
                                    }}
                                  >
                                    {ev}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* 격차 분석 */}
            {vividReport.alignment_analysis.gap_analysis.biggest_gaps &&
              vividReport.alignment_analysis.gap_analysis.biggest_gaps.length >
                0 && (
                <div>
                  <p
                    className={cn(
                      TYPOGRAPHY.label.fontSize,
                      TYPOGRAPHY.label.fontWeight,
                      TYPOGRAPHY.label.letterSpacing,
                      "mb-3 uppercase"
                    )}
                    style={{ color: COLORS.text.secondary }}
                  >
                    주요 격차
                  </p>
                  <div className="space-y-4">
                    {vividReport.alignment_analysis.gap_analysis.biggest_gaps.map(
                      (gap, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-lg"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.6)",
                            border: "1px solid rgba(163, 191, 217, 0.2)",
                          }}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div>
                              <p
                                className={cn(
                                  TYPOGRAPHY.bodySmall.fontSize,
                                  "mb-1 uppercase"
                                )}
                                style={{ color: COLORS.text.tertiary }}
                              >
                                현재 상태
                              </p>
                              <p
                                className={cn(
                                  TYPOGRAPHY.body.fontSize,
                                  "font-medium"
                                )}
                                style={{ color: COLORS.text.primary }}
                              >
                                {gap.current_state}
                              </p>
                            </div>
                            <div>
                              <p
                                className={cn(
                                  TYPOGRAPHY.bodySmall.fontSize,
                                  "mb-1 uppercase"
                                )}
                                style={{ color: COLORS.text.tertiary }}
                              >
                                원하는 상태
                              </p>
                              <p
                                className={cn(
                                  TYPOGRAPHY.body.fontSize,
                                  "font-medium"
                                )}
                                style={{ color: COLORS.text.primary }}
                              >
                                {gap.desired_state}
                              </p>
                            </div>
                          </div>
                          <p
                            className={cn(
                              TYPOGRAPHY.body.fontSize,
                              TYPOGRAPHY.body.lineHeight,
                              "mb-3"
                            )}
                            style={{ color: COLORS.text.secondary }}
                          >
                            {gap.gap_description}
                          </p>
                          {gap.actionable_steps &&
                            gap.actionable_steps.length > 0 && (
                              <div>
                                <p
                                  className={cn(
                                    TYPOGRAPHY.bodySmall.fontSize,
                                    "mb-2 font-semibold"
                                  )}
                                  style={{ color: COLORS.text.primary }}
                                >
                                  실행 가능한 단계:
                                </p>
                                <ul className="space-y-1.5">
                                  {gap.actionable_steps.map((step, sIdx) => (
                                    <li
                                      key={sIdx}
                                      className="flex items-start gap-2"
                                    >
                                      <div
                                        className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                                        style={{ backgroundColor: vividColor }}
                                      />
                                      <p
                                        className={cn(
                                          TYPOGRAPHY.body.fontSize,
                                          TYPOGRAPHY.body.lineHeight,
                                          "flex-1"
                                        )}
                                        style={{ color: COLORS.text.primary }}
                                      >
                                        {step}
                                      </p>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </GradientCard>
        </div>
      )}

      {/* 3. 하루 패턴 인사이트 (20%) */}
      {vividReport.daily_life_patterns && (
        <div className="space-y-5">
          <GradientCard gradientColor="163, 191, 217">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: `${vividColor}20`,
                  border: `1.5px solid ${vividColor}40`,
                }}
              >
                <Zap className="w-4 h-4" style={{ color: vividColor }} />
              </div>
              <p
                className={cn(
                  TYPOGRAPHY.label.fontSize,
                  TYPOGRAPHY.label.fontWeight,
                  TYPOGRAPHY.label.letterSpacing,
                  "uppercase"
                )}
                style={{ color: COLORS.text.secondary }}
              >
                하루 패턴 인사이트
              </p>
            </div>

            {/* 반복되는 패턴 */}
            {vividReport.daily_life_patterns.recurring_patterns &&
              vividReport.daily_life_patterns.recurring_patterns.length >
                0 && (
                <div className="mb-6">
                  <p
                    className={cn(
                      TYPOGRAPHY.label.fontSize,
                      TYPOGRAPHY.label.fontWeight,
                      "mb-3 uppercase"
                    )}
                    style={{ color: COLORS.text.secondary }}
                  >
                    반복되는 패턴
                  </p>
                  <div className="space-y-3">
                    {vividReport.daily_life_patterns.recurring_patterns.map(
                      (pattern, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-lg"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.6)",
                            border: "1px solid rgba(163, 191, 217, 0.2)",
                          }}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <p
                              className={cn(
                                TYPOGRAPHY.body.fontSize,
                                "font-semibold flex-1"
                              )}
                              style={{ color: COLORS.text.primary }}
                            >
                              {pattern.pattern}
                            </p>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {pattern.impact === "positive" ? (
                                <CheckCircle2
                                  className="w-4 h-4"
                                  style={{ color: "#4CAF50" }}
                                />
                              ) : pattern.impact === "negative" ? (
                                <XCircle
                                  className="w-4 h-4"
                                  style={{ color: "#FF9800" }}
                                />
                              ) : (
                                <Minus
                                  className="w-4 h-4"
                                  style={{ color: COLORS.text.tertiary }}
                                />
                              )}
                              <span
                                className={cn(
                                  TYPOGRAPHY.bodySmall.fontSize,
                                  "px-2 py-0.5 rounded"
                                )}
                                style={{
                                  backgroundColor: "#E8F0F8",
                                  color: "#5A7A9A",
                                }}
                              >
                                {pattern.frequency}회
                              </span>
                            </div>
                          </div>
                          <p
                            className={cn(
                              TYPOGRAPHY.body.fontSize,
                              TYPOGRAPHY.body.lineHeight,
                              "mb-2"
                            )}
                            style={{ color: COLORS.text.secondary }}
                          >
                            {pattern.why_it_matters}
                          </p>
                          {pattern.days && pattern.days.length > 0 && (
                            <p
                              className={cn(TYPOGRAPHY.bodySmall.fontSize)}
                              style={{ color: COLORS.text.tertiary }}
                            >
                              {pattern.days.slice(0, 5).join(", ")}
                              {pattern.days.length > 5 && "..."}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* 주차별 진화 */}
            {vividReport.daily_life_patterns.weekly_evolution &&
              vividReport.daily_life_patterns.weekly_evolution.length > 0 && (
                <div className="mb-6">
                  <p
                    className={cn(
                      TYPOGRAPHY.label.fontSize,
                      TYPOGRAPHY.label.fontWeight,
                      "mb-3 uppercase"
                    )}
                    style={{ color: COLORS.text.secondary }}
                  >
                    주차별 진화
                  </p>
                  <div className="space-y-4">
                    {vividReport.daily_life_patterns.weekly_evolution.map(
                      (week, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-lg"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.6)",
                            border: "1px solid rgba(163, 191, 217, 0.2)",
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar
                              className="w-4 h-4"
                              style={{ color: vividColor }}
                            />
                            <p
                              className={cn(
                                TYPOGRAPHY.body.fontSize,
                                "font-semibold"
                              )}
                              style={{ color: COLORS.text.primary }}
                            >
                              {week.week}주차
                            </p>
                          </div>
                          {week.dominant_activities &&
                            week.dominant_activities.length > 0 && (
                              <div className="mb-2">
                                <p
                                  className={cn(
                                    TYPOGRAPHY.bodySmall.fontSize,
                                    "mb-1"
                                  )}
                                  style={{ color: COLORS.text.tertiary }}
                                >
                                  주요 활동:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {week.dominant_activities.map(
                                    (activity, aIdx) => (
                                      <span
                                        key={aIdx}
                                        className={cn(
                                          TYPOGRAPHY.bodySmall.fontSize,
                                          "px-2 py-0.5 rounded"
                                        )}
                                        style={{
                                          backgroundColor: "#E8F0F8",
                                          color: "#5A7A9A",
                                        }}
                                      >
                                        {activity}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          {week.dominant_keywords &&
                            week.dominant_keywords.length > 0 && (
                              <div className="mb-2">
                                <p
                                  className={cn(
                                    TYPOGRAPHY.bodySmall.fontSize,
                                    "mb-1"
                                  )}
                                  style={{ color: COLORS.text.tertiary }}
                                >
                                  주요 키워드:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {week.dominant_keywords.map(
                                    (keyword, kIdx) => (
                                      <span
                                        key={kIdx}
                                        className={cn(
                                          TYPOGRAPHY.bodySmall.fontSize,
                                          "px-2 py-0.5 rounded"
                                        )}
                                        style={{
                                          backgroundColor: "#E8F0F8",
                                          color: "#5A7A9A",
                                        }}
                                      >
                                        {keyword}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          <p
                            className={cn(
                              TYPOGRAPHY.body.fontSize,
                              TYPOGRAPHY.body.lineHeight,
                              "mt-2"
                            )}
                            style={{ color: COLORS.text.secondary }}
                          >
                            {week.narrative}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* 평가 테마 */}
            {vividReport.daily_life_patterns.evaluation_themes && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 강점 */}
                {vividReport.daily_life_patterns.evaluation_themes.strengths &&
                  vividReport.daily_life_patterns.evaluation_themes.strengths
                    .length > 0 && (
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: "rgba(76, 175, 80, 0.1)",
                        border: "1px solid rgba(76, 175, 80, 0.3)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2
                          className="w-4 h-4"
                          style={{ color: "#4CAF50" }}
                        />
                        <p
                          className={cn(
                            TYPOGRAPHY.label.fontSize,
                            TYPOGRAPHY.label.fontWeight,
                            "uppercase"
                          )}
                          style={{ color: "#4CAF50" }}
                        >
                          강점
                        </p>
                      </div>
                      <div className="space-y-3">
                        {vividReport.daily_life_patterns.evaluation_themes.strengths.map(
                          (strength, idx) => (
                            <div key={idx}>
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <p
                                  className={cn(
                                    TYPOGRAPHY.body.fontSize,
                                    "font-semibold"
                                  )}
                                  style={{ color: COLORS.text.primary }}
                                >
                                  {strength.theme}
                                </p>
                                <span
                                  className={cn(
                                    TYPOGRAPHY.bodySmall.fontSize,
                                    "px-2 py-0.5 rounded"
                                  )}
                                  style={{
                                    backgroundColor: "rgba(76, 175, 80, 0.15)",
                                    color: "#4CAF50",
                                  }}
                                >
                                  {strength.frequency}회
                                </span>
                              </div>
                              {strength.examples && strength.examples.length > 0 && (
                                <div className="mb-2">
                                  {strength.examples.slice(0, 2).map(
                                    (example, eIdx) => (
                                      <p
                                        key={eIdx}
                                        className={cn(
                                          TYPOGRAPHY.bodySmall.fontSize,
                                          TYPOGRAPHY.body.lineHeight
                                        )}
                                        style={{
                                          color: COLORS.text.secondary,
                                        }}
                                      >
                                        • {example}
                                      </p>
                                    )
                                  )}
                                </div>
                              )}
                              <p
                                className={cn(
                                  TYPOGRAPHY.bodySmall.fontSize,
                                  TYPOGRAPHY.body.lineHeight
                                )}
                                style={{ color: COLORS.text.tertiary }}
                              >
                                {strength.how_to_maintain}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* 개선점 */}
                {vividReport.daily_life_patterns.evaluation_themes
                  .improvements &&
                  vividReport.daily_life_patterns.evaluation_themes.improvements
                    .length > 0 && (
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: "rgba(255, 152, 0, 0.1)",
                        border: "1px solid rgba(255, 152, 0, 0.3)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp
                          className="w-4 h-4"
                          style={{ color: "#FF9800" }}
                        />
                        <p
                          className={cn(
                            TYPOGRAPHY.label.fontSize,
                            TYPOGRAPHY.label.fontWeight,
                            "uppercase"
                          )}
                          style={{ color: "#FF9800" }}
                        >
                          개선점
                        </p>
                      </div>
                      <div className="space-y-3">
                        {vividReport.daily_life_patterns.evaluation_themes.improvements.map(
                          (improvement, idx) => (
                            <div key={idx}>
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <p
                                  className={cn(
                                    TYPOGRAPHY.body.fontSize,
                                    "font-semibold"
                                  )}
                                  style={{ color: COLORS.text.primary }}
                                >
                                  {improvement.theme}
                                </p>
                                <span
                                  className={cn(
                                    TYPOGRAPHY.bodySmall.fontSize,
                                    "px-2 py-0.5 rounded"
                                  )}
                                  style={{
                                    backgroundColor: "rgba(255, 152, 0, 0.15)",
                                    color: "#FF9800",
                                  }}
                                >
                                  {improvement.frequency}회
                                </span>
                              </div>
                              {improvement.examples &&
                                improvement.examples.length > 0 && (
                                  <div className="mb-2">
                                    {improvement.examples.slice(0, 2).map(
                                      (example, eIdx) => (
                                        <p
                                          key={eIdx}
                                          className={cn(
                                            TYPOGRAPHY.bodySmall.fontSize,
                                            TYPOGRAPHY.body.lineHeight
                                          )}
                                          style={{
                                            color: COLORS.text.secondary,
                                          }}
                                        >
                                          • {example}
                                        </p>
                                      )
                                    )}
                                  </div>
                                )}
                              {improvement.actionable_steps &&
                                improvement.actionable_steps.length > 0 && (
                                  <div>
                                    <p
                                      className={cn(
                                        TYPOGRAPHY.bodySmall.fontSize,
                                        "mb-1 font-semibold"
                                      )}
                                      style={{ color: COLORS.text.primary }}
                                    >
                                      실행 단계:
                                    </p>
                                    <ul className="space-y-1">
                                      {improvement.actionable_steps
                                        .slice(0, 2)
                                        .map((step, sIdx) => (
                                          <li
                                            key={sIdx}
                                            className="flex items-start gap-2"
                                          >
                                            <div
                                              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                                              style={{
                                                backgroundColor: "#FF9800",
                                              }}
                                            />
                                            <p
                                              className={cn(
                                                TYPOGRAPHY.bodySmall.fontSize,
                                                TYPOGRAPHY.body.lineHeight,
                                                "flex-1"
                                              )}
                                              style={{
                                                color: COLORS.text.secondary,
                                              }}
                                            >
                                              {step}
                                            </p>
                                          </li>
                                        ))}
                                    </ul>
                                  </div>
                                )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </GradientCard>
        </div>
      )}

      {/* 4. 특성-비전 매칭 (15%) */}
      {vividReport.identity_alignment && (
        <div className="space-y-5">
          <GradientCard gradientColor="163, 191, 217">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: `${vividColor}20`,
                  border: `1.5px solid ${vividColor}40`,
                }}
              >
                <Users className="w-4 h-4" style={{ color: vividColor }} />
              </div>
              <p
                className={cn(
                  TYPOGRAPHY.label.fontSize,
                  TYPOGRAPHY.label.fontWeight,
                  TYPOGRAPHY.label.letterSpacing,
                  "uppercase"
                )}
                style={{ color: COLORS.text.secondary }}
              >
                특성-비전 매칭
              </p>
            </div>

            {/* 특성 매핑 */}
            {vividReport.identity_alignment.trait_mapping &&
              vividReport.identity_alignment.trait_mapping.length > 0 && (
                <div className="mb-6">
                  <p
                    className={cn(
                      TYPOGRAPHY.label.fontSize,
                      TYPOGRAPHY.label.fontWeight,
                      "mb-3 uppercase"
                    )}
                    style={{ color: COLORS.text.secondary }}
                  >
                    특성 매핑
                  </p>
                  <div className="space-y-4">
                    {vividReport.identity_alignment.trait_mapping.map(
                      (mapping, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-lg"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.6)",
                            border: "1px solid rgba(163, 191, 217, 0.2)",
                          }}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div>
                              <p
                                className={cn(
                                  TYPOGRAPHY.bodySmall.fontSize,
                                  "mb-1 uppercase"
                                )}
                                style={{ color: COLORS.text.tertiary }}
                              >
                                현재 특성
                              </p>
                              <p
                                className={cn(
                                  TYPOGRAPHY.body.fontSize,
                                  "font-medium"
                                )}
                                style={{ color: COLORS.text.primary }}
                              >
                                {mapping.current}
                              </p>
                            </div>
                            <div>
                              <p
                                className={cn(
                                  TYPOGRAPHY.bodySmall.fontSize,
                                  "mb-1 uppercase"
                                )}
                                style={{ color: COLORS.text.tertiary }}
                              >
                                지향 특성
                              </p>
                              <p
                                className={cn(
                                  TYPOGRAPHY.body.fontSize,
                                  "font-medium"
                                )}
                                style={{ color: COLORS.text.primary }}
                              >
                                {mapping.aspired}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <div
                              className="flex-1 h-2 rounded-full overflow-hidden"
                              style={{ backgroundColor: "#E8F0F8" }}
                            >
                              <div
                                className="h-full transition-all duration-500"
                                style={{
                                  width: `${mapping.match_score * 100}%`,
                                  backgroundColor: vividColor,
                                }}
                              />
                            </div>
                            <span
                              className={cn(
                                TYPOGRAPHY.bodySmall.fontSize,
                                "font-semibold whitespace-nowrap"
                              )}
                              style={{ color: vividColor }}
                            >
                              {Math.round(mapping.match_score * 100)}%
                            </span>
                          </div>
                          <p
                            className={cn(
                              TYPOGRAPHY.body.fontSize,
                              TYPOGRAPHY.body.lineHeight,
                              "mb-2"
                            )}
                            style={{ color: COLORS.text.secondary }}
                          >
                            {mapping.gap_description}
                          </p>
                          {mapping.progress_evidence &&
                            mapping.progress_evidence.length > 0 && (
                              <div>
                                <p
                                  className={cn(
                                    TYPOGRAPHY.bodySmall.fontSize,
                                    "mb-1 font-semibold"
                                  )}
                                  style={{ color: COLORS.text.primary }}
                                >
                                  진행 증거:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {mapping.progress_evidence.map(
                                    (evidence, eIdx) => (
                                      <span
                                        key={eIdx}
                                        className={cn(
                                          TYPOGRAPHY.caption.fontSize,
                                          "px-2 py-0.5 rounded"
                                        )}
                                        style={{
                                          backgroundColor: "#E8F0F8",
                                          color: "#5A7A9A",
                                        }}
                                      >
                                        {evidence}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* 특성 진화 */}
            {vividReport.identity_alignment.trait_evolution && (
              <div className="mb-6">
                <p
                  className={cn(
                    TYPOGRAPHY.label.fontSize,
                    TYPOGRAPHY.label.fontWeight,
                    "mb-3 uppercase"
                  )}
                  style={{ color: COLORS.text.secondary }}
                >
                  특성 진화
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 강해진 특성 */}
                  {vividReport.identity_alignment.trait_evolution
                    .strengthened &&
                    vividReport.identity_alignment.trait_evolution
                      .strengthened.length > 0 && (
                      <div
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor: "rgba(76, 175, 80, 0.1)",
                          border: "1px solid rgba(76, 175, 80, 0.3)",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <ArrowUp
                            className="w-4 h-4"
                            style={{ color: "#4CAF50" }}
                          />
                          <p
                            className={cn(
                              TYPOGRAPHY.label.fontSize,
                              TYPOGRAPHY.label.fontWeight,
                              "uppercase"
                            )}
                            style={{ color: "#4CAF50" }}
                          >
                            강해진 특성
                          </p>
                        </div>
                        <div className="space-y-2">
                          {vividReport.identity_alignment.trait_evolution.strengthened.map(
                            (trait, idx) => (
                              <div key={idx}>
                                <p
                                  className={cn(
                                    TYPOGRAPHY.body.fontSize,
                                    "font-semibold mb-1"
                                  )}
                                  style={{ color: COLORS.text.primary }}
                                >
                                  {trait.trait}
                                </p>
                                <p
                                  className={cn(
                                    TYPOGRAPHY.bodySmall.fontSize,
                                    TYPOGRAPHY.body.lineHeight
                                  )}
                                  style={{ color: COLORS.text.secondary }}
                                >
                                  {trait.early_month} → {trait.late_month}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* 새로 나타난 특성 */}
                  {vividReport.identity_alignment.trait_evolution.emerging &&
                    vividReport.identity_alignment.trait_evolution.emerging
                      .length > 0 && (
                      <div
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor: "rgba(163, 191, 217, 0.1)",
                          border: "1px solid rgba(163, 191, 217, 0.3)",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles
                            className="w-4 h-4"
                            style={{ color: vividColor }}
                          />
                          <p
                            className={cn(
                              TYPOGRAPHY.label.fontSize,
                              TYPOGRAPHY.label.fontWeight,
                              "uppercase"
                            )}
                            style={{ color: vividColor }}
                          >
                            새로 나타난 특성
                          </p>
                        </div>
                        <div className="space-y-2">
                          {vividReport.identity_alignment.trait_evolution.emerging.map(
                            (trait, idx) => (
                              <div key={idx}>
                                <p
                                  className={cn(
                                    TYPOGRAPHY.body.fontSize,
                                    "font-semibold mb-1"
                                  )}
                                  style={{ color: COLORS.text.primary }}
                                >
                                  {trait.trait}
                                </p>
                                <p
                                  className={cn(
                                    TYPOGRAPHY.bodySmall.fontSize,
                                    TYPOGRAPHY.body.lineHeight
                                  )}
                                  style={{ color: COLORS.text.secondary }}
                                >
                                  {trait.first_date}부터 {trait.frequency}회
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* 사라진 특성 */}
                  {vividReport.identity_alignment.trait_evolution.fading &&
                    vividReport.identity_alignment.trait_evolution.fading
                      .length > 0 && (
                      <div
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor: "rgba(255, 152, 0, 0.1)",
                          border: "1px solid rgba(255, 152, 0, 0.3)",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <ArrowDown
                            className="w-4 h-4"
                            style={{ color: "#FF9800" }}
                          />
                          <p
                            className={cn(
                              TYPOGRAPHY.label.fontSize,
                              TYPOGRAPHY.label.fontWeight,
                              "uppercase"
                            )}
                            style={{ color: "#FF9800" }}
                          >
                            사라진 특성
                          </p>
                        </div>
                        <div className="space-y-2">
                          {vividReport.identity_alignment.trait_evolution.fading.map(
                            (trait, idx) => (
                              <div key={idx}>
                                <p
                                  className={cn(
                                    TYPOGRAPHY.body.fontSize,
                                    "font-semibold mb-1"
                                  )}
                                  style={{ color: COLORS.text.primary }}
                                >
                                  {trait.trait}
                                </p>
                                <p
                                  className={cn(
                                    TYPOGRAPHY.bodySmall.fontSize,
                                    TYPOGRAPHY.body.lineHeight
                                  )}
                                  style={{ color: COLORS.text.secondary }}
                                >
                                  마지막: {trait.last_appeared}
                                </p>
                                <p
                                  className={cn(
                                    TYPOGRAPHY.bodySmall.fontSize,
                                    TYPOGRAPHY.body.lineHeight,
                                    "mt-1"
                                  )}
                                  style={{ color: COLORS.text.tertiary }}
                                >
                                  {trait.why}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* 집중할 특성 */}
            {vividReport.identity_alignment.focus_traits &&
              vividReport.identity_alignment.focus_traits.length > 0 && (
                <div>
                  <p
                    className={cn(
                      TYPOGRAPHY.label.fontSize,
                      TYPOGRAPHY.label.fontWeight,
                      "mb-3 uppercase"
                    )}
                    style={{ color: COLORS.text.secondary }}
                  >
                    다음 달 집중할 특성
                  </p>
                  <div className="space-y-4">
                    {vividReport.identity_alignment.focus_traits.map(
                      (trait, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-lg"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.6)",
                            border: "1px solid rgba(163, 191, 217, 0.2)",
                          }}
                        >
                          <p
                            className={cn(
                              TYPOGRAPHY.body.fontSize,
                              "font-semibold mb-3"
                            )}
                            style={{ color: COLORS.text.primary }}
                          >
                            {trait.trait}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div>
                              <p
                                className={cn(
                                  TYPOGRAPHY.bodySmall.fontSize,
                                  "mb-1 uppercase"
                                )}
                                style={{ color: COLORS.text.tertiary }}
                              >
                                현재 상태
                              </p>
                              <p
                                className={cn(
                                  TYPOGRAPHY.body.fontSize,
                                  TYPOGRAPHY.body.lineHeight
                                )}
                                style={{ color: COLORS.text.secondary }}
                              >
                                {trait.current_state}
                              </p>
                            </div>
                            <div>
                              <p
                                className={cn(
                                  TYPOGRAPHY.bodySmall.fontSize,
                                  "mb-1 uppercase"
                                )}
                                style={{ color: COLORS.text.tertiary }}
                              >
                                원하는 상태
                              </p>
                              <p
                                className={cn(
                                  TYPOGRAPHY.body.fontSize,
                                  TYPOGRAPHY.body.lineHeight
                                )}
                                style={{ color: COLORS.text.secondary }}
                              >
                                {trait.desired_state}
                              </p>
                            </div>
                          </div>
                          <p
                            className={cn(
                              TYPOGRAPHY.body.fontSize,
                              TYPOGRAPHY.body.lineHeight,
                              "font-medium"
                            )}
                            style={{ color: COLORS.text.primary }}
                          >
                            {trait.monthly_action}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </GradientCard>
        </div>
      )}

      {/* 5. 실행 가능한 다음 달 플랜 (10%) */}
      {vividReport.next_month_plan && (
        <div className="space-y-5">
          <GradientCard gradientColor="163, 191, 217">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: `${vividColor}20`,
                  border: `1.5px solid ${vividColor}40`,
                }}
              >
                <Rocket className="w-4 h-4" style={{ color: vividColor }} />
              </div>
              <p
                className={cn(
                  TYPOGRAPHY.label.fontSize,
                  TYPOGRAPHY.label.fontWeight,
                  TYPOGRAPHY.label.letterSpacing,
                  "uppercase"
                )}
                style={{ color: COLORS.text.secondary }}
              >
                실행 가능한 다음 달 플랜
              </p>
            </div>

            {/* 집중 영역 */}
            {vividReport.next_month_plan.focus_areas &&
              vividReport.next_month_plan.focus_areas.length > 0 && (
                <div className="mb-6">
                  <p
                    className={cn(
                      TYPOGRAPHY.label.fontSize,
                      TYPOGRAPHY.label.fontWeight,
                      "mb-3 uppercase"
                    )}
                    style={{ color: COLORS.text.secondary }}
                  >
                    집중 영역
                  </p>
                  <div className="space-y-4">
                    {vividReport.next_month_plan.focus_areas.map(
                      (area, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-lg"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.6)",
                            border: "1px solid rgba(163, 191, 217, 0.2)",
                          }}
                        >
                          <p
                            className={cn(
                              TYPOGRAPHY.body.fontSize,
                              "font-semibold mb-2"
                            )}
                            style={{ color: COLORS.text.primary }}
                          >
                            {area.area}
                          </p>
                          <p
                            className={cn(
                              TYPOGRAPHY.body.fontSize,
                              TYPOGRAPHY.body.lineHeight,
                              "mb-3"
                            )}
                            style={{ color: COLORS.text.secondary }}
                          >
                            {area.why}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div>
                              <p
                                className={cn(
                                  TYPOGRAPHY.bodySmall.fontSize,
                                  "mb-1 uppercase"
                                )}
                                style={{ color: COLORS.text.tertiary }}
                              >
                                현재 상태
                              </p>
                              <p
                                className={cn(
                                  TYPOGRAPHY.body.fontSize,
                                  TYPOGRAPHY.body.lineHeight
                                )}
                                style={{ color: COLORS.text.secondary }}
                              >
                                {area.current_state}
                              </p>
                            </div>
                            <div>
                              <p
                                className={cn(
                                  TYPOGRAPHY.bodySmall.fontSize,
                                  "mb-1 uppercase"
                                )}
                                style={{ color: COLORS.text.tertiary }}
                              >
                                원하는 상태
                              </p>
                              <p
                                className={cn(
                                  TYPOGRAPHY.body.fontSize,
                                  TYPOGRAPHY.body.lineHeight
                                )}
                                style={{ color: COLORS.text.secondary }}
                              >
                                {area.desired_state}
                              </p>
                            </div>
                          </div>
                          {area.weekly_actions &&
                            area.weekly_actions.length > 0 && (
                              <div>
                                <p
                                  className={cn(
                                    TYPOGRAPHY.bodySmall.fontSize,
                                    "mb-2 font-semibold"
                                  )}
                                  style={{ color: COLORS.text.primary }}
                                >
                                  주차별 액션:
                                </p>
                                <div className="space-y-2">
                                  {area.weekly_actions.map((action, aIdx) => (
                                    <div
                                      key={aIdx}
                                      className="p-2 rounded"
                                      style={{
                                        backgroundColor: "rgba(163, 191, 217, 0.1)",
                                      }}
                                    >
                                      <div className="flex items-center justify-between gap-2 mb-1">
                                        <p
                                          className={cn(
                                            TYPOGRAPHY.bodySmall.fontSize,
                                            "font-semibold"
                                          )}
                                          style={{ color: COLORS.text.primary }}
                                        >
                                          {action.week}주차
                                        </p>
                                        <span
                                          className={cn(
                                            TYPOGRAPHY.caption.fontSize,
                                            "px-2 py-0.5 rounded"
                                          )}
                                          style={{
                                            backgroundColor: "#E8F0F8",
                                            color: "#5A7A9A",
                                          }}
                                        >
                                          {action.success_metric}
                                        </span>
                                      </div>
                                      <p
                                        className={cn(
                                          TYPOGRAPHY.bodySmall.fontSize,
                                          TYPOGRAPHY.body.lineHeight
                                        )}
                                        style={{ color: COLORS.text.secondary }}
                                      >
                                        {action.action}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* 유지할 패턴 */}
            {vividReport.next_month_plan.maintain_patterns &&
              vividReport.next_month_plan.maintain_patterns.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Repeat
                      className="w-4 h-4"
                      style={{ color: "#4CAF50" }}
                    />
                    <p
                      className={cn(
                        TYPOGRAPHY.label.fontSize,
                        TYPOGRAPHY.label.fontWeight,
                        "uppercase"
                      )}
                      style={{ color: "#4CAF50" }}
                    >
                      유지할 패턴
                    </p>
                  </div>
                  <div className="space-y-3">
                    {vividReport.next_month_plan.maintain_patterns.map(
                      (pattern, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-lg"
                          style={{
                            backgroundColor: "rgba(76, 175, 80, 0.1)",
                            border: "1px solid rgba(76, 175, 80, 0.3)",
                          }}
                        >
                          <p
                            className={cn(
                              TYPOGRAPHY.body.fontSize,
                              "font-semibold mb-2"
                            )}
                            style={{ color: COLORS.text.primary }}
                          >
                            {pattern.pattern}
                          </p>
                          <p
                            className={cn(
                              TYPOGRAPHY.body.fontSize,
                              TYPOGRAPHY.body.lineHeight,
                              "mb-2"
                            )}
                            style={{ color: COLORS.text.secondary }}
                          >
                            {pattern.why_important}
                          </p>
                          <p
                            className={cn(
                              TYPOGRAPHY.bodySmall.fontSize,
                              TYPOGRAPHY.body.lineHeight,
                              "font-medium"
                            )}
                            style={{ color: COLORS.text.primary }}
                          >
                            {pattern.how_to_maintain}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* 실험할 패턴 */}
            {vividReport.next_month_plan.experiment_patterns &&
              vividReport.next_month_plan.experiment_patterns.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FlaskConical
                      className="w-4 h-4"
                      style={{ color: vividColor }}
                    />
                    <p
                      className={cn(
                        TYPOGRAPHY.label.fontSize,
                        TYPOGRAPHY.label.fontWeight,
                        "uppercase"
                      )}
                      style={{ color: vividColor }}
                    >
                      실험할 패턴
                    </p>
                  </div>
                  <div className="space-y-3">
                    {vividReport.next_month_plan.experiment_patterns.map(
                      (pattern, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-lg"
                          style={{
                            backgroundColor: "rgba(163, 191, 217, 0.1)",
                            border: "1px solid rgba(163, 191, 217, 0.3)",
                          }}
                        >
                          <p
                            className={cn(
                              TYPOGRAPHY.body.fontSize,
                              "font-semibold mb-2"
                            )}
                            style={{ color: COLORS.text.primary }}
                          >
                            {pattern.pattern}
                          </p>
                          <p
                            className={cn(
                              TYPOGRAPHY.body.fontSize,
                              TYPOGRAPHY.body.lineHeight,
                              "mb-2"
                            )}
                            style={{ color: COLORS.text.secondary }}
                          >
                            {pattern.why_suggested}
                          </p>
                          <p
                            className={cn(
                              TYPOGRAPHY.bodySmall.fontSize,
                              TYPOGRAPHY.body.lineHeight,
                              "font-medium"
                            )}
                            style={{ color: COLORS.text.primary }}
                          >
                            {pattern.how_to_start}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </GradientCard>
        </div>
      )}
    </div>
  );
}
