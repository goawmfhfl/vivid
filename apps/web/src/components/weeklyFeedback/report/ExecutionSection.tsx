import {
  CheckCircle2,
  XCircle,
  Lock,
  BarChart3,
  TrendingUp,
  User,
  Target,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Card } from "../../ui/card";
import type { ExecutionReport } from "@/types/weekly-feedback";
import { COLORS, SPACING } from "@/lib/design-system";
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
  LineChart,
  Line,
} from "recharts";

type ExecutionSectionProps = {
  executionReport: ExecutionReport;
  isPro?: boolean;
};

const EXECUTION_COLOR = "#6B7A6F";
const EXECUTION_COLORS = [
  "#6B7A6F",
  "#7C9A7C",
  "#A8BBA8",
  "#5A6B5A",
  "#8B9A8B",
  "#9CAB9C",
  "#ADBCAD",
];

export function ExecutionSection({
  executionReport,
  isPro = false,
}: ExecutionSectionProps) {
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

      {/* Positives Top 3 - 모든 사용자 */}
      {executionReport.positives_top3 && executionReport.positives_top3.length > 0 && (
        <Card
          className={`${SPACING.card.padding} mb-4`}
          style={{
            backgroundColor: "#F0F5F0",
            border: "1px solid #D5E3D5",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4" style={{ color: EXECUTION_COLOR }} />
            <p className="text-xs font-semibold" style={{ color: COLORS.text.secondary }}>
              잘한 점
            </p>
          </div>
          <ul className="space-y-2">
            {executionReport.positives_top3.map((positive, idx) => (
              <li
                key={idx}
                className="text-sm leading-relaxed"
                style={{ color: COLORS.text.primary }}
              >
                • {positive}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Improvements Top 3 - 모든 사용자 */}
      {executionReport.improvements_top3 &&
        executionReport.improvements_top3.length > 0 && (
          <Card
            className={`${SPACING.card.padding} mb-4`}
            style={{
              backgroundColor: COLORS.background.card,
              border: `1px solid ${COLORS.border.light}`,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-4 h-4" style={{ color: "#B89A7A" }} />
              <p className="text-xs font-semibold" style={{ color: COLORS.text.secondary }}>
                개선할 점
              </p>
            </div>
            <ul className="space-y-2">
              {executionReport.improvements_top3.map((improvement, idx) => (
                <li
                  key={idx}
                  className="text-sm leading-relaxed"
                  style={{ color: COLORS.text.primary }}
                >
                  • {improvement}
                </li>
              ))}
            </ul>
          </Card>
        )}

      {/* AI Feedback Summary - 모든 사용자 */}
      {executionReport.ai_feedback_summary && (
        <Card
          className={`${SPACING.card.padding} mb-4`}
          style={{
            backgroundColor: "#F7F8F6",
            border: "1px solid #E6E4DE",
          }}
        >
          <p className={`text-xs ${SPACING.element.marginBottomSmall}`} style={{ color: COLORS.text.secondary }}>
            AI 종합 피드백
          </p>
          <p className="text-sm leading-relaxed" style={{ color: COLORS.text.primary }}>
            {executionReport.ai_feedback_summary}
          </p>
        </Card>
      )}

      {/* Free 모드: Pro 업그레이드 유도 */}
      {!isPro && (
        <Card
          className={SPACING.card.paddingSmall}
          style={{
            backgroundColor: COLORS.background.base,
            border: `1px solid ${COLORS.border.default}`,
          }}
        >
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 mt-0.5" style={{ color: COLORS.brand.primary }} />
            <div className="flex-1">
              <p
                className="text-xs font-semibold mb-1"
                style={{ color: COLORS.text.primary }}
              >
                더 깊은 피드백 분석이 필요하신가요?
              </p>
              <p
                className="text-xs"
                style={{
                  color: COLORS.text.secondary,
                  lineHeight: "1.5",
                }}
              >
                Pro 멤버십에서는 피드백 패턴, 정체성 분석, 개선-행동 정렬을 시각화해
                드립니다. 기록을 성장으로 바꾸는 당신만의 피드백 지도를 함께 만들어보세요.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Pro 모드: 상세 분석 및 시각화 */}
      {isPro && (
        <div className="space-y-4">
          {/* Feedback Patterns - 피드백 패턴 시각화 */}
          {executionReport.feedback_patterns && (
            <>
              {/* Positives Categories Chart */}
              {executionReport.feedback_patterns.visualization
                ?.positives_categories_chart && (
                <Card
                  className={`${SPACING.card.padding} mb-4`}
                  style={{
                    backgroundColor: COLORS.background.card,
                    border: `1px solid ${COLORS.border.light}`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-4 h-4" style={{ color: EXECUTION_COLOR }} />
                    <p
                      className="text-xs font-semibold"
                      style={{ color: COLORS.text.secondary }}
                    >
                      잘한 점 카테고리 분포
                    </p>
                  </div>
                  {executionReport.feedback_patterns.summary && (
                    <p
                      className="text-sm mb-4 leading-relaxed"
                      style={{ color: COLORS.text.primary }}
                    >
                      {executionReport.feedback_patterns.summary}
                    </p>
                  )}
                  <div className="h-64 mt-4">
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
                          label={({ category, value }) => `${category}: ${value}개`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          stroke={COLORS.background.card}
                          strokeWidth={2}
                        >
                          {executionReport.feedback_patterns.visualization.positives_categories_chart.data.map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.color ||
                                  EXECUTION_COLORS[index % EXECUTION_COLORS.length]
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
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {executionReport.feedback_patterns.positives_categories &&
                    executionReport.feedback_patterns.positives_categories.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {executionReport.feedback_patterns.positives_categories.map(
                          (category, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-lg"
                              style={{
                                backgroundColor: "#FAFAF8",
                                border: `1px solid ${COLORS.border.default}`,
                              }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <p
                                  className="text-sm font-semibold"
                                  style={{ color: COLORS.text.primary }}
                                >
                                  {category.category}
                                </p>
                                <span
                                  className="text-xs"
                                  style={{ color: COLORS.text.secondary }}
                                >
                                  {category.count}회
                                </span>
                              </div>
                              {category.insight && (
                                <p
                                  className="text-xs mt-1"
                                  style={{ color: COLORS.text.secondary }}
                                >
                                  {category.insight}
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )}
                </Card>
              )}

              {/* Improvements Categories Chart */}
              {executionReport.feedback_patterns.visualization
                ?.improvements_categories_chart && (
                <Card
                  className={`${SPACING.card.padding} mb-4`}
                  style={{
                    backgroundColor: COLORS.background.card,
                    border: `1px solid ${COLORS.border.light}`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="w-4 h-4" style={{ color: "#B89A7A" }} />
                    <p
                      className="text-xs font-semibold"
                      style={{ color: COLORS.text.secondary }}
                    >
                      개선할 점 카테고리 분포
                    </p>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={
                          executionReport.feedback_patterns.visualization
                            .improvements_categories_chart.data
                        }
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border.default} />
                        <XAxis
                          dataKey="category"
                          style={{ fontSize: "0.75rem", color: COLORS.text.secondary }}
                        />
                        <YAxis
                          style={{ fontSize: "0.75rem", color: COLORS.text.secondary }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: COLORS.background.card,
                            border: `1px solid ${COLORS.border.light}`,
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                          {executionReport.feedback_patterns.visualization.improvements_categories_chart.data.map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.color ||
                                  EXECUTION_COLORS[index % EXECUTION_COLORS.length]
                                }
                              />
                            )
                          )}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {executionReport.feedback_patterns.improvements_categories &&
                    executionReport.feedback_patterns.improvements_categories.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {executionReport.feedback_patterns.improvements_categories.map(
                          (category, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-lg"
                              style={{
                                backgroundColor: "#FAFAF8",
                                border: `1px solid ${COLORS.border.default}`,
                              }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <p
                                  className="text-sm font-semibold"
                                  style={{ color: COLORS.text.primary }}
                                >
                                  {category.category}
                                </p>
                                <span
                                  className="text-xs"
                                  style={{ color: COLORS.text.secondary }}
                                >
                                  {category.count}회
                                </span>
                              </div>
                              {category.insight && (
                                <p
                                  className="text-xs mt-1"
                                  style={{ color: COLORS.text.secondary }}
                                >
                                  {category.insight}
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )}
                </Card>
              )}
            </>
          )}

          {/* Person Traits Analysis - 정체성 분석 */}
          {executionReport.person_traits_analysis && (
            <Card
              className={`${SPACING.card.padding} mb-4`}
              style={{
                backgroundColor: "#F0F5F0",
                border: "1px solid #D5E3D5",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <User className="w-4 h-4" style={{ color: COLORS.brand.secondary }} />
                <p
                  className="text-xs font-semibold"
                  style={{ color: COLORS.text.secondary }}
                >
                  정체성 분석
                </p>
              </div>
              {executionReport.person_traits_analysis.summary && (
                <p
                  className="text-sm mb-4 leading-relaxed"
                  style={{ color: COLORS.text.primary }}
                >
                  {executionReport.person_traits_analysis.summary}
                </p>
              )}
              {executionReport.person_traits_analysis.key_traits &&
                executionReport.person_traits_analysis.key_traits.length > 0 && (
                  <div className="space-y-3">
                    {executionReport.person_traits_analysis.key_traits.map((trait, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: COLORS.background.card,
                          border: `1px solid ${COLORS.border.light}`,
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
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              backgroundColor: EXECUTION_COLOR,
                              color: "white",
                            }}
                          >
                            {trait.frequency}회
                          </span>
                        </div>
                        {trait.insight && (
                          <p
                            className="text-xs mt-1"
                            style={{ color: COLORS.text.secondary }}
                          >
                            {trait.insight}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </Card>
          )}

          {/* Core Feedback Themes - 핵심 피드백 테마 */}
          {executionReport.core_feedback_themes &&
            executionReport.core_feedback_themes.visualization?.themes_timeline && (
              <Card
                className={`${SPACING.card.padding} mb-4`}
                style={{
                  backgroundColor: COLORS.background.card,
                  border: `1px solid ${COLORS.border.light}`,
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4" style={{ color: EXECUTION_COLOR }} />
                  <p
                    className="text-xs font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    핵심 피드백 테마 타임라인
                  </p>
                </div>
                {executionReport.core_feedback_themes.summary && (
                  <p
                    className="text-sm mb-4 leading-relaxed"
                    style={{ color: COLORS.text.primary }}
                  >
                    {executionReport.core_feedback_themes.summary}
                  </p>
                )}
                <div className="space-y-3">
                  {executionReport.core_feedback_themes.visualization.themes_timeline.map(
                    (item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: "#FAFAF8",
                          border: `1px solid ${COLORS.border.default}`,
                        }}
                      >
                        <p
                          className="text-xs font-semibold mb-2"
                          style={{ color: COLORS.text.secondary }}
                        >
                          {item.date}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {item.themes.map((theme, themeIdx) => (
                            <span
                              key={themeIdx}
                              className="text-xs px-2 py-1 rounded"
                              style={{
                                backgroundColor: EXECUTION_COLOR,
                                color: "white",
                              }}
                            >
                              {theme}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
                {executionReport.core_feedback_themes.main_themes &&
                  executionReport.core_feedback_themes.main_themes.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {executionReport.core_feedback_themes.main_themes.map((theme, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg"
                          style={{
                            backgroundColor: "#F0F5F0",
                            border: `1px solid #D5E3D5`,
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p
                              className="text-sm font-semibold"
                              style={{ color: COLORS.text.primary }}
                            >
                              {theme.theme}
                            </p>
                            <span
                              className="text-xs"
                              style={{ color: COLORS.text.secondary }}
                            >
                              {theme.frequency}회
                            </span>
                          </div>
                          {theme.insight && (
                            <p
                              className="text-xs mt-1"
                              style={{ color: COLORS.text.secondary }}
                            >
                              {theme.insight}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
              </Card>
            )}

          {/* Improvement Action Alignment - 개선-행동 정렬 */}
          {executionReport.improvement_action_alignment && (
            <Card
              className={`${SPACING.card.padding} mb-4`}
              style={{
                backgroundColor: COLORS.background.card,
                border: `1px solid ${COLORS.border.light}`,
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4" style={{ color: EXECUTION_COLOR }} />
                <p
                  className="text-xs font-semibold"
                  style={{ color: COLORS.text.secondary }}
                >
                  개선-행동 정렬도
                </p>
              </div>
              {executionReport.improvement_action_alignment.summary && (
                <p
                  className="text-sm mb-4 leading-relaxed"
                  style={{ color: COLORS.text.primary }}
                >
                  {executionReport.improvement_action_alignment.summary}
                </p>
              )}
              {executionReport.improvement_action_alignment.alignment_score && (
                <div
                  className="p-4 rounded-lg mb-4"
                  style={{
                    background: `linear-gradient(135deg, ${EXECUTION_COLOR} 0%, #7C9A7C 100%)`,
                    color: "white",
                  }}
                >
                  <p className="text-xs mb-1" style={{ opacity: 0.9 }}>
                    정렬 점수
                  </p>
                  <p className="text-2xl font-bold mb-1">
                    {executionReport.improvement_action_alignment.alignment_score.value}점
                  </p>
                  <p className="text-xs">
                    {executionReport.improvement_action_alignment.alignment_score.description}
                  </p>
                </div>
              )}
              {executionReport.improvement_action_alignment.strong_connections &&
                executionReport.improvement_action_alignment.strong_connections.length > 0 && (
                  <div className="space-y-2">
                    {executionReport.improvement_action_alignment.strong_connections.map(
                      (connection, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg"
                          style={{
                            backgroundColor: "#FAFAF8",
                            border: `1px solid ${COLORS.border.default}`,
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <ArrowRight className="w-4 h-4 mt-0.5" style={{ color: EXECUTION_COLOR }} />
                            <div className="flex-1">
                              <p
                                className="text-sm font-semibold mb-1"
                                style={{ color: COLORS.text.primary }}
                              >
                                {connection.feedback_theme}
                              </p>
                              <p
                                className="text-xs mb-1"
                                style={{ color: COLORS.text.secondary }}
                              >
                                → {connection.improvement}
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: COLORS.text.secondary }}
                              >
                                {connection.connection}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
            </Card>
          )}

          {/* Growth Insights - 성장 인사이트 */}
          {executionReport.growth_insights && (
            <Card
              className={`${SPACING.card.padding} mb-4`}
              style={{
                backgroundColor: "#F0F5F0",
                border: "1px solid #D5E3D5",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4" style={{ color: COLORS.brand.secondary }} />
                <p
                  className="text-xs font-semibold"
                  style={{ color: COLORS.text.secondary }}
                >
                  성장 인사이트
                </p>
              </div>
              {executionReport.growth_insights.key_learnings &&
                executionReport.growth_insights.key_learnings.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {executionReport.growth_insights.key_learnings.map((learning, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: COLORS.background.card,
                          border: `1px solid ${COLORS.border.light}`,
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
                            className="text-xs mt-1"
                            style={{ color: COLORS.text.secondary }}
                          >
                            {learning.implication}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              {executionReport.growth_insights.next_week_focus &&
                executionReport.growth_insights.next_week_focus.length > 0 && (
                  <div>
                    <p
                      className="text-xs font-semibold mb-2"
                      style={{ color: COLORS.text.secondary }}
                    >
                      다음 주 포커스
                    </p>
                    <ul className="space-y-2">
                      {executionReport.growth_insights.next_week_focus.map((focus, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2"
                          style={{ color: COLORS.text.primary }}
                        >
                          <span className="text-xs mt-0.5">•</span>
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
                      ))}
                    </ul>
                  </div>
                )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

