import {
  CheckCircle2,
  Sparkles,
  Lock,
  ArrowRight,
  TrendingUp,
  Star,
  Target,
  BarChart3,
  Zap,
} from "lucide-react";
import { Card } from "../../ui/card";
import type { ClosingReport } from "@/types/weekly-feedback";
import { COLORS } from "@/lib/design-system";
import { useRouter } from "next/navigation";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type ClosingSectionProps = {
  closingReport: ClosingReport;
  isPro?: boolean;
};

export function ClosingSection({
  closingReport,
  isPro = false,
}: ClosingSectionProps) {
  const router = useRouter();

  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#6B7A6F" }}
        >
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: COLORS.text.primary }}
        >
          이번 주의 마무리
        </h2>
      </div>

      {/* Weekly One-Liner - Main Conclusion */}
      {closingReport.call_to_action?.weekly_one_liner && (
        <Card
          className="p-6 sm:p-8 mb-4"
          style={{
            background: "linear-gradient(135deg, #6B7A6F 0%, #5A6A5F 100%)",
            color: "white",
            border: "none",
            borderRadius: "16px",
          }}
        >
          <p className="text-base sm:text-lg leading-relaxed text-center">
            &ldquo;{closingReport.call_to_action.weekly_one_liner}&rdquo;
          </p>
        </Card>
      )}

      {/* Next Week Objective and Actions - Combined */}
      {(closingReport.call_to_action?.next_week_objective ||
        (Array.isArray(closingReport.call_to_action?.actions) &&
          closingReport.call_to_action.actions.length > 0)) && (
        <Card
          className="p-5 sm:p-6 mb-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
            border: "1px solid #D5E3D5",
            borderRadius: "16px",
          }}
        >
          {closingReport.call_to_action?.next_week_objective && (
            <div className="mb-4">
              <p
                className="text-xs mb-2.5 sm:mb-3 font-semibold"
                style={{ color: COLORS.text.secondary }}
              >
                다음 주 방향
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: COLORS.text.primary }}
              >
                {closingReport.call_to_action.next_week_objective}
              </p>
            </div>
          )}
          {Array.isArray(closingReport.call_to_action?.actions) &&
            closingReport.call_to_action.actions.length > 0 && (
              <div>
                <p
                  className="text-xs mb-2.5 sm:mb-3 font-semibold"
                  style={{ color: COLORS.text.secondary }}
                >
                  다음 주 실행 계획
                </p>
                <ul className="space-y-2.5">
                  {closingReport.call_to_action.actions.map((action, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <div
                        className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          borderColor: "#6B7A6F",
                          backgroundColor: "white",
                        }}
                      >
                        <CheckCircle2
                          className="w-3 h-3"
                          style={{ color: "#6B7A6F" }}
                        />
                      </div>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: COLORS.text.primary }}
                      >
                        {action}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </Card>
      )}

      {/* Free 모드: Pro 업그레이드 유도 */}
      {!isPro && (
        <Card
          className="p-5 sm:p-6 cursor-pointer transition-all hover:scale-[1.02] relative overflow-hidden group"
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
              <Lock className="w-5 h-5" style={{ color: "#A8BBA8" }} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p
                  className="text-xs font-semibold"
                  style={{ color: COLORS.text.primary }}
                >
                  이번 주의 나를 더 깊이 이해하고 싶으신가요?
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
                Pro 멤버십에서는 이번 주의 정체성 변화, 성장 스토리, 강점과 개선
                영역을 시각화해 드립니다. 기록을 성장으로 바꾸는 당신만의 정체성
                지도를 함께 만들어보세요.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span style={{ color: COLORS.brand.primary }}>
                  Pro 멤버십으로 업그레이드
                </span>
                <ArrowRight className="w-4 h-4" style={{ color: "#A8BBA8" }} />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Pro 모드: 상세 분석 표시 */}
      {isPro && closingReport.this_week_identity && (
        <div className="space-y-6">
          {/* Characteristics Radar Chart */}
          {closingReport.this_week_identity?.visualization
            ?.characteristics_radar && (
            <Card
              className="p-5 sm:p-6 relative overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #D5E3D5",
                borderRadius: "16px",
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background:
                      "linear-gradient(135deg, #6B7A6F 0%, #5A6A5F 100%)",
                  }}
                >
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    정체성 특성 레이더
                  </p>
                  <div style={{ marginLeft: "-8px", marginRight: "-8px" }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart
                        data={
                          closingReport.this_week_identity.visualization
                            .characteristics_radar.data
                        }
                      >
                        <PolarGrid stroke="#E0E0E0" />
                        <PolarAngleAxis
                          dataKey="characteristic"
                          tick={{
                            fontSize: 11,
                            fill: COLORS.text.primary,
                            fontWeight: 500,
                          }}
                        />
                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, 10]}
                          tickCount={6}
                          allowDataOverflow={false}
                          tick={{
                            fontSize: 10,
                            fill: COLORS.text.secondary,
                            fontWeight: 500,
                          }}
                          tickFormatter={(value) => {
                            // 정수 값만 표시 (0, 2, 2, 4, 6, 8)
                            const intValue = Math.round(value);
                            if (intValue === 0 || intValue === 10)
                              return intValue.toString();
                            if (
                              intValue % 2 === 0 &&
                              intValue > 0 &&
                              intValue < 10
                            )
                              return intValue.toString();
                            return "";
                          }}
                        />
                        <Radar
                          name="특성"
                          dataKey="value"
                          stroke="#6B7A6F"
                          fill="#6B7A6F"
                          fillOpacity={0.6}
                          strokeWidth={2}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: `1px solid ${COLORS.border.default}`,
                            borderRadius: "8px",
                            padding: "8px 12px",
                          }}
                          labelStyle={{
                            color: COLORS.text.primary,
                            fontWeight: 600,
                            marginBottom: "4px",
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Core Characteristics */}
          {closingReport.this_week_identity.core_characteristics &&
            closingReport.this_week_identity.core_characteristics.length >
              0 && (
              <Card
                className="p-5 sm:p-6 relative overflow-hidden group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                  border: "1px solid #D5E3D5",
                  borderRadius: "16px",
                }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background:
                        "linear-gradient(135deg, #6B7A6F 0%, #5A6A5F 100%)",
                    }}
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-xs mb-3 font-semibold"
                      style={{ color: COLORS.text.secondary }}
                    >
                      핵심 특성
                    </p>
                    <div className="space-y-3">
                      {closingReport.this_week_identity.core_characteristics.map(
                        (char, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg"
                            style={{
                              backgroundColor: "#FAFAF8",
                              border: "1px solid #EFE9E3",
                            }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className="text-sm font-semibold"
                                style={{ color: COLORS.text.primary }}
                              >
                                {char.characteristic}
                              </span>
                              <span
                                className="px-2 py-0.5 rounded text-xs"
                                style={{
                                  backgroundColor: "#E8EFE8",
                                  color: "#6B7A6F",
                                }}
                              >
                                {char.frequency}회
                              </span>
                            </div>
                            <p
                              className="text-xs mb-2"
                              style={{ color: COLORS.text.secondary }}
                            >
                              {char.description}
                            </p>
                            {Array.isArray(char.evidence) &&
                              char.evidence.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {char.evidence.map((evidence, eIdx) => (
                                    <span
                                      key={eIdx}
                                      className="px-2 py-0.5 rounded text-xs"
                                      style={{
                                        backgroundColor: "#F0F5F0",
                                        color: "#6B7A6F",
                                      }}
                                    >
                                      {evidence}
                                    </span>
                                  ))}
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

          {/* Growth Story */}
          {closingReport.this_week_identity.growth_story && (
            <Card
              className="p-5 sm:p-6 relative overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #D5E3D5",
                borderRadius: "16px",
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background:
                      "linear-gradient(135deg, #6B7A6F 0%, #5A6A5F 100%)",
                  }}
                >
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    성장 스토리
                  </p>
                  {closingReport.this_week_identity.growth_story.summary && (
                    <p
                      className="text-sm leading-relaxed mb-3"
                      style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
                    >
                      {closingReport.this_week_identity.growth_story.summary}
                    </p>
                  )}
                  {closingReport.this_week_identity.growth_story.narrative && (
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
                    >
                      {closingReport.this_week_identity.growth_story.narrative}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Growth Journey Timeline */}
          {closingReport.this_week_identity.visualization?.growth_journey && (
            <Card
              className="p-5 sm:p-6 relative overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #D5E3D5",
                borderRadius: "16px",
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background:
                      "linear-gradient(135deg, #6B7A6F 0%, #5A6A5F 100%)",
                  }}
                >
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    성장 여정 타임라인
                  </p>
                  <div className="space-y-4">
                    {closingReport.this_week_identity.visualization.growth_journey.data.map(
                      (phase, idx) => (
                        <div key={idx} className="relative pl-6">
                          {/* 타임라인 라인 */}
                          {idx <
                            closingReport.this_week_identity.visualization!
                              .growth_journey.data.length -
                              1 && (
                            <div
                              className="absolute left-2 top-6 bottom-0 w-0.5"
                              style={{ backgroundColor: "#D5E3D5" }}
                            />
                          )}
                          {/* 타임라인 포인트 */}
                          <div
                            className="absolute left-0 top-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: "#6B7A6F",
                              border: "2px solid white",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            }}
                          />
                          <div
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
                              {phase.phase}
                            </p>
                            <p
                              className="text-xs mb-2"
                              style={{ color: COLORS.text.secondary }}
                            >
                              {phase.description}
                            </p>
                            <p
                              className="text-xs"
                              style={{
                                color: COLORS.text.tertiary,
                                fontStyle: "italic",
                              }}
                            >
                              {phase.response}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Strengths Highlighted */}
          {closingReport.this_week_identity.strengths_highlighted && (
            <Card
              className="p-5 sm:p-6 relative overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #D5E3D5",
                borderRadius: "16px",
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background:
                      "linear-gradient(135deg, #6B7A6F 0%, #5A6A5F 100%)",
                  }}
                >
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    강점 하이라이트
                  </p>
                  {closingReport.this_week_identity.strengths_highlighted
                    .summary && (
                    <p
                      className="text-sm leading-relaxed mb-4"
                      style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
                    >
                      {
                        closingReport.this_week_identity.strengths_highlighted
                          .summary
                      }
                    </p>
                  )}
                  {closingReport.this_week_identity.strengths_highlighted
                    .top_strengths &&
                    closingReport.this_week_identity.strengths_highlighted
                      .top_strengths.length > 0 && (
                      <div className="space-y-3">
                        {closingReport.this_week_identity.strengths_highlighted.top_strengths.map(
                          (strength, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-lg"
                              style={{
                                backgroundColor: "#FAFAF8",
                                border: "1px solid #EFE9E3",
                              }}
                            >
                              <p
                                className="text-sm font-semibold mb-2"
                                style={{ color: COLORS.text.primary }}
                              >
                                {strength.strength}
                              </p>
                              <p
                                className="text-xs mb-2"
                                style={{ color: COLORS.text.secondary }}
                              >
                                {strength.description}
                              </p>
                              <p
                                className="text-xs"
                                style={{
                                  color: COLORS.text.tertiary,
                                  fontStyle: "italic",
                                }}
                              >
                                {strength.impact}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    )}
                </div>
              </div>
            </Card>
          )}

          {/* Areas of Awareness */}
          {closingReport.this_week_identity.areas_of_awareness && (
            <Card
              className="p-5 sm:p-6 relative overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #D5E3D5",
                borderRadius: "16px",
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background:
                      "linear-gradient(135deg, #6B7A6F 0%, #5A6A5F 100%)",
                  }}
                >
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    인식 영역
                  </p>
                  {closingReport.this_week_identity.areas_of_awareness
                    .summary && (
                    <p
                      className="text-sm leading-relaxed mb-4"
                      style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
                    >
                      {
                        closingReport.this_week_identity.areas_of_awareness
                          .summary
                      }
                    </p>
                  )}
                  {closingReport.this_week_identity.areas_of_awareness
                    .key_areas &&
                    closingReport.this_week_identity.areas_of_awareness
                      .key_areas.length > 0 && (
                      <div className="space-y-3">
                        {closingReport.this_week_identity.areas_of_awareness.key_areas.map(
                          (area, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-lg"
                              style={{
                                backgroundColor: "#FAFAF8",
                                border: "1px solid #EFE9E3",
                              }}
                            >
                              <p
                                className="text-sm font-semibold mb-2"
                                style={{ color: COLORS.text.primary }}
                              >
                                {area.area}
                              </p>
                              <p
                                className="text-xs mb-2"
                                style={{ color: COLORS.text.secondary }}
                              >
                                {area.description}
                              </p>
                              <div className="flex items-start gap-2 mt-2">
                                <span
                                  className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                                  style={{
                                    backgroundColor: "#6B7A6F",
                                  }}
                                />
                                <p
                                  className="text-xs"
                                  style={{ color: COLORS.text.secondary }}
                                >
                                  {area.action_taken}
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                </div>
              </div>
            </Card>
          )}

          {/* Identity Evolution */}
          {closingReport.this_week_identity.identity_evolution && (
            <Card
              className="p-5 sm:p-6 relative overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #D5E3D5",
                borderRadius: "16px",
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background:
                      "linear-gradient(135deg, #6B7A6F 0%, #5A6A5F 100%)",
                  }}
                >
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    정체성 진화
                  </p>
                  {closingReport.this_week_identity.identity_evolution
                    .summary && (
                    <p
                      className="text-sm leading-relaxed mb-3"
                      style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
                    >
                      {
                        closingReport.this_week_identity.identity_evolution
                          .summary
                      }
                    </p>
                  )}
                  {closingReport.this_week_identity.identity_evolution
                    .evolution && (
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
                    >
                      {
                        closingReport.this_week_identity.identity_evolution
                          .evolution
                      }
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Next Week Identity Intention */}
          {closingReport.next_week_identity_intention && (
            <Card
              className="p-5 sm:p-6 relative overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #D5E3D5",
                borderRadius: "16px",
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background:
                      "linear-gradient(135deg, #6B7A6F 0%, #5A6A5F 100%)",
                  }}
                >
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    다음 주 정체성 의도
                  </p>
                  {closingReport.next_week_identity_intention.summary && (
                    <p
                      className="text-sm leading-relaxed mb-3"
                      style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
                    >
                      {closingReport.next_week_identity_intention.summary}
                    </p>
                  )}
                  {closingReport.next_week_identity_intention.intention && (
                    <p
                      className="text-sm leading-relaxed mb-4"
                      style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
                    >
                      {closingReport.next_week_identity_intention.intention}
                    </p>
                  )}
                  {closingReport.next_week_identity_intention.focus_areas &&
                    closingReport.next_week_identity_intention.focus_areas
                      .length > 0 && (
                      <div className="space-y-3">
                        {closingReport.next_week_identity_intention.focus_areas.map(
                          (area, idx) => (
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
                              {area.identity_shift && (
                                <div className="flex items-start gap-2 mt-2">
                                  <span
                                    className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                                    style={{
                                      backgroundColor: "#6B7A6F",
                                    }}
                                  />
                                  <p
                                    className="text-xs"
                                    style={{ color: COLORS.text.secondary }}
                                  >
                                    {area.identity_shift}
                                  </p>
                                </div>
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
        </div>
      )}
    </div>
  );
}
