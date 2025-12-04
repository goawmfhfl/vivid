import {
  Lightbulb,
  Lock,
  TrendingUp,
  BarChart3,
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Card } from "../../ui/card";
import type { InsightReport } from "@/types/weekly-feedback";
import { COLORS, SPACING } from "@/lib/design-system";
import { useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type InsightSectionProps = {
  insightReport: InsightReport;
  isPro?: boolean;
};

// 브랜드 색상: 골드/베이지 계열 (VisionSection의 #E5B96B와 유사한 톤)
const INSIGHT_COLOR = "#E5B96B";
const INSIGHT_COLOR_DARK = "#D4A85A";
const INSIGHT_COLOR_LIGHT = "#F5E6C8";
const INSIGHT_COLORS = [
  "#E5B96B",
  "#D4A85A",
  "#C9A052",
  "#B89A7A",
  "#A78A6A",
  "#9A7C5A",
  "#8A6C4A",
];

export function InsightSection({
  insightReport,
  isPro = false,
}: InsightSectionProps) {
  const router = useRouter();

  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
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
          이번 주의 인사이트
        </h2>
      </div>

      {/* Core Insights - 모든 사용자 */}
      {insightReport.core_insights &&
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
                style={{ backgroundColor: INSIGHT_COLOR_LIGHT }}
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
                  {insightReport.core_insights.map((insight, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3"
                      style={{ color: COLORS.text.primary }}
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background: `linear-gradient(135deg, ${INSIGHT_COLOR} 0%, ${INSIGHT_COLOR_DARK} 100%)`,
                          color: "white",
                        }}
                      >
                        <span className="text-xs font-semibold">{idx + 1}</span>
                      </div>
                      <p
                        className="text-sm leading-relaxed flex-1"
                        style={{ lineHeight: "1.7" }}
                      >
                        {insight}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

      {/* Meta Questions Highlight - 모든 사용자 */}
      {insightReport.meta_questions_highlight &&
        insightReport.meta_questions_highlight.length > 0 && (
          <Card
            className="p-5 sm:p-6 mb-4"
            style={{
              backgroundColor: "#F0F5F0",
              border: "1px solid #D5E3D5",
              borderRadius: "16px",
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#E8EFE8" }}
              >
                <Target
                  className="w-4 h-4"
                  style={{ color: COLORS.brand.secondary }}
                />
              </div>
              <div className="flex-1">
                <p
                  className="text-xs mb-2 font-semibold"
                  style={{ color: COLORS.text.secondary }}
                >
                  메타 질문
                </p>
                <ul className="space-y-2">
                  {insightReport.meta_questions_highlight.map(
                    (question, idx) => (
                      <li
                        key={idx}
                        className="text-sm leading-relaxed"
                        style={{
                          color: COLORS.text.primary,
                          lineHeight: "1.7",
                        }}
                      >
                        • {question}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </Card>
        )}

      {/* Free 모드: Pro 업그레이드 유도 */}
      {!isPro && (
        <Card
          className="p-5 sm:p-6 cursor-pointer transition-all hover:scale-[1.02] relative overflow-hidden group"
          style={{
            background:
              "linear-gradient(135deg, rgba(229, 185, 107, 0.08) 0%, rgba(255, 255, 255, 1) 100%)",
            border: "1px solid #D5E3D5",
            borderRadius: "16px",
          }}
          onClick={() => router.push("/subscription")}
        >
          {/* 장식 요소 */}
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
                  인사이트를 행동으로 옮기고 싶으신가요?
                </p>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    backgroundColor: "rgba(229, 185, 107, 0.2)",
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
                Pro 멤버십에서는 이번 주의 인사이트 패턴, 강점 발견, 행동 정렬을
                시각화해 드립니다. 깨달음이 그냥 감탄으로 끝나지 않고, 당신의
                성장으로 이어지도록 도와드려요.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span style={{ color: COLORS.brand.primary }}>
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

      {/* Pro 모드: 상세 분석 및 시각화 */}
      {isPro && (
        <div className="space-y-6">
          {/* Insight Patterns - 인사이트 카테고리 분석 */}
          {insightReport.insight_patterns &&
            insightReport.insight_patterns.insight_categories &&
            insightReport.insight_patterns.insight_categories.length > 0 && (
              <Card
                className="p-5 sm:p-6 relative overflow-hidden group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(229, 185, 107, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                  border: "1px solid #D5E3D5",
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
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-xs mb-3 font-semibold"
                      style={{ color: COLORS.text.secondary }}
                    >
                      인사이트 카테고리 분석
                    </p>
                    {insightReport.insight_patterns.summary && (
                      <p
                        className="text-sm mb-4 leading-relaxed"
                        style={{
                          color: COLORS.text.primary,
                          lineHeight: "1.7",
                        }}
                      >
                        {insightReport.insight_patterns.summary}
                      </p>
                    )}
                    {/* 차트와 카테고리 리스트를 함께 표시 */}
                    {insightReport.insight_patterns.visualization
                      ?.insight_categories_chart && (
                      <div className="mb-4">
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={
                                  insightReport.insight_patterns.visualization
                                    .insight_categories_chart.data
                                }
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                stroke={COLORS.background.card}
                                strokeWidth={2}
                              >
                                {insightReport.insight_patterns.visualization.insight_categories_chart.data.map(
                                  (entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={
                                        entry.color ||
                                        INSIGHT_COLORS[
                                          index % INSIGHT_COLORS.length
                                        ]
                                      }
                                    />
                                  )
                                )}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: COLORS.background.card,
                                  border: `1px solid ${COLORS.border.light}`,
                                  borderRadius: "8px",
                                }}
                                formatter={(
                                  value: number,
                                  name: string,
                                  props: any
                                ) => [
                                  `${value}개`,
                                  props.payload?.category || name,
                                ]}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                    {/* 카테고리 상세 정보 */}
                    <div className="space-y-3">
                      {insightReport.insight_patterns.insight_categories.map(
                        (category, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-lg transition-all hover:shadow-md"
                            style={{
                              backgroundColor: "#FAFAF8",
                              border: "1px solid #EFE9E3",
                            }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{
                                    backgroundColor:
                                      insightReport.insight_patterns
                                        .visualization?.insight_categories_chart
                                        ?.data[idx]?.color ||
                                      INSIGHT_COLORS[
                                        idx % INSIGHT_COLORS.length
                                      ],
                                  }}
                                />
                                <span
                                  className="text-sm font-semibold"
                                  style={{ color: COLORS.text.primary }}
                                >
                                  {category.category}
                                </span>
                              </div>
                              <span
                                className="px-3 py-1 rounded-full text-xs font-semibold"
                                style={{
                                  backgroundColor: INSIGHT_COLOR_LIGHT,
                                  color: INSIGHT_COLOR_DARK,
                                }}
                              >
                                {category.count}개
                              </span>
                            </div>
                            {category.examples &&
                              category.examples.length > 0 && (
                                <div className="mb-2">
                                  <p
                                    className="text-xs mb-1.5 font-medium"
                                    style={{ color: COLORS.text.secondary }}
                                  >
                                    예시:
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {category.examples
                                      .slice(0, 3)
                                      .map((example, eIdx) => (
                                        <span
                                          key={eIdx}
                                          className="px-2 py-0.5 rounded text-xs"
                                          style={{
                                            backgroundColor: "white",
                                            color: COLORS.text.secondary,
                                            border: "1px solid #EFE9E3",
                                          }}
                                        >
                                          {example}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                              )}
                            {category.insight && (
                              <p
                                className="text-xs mt-2 leading-relaxed"
                                style={{
                                  color: COLORS.text.secondary,
                                  lineHeight: "1.6",
                                }}
                              >
                                {category.insight}
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

          {/* Key Strengths - 강점 발견 */}
          {insightReport.insight_patterns?.key_strengths_identified &&
            insightReport.insight_patterns.key_strengths_identified.length >
              0 && (
              <Card
                className="p-5 sm:p-6 relative overflow-hidden group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                  border: "1px solid #D5E3D5",
                  borderRadius: "16px",
                }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background:
                        "linear-gradient(135deg, #B89A7A 0%, #A78A6A 100%)",
                    }}
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-xs mb-3 font-semibold"
                      style={{ color: COLORS.text.secondary }}
                    >
                      발견된 강점
                    </p>
                    <div className="space-y-3">
                      {insightReport.insight_patterns.key_strengths_identified.map(
                        (strength, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg"
                            style={{
                              backgroundColor: "#FAFAF8",
                              border: "1px solid #EFE9E3",
                            }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <p
                                className="text-sm font-semibold"
                                style={{ color: COLORS.text.primary }}
                              >
                                {strength.strength}
                              </p>
                              <span
                                className="px-2 py-0.5 rounded text-xs"
                                style={{
                                  backgroundColor: "#FFF9E6",
                                  color: "#B89A7A",
                                }}
                              >
                                {strength.frequency}회
                              </span>
                            </div>
                            {strength.insight && (
                              <p
                                className="text-xs mt-2"
                                style={{ color: COLORS.text.secondary }}
                              >
                                {strength.insight}
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

          {/* Meta Questions Analysis - 메타 질문 테마 분석 */}
          {insightReport.meta_questions_analysis &&
            insightReport.meta_questions_analysis.visualization
              ?.question_themes_chart && (
              <Card
                className="p-5 sm:p-6 relative overflow-hidden group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(229, 185, 107, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                  border: "1px solid #D5E3D5",
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
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-xs mb-3 font-semibold"
                      style={{ color: COLORS.text.secondary }}
                    >
                      메타 질문 테마 분석
                    </p>
                    {insightReport.meta_questions_analysis.summary && (
                      <p
                        className="text-sm mb-4 leading-relaxed"
                        style={{
                          color: COLORS.text.primary,
                          lineHeight: "1.7",
                        }}
                      >
                        {insightReport.meta_questions_analysis.summary}
                      </p>
                    )}
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={
                            insightReport.meta_questions_analysis.visualization
                              .question_themes_chart.data
                          }
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={COLORS.border.default}
                          />
                          <XAxis
                            dataKey="theme"
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
                              borderRadius: "8px",
                            }}
                          />
                          <Bar
                            dataKey="count"
                            fill={INSIGHT_COLOR}
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </Card>
            )}

          {/* Growth Insights - 성장 인사이트 */}
          {insightReport.growth_insights && (
            <Card
              className="p-5 sm:p-6 relative overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, rgba(168, 187, 168, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #D5E3D5",
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
                    성장 인사이트
                  </p>
                  {insightReport.growth_insights.key_learnings &&
                    insightReport.growth_insights.key_learnings.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {insightReport.growth_insights.key_learnings.map(
                          (learning, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-lg"
                              style={{
                                backgroundColor: "#FAFAF8",
                                border: "1px solid #EFE9E3",
                              }}
                            >
                              <p
                                className="text-sm font-semibold mb-1"
                                style={{ color: COLORS.text.primary }}
                              >
                                {learning.learning}
                              </p>
                              {learning.implication && (
                                <p
                                  className="text-xs mt-2"
                                  style={{ color: COLORS.text.secondary }}
                                >
                                  {learning.implication}
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  {insightReport.growth_insights.next_week_focus &&
                    insightReport.growth_insights.next_week_focus.length >
                      0 && (
                      <div>
                        <p
                          className="text-xs font-medium mb-2"
                          style={{ color: COLORS.text.secondary }}
                        >
                          다음 주 포커스
                        </p>
                        <ul className="space-y-2">
                          {insightReport.growth_insights.next_week_focus.map(
                            (focus, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2"
                                style={{ color: COLORS.text.primary }}
                              >
                                <span
                                  className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                                  style={{
                                    backgroundColor: COLORS.brand.primary,
                                  }}
                                />
                                <div className="flex-1">
                                  <p className="text-sm">{focus.area}</p>
                                  {focus.reason && (
                                    <p
                                      className="text-xs mt-1"
                                      style={{ color: COLORS.text.secondary }}
                                    >
                                      {focus.reason}
                                    </p>
                                  )}
                                </div>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            </Card>
          )}

          {/* Insight Action Alignment - 인사이트-행동 정렬 */}
          {insightReport.insight_action_alignment && (
            <Card
              className="p-5 sm:p-6 relative overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, rgba(229, 185, 107, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #D5E3D5",
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
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    인사이트-행동 정렬도
                  </p>
                  {insightReport.insight_action_alignment.summary && (
                    <p
                      className="text-sm mb-4 leading-relaxed"
                      style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
                    >
                      {insightReport.insight_action_alignment.summary}
                    </p>
                  )}
                  {insightReport.insight_action_alignment.alignment_score && (
                    <div
                      className="mb-4 p-4 rounded-lg"
                      style={{ backgroundColor: "#F0F5F0" }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-xs font-medium"
                          style={{ color: COLORS.text.secondary }}
                        >
                          정렬 점수
                        </span>
                        <span
                          className="text-2xl font-bold"
                          style={{ color: COLORS.brand.primary }}
                        >
                          {
                            insightReport.insight_action_alignment
                              .alignment_score.value
                          }
                        </span>
                      </div>
                      <p
                        className="text-xs mt-2 leading-relaxed"
                        style={{
                          color: COLORS.text.secondary,
                          lineHeight: "1.6",
                        }}
                      >
                        {
                          insightReport.insight_action_alignment.alignment_score
                            .description
                        }
                      </p>
                    </div>
                  )}
                  {insightReport.insight_action_alignment.strong_connections &&
                    insightReport.insight_action_alignment.strong_connections
                      .length > 0 && (
                      <div>
                        <p
                          className="text-xs font-medium mb-3"
                          style={{ color: COLORS.text.secondary }}
                        >
                          강한 연결 관계
                        </p>
                        <div className="space-y-3">
                          {insightReport.insight_action_alignment.strong_connections.map(
                            (connection, idx) => (
                              <div
                                key={idx}
                                className="p-4 rounded-lg transition-all hover:shadow-md"
                                style={{
                                  backgroundColor: "#FAFAF8",
                                  border: "1px solid #EFE9E3",
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                    style={{
                                      background: `linear-gradient(135deg, ${INSIGHT_COLOR} 0%, ${INSIGHT_COLOR_DARK} 100%)`,
                                    }}
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <p
                                      className="text-sm font-semibold mb-1.5"
                                      style={{ color: COLORS.text.primary }}
                                    >
                                      {connection.insight}
                                    </p>
                                    <div className="flex items-center gap-2 mb-2">
                                      <span
                                        className="text-xs px-2 py-0.5 rounded"
                                        style={{
                                          backgroundColor: INSIGHT_COLOR_LIGHT,
                                          color: INSIGHT_COLOR_DARK,
                                          fontWeight: 500,
                                        }}
                                      >
                                        행동
                                      </span>
                                      <p
                                        className="text-xs font-medium"
                                        style={{ color: COLORS.text.primary }}
                                      >
                                        {connection.action}
                                      </p>
                                    </div>
                                    <p
                                      className="text-xs leading-relaxed"
                                      style={{
                                        color: COLORS.text.secondary,
                                        lineHeight: "1.6",
                                      }}
                                    >
                                      {connection.connection}
                                    </p>
                                  </div>
                                </div>
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
        </div>
      )}
    </div>
  );
}
