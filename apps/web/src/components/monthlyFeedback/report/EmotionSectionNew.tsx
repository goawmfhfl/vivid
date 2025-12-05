"use client";

import {
  Heart,
  Lock,
  ArrowRight,
  TrendingUp,
  Zap,
  Sparkles,
} from "lucide-react";
import { Card } from "../../ui/card";
import type { EmotionReport } from "@/types/monthly-feedback-new";
import { COLORS } from "@/lib/design-system";
import { useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

type EmotionSectionNewProps = {
  emotionReport: EmotionReport;
  isPro?: boolean;
};

const EMOTION_COLOR = "#B89A7A";
const EMOTION_COLOR_DARK = "#A78A6A";

export function EmotionSectionNew({
  emotionReport,
  isPro = false,
}: EmotionSectionNewProps) {
  const router = useRouter();

  if (!emotionReport) {
    return null;
  }

  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: EMOTION_COLOR }}
        >
          <Heart className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: COLORS.text.primary }}
        >
          이번 달의 감정
        </h2>
      </div>

      {/* Summary - 모든 사용자 */}
      {emotionReport.summary && (
        <Card
          className="p-5 sm:p-6 mb-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
            border: "1px solid #E6D5C3",
            borderRadius: "16px",
          }}
        >
          <div className="flex items-start gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#F5E6D3" }}
            >
              <Heart className="w-4 h-4" style={{ color: EMOTION_COLOR }} />
            </div>
            <div className="flex-1">
              <p
                className="text-xs mb-2 font-semibold"
                style={{ color: COLORS.text.secondary }}
              >
                감정 요약
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
              >
                {emotionReport.summary}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Monthly Emotion Overview - 모든 사용자 */}
      {emotionReport.monthly_emotion_overview && (
        <Card
          className="p-5 sm:p-6 mb-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
            border: "1px solid #E6D5C3",
            borderRadius: "16px",
          }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#F5E6D3" }}
            >
              <TrendingUp
                className="w-4 h-4"
                style={{ color: EMOTION_COLOR }}
              />
            </div>
            <div className="flex-1">
              <p
                className="text-xs mb-3 font-semibold"
                style={{ color: COLORS.text.secondary }}
              >
                월간 감정 개요
              </p>

              {/* Dominant Quadrant */}
              {emotionReport.monthly_emotion_overview.dominant_quadrant && (
                <div className="mb-4 p-3 rounded-lg bg-gray-50">
                  <p
                    className="text-xs mb-1 font-medium"
                    style={{ color: COLORS.text.secondary }}
                  >
                    주요 감정 영역
                  </p>
                  <p
                    className="text-base font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    {emotionReport.monthly_emotion_overview.dominant_quadrant}
                  </p>
                </div>
              )}

              {/* Quadrant Distribution */}
              {emotionReport.monthly_emotion_overview.quadrant_distribution && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {Object.entries(
                    emotionReport.monthly_emotion_overview.quadrant_distribution
                  ).map(([quadrant, value]) => (
                    <div
                      key={quadrant}
                      className="p-3 rounded-lg"
                      style={{
                        backgroundColor: "#F5E6D3",
                        border: "1px solid #E6D5C3",
                      }}
                    >
                      <p
                        className="text-xs font-semibold mb-1"
                        style={{ color: COLORS.text.primary }}
                      >
                        {quadrant}
                      </p>
                      <p
                        className="text-lg font-bold"
                        style={{ color: EMOTION_COLOR }}
                      >
                        {(value * 100).toFixed(0)}%
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Emotion Stability Score */}
              {emotionReport.monthly_emotion_overview
                .emotion_stability_score !== undefined && (
                <div className="p-3 rounded-lg bg-gray-50">
                  <p
                    className="text-xs mb-1 font-medium"
                    style={{ color: COLORS.text.secondary }}
                  >
                    감정 안정성 점수
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: EMOTION_COLOR }}
                  >
                    {emotionReport.monthly_emotion_overview.emotion_stability_score.toFixed(
                      1
                    )}
                    /10
                  </p>
                </div>
              )}

              {/* Most Frequent Emotions */}
              {emotionReport.monthly_emotion_overview.most_frequent_emotions &&
                emotionReport.monthly_emotion_overview.most_frequent_emotions
                  .length > 0 && (
                  <div className="mt-4">
                    <p
                      className="text-xs mb-2 font-medium"
                      style={{ color: COLORS.text.secondary }}
                    >
                      가장 자주 느낀 감정
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {emotionReport.monthly_emotion_overview.most_frequent_emotions
                        .slice(0, isPro ? 10 : 5)
                        .map((emotion, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-1.5 rounded-lg"
                            style={{
                              backgroundColor: "#F5E6D3",
                              border: "1px solid #E6D5C3",
                            }}
                          >
                            <span
                              className="text-xs font-medium"
                              style={{ color: COLORS.text.primary }}
                            >
                              {emotion.emotion}
                            </span>
                            <span
                              className="text-xs ml-1.5"
                              style={{ color: COLORS.text.secondary }}
                            >
                              ({emotion.frequency}회)
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </Card>
      )}

      {/* Pro 전용 섹션들 */}
      {isPro ? (
        <div className="space-y-4">
          {/* Weekly Emotion Evolution */}
          {emotionReport.weekly_emotion_evolution &&
            emotionReport.weekly_emotion_evolution.length > 0 && (
              <Card
                className="p-5 sm:p-6 relative overflow-hidden group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                  border: "1px solid #E6D5C3",
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
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-xs mb-3 font-semibold"
                      style={{ color: COLORS.text.secondary }}
                    >
                      주간 감정 진화
                    </p>
                    <div className="space-y-3">
                      {emotionReport.weekly_emotion_evolution.map(
                        (evolution, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg"
                            style={{
                              backgroundColor: "#F5E6D3",
                              border: "1px solid #E6D5C3",
                            }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <p
                                className="text-sm font-medium"
                                style={{ color: COLORS.text.primary }}
                              >
                                {evolution.week}주차
                              </p>
                              <span
                                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                style={{
                                  backgroundColor: "#E6D5C3",
                                  color: "#8B6F47",
                                }}
                              >
                                {evolution.dominant_quadrant}
                              </span>
                            </div>
                            <p
                              className="text-xs mb-1"
                              style={{ color: COLORS.text.secondary }}
                            >
                              안정성: {evolution.stability_score.toFixed(1)}/10
                            </p>
                            {evolution.key_emotions &&
                              evolution.key_emotions.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {evolution.key_emotions.map(
                                    (emotion, eIdx) => (
                                      <span
                                        key={eIdx}
                                        className="px-2 py-0.5 rounded text-xs"
                                        style={{
                                          backgroundColor: "#E6D5C3",
                                          color: "#8B6F47",
                                        }}
                                      >
                                        {emotion}
                                      </span>
                                    )
                                  )}
                                </div>
                              )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}

          {/* Emotion Pattern Changes */}
          {emotionReport.emotion_pattern_changes && (
            <Card
              className="p-5 sm:p-6 relative overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #E6D5C3",
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
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    감정 패턴 변화
                  </p>

                  {/* Trends */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-gray-50">
                      <p
                        className="text-xs mb-1"
                        style={{ color: COLORS.text.secondary }}
                      >
                        쾌-불쾌
                      </p>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: COLORS.text.primary }}
                      >
                        {emotionReport.emotion_pattern_changes.valence_trend}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-50">
                      <p
                        className="text-xs mb-1"
                        style={{ color: COLORS.text.secondary }}
                      >
                        각성
                      </p>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: COLORS.text.primary }}
                      >
                        {emotionReport.emotion_pattern_changes.arousal_trend}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-50">
                      <p
                        className="text-xs mb-1"
                        style={{ color: COLORS.text.secondary }}
                      >
                        안정성
                      </p>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: COLORS.text.primary }}
                      >
                        {emotionReport.emotion_pattern_changes.stability_trend}
                      </p>
                    </div>
                  </div>

                  {/* Key Insights */}
                  {emotionReport.emotion_pattern_changes.key_insights &&
                    emotionReport.emotion_pattern_changes.key_insights.length >
                      0 && (
                      <div className="space-y-2">
                        {emotionReport.emotion_pattern_changes.key_insights.map(
                          (insight, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 text-xs"
                              style={{ color: COLORS.text.primary }}
                            >
                              <span
                                className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: "#8B6F47" }}
                              />
                              <span style={{ lineHeight: "1.6" }}>
                                {insight}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    )}

                  {/* Pattern Summary */}
                  {emotionReport.emotion_pattern_changes.pattern_summary && (
                    <p
                      className="text-sm leading-relaxed mt-4 pt-4 border-t border-gray-200"
                      style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
                    >
                      {emotionReport.emotion_pattern_changes.pattern_summary}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Visualization Charts */}
          {emotionReport.visualization && (
            <div className="space-y-4">
              {/* Emotion Quadrant Pie Chart */}
              {emotionReport.visualization.emotion_quadrant_pie && (
                <Card
                  className="p-5 sm:p-6"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                    border: "1px solid #E6D5C3",
                    borderRadius: "16px",
                  }}
                >
                  <p
                    className="text-xs mb-4 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    감정 사분면 분포
                  </p>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={
                          emotionReport.visualization.emotion_quadrant_pie.data
                        }
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ quadrant, value }) =>
                          `${quadrant}: ${(value * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {emotionReport.visualization.emotion_quadrant_pie.data.map(
                          (entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          )
                        )}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Trigger Impact Bar Chart */}
              {emotionReport.visualization.trigger_impact_bar && (
                <Card
                  className="p-5 sm:p-6"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                    border: "1px solid #E6D5C3",
                    borderRadius: "16px",
                  }}
                >
                  <p
                    className="text-xs mb-4 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    트리거 영향도
                  </p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={emotionReport.visualization.trigger_impact_bar.data}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E6D5C3" />
                      <XAxis
                        dataKey="trigger"
                        style={{
                          fontSize: "0.75rem",
                          color: COLORS.text.secondary,
                        }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
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
                        dataKey="impact"
                        fill={EMOTION_COLOR}
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
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
              "linear-gradient(135deg, rgba(184, 154, 122, 0.08) 0%, rgba(255, 255, 255, 1) 100%)",
            border: "1px solid #E6D5C3",
            borderRadius: "16px",
          }}
          onClick={() => router.push("/subscription")}
        >
          <div
            className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(circle, rgba(184, 154, 122, 0.8) 0%, transparent 70%)",
            }}
          />

          <div className="flex items-start gap-4 relative z-10">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
              style={{
                background:
                  "linear-gradient(135deg, rgba(184, 154, 122, 0.3) 0%, rgba(184, 154, 122, 0.15) 100%)",
                border: "1px solid rgba(184, 154, 122, 0.3)",
              }}
            >
              <Lock className="w-5 h-5" style={{ color: EMOTION_COLOR }} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p
                  className="text-xs font-semibold"
                  style={{ color: COLORS.text.primary }}
                >
                  감정 패턴을 더 깊이 이해하고 싶으신가요?
                </p>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    backgroundColor: "rgba(184, 154, 122, 0.2)",
                    color: EMOTION_COLOR,
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
                Pro 멤버십에서는 이번 달의 감정 패턴, 주간 진화, 트리거 분석을
                시각화해 드립니다. 기록을 성장으로 바꾸는 당신만의 감정 지도를
                함께 만들어보세요.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span style={{ color: EMOTION_COLOR }}>
                  Pro 멤버십으로 업그레이드
                </span>
                <ArrowRight
                  className="w-4 h-4"
                  style={{ color: EMOTION_COLOR }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
