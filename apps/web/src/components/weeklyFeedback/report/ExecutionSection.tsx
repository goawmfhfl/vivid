import {
  CheckCircle2,
  XCircle,
  Lock,
  BarChart3,
  User,
  Target,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Card } from "../../ui/card";
import type { ExecutionReport } from "@/types/weekly-feedback";
import { COLORS } from "@/lib/design-system";
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
  LabelList,
  Legend,
} from "recharts";

type ExecutionSectionProps = {
  executionReport: ExecutionReport;
  isPro?: boolean;
};

const EXECUTION_COLOR = COLORS.brand.primary; // #6B7A6F
const EXECUTION_COLOR_DARK = COLORS.brand.dark; // #5A6B5A
// 피드백/개선점에 어울리는 브랜드 그린 계열 그라데이션 팔레트
// 기본 색상: rgb(107, 122, 111) = #6B7A6F를 기준으로 명암 조절
const EXECUTION_COLORS = [
  "#9DB29D", // 가장 밝은 톤 (기본 색상의 +30% 밝기)
  "#8FA38F", // 밝은 톤 (기본 색상의 +15% 밝기)
  "#6B7A6F", // 기본 색상 (중간 톤) - rgb(107, 122, 111)
  "#5A6B5A", // 어두운 톤 (기본 색상의 -15% 밝기) - rgb(90, 107, 90)
  "#4A5A4A", // 가장 어두운 톤 (기본 색상의 -30% 밝기)
];

// 모던한 차트 스타일을 위한 커스텀 컴포넌트
const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload?: { category?: string; color?: string };
    name?: string;
    value?: number;
  }>;
}) => {
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
            color: payload[0].payload?.color || EXECUTION_COLOR,
          }}
        >
          {payload[0].value}개
        </p>
      </div>
    );
  }
  return null;
};

interface CustomLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}

const CustomLabel = (props: CustomLabelProps) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;

  if (
    !midAngle ||
    !percent ||
    percent < 0.05 ||
    !cx ||
    !cy ||
    !innerRadius ||
    !outerRadius
  )
    return null; // midAngle이나 percent가 없거나 5% 미만은 라벨 숨김

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

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

export function ExecutionSection({
  executionReport,
  isPro = false,
}: ExecutionSectionProps) {
  const router = useRouter();

  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: EXECUTION_COLOR }}
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: COLORS.text.primary }}
        >
          이번 주의 피드백
        </h2>
      </div>

      {/* AI Feedback Summary - 가장 먼저 표시 (모든 사용자) */}
      {executionReport.ai_feedback_summary && (
        <Card
          className="p-5 sm:p-6 mb-4 mb-3 sm:mb-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
            border: "1px solid #D5E3D5",
            borderRadius: "16px",
          }}
        >
          {/* Header */}
          <div
            className="pb-4 mb-4 border-b"
            style={{ borderColor: COLORS.border.light }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${EXECUTION_COLOR} 0%, ${EXECUTION_COLOR_DARK} 100%)`,
                }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <p
                className="text-xs font-semibold"
                style={{ color: COLORS.text.secondary }}
              >
                AI 종합 피드백
              </p>
            </div>
          </div>
          {/* Body */}
          <div className="pt-0">
            <p
              className="text-sm leading-relaxed"
              style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
            >
              {executionReport.ai_feedback_summary}
            </p>
          </div>
        </Card>
      )}

      {/* Free 모드: Pro 업그레이드 유도 */}
      {!isPro && (
        <Card
          className="p-5 sm:p-6 cursor-pointer transition-all hover:scale-[1.02] relative overflow-hidden group mb-3 sm:mb-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
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
                Pro 멤버십에서는 이번 주의 피드백 패턴을 깊이 분석하고, 당신의
                강점과 개선점이 실제 행동과 어떻게 연결되는지 시각화해 드립니다.
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

      {/* 잘한 점 카테고리 분포 - Pro 전용 */}
      {isPro && executionReport.feedback_patterns && (
        <div className="space-y-6 mt-6">
          {executionReport.feedback_patterns.visualization
            ?.positives_categories_chart && (
            <Card
              className="p-5 sm:p-6 relative overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #D5E3D5",
                borderRadius: "16px",
              }}
            >
              {/* Header */}
              <div
                className="pb-4 mb-4 border-b"
                style={{ borderColor: COLORS.border.light }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${EXECUTION_COLOR} 0%, ${EXECUTION_COLOR_DARK} 100%)`,
                    }}
                  >
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    잘한 점 카테고리 분포
                  </p>
                </div>
              </div>
              {/* Body */}
              <div className="pt-0">
                {executionReport.feedback_patterns.summary && (
                  <p
                    className="text-sm mb-4 leading-relaxed"
                    style={{
                      color: COLORS.text.primary,
                      lineHeight: "1.7",
                    }}
                  >
                    {executionReport.feedback_patterns.summary}
                  </p>
                )}
                {/* 모던한 파이 차트 */}
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
                              executionReport.feedback_patterns.visualization
                                .positives_categories_chart.data
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
                            {executionReport.feedback_patterns.visualization.positives_categories_chart.data.map(
                              (entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    EXECUTION_COLORS[
                                      index % EXECUTION_COLORS.length
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
                            formatter={(value, entry) => {
                              const category = (
                                entry?.payload as { category?: string }
                              )?.category;
                              return (
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    color: COLORS.text.primary,
                                    fontWeight: 500,
                                  }}
                                >
                                  {category || value}
                                </span>
                              );
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                {/* 카테고리 상세 정보 */}
                {executionReport.feedback_patterns.positives_categories &&
                  executionReport.feedback_patterns.positives_categories
                    .length > 0 && (
                    <div className="space-y-3">
                      {executionReport.feedback_patterns.positives_categories.map(
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
                                      EXECUTION_COLORS[
                                        idx % EXECUTION_COLORS.length
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
                                  backgroundColor: "#E8F0E8",
                                  color: EXECUTION_COLOR_DARK,
                                }}
                              >
                                {category.count}개
                              </span>
                            </div>
                            {Array.isArray(category.examples) &&
                              category.examples.length > 0 && (
                                <div className="mt-3">
                                  <p
                                    className="text-xs mb-2 font-medium"
                                    style={{
                                      color: COLORS.text.secondary,
                                    }}
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
                                            border: "1px solid #E0E5E0",
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
                  )}
              </div>
            </Card>
          )}

          {/* Improvements Categories Chart */}
          {executionReport.feedback_patterns.visualization
            ?.improvements_categories_chart && (
            <Card
              className="p-5 sm:p-6 relative overflow-hidden group mt-6 mb-3 sm:mb-4"
              style={{
                background:
                  "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #D5E3D5",
                borderRadius: "16px",
              }}
            >
              {/* Header */}
              <div
                className="pb-4 mb-4 border-b"
                style={{ borderColor: COLORS.border.light }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, rgb(107, 122, 111) 0%, rgb(90, 107, 90) 100%)`,
                    }}
                  >
                    <XCircle className="w-5 h-5 text-white" />
                  </div>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    개선할 점 카테고리 분포
                  </p>
                </div>
              </div>
              {/* Body */}
              <div className="pt-0">
                {/* 모던한 바 차트 */}
                <div
                  className="rounded-xl p-4 mb-6"
                  style={{
                    backgroundColor: COLORS.background.base,
                    border: `1px solid ${COLORS.border.light}`,
                  }}
                >
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={
                          executionReport.feedback_patterns.visualization.improvements_categories_chart.data.slice(
                            0,
                            5
                          ) // 최대 5개로 제한
                        }
                        margin={{
                          top: 20,
                          right: 20,
                          left: 0,
                          bottom: 20,
                        }}
                      >
                        <defs>
                          <linearGradient
                            id="improvementsBarGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="rgb(107, 122, 111)"
                              stopOpacity={1}
                            />
                            <stop
                              offset="100%"
                              stopColor="rgb(90, 107, 90)"
                              stopOpacity={0.9}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={COLORS.border.light}
                          vertical={false}
                          opacity={0.5}
                        />
                        <XAxis
                          dataKey="category"
                          tick={{
                            fontSize: "0.75rem",
                            fill: COLORS.text.secondary,
                            fontWeight: 500,
                          }}
                          axisLine={{ stroke: COLORS.border.light }}
                          tickLine={{ stroke: COLORS.border.light }}
                        />
                        <YAxis
                          tick={{
                            fontSize: "0.75rem",
                            fill: COLORS.text.secondary,
                            fontWeight: 500,
                          }}
                          axisLine={{ stroke: COLORS.border.light }}
                          tickLine={{ stroke: COLORS.border.light }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="count"
                          radius={[12, 12, 0, 0]}
                          animationDuration={800}
                          animationBegin={0}
                          style={{
                            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                          }}
                        >
                          {executionReport.feedback_patterns.visualization.improvements_categories_chart.data
                            .slice(0, 5)
                            .map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  EXECUTION_COLORS[
                                    index % EXECUTION_COLORS.length
                                  ]
                                }
                              />
                            ))}
                          <LabelList
                            dataKey="count"
                            position="top"
                            style={{
                              fontSize: "0.75rem",
                              fill: COLORS.text.primary,
                              fontWeight: 600,
                            }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 카테고리 상세 정보 - 최대 5개 */}
                {executionReport.feedback_patterns.improvements_categories &&
                  executionReport.feedback_patterns.improvements_categories
                    .length > 0 && (
                    <div className="space-y-3">
                      {executionReport.feedback_patterns.improvements_categories
                        .slice(0, 5)
                        .map((category, idx) => (
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
                                      EXECUTION_COLORS[
                                        idx % EXECUTION_COLORS.length
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
                                  backgroundColor: "rgba(107, 122, 111, 0.15)",
                                  color: "#5A6B5A",
                                }}
                              >
                                {category.count}개
                              </span>
                            </div>
                            {Array.isArray(category.examples) &&
                              category.examples.length > 0 && (
                                <div className="mt-3">
                                  <p
                                    className="text-xs mb-2 font-medium"
                                    style={{
                                      color: COLORS.text.secondary,
                                    }}
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
                                            border: "1px solid #E0E5E0",
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
                        ))}
                    </div>
                  )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Person Traits Analysis - 정체성 분석 */}
      {executionReport.person_traits_analysis && (
        <Card
          className="p-5 sm:p-6 relative overflow-hidden group mb-3 sm:mb-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
            border: "1px solid #D5E3D5",
            borderRadius: "16px",
          }}
        >
          {/* Header */}
          <div
            className="pb-4 mb-4 border-b"
            style={{ borderColor: COLORS.border.light }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${EXECUTION_COLOR} 0%, ${EXECUTION_COLOR_DARK} 100%)`,
                }}
              >
                <User className="w-5 h-5 text-white" />
              </div>
              <p
                className="text-xs font-semibold"
                style={{ color: COLORS.text.secondary }}
              >
                정체성 분석
              </p>
            </div>
          </div>
          {/* Body */}
          <div className="pt-0">
            {executionReport.person_traits_analysis.summary && (
              <p
                className="text-sm mb-4 leading-relaxed"
                style={{
                  color: COLORS.text.primary,
                  lineHeight: "1.7",
                }}
              >
                {executionReport.person_traits_analysis.summary}
              </p>
            )}
            {executionReport.person_traits_analysis.key_traits &&
              executionReport.person_traits_analysis.key_traits.length > 0 && (
                <div className="space-y-3">
                  {executionReport.person_traits_analysis.key_traits.map(
                    (trait, idx) => (
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
                            {trait.trait}
                          </p>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: "#E8F0E8",
                              color: EXECUTION_COLOR_DARK,
                            }}
                          >
                            {trait.frequency}회
                          </span>
                        </div>
                        {trait.insight && (
                          <p
                            className="text-xs mt-2 leading-relaxed"
                            style={{
                              color: COLORS.text.secondary,
                              lineHeight: "1.6",
                            }}
                          >
                            {trait.insight}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
          </div>
        </Card>
      )}

      {/* Improvement Action Alignment - 개선-행동 정렬 */}
      {executionReport.improvement_action_alignment && (
        <Card
          className="p-5 sm:p-6 relative overflow-hidden group mb-3 sm:mb-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
            border: "1px solid #D5E3D5",
            borderRadius: "16px",
          }}
        >
          {/* Header */}
          <div
            className="pb-4 mb-4 border-b"
            style={{ borderColor: COLORS.border.light }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${EXECUTION_COLOR} 0%, ${EXECUTION_COLOR_DARK} 100%)`,
                }}
              >
                <Target className="w-5 h-5 text-white" />
              </div>
              <p
                className="text-xs font-semibold"
                style={{ color: COLORS.text.secondary }}
              >
                개선-행동 정렬도
              </p>
            </div>
          </div>
          {/* Body */}
          <div className="pt-0">
            {executionReport.improvement_action_alignment.summary && (
              <div className="mb-4">
                <p
                  className="text-sm mb-2 leading-relaxed"
                  style={{
                    color: COLORS.text.primary,
                    lineHeight: "1.7",
                  }}
                >
                  {executionReport.improvement_action_alignment.summary}
                </p>
                <p
                  className="text-xs leading-relaxed"
                  style={{
                    color: COLORS.text.tertiary,
                    lineHeight: "1.6",
                    fontStyle: "italic",
                  }}
                >
                  💡 이 섹션은 이번 주 피드백에서 발견된 개선점들이 실제로 어떤
                  행동과 연결되어 있는지를 보여줍니다. 높은 정렬도는 개선 의지가
                  구체적인 행동으로 이어지고 있음을 의미합니다.
                </p>
              </div>
            )}
            {executionReport.improvement_action_alignment.alignment_score && (
              <div
                className="mb-4 p-4 rounded-lg"
                style={{
                  backgroundColor: COLORS.background.base,
                  border: `1px solid ${COLORS.border.light}`,
                }}
              >
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-xs font-medium"
                      style={{ color: COLORS.text.secondary }}
                    >
                      정렬 점수
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: COLORS.text.secondary }}
                    >
                      {(() => {
                        const score =
                          executionReport.improvement_action_alignment
                            .alignment_score.value;
                        // 점수가 5점 만점 기준인지 확인 (일반적으로 5점 이하면 5점 만점)
                        if (score <= 5) {
                          return `${score} / 5`;
                        }
                        // 점수가 0-1 사이 소수점이면 100을 곱하고, 아니면 그대로 사용
                        const percentage =
                          score <= 1 ? Math.round(score * 100) : score;
                        return `${percentage} / 100`;
                      })()}
                    </span>
                  </div>
                  {/* ProgressBar */}
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
                              executionReport.improvement_action_alignment
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
                          background: `linear-gradient(90deg, ${EXECUTION_COLOR} 0%, ${EXECUTION_COLOR_DARK} 100%)`,
                          boxShadow: `0 2px 4px ${EXECUTION_COLOR}40`,
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
                    executionReport.improvement_action_alignment.alignment_score
                      .description
                  }
                </p>
              </div>
            )}
            {executionReport.improvement_action_alignment.strong_connections &&
              executionReport.improvement_action_alignment.strong_connections
                .length > 0 && (
                <div>
                  <p
                    className="text-xs font-medium mb-3"
                    style={{ color: COLORS.text.secondary }}
                  >
                    강한 연결 관계
                  </p>
                  <div className="space-y-3">
                    {executionReport.improvement_action_alignment.strong_connections.map(
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
                                background: `linear-gradient(135deg, ${EXECUTION_COLOR} 0%, ${EXECUTION_COLOR_DARK} 100%)`,
                              }}
                            >
                              <ArrowRight className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p
                                className="text-sm font-semibold mb-1.5"
                                style={{ color: COLORS.text.primary }}
                              >
                                {connection.feedback_theme}
                              </p>
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className="text-xs px-2 py-0.5 rounded"
                                  style={{
                                    backgroundColor: "#E8F0E8",
                                    color: EXECUTION_COLOR_DARK,
                                    fontWeight: 500,
                                  }}
                                >
                                  개선
                                </span>
                                <p
                                  className="text-xs font-medium"
                                  style={{ color: COLORS.text.primary }}
                                >
                                  {connection.improvement}
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
        </Card>
      )}
    </div>
  );
}
