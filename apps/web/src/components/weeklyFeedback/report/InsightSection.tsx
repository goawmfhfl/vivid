import {
  Lightbulb,
  Lock,
  TrendingUp,
  BarChart3,
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Star,
} from "lucide-react";
import { Card } from "../../ui/card";
import type { InsightReport } from "@/types/weekly-feedback";
import { COLORS } from "@/lib/design-system";
import { useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type InsightSectionProps = {
  insightReport: InsightReport;
  isPro?: boolean;
};

// 인사이트 섹션 브랜드 색상: 골드/베이지 계열
const INSIGHT_COLOR = "#E5B96B";
const INSIGHT_COLOR_DARK = "#D4A85A";
const INSIGHT_COLOR_LIGHT = "#F5E6C8";
// 골드/베이지 계열 차트 색상 팔레트
const INSIGHT_COLORS = [
  "#E5B96B", // 골드 - 메인 색상
  "#D4A85A", // 다크 골드
  "#C9A052", // 미드 골드
  "#B89A7A", // 베이지 브라운
  "#D4C4B0", // 웜 베이지
  "#E6D5C3", // 라이트 크림
  "#F5E6C8", // 매우 연한 베이지
];

// 모던한 차트 스타일을 위한 커스텀 컴포넌트
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: COLORS.background.card,
          border: `1px solid ${COLORS.border.light}`,
          borderRadius: "12px",
          padding: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: COLORS.text.primary,
            marginBottom: "4px",
          }}
        >
          {payload[0].payload?.category || payload[0].name}
        </p>
        <p
          style={{
            fontSize: "0.875rem",
            fontWeight: 700,
            color: payload[0].payload?.color || INSIGHT_COLOR,
          }}
        >
          {payload[0].value}개
        </p>
      </div>
    );
  }
  return null;
};

const CustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  payload,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // 5% 미만은 라벨 숨김

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      style={{
        fontSize: "0.75rem",
        fontWeight: 600,
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
      }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

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
                style={{ backgroundColor: "#FFF9E6" }}
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
                <ul className="space-y-2">
                  {insightReport.core_insights.map((insight, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm leading-relaxed"
                      style={{
                        color: COLORS.text.primary,
                        lineHeight: "1.7",
                      }}
                    >
                      <span
                        className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: INSIGHT_COLOR,
                        }}
                      />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

      {/* Meta Questions Highlight - 모든 사용자 */}
      {Array.isArray(insightReport.meta_questions_highlight) &&
        insightReport.meta_questions_highlight.length > 0 && (
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
                <Target className="w-4 h-4" style={{ color: INSIGHT_COLOR }} />
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
                        className="flex items-start gap-2 text-sm leading-relaxed"
                        style={{
                          color: COLORS.text.primary,
                          lineHeight: "1.7",
                        }}
                      >
                        <span
                          className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: INSIGHT_COLOR,
                          }}
                        />
                        <span>{question}</span>
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
            border: "1px solid #E6D5C3",
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
                Pro 멤버십에서는 이번 주의 인사이트 패턴, 강점 발견, 행동 정렬을
                시각화해 드립니다. 깨달음이 그냥 감탄으로 끝나지 않고, 당신의
                성장으로 이어지도록 도와드려요.
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
                    {/* 모던한 파이 차트 */}
                    {insightReport.insight_patterns.visualization
                      ?.insight_categories_chart && (
                      <div className="mb-6">
                        <div
                          className="rounded-xl p-4"
                          style={{
                            backgroundColor: COLORS.background.base,
                            border: `1px solid ${COLORS.border.light}`,
                          }}
                        >
                          <div className="h-72">
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
                                  label={CustomLabel}
                                  outerRadius={100}
                                  innerRadius={40}
                                  fill="#8884d8"
                                  dataKey="value"
                                  nameKey="category"
                                  stroke={COLORS.background.card}
                                  strokeWidth={3}
                                  animationDuration={800}
                                  animationBegin={0}
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
                                        style={{
                                          filter:
                                            "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                                        }}
                                      />
                                    )
                                  )}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                  wrapperStyle={{
                                    paddingTop: "20px",
                                  }}
                                  iconType="circle"
                                  formatter={(value, entry: any) => (
                                    <span
                                      style={{
                                        fontSize: "0.75rem",
                                        color: COLORS.text.primary,
                                        fontWeight: 500,
                                      }}
                                    >
                                      {entry.payload?.category || value}
                                    </span>
                                  )}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
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
                            {Array.isArray(category.examples) &&
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
                                  backgroundColor: INSIGHT_COLOR_LIGHT,
                                  color: INSIGHT_COLOR_DARK,
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

          {/* Growth Insights - 성장 인사이트 */}
          {insightReport.growth_insights && (
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
                                    backgroundColor: INSIGHT_COLOR,
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
                      style={{
                        backgroundColor: COLORS.background.base,
                        border: `1px solid ${COLORS.border.light}`,
                      }}
                    >
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="text-xs font-medium"
                            style={{ color: COLORS.text.secondary }}
                          >
                            정렬 점수
                          </span>
                          <span
                            className="text-sm font-semibold"
                            style={{ color: INSIGHT_COLOR }}
                          >
                            {(() => {
                              const score =
                                insightReport.insight_action_alignment
                                  .alignment_score.value;
                              // 정렬 점수는 별도로 처리: 0-1 사이면 비율로 해석, 1-5 사이면 5점 만점, 5-100 사이면 이미 100점 만점
                              let percentage: number;
                              if (score > 0 && score <= 1) {
                                // 0-1 사이: 비율로 해석 (0.9 = 90점)
                                percentage = Math.round(score * 100);
                              } else if (score > 1 && score <= 5) {
                                // 1-5 사이: 5점 만점으로 해석 (4.5 / 5 = 90점)
                                percentage = Math.round((score / 5) * 100);
                              } else {
                                // 5-100 사이: 이미 100점 만점
                                percentage = Math.round(score);
                              }
                              return `${percentage} / 100`;
                            })()}
                          </span>
                        </div>
                        {/* 프로그레스 바 */}
                        <div className="relative">
                          <div
                            className="w-full h-4 rounded-full overflow-hidden"
                            style={{
                              backgroundColor: COLORS.border.light,
                            }}
                          >
                            <div
                              className="h-full rounded-full transition-all duration-500 relative"
                              style={{
                                width: `${(() => {
                                  const score =
                                    insightReport.insight_action_alignment
                                      .alignment_score.value;
                                  // 정렬 점수는 별도로 처리: 0-1 사이면 비율로 해석, 1-5 사이면 5점 만점, 5-100 사이면 이미 100점 만점
                                  let percentage: number;
                                  if (score > 0 && score <= 1) {
                                    // 0-1 사이: 비율로 해석 (0.9 = 90%)
                                    percentage = score * 100;
                                  } else if (score > 1 && score <= 5) {
                                    // 1-5 사이: 5점 만점으로 해석 (4.5 / 5 = 90%)
                                    percentage = (score / 5) * 100;
                                  } else {
                                    // 5-100 사이: 이미 100점 만점
                                    percentage = score;
                                  }
                                  return Math.min(100, Math.max(0, percentage));
                                })()}%`,
                                background: `linear-gradient(90deg, ${INSIGHT_COLOR} 0%, ${INSIGHT_COLOR_DARK} 100%)`,
                                boxShadow: `0 2px 4px ${INSIGHT_COLOR}40`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <p
                        className="text-xs leading-relaxed"
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
