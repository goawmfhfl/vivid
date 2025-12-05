"use client";

import {
  Heart,
  Lock,
  ArrowRight,
  TrendingUp,
  Zap,
  Sparkles,
  AlertCircle,
  Smile,
} from "lucide-react";
import { Card } from "../../ui/card";
import type { EmotionReport } from "@/types/monthly-feedback-new";
import { COLORS, SPACING } from "@/lib/design-system";
import { useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type EmotionSectionProps = {
  emotionReport: EmotionReport;
  isPro?: boolean;
};

const EMOTION_COLOR = "#B89A7A";

// 감정 사분면 색상 매핑
const QUADRANT_COLORS: Record<
  "몰입·설렘" | "불안·초조" | "슬픔·무기력" | "안도·평온",
  string
> = {
  "몰입·설렘": "#FF6B6B",
  "불안·초조": "#FFA500",
  "슬픔·무기력": "#4ECDC4",
  "안도·평온": "#95E1D3",
};

export function EmotionSection({
  emotionReport,
  isPro = false,
}: EmotionSectionProps) {
  const router = useRouter();

  console.log("[EmotionSection] emotionReport:", emotionReport);

  if (!emotionReport) {
    return null;
  }

  // Pie Chart 데이터 준비
  const pieChartData =
    emotionReport.emotion_quadrant_distribution?.map((item) => ({
      name: item.quadrant,
      value: item.ratio * 100,
      count: item.count,
      explanation: item.explanation,
      color: QUADRANT_COLORS[item.quadrant] || EMOTION_COLOR,
    })) || [];

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

      {/* 감정 사분면 분석 요약 */}
      {emotionReport.emotion_quadrant_analysis_summary && (
        <Card
          className="p-5 sm:p-6 mb-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
            border: "1px solid #E6D5C3",
            borderRadius: "16px",
          }}
        >
          <div className="flex items-start gap-3">
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
                감정 분석 요약
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
              >
                {emotionReport.emotion_quadrant_analysis_summary}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* 주요 감정 영역 및 분포 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* 주요 감정 영역 */}
        {emotionReport.emotion_quadrant_dominant && (
          <Card
            className="p-5 sm:p-6"
            style={{
              background:
                "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
              border: "1px solid #E6D5C3",
              borderRadius: "16px",
            }}
          >
            <div className="flex items-start gap-3">
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
                  className="text-xs mb-2 font-semibold"
                  style={{ color: COLORS.text.secondary }}
                >
                  주요 감정 영역
                </p>
                <p
                  className="text-lg font-semibold"
                  style={{ color: COLORS.text.primary }}
                >
                  {emotionReport.emotion_quadrant_dominant}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* 감정 안정성 점수 */}
        {emotionReport.emotion_stability_score !== undefined && (
          <Card
            className="p-5 sm:p-6"
            style={{
              background:
                "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
              border: "1px solid #E6D5C3",
              borderRadius: "16px",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#F5E6D3" }}
              >
                <Sparkles
                  className="w-4 h-4"
                  style={{ color: EMOTION_COLOR }}
                />
              </div>
              <div className="flex-1">
                <p
                  className="text-xs mb-2 font-semibold"
                  style={{ color: COLORS.text.secondary }}
                >
                  감정 안정성 점수
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: EMOTION_COLOR }}
                >
                  {emotionReport.emotion_stability_score}/10
                </p>
                {emotionReport.emotion_stability_explanation && (
                  <p
                    className="text-xs mt-2 leading-relaxed"
                    style={{ color: COLORS.text.secondary }}
                  >
                    {emotionReport.emotion_stability_explanation}
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* 감정 패턴 요약 */}
      {emotionReport.emotion_pattern_summary && (
        <Card
          className="p-5 sm:p-6 mb-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
            border: "1px solid #E6D5C3",
            borderRadius: "16px",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#F5E6D3" }}
            >
              <Zap className="w-4 h-4" style={{ color: EMOTION_COLOR }} />
            </div>
            <div className="flex-1">
              <p
                className="text-xs mb-2 font-semibold"
                style={{ color: COLORS.text.secondary }}
              >
                감정 패턴 요약
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
              >
                {emotionReport.emotion_pattern_summary}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* 감정 사분면 분포 차트 */}
      {pieChartData.length > 0 && (
        <Card
          className="p-5 sm:p-6 mb-4"
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
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `${value.toFixed(1)}% (${props.payload.count}회)`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: COLORS.background.card,
                  border: `1px solid ${COLORS.border.light}`,
                  borderRadius: "12px",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          {/* 사분면별 설명 */}
          <div className="mt-4 space-y-2">
            {emotionReport.emotion_quadrant_distribution.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: "#F5E6D3",
                  border: "1px solid #E6D5C3",
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <p
                    className="text-xs font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    {item.quadrant}
                  </p>
                  <span
                    className="text-xs font-medium"
                    style={{ color: EMOTION_COLOR }}
                  >
                    {(item.ratio * 100).toFixed(1)}% ({item.count}회)
                  </span>
                </div>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: COLORS.text.secondary }}
                >
                  {item.explanation}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 감정 트리거 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* 긍정 트리거 */}
        {emotionReport.positive_triggers &&
          emotionReport.positive_triggers.length > 0 && (
            <Card
              className="p-5 sm:p-6"
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
                  <Smile className="w-4 h-4" style={{ color: EMOTION_COLOR }} />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    긍정 감정 트리거
                  </p>
                  <ul className="space-y-2">
                    {emotionReport.positive_triggers
                      .slice(0, isPro ? 10 : 5)
                      .map((trigger, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm"
                          style={{ color: COLORS.text.primary }}
                        >
                          <span
                            className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: "#8B6F47" }}
                          />
                          <span style={{ lineHeight: "1.6" }}>{trigger}</span>
                        </li>
                      ))}
                  </ul>
                  {!isPro && emotionReport.positive_triggers.length > 5 && (
                    <div className="mt-3 flex items-center gap-2 text-xs opacity-75">
                      <Lock className="w-3 h-3" />
                      <span>
                        {emotionReport.positive_triggers.length - 5}개 더 보기
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

        {/* 부정 트리거 */}
        {emotionReport.negative_triggers &&
          emotionReport.negative_triggers.length > 0 && (
            <Card
              className="p-5 sm:p-6"
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
                  <AlertCircle
                    className="w-4 h-4"
                    style={{ color: EMOTION_COLOR }}
                  />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    부정 감정 트리거
                  </p>
                  <ul className="space-y-2">
                    {emotionReport.negative_triggers
                      .slice(0, isPro ? 10 : 5)
                      .map((trigger, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm"
                          style={{ color: COLORS.text.primary }}
                        >
                          <span
                            className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: "#8B6F47" }}
                          />
                          <span style={{ lineHeight: "1.6" }}>{trigger}</span>
                        </li>
                      ))}
                  </ul>
                  {!isPro && emotionReport.negative_triggers.length > 5 && (
                    <div className="mt-3 flex items-center gap-2 text-xs opacity-75">
                      <Lock className="w-3 h-3" />
                      <span>
                        {emotionReport.negative_triggers.length - 5}개 더 보기
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
      </div>

      {/* 감정 안정성 상세 정보 */}
      {isPro && (
        <div className="space-y-4 mb-4">
          {/* 감정 안정성 점수 이유 */}
          {emotionReport.emotion_stability_score_reason && (
            <Card
              className="p-5 sm:p-6"
              style={{
                background:
                  "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #E6D5C3",
                borderRadius: "16px",
              }}
            >
              <div className="flex items-start gap-3">
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
                    className="text-xs mb-2 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    감정 안정성 점수 분석
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
                  >
                    {emotionReport.emotion_stability_score_reason}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* 칭찬 메시지 */}
          {emotionReport.emotion_stability_praise && (
            <Card
              className="p-5 sm:p-6"
              style={{
                background:
                  "linear-gradient(135deg, rgba(184, 154, 122, 0.15) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "2px solid #E6D5C3",
                borderRadius: "16px",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#F5E6D3" }}
                >
                  <Sparkles
                    className="w-4 h-4"
                    style={{ color: EMOTION_COLOR }}
                  />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-2 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    잘하고 있어요!
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
                  >
                    {emotionReport.emotion_stability_praise}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* 가이드라인 */}
          {emotionReport.emotion_stability_guidelines &&
            emotionReport.emotion_stability_guidelines.length > 0 && (
              <Card
                className="p-5 sm:p-6"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                  border: "1px solid #E6D5C3",
                  borderRadius: "16px",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#F5E6D3" }}
                  >
                    <Zap className="w-4 h-4" style={{ color: EMOTION_COLOR }} />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-xs mb-3 font-semibold"
                      style={{ color: COLORS.text.secondary }}
                    >
                      감정 안정성 향상 가이드라인
                    </p>
                    <ul className="space-y-2">
                      {emotionReport.emotion_stability_guidelines.map(
                        (guideline, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm"
                            style={{ color: COLORS.text.primary }}
                          >
                            <span
                              className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: "#8B6F47" }}
                            />
                            <span style={{ lineHeight: "1.6" }}>
                              {guideline}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </Card>
            )}

          {/* 행동 제안 */}
          {emotionReport.emotion_stability_actions &&
            emotionReport.emotion_stability_actions.length > 0 && (
              <Card
                className="p-5 sm:p-6"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                  border: "1px solid #E6D5C3",
                  borderRadius: "16px",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#F5E6D3" }}
                  >
                    <Heart
                      className="w-4 h-4"
                      style={{ color: EMOTION_COLOR }}
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-xs mb-3 font-semibold"
                      style={{ color: COLORS.text.secondary }}
                    >
                      실천 가능한 행동 제안
                    </p>
                    <ul className="space-y-2">
                      {emotionReport.emotion_stability_actions.map(
                        (action, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm"
                            style={{ color: COLORS.text.primary }}
                          >
                            <span
                              className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: "#8B6F47" }}
                            />
                            <span style={{ lineHeight: "1.6" }}>{action}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </Card>
            )}
        </div>
      )}

      {/* AI 코멘트 */}
      {emotionReport.emotion_ai_comment && (
        <Card
          className="p-5 sm:p-6 mb-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
            border: "1px solid #E6D5C3",
            borderRadius: "16px",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#F5E6D3" }}
            >
              <Sparkles className="w-4 h-4" style={{ color: EMOTION_COLOR }} />
            </div>
            <div className="flex-1">
              <p
                className="text-xs mb-2 font-semibold"
                style={{ color: COLORS.text.secondary }}
              >
                AI 코멘트
              </p>
              <p
                className="text-sm leading-relaxed italic"
                style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
              >
                {emotionReport.emotion_ai_comment}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Pro 업그레이드 유도 (Free 모드) */}
      {!isPro && (
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
                Pro 멤버십에서는 감정 안정성 점수 분석, 가이드라인, 행동 제안을
                포함한 상세한 감정 분석을 제공합니다. 기록을 성장으로 바꾸는
                당신만의 감정 지도를 함께 만들어보세요.
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
