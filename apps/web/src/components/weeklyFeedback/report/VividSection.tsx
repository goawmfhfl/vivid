import {
  Target,
  Lightbulb,
  TrendingUp,
  BarChart3,
  Users,
  Sparkles,
  Zap,
  Eye,
  ArrowUp,
  ArrowDown,
  Calendar,
} from "lucide-react";
import type { VividReport } from "@/types/weekly-feedback";
import { COLORS } from "@/lib/design-system";
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
  ContentCard,
  GradientCard,
} from "@/components/common/feedback";

type VividSectionProps = {
  vividReport: VividReport;
  isPro?: boolean;
  userName?: string;
};

export function VividSection({
  vividReport,
  isPro: _isPro = false,
  userName,
}: VividSectionProps) {
  // 색상 팔레트
  const vividColor = "#A3BFD9"; // 파스텔 블루

  return (
    <div className="mb-16">
      <SectionHeader
        icon={Target}
        iconGradient="#A3BFD9"
        title="이번 주의 비비드"
        description="7일간의 비비드 기록을 종합한 주간 분석"
      />

      <div className="space-y-5">
        {/* 1. 주간 비비드 요약 */}
        {vividReport.weekly_vivid_summary && (
          <div className="space-y-5">
            <ContentCard
              icon={Sparkles}
              iconColor={vividColor}
              label="주간 비비드 요약"
              content={vividReport.weekly_vivid_summary.summary}
              gradientColor="163, 191, 217"
            />
            {vividReport.weekly_vivid_summary.key_points &&
              vividReport.weekly_vivid_summary.key_points.length > 0 && (
                <GradientCard gradientColor="163, 191, 217">
                  <p
                    className="text-xs font-semibold mb-3 uppercase"
                    style={{ color: COLORS.text.secondary }}
                  >
                    핵심 포인트
                  </p>
                  <div className="space-y-3">
                    {vividReport.weekly_vivid_summary.key_points.map(
                      (point, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.6)",
                            border: "1px solid rgba(163, 191, 217, 0.2)",
                          }}
                        >
                          <p
                            className="text-sm mb-1"
                            style={{ color: COLORS.text.primary }}
                          >
                            {point.point}
                          </p>
                          {point.dates && point.dates.length > 0 && (
                            <p
                              className="text-xs mt-1"
                              style={{ color: COLORS.text.secondary }}
                            >
                              {point.dates.join(", ")}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </GradientCard>
              )}
            {vividReport.weekly_vivid_summary.next_week_vision_key_points &&
              vividReport.weekly_vivid_summary.next_week_vision_key_points
                .length > 0 && (
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
                      className="text-xs font-semibold uppercase"
                      style={{ color: COLORS.text.secondary }}
                    >
                      다음주 비전 핵심 포인트
                    </p>
                  </div>
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.6)",
                      border: `1px solid rgba(163, 191, 217, 0.3)`,
                    }}
                  >
                    <ul className="space-y-2.5">
                      {vividReport.weekly_vivid_summary.next_week_vision_key_points.map(
                        (point, index) => (
                          <li key={index} className="flex items-start gap-2.5">
                            <div
                              className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                              style={{ backgroundColor: vividColor }}
                            />
                            <p
                              className="text-sm"
                              style={{
                                color: COLORS.text.primary,
                                lineHeight: "1.6",
                              }}
                            >
                              {point}
                            </p>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </GradientCard>
              )}
          </div>
        )}

        {/* 2. 주간 비비드 평가 */}
        {vividReport.weekly_vivid_evaluation && (
          <GradientCard gradientColor="163, 191, 217">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: `${vividColor}20`,
                  border: `1.5px solid ${vividColor}40`,
                }}
              >
                <TrendingUp className="w-4 h-4" style={{ color: vividColor }} />
              </div>
              <p
                className="text-xs font-semibold uppercase"
                style={{ color: COLORS.text.secondary }}
              >
                주간 비비드 평가
              </p>
            </div>
            <div className="mb-4">
              <p
                className="text-sm mb-2"
                style={{ color: COLORS.text.primary }}
              >
                주간 평균 점수:{" "}
                <span className="font-semibold">
                  {vividReport.weekly_vivid_evaluation.weekly_average_score.toFixed(
                    1
                  )}
                </span>
              </p>
                  {vividReport.weekly_vivid_evaluation.daily_evaluation_trend &&
                    vividReport.weekly_vivid_evaluation.daily_evaluation_trend
                      .length > 0 && (
                      <div style={{ height: "200px", marginTop: "1rem" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={vividReport.weekly_vivid_evaluation.daily_evaluation_trend.map(
                              (item) => ({
                                date: item.date.split("-").slice(1).join("/"),
                                score: item.evaluation_score,
                              })
                            )}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                            <XAxis
                              dataKey="date"
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
                    )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {vividReport.weekly_vivid_evaluation.highest_day && (
                <div
                  className="p-4 rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor: COLORS.background.cardElevated,
                    border: `1px solid ${COLORS.border.light}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#4CAF50";
                    e.currentTarget.style.backgroundColor = COLORS.background.hoverLight;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = COLORS.border.light;
                    e.currentTarget.style.backgroundColor = COLORS.background.cardElevated;
                  }}
                >
                  <div className="flex items-start gap-3">
                    <ArrowUp
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      style={{ color: "#4CAF50" }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p
                          className="text-xs font-medium uppercase tracking-wide"
                          style={{ color: COLORS.text.secondary }}
                        >
                          가장 높았던 날
                        </p>
                        <span
                          className="text-base font-bold"
                          style={{ color: "#4CAF50" }}
                        >
                          {vividReport.weekly_vivid_evaluation.highest_day.score}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Calendar
                          className="w-3 h-3"
                          style={{ color: COLORS.text.tertiary }}
                        />
                        <p
                          className="text-sm font-medium"
                          style={{ color: COLORS.text.primary }}
                        >
                          {vividReport.weekly_vivid_evaluation.highest_day.date}
                        </p>
                      </div>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: COLORS.text.secondary }}
                      >
                        {vividReport.weekly_vivid_evaluation.highest_day.reason}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {vividReport.weekly_vivid_evaluation.lowest_day && (
                <div
                  className="p-4 rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor: COLORS.background.cardElevated,
                    border: `1px solid ${COLORS.border.light}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#FF9800";
                    e.currentTarget.style.backgroundColor = COLORS.background.hoverLight;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = COLORS.border.light;
                    e.currentTarget.style.backgroundColor = COLORS.background.cardElevated;
                  }}
                >
                  <div className="flex items-start gap-3">
                    <ArrowDown
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      style={{ color: "#FF9800" }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p
                          className="text-xs font-medium uppercase tracking-wide"
                          style={{ color: COLORS.text.secondary }}
                        >
                          가장 낮았던 날
                        </p>
                        <span
                          className="text-base font-bold"
                          style={{ color: "#FF9800" }}
                        >
                          {vividReport.weekly_vivid_evaluation.lowest_day.score}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Calendar
                          className="w-3 h-3"
                          style={{ color: COLORS.text.tertiary }}
                        />
                        <p
                          className="text-sm font-medium"
                          style={{ color: COLORS.text.primary }}
                        >
                          {vividReport.weekly_vivid_evaluation.lowest_day.date}
                        </p>
                      </div>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: COLORS.text.secondary }}
                      >
                        {vividReport.weekly_vivid_evaluation.lowest_day.reason}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </GradientCard>
        )}

        {/* 3. 주간 키워드 분석 */}
        {vividReport.weekly_keywords_analysis && (
          <div className="space-y-5">
            {vividReport.weekly_keywords_analysis.vision_keywords_trend &&
              vividReport.weekly_keywords_analysis.vision_keywords_trend
                .length > 0 && (
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
                      className="text-xs font-semibold uppercase"
                      style={{ color: COLORS.text.secondary }}
                    >
                      비전 키워드 트렌드
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[...vividReport.weekly_keywords_analysis.vision_keywords_trend]
                      .sort((a, b) => b.days - a.days)
                      .map(
                      (keyword, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.6)",
                            border: "1px solid rgba(163, 191, 217, 0.2)",
                          }}
                        >
                              <div className="flex items-center justify-between mb-2">
                                <span
                                  className="text-sm font-semibold"
                                  style={{ color: COLORS.text.primary }}
                                >
                                  {keyword.keyword}
                                </span>
                                <span
                                  className="px-2 py-0.5 rounded text-xs"
                                  style={{
                                    backgroundColor: "#E8F0F8",
                                    color: "#5A7A9A",
                                  }}
                                >
                                  {keyword.days}일
                                </span>
                              </div>
                              {keyword.context && (
                                <p
                                  className="text-xs mb-2"
                                  style={{ color: COLORS.text.secondary }}
                                >
                                  {keyword.context}
                                </p>
                              )}
                              {keyword.related_keywords &&
                                keyword.related_keywords.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {keyword.related_keywords.map(
                                      (related, rIdx) => (
                                        <span
                                          key={rIdx}
                                          className="px-2 py-0.5 rounded text-xs"
                                          style={{
                                            backgroundColor: "#E8F0F8",
                                            color: "#5A7A9A",
                                          }}
                                        >
                                          {related}
                                        </span>
                                      )
                                    )}
                                  </div>
                                )}
                        </div>
                      )
                    )}
                  </div>
                </GradientCard>
              )}
          </div>
        )}

        {/* 4. 앞으로의 모습 종합 분석 */}
        {vividReport.future_vision_analysis && (
          <div className="space-y-5">
            <ContentCard
              icon={Eye}
              iconColor={vividColor}
              label="앞으로의 모습 종합 분석"
              content={vividReport.future_vision_analysis.integrated_summary}
              gradientColor="163, 191, 217"
            />
            {vividReport.future_vision_analysis.consistency_analysis && (
              <GradientCard gradientColor="163, 191, 217">
                <p
                  className="text-xs mb-3 font-semibold uppercase"
                  style={{ color: COLORS.text.secondary }}
                >
                  일관성 분석
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {vividReport.future_vision_analysis.consistency_analysis
                    .consistent_themes &&
                    vividReport.future_vision_analysis.consistency_analysis
                      .consistent_themes.length > 0 && (
                      <div
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: "rgba(200, 230, 201, 0.3)",
                          border: "1px solid rgba(200, 230, 201, 0.5)",
                        }}
                      >
                            <p
                              className="text-xs font-semibold mb-2"
                              style={{ color: COLORS.text.secondary }}
                            >
                              일관성 있는 비전
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {vividReport.future_vision_analysis.consistency_analysis.consistent_themes.map(
                                (theme, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded text-xs"
                                    style={{
                                      backgroundColor: "#C8E6C9",
                                      color: "#2E7D32",
                                    }}
                                  >
                                    {theme}
                                  </span>
                                )
                              )}
                            </div>
                      </div>
                    )}
                  {vividReport.future_vision_analysis.consistency_analysis
                    .changing_themes &&
                    vividReport.future_vision_analysis.consistency_analysis
                      .changing_themes.length > 0 && (
                      <div
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: "rgba(255, 224, 178, 0.3)",
                          border: "1px solid rgba(255, 224, 178, 0.5)",
                        }}
                      >
                            <p
                              className="text-xs font-semibold mb-2"
                              style={{ color: COLORS.text.secondary }}
                            >
                              변화하는 비전
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {vividReport.future_vision_analysis.consistency_analysis.changing_themes.map(
                                (theme, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded text-xs"
                                    style={{
                                      backgroundColor: "#FFE0B2",
                                      color: "#E65100",
                                    }}
                                  >
                                    {theme}
                                  </span>
                                )
                              )}
                            </div>
                      </div>
                    )}
                </div>
                <p
                  className="text-xs mt-3"
                  style={{ color: COLORS.text.secondary }}
                >
                  {vividReport.future_vision_analysis.consistency_analysis.analysis}
                </p>
              </GradientCard>
            )}
          </div>
        )}

        {/* 5. 일치도 트렌드 분석 */}
        {vividReport.alignment_trend_analysis && (
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
                className="text-xs font-semibold uppercase"
                style={{ color: COLORS.text.secondary }}
              >
                일치도 트렌드 분석
              </p>
            </div>
            <div className="mb-4">
              <p
                className="text-sm mb-2"
                style={{ color: COLORS.text.primary }}
              >
                평균 일치도 점수:{" "}
                <span className="font-semibold">
                  {vividReport.alignment_trend_analysis.average_alignment_score.toFixed(
                    1
                  )}
                </span>
              </p>
              <p
                className="text-xs mb-3"
                style={{ color: COLORS.text.secondary }}
              >
                추세:{" "}
                {vividReport.alignment_trend_analysis.trend === "improving"
                  ? "개선 중"
                  : vividReport.alignment_trend_analysis.trend === "declining"
                  ? "악화 중"
                  : "안정"}
              </p>
              {vividReport.alignment_trend_analysis.daily_alignment_scores &&
                vividReport.alignment_trend_analysis.daily_alignment_scores
                  .length > 0 && (
                  <div style={{ height: "200px", marginTop: "1rem" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={vividReport.alignment_trend_analysis.daily_alignment_scores.map(
                          (item) => ({
                            date: item.date.split("-").slice(1).join("/"),
                            score: item.score,
                          })
                        )}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                        <XAxis
                          dataKey="date"
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
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {vividReport.alignment_trend_analysis.highest_alignment_day && (
                <div
                  className="p-4 rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor: COLORS.background.cardElevated,
                    border: `1px solid ${COLORS.border.light}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#4CAF50";
                    e.currentTarget.style.backgroundColor = COLORS.background.hoverLight;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = COLORS.border.light;
                    e.currentTarget.style.backgroundColor = COLORS.background.cardElevated;
                  }}
                >
                  <div className="flex items-start gap-3">
                    <ArrowUp
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      style={{ color: "#4CAF50" }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p
                          className="text-xs font-medium uppercase tracking-wide"
                          style={{ color: COLORS.text.secondary }}
                        >
                          가장 높았던 날
                        </p>
                        <span
                          className="text-base font-bold"
                          style={{ color: "#4CAF50" }}
                        >
                          {vividReport.alignment_trend_analysis.highest_alignment_day.score}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Calendar
                          className="w-3 h-3"
                          style={{ color: COLORS.text.tertiary }}
                        />
                        <p
                          className="text-sm font-medium"
                          style={{ color: COLORS.text.primary }}
                        >
                          {vividReport.alignment_trend_analysis.highest_alignment_day.date}
                        </p>
                      </div>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: COLORS.text.secondary }}
                      >
                        {vividReport.alignment_trend_analysis.highest_alignment_day.pattern}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {vividReport.alignment_trend_analysis.lowest_alignment_day && (
                <div
                  className="p-4 rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor: COLORS.background.cardElevated,
                    border: `1px solid ${COLORS.border.light}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#FF9800";
                    e.currentTarget.style.backgroundColor = COLORS.background.hoverLight;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = COLORS.border.light;
                    e.currentTarget.style.backgroundColor = COLORS.background.cardElevated;
                  }}
                >
                  <div className="flex items-start gap-3">
                    <ArrowDown
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      style={{ color: "#FF9800" }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p
                          className="text-xs font-medium uppercase tracking-wide"
                          style={{ color: COLORS.text.secondary }}
                        >
                          가장 낮았던 날
                        </p>
                        <span
                          className="text-base font-bold"
                          style={{ color: "#FF9800" }}
                        >
                          {vividReport.alignment_trend_analysis.lowest_alignment_day.score}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Calendar
                          className="w-3 h-3"
                          style={{ color: COLORS.text.tertiary }}
                        />
                        <p
                          className="text-sm font-medium"
                          style={{ color: COLORS.text.primary }}
                        >
                          {vividReport.alignment_trend_analysis.lowest_alignment_day.date}
                        </p>
                      </div>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: COLORS.text.secondary }}
                      >
                        {vividReport.alignment_trend_analysis.lowest_alignment_day.pattern}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </GradientCard>
        )}

        {/* 6. 사용자 특징 심화 분석 */}
        {vividReport.user_characteristics_analysis && (
          <div className="space-y-5">
            <ContentCard
              icon={Users}
              iconColor={vividColor}
              label="사용자 특징 심화 분석"
              content={
                userName
                  ? `${userName}${vividReport.user_characteristics_analysis.consistency_summary}`
                  : vividReport.user_characteristics_analysis.consistency_summary
              }
              gradientColor="163, 191, 217"
            />
            {vividReport.user_characteristics_analysis.top_5_characteristics &&
              vividReport.user_characteristics_analysis.top_5_characteristics
                .length > 0 && (
                <GradientCard gradientColor="163, 191, 217">
                  <p
                    className="text-xs mb-3 font-semibold uppercase"
                    style={{ color: COLORS.text.secondary }}
                  >
                    {userName ? `${userName}의 ` : ""}Top 5 특징
                  </p>
                  <div className="space-y-3">
                    {vividReport.user_characteristics_analysis.top_5_characteristics.map(
                      (char, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.6)",
                            border: "1px solid rgba(163, 191, 217, 0.2)",
                          }}
                        >
                              <div className="flex items-center justify-between mb-1">
                                <span
                                  className="text-sm font-semibold"
                                  style={{ color: COLORS.text.primary }}
                                >
                                  {char.characteristic}
                                </span>
                                <span
                                  className="px-2 py-0.5 rounded text-xs"
                                  style={{
                                    backgroundColor: "#E8F0F8",
                                    color: "#5A7A9A",
                                  }}
                                >
                                  {char.frequency}회
                                </span>
                              </div>
                              {char.dates && char.dates.length > 0 && (
                                <p
                                  className="text-xs mt-1"
                                  style={{ color: COLORS.text.secondary }}
                                >
                                  {char.dates.join(", ")}
                                </p>
                              )}
                        </div>
                      )
                    )}
                  </div>
                </GradientCard>
              )}
            {vividReport.user_characteristics_analysis.change_patterns && (
              <GradientCard gradientColor="163, 191, 217">
                <p
                  className="text-xs mb-3 font-semibold uppercase"
                  style={{ color: COLORS.text.secondary }}
                >
                  변화 패턴
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {vividReport.user_characteristics_analysis.change_patterns
                    .new_characteristics &&
                    vividReport.user_characteristics_analysis.change_patterns
                      .new_characteristics.length > 0 && (
                      <div
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: "rgba(200, 230, 201, 0.3)",
                          border: "1px solid rgba(200, 230, 201, 0.5)",
                        }}
                      >
                            <p
                              className="text-xs font-semibold mb-2"
                              style={{ color: COLORS.text.secondary }}
                            >
                              새로 나타난 특징
                            </p>
                            <div className="space-y-1">
                              {vividReport.user_characteristics_analysis.change_patterns.new_characteristics.map(
                                (char, idx) => (
                                  <div key={idx} className="text-xs">
                                    <span
                                      style={{ color: COLORS.text.primary }}
                                    >
                                      {char.characteristic}
                                    </span>
                                    <span
                                      className="ml-2"
                                      style={{ color: COLORS.text.secondary }}
                                    >
                                      ({char.first_appeared})
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                      </div>
                    )}
                  {vividReport.user_characteristics_analysis.change_patterns
                    .disappeared_characteristics &&
                    vividReport.user_characteristics_analysis.change_patterns
                      .disappeared_characteristics.length > 0 && (
                      <div
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: "rgba(255, 224, 178, 0.3)",
                          border: "1px solid rgba(255, 224, 178, 0.5)",
                        }}
                      >
                            <p
                              className="text-xs font-semibold mb-2"
                              style={{ color: COLORS.text.secondary }}
                            >
                              사라진 특징
                            </p>
                            <div className="space-y-1">
                              {vividReport.user_characteristics_analysis.change_patterns.disappeared_characteristics.map(
                                (char, idx) => (
                                  <div key={idx} className="text-xs">
                                    <span
                                      style={{ color: COLORS.text.primary }}
                                    >
                                      {char.characteristic}
                                    </span>
                                    <span
                                      className="ml-2"
                                      style={{ color: COLORS.text.secondary }}
                                    >
                                      ({char.last_appeared})
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                      </div>
                    )}
                </div>
              </GradientCard>
            )}
          </div>
        )}

        {/* 7. 지향하는 모습 심화 분석 */}
        {vividReport.aspired_traits_analysis && (
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
                  <Lightbulb className="w-4 h-4" style={{ color: vividColor }} />
                </div>
                <p
                  className="text-xs font-semibold uppercase"
                  style={{ color: COLORS.text.secondary }}
                >
                  지향하는 모습 심화 분석
                </p>
              </div>
              <p
                className="text-sm leading-relaxed mb-2"
                style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
              >
                {vividReport.aspired_traits_analysis.consistency_summary}
              </p>
              <p
                className="text-sm mb-4"
                style={{ color: COLORS.text.primary }}
              >
                평균 점수:{" "}
                <span className="font-semibold">
                  {vividReport.aspired_traits_analysis.average_score.toFixed(1)}
                </span>
              </p>
            </GradientCard>
            {vividReport.aspired_traits_analysis.top_5_aspired_traits &&
              vividReport.aspired_traits_analysis.top_5_aspired_traits.length >
                0 && (
                <GradientCard gradientColor="163, 191, 217">
                  <p
                    className="text-xs mb-3 font-semibold uppercase"
                    style={{ color: COLORS.text.secondary }}
                  >
                    Top 5 지향 모습
                  </p>
                  <div className="space-y-3">
                    {vividReport.aspired_traits_analysis.top_5_aspired_traits.map(
                      (trait, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.6)",
                            border: "1px solid rgba(163, 191, 217, 0.2)",
                          }}
                        >
                              <div className="flex items-center justify-between mb-1">
                                <span
                                  className="text-sm font-semibold"
                                  style={{ color: COLORS.text.primary }}
                                >
                                  {trait.trait}
                                </span>
                                <span
                                  className="px-2 py-0.5 rounded text-xs"
                                  style={{
                                    backgroundColor: "#E8F0F8",
                                    color: "#5A7A9A",
                                  }}
                                >
                                  {trait.frequency}회
                                </span>
                              </div>
                              {trait.dates && trait.dates.length > 0 && (
                                <p
                                  className="text-xs mt-1"
                                  style={{ color: COLORS.text.secondary }}
                                >
                                  {trait.dates.join(", ")}
                                </p>
                              )}
                        </div>
                      )
                    )}
                  </div>
                </GradientCard>
              )}
            {vividReport.aspired_traits_analysis.evolution_process && (
              <GradientCard gradientColor="163, 191, 217">
                <p
                  className="text-xs mb-3 font-semibold uppercase"
                  style={{ color: COLORS.text.secondary }}
                >
                  진화 과정
                </p>
                <p
                  className="text-xs mb-3"
                  style={{ color: COLORS.text.secondary }}
                >
                  {vividReport.aspired_traits_analysis.evolution_process.summary}
                </p>
                {vividReport.aspired_traits_analysis.evolution_process.stages &&
                  vividReport.aspired_traits_analysis.evolution_process.stages
                    .length > 0 && (
                    <div className="space-y-3">
                      {vividReport.aspired_traits_analysis.evolution_process.stages.map(
                        (stage, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg"
                            style={{
                              backgroundColor: "rgba(255, 255, 255, 0.6)",
                              border: "1px solid rgba(163, 191, 217, 0.2)",
                            }}
                          >
                                <p
                                  className="text-xs font-semibold mb-1"
                                  style={{ color: COLORS.text.secondary }}
                                >
                                  {stage.period}
                                </p>
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                  {stage.traits.map((trait, tIdx) => (
                                    <span
                                      key={tIdx}
                                      className="px-2 py-0.5 rounded text-xs"
                                      style={{
                                        backgroundColor: "#E8F0F8",
                                        color: "#5A7A9A",
                                      }}
                                    >
                                      {trait}
                                    </span>
                                  ))}
                                </div>
                                <p
                                  className="text-xs"
                                  style={{ color: COLORS.text.primary }}
                                >
                                  {stage.description}
                                </p>
                          </div>
                        )
                      )}
                    </div>
                  )}
              </GradientCard>
            )}
          </div>
        )}

        {/* 8. 주간 인사이트 */}
        {vividReport.weekly_insights && (
          <div className="space-y-5">
            {vividReport.weekly_insights.patterns &&
              vividReport.weekly_insights.patterns.length > 0 && (
                <GradientCard gradientColor="163, 191, 217">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: `${vividColor}20`,
                        border: `1.5px solid ${vividColor}40`,
                      }}
                    >
                      <Lightbulb className="w-4 h-4" style={{ color: vividColor }} />
                    </div>
                    <p
                      className="text-xs font-semibold uppercase"
                      style={{ color: COLORS.text.secondary }}
                    >
                      발견한 패턴
                    </p>
                  </div>
                  <div className="space-y-3">
                    {vividReport.weekly_insights.patterns.map(
                      (pattern, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.6)",
                            border: "1px solid rgba(163, 191, 217, 0.2)",
                          }}
                        >
                              <p
                                className="text-sm font-semibold mb-1"
                                style={{ color: COLORS.text.primary }}
                              >
                                {pattern.pattern}
                              </p>
                              <p
                                className="text-xs mb-2"
                                style={{ color: COLORS.text.secondary }}
                              >
                                {pattern.description}
                              </p>
                              {pattern.evidence && pattern.evidence.length > 0 && (
                                <div className="mt-2">
                                  <p
                                    className="text-xs mb-1"
                                    style={{ color: COLORS.text.secondary }}
                                  >
                                    근거:
                                  </p>
                                  <ul className="list-disc list-inside space-y-1">
                                    {pattern.evidence.map((ev, eIdx) => {
                                      // 날짜 형식 (YYYY-MM-DD) 감지 및 변환
                                      const datePattern = /(\d{4}-\d{2}-\d{2})/g;
                                      const formattedEvidence = ev.replace(
                                        datePattern,
                                        (match) => `${match}일의 기록`
                                      );
                                      return (
                                        <li
                                          key={eIdx}
                                          className="text-xs"
                                          style={{ color: COLORS.text.secondary }}
                                        >
                                          {formattedEvidence}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              )}
                        </div>
                      )
                    )}
                  </div>
                </GradientCard>
              )}
            {vividReport.weekly_insights.unexpected_connections &&
              vividReport.weekly_insights.unexpected_connections.length > 0 && (
                <GradientCard gradientColor="255, 235, 59">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: "rgba(255, 235, 59, 0.2)",
                        border: "1.5px solid rgba(255, 235, 59, 0.4)",
                      }}
                    >
                      <Lightbulb className="w-4 h-4" style={{ color: "#F9A825" }} />
                    </div>
                    <p
                      className="text-xs font-semibold uppercase"
                      style={{ color: COLORS.text.secondary }}
                    >
                      예상치 못한 연결점
                    </p>
                  </div>
                  <div className="space-y-3">
                    {vividReport.weekly_insights.unexpected_connections.map(
                      (connection, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg"
                          style={{
                            backgroundColor: "rgba(255, 249, 196, 0.5)",
                            border: "1px solid rgba(255, 245, 157, 0.5)",
                          }}
                        >
                              <p
                                className="text-sm font-semibold mb-1"
                                style={{ color: COLORS.text.primary }}
                              >
                                {connection.connection}
                              </p>
                              <p
                                className="text-xs mb-2"
                                style={{ color: COLORS.text.secondary }}
                              >
                                {connection.description}
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: COLORS.text.secondary }}
                              >
                                <span className="font-semibold">의미:</span>{" "}
                                {connection.significance}
                              </p>
                        </div>
                      )
                    )}
                  </div>
                </GradientCard>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
