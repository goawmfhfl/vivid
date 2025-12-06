import {
  Target,
  Lock,
  ArrowRight,
  Lightbulb,
  Sparkles,
  Zap,
} from "lucide-react";
import { Card } from "../../ui/card";
import type { VisionReport } from "@/types/weekly-feedback";
import { COLORS } from "@/lib/design-system";
import { useRouter } from "next/navigation";

type VisionSectionProps = {
  visionReport: VisionReport;
  isPro?: boolean;
};

export function VisionSection({
  visionReport,
  isPro = false,
}: VisionSectionProps) {
  const router = useRouter();

  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#A3BFD9" }}
        >
          <Target className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: COLORS.text.primary }}
        >
          이번 주의 비전
        </h2>
      </div>

      {/* Vision Summary - 모든 사용자 */}
      {visionReport.vision_summary && (
        <Card
          className="p-5 sm:p-6 mb-4"
          style={{
            backgroundColor: "white",
            border: "1px solid #E6E4DE",
            borderRadius: "16px",
          }}
        >
          <div className="flex items-start gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#E8F0F8" }}
            >
              <Target className="w-4 h-4" style={{ color: "#A3BFD9" }} />
            </div>
            <div className="flex-1">
              <p
                className="text-xs mb-2 font-semibold"
                style={{ color: COLORS.text.secondary }}
              >
                비전 요약
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
              >
                {visionReport.vision_summary}
              </p>
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
              "linear-gradient(135deg, rgba(163, 191, 217, 0.08) 0%, rgba(255, 255, 255, 1) 100%)",
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
                "radial-gradient(circle, rgba(163, 191, 217, 0.8) 0%, transparent 70%)",
            }}
          />

          <div className="flex items-start gap-4 relative z-10">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
              style={{
                background:
                  "linear-gradient(135deg, rgba(163, 191, 217, 0.3) 0%, rgba(163, 191, 217, 0.15) 100%)",
                border: "1px solid rgba(163, 191, 217, 0.3)",
              }}
            >
              <Lock className="w-5 h-5" style={{ color: "#A3BFD9" }} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p
                  className="text-xs font-semibold"
                  style={{ color: COLORS.text.primary }}
                >
                  더 깊은 비전 분석이 필요하신가요?
                </p>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    backgroundColor: "rgba(163, 191, 217, 0.2)",
                    color: "#5A7A9A",
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
                Pro 멤버십에서는 이번 주의 목표 패턴, 정체성 정렬을 시각화해
                드립니다. 기록을 성장으로 바꾸는 당신만의 비전 지도를 함께
                만들어보세요.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span style={{ color: COLORS.brand.primary }}>
                  Pro 멤버십으로 업그레이드
                </span>
                <ArrowRight className="w-4 h-4" style={{ color: "#A3BFD9" }} />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Pro 모드: 상세 분석 표시 */}
      {isPro && (
        <div className="space-y-6">
          {/* Vision Keywords Trend */}
          {visionReport.vision_keywords_trend &&
            visionReport.vision_keywords_trend.length > 0 && (
              <Card
                className="p-5 sm:p-6 relative overflow-hidden group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(163, 191, 217, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                  border: "1px solid #C5D5E5",
                  borderRadius: "16px",
                }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background:
                        "linear-gradient(135deg, #A3BFD9 0%, #8FA8C7 100%)",
                    }}
                  >
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-xs mb-3 font-semibold"
                      style={{ color: COLORS.text.secondary }}
                    >
                      비전 키워드 트렌드
                    </p>
                    <div className="space-y-3">
                      {visionReport.vision_keywords_trend.map(
                        (keyword, idx) => (
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
                  </div>
                </div>
              </Card>
            )}

          {/* Goals Pattern */}
          {visionReport.goals_pattern && (
            <Card
              className="p-5 sm:p-6 relative overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, rgba(163, 191, 217, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #C5D5E5",
                borderRadius: "16px",
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background:
                      "linear-gradient(135deg, #A3BFD9 0%, #8FA8C7 100%)",
                  }}
                >
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    목표 패턴
                  </p>
                  {visionReport.goals_pattern.summary && (
                    <p
                      className="text-sm leading-relaxed mb-4"
                      style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
                    >
                      {visionReport.goals_pattern.summary}
                    </p>
                  )}
                  {visionReport.goals_pattern.goal_categories &&
                    visionReport.goals_pattern.goal_categories.length > 0 && (
                      <div className="space-y-3">
                        {visionReport.goals_pattern.goal_categories.map(
                          (category, idx) => (
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
                                  {category.category}
                                </span>
                                <span
                                  className="px-2 py-0.5 rounded text-xs"
                                  style={{
                                    backgroundColor: "#D5E5F0",
                                    color: "#5A7A9A",
                                  }}
                                >
                                  {category.count}개
                                </span>
                              </div>
                              {Array.isArray(category.examples) &&
                                category.examples.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mb-2">
                                    {category.examples.map((example, eIdx) => (
                                      <span
                                        key={eIdx}
                                        className="px-2 py-0.5 rounded text-xs"
                                        style={{
                                          backgroundColor: "white",
                                          color: "#5A7A9A",
                                          border: "1px solid #C5D5E5",
                                        }}
                                      >
                                        {example}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              {category.insight && (
                                <p
                                  className="text-xs mt-2"
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
                </div>
              </div>
            </Card>
          )}

          {/* Self Vision Alignment */}
          {visionReport.self_vision_alignment && (
            <Card
              className="p-5 sm:p-6 relative overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, rgba(163, 191, 217, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #C5D5E5",
                borderRadius: "16px",
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background:
                      "linear-gradient(135deg, #A3BFD9 0%, #8FA8C7 100%)",
                  }}
                >
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    자기 비전 정렬
                  </p>
                  {visionReport.self_vision_alignment.summary && (
                    <p
                      className="text-sm leading-relaxed mb-4"
                      style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
                    >
                      {visionReport.self_vision_alignment.summary}
                    </p>
                  )}
                  {visionReport.self_vision_alignment.key_traits &&
                    visionReport.self_vision_alignment.key_traits.length >
                      0 && (
                      <div className="space-y-3">
                        {visionReport.self_vision_alignment.key_traits.map(
                          (trait, idx) => (
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
                              {trait.evidence && (
                                <p
                                  className="text-xs"
                                  style={{ color: COLORS.text.secondary }}
                                >
                                  {trait.evidence}
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

          {/* Dreamer Traits Evolution */}
          {visionReport.dreamer_traits_evolution && (
            <Card
              className="p-5 sm:p-6 relative overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, rgba(163, 191, 217, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #C5D5E5",
                borderRadius: "16px",
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background:
                      "linear-gradient(135deg, #A3BFD9 0%, #8FA8C7 100%)",
                  }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    꿈꾸는 자 특성 진화
                  </p>
                  {visionReport.dreamer_traits_evolution.summary && (
                    <p
                      className="text-sm leading-relaxed mb-4"
                      style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
                    >
                      {visionReport.dreamer_traits_evolution.summary}
                    </p>
                  )}
                  {visionReport.dreamer_traits_evolution.common_traits &&
                    visionReport.dreamer_traits_evolution.common_traits.length >
                      0 && (
                      <div className="space-y-2">
                        {visionReport.dreamer_traits_evolution.common_traits.map(
                          (trait, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 p-2 rounded-lg"
                              style={{
                                backgroundColor: "#FAFAF8",
                                border: "1px solid #EFE9E3",
                              }}
                            >
                              <span
                                className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                                style={{
                                  backgroundColor: "#A3BFD9",
                                }}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span
                                    className="text-sm font-medium"
                                    style={{ color: COLORS.text.primary }}
                                  >
                                    {trait.trait}
                                  </span>
                                  <span
                                    className="text-xs"
                                    style={{ color: COLORS.text.secondary }}
                                  >
                                    ({trait.frequency}회)
                                  </span>
                                </div>
                                {trait.insight && (
                                  <p
                                    className="text-xs"
                                    style={{ color: COLORS.text.secondary }}
                                  >
                                    {trait.insight}
                                  </p>
                                )}
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

          {/* AI Feedback Patterns */}
          {visionReport.ai_feedback_patterns && (
            <Card
              className="p-5 sm:p-6 relative overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, rgba(163, 191, 217, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #C5D5E5",
                borderRadius: "16px",
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background:
                      "linear-gradient(135deg, #A3BFD9 0%, #8FA8C7 100%)",
                  }}
                >
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    AI 피드백 패턴
                  </p>
                  {visionReport.ai_feedback_patterns.summary && (
                    <p
                      className="text-sm leading-relaxed mb-4"
                      style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
                    >
                      {visionReport.ai_feedback_patterns.summary}
                    </p>
                  )}
                  {visionReport.ai_feedback_patterns.common_themes &&
                    visionReport.ai_feedback_patterns.common_themes.length >
                      0 && (
                      <div className="space-y-3">
                        {visionReport.ai_feedback_patterns.common_themes.map(
                          (theme, idx) => (
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
                                  {theme.theme}
                                </span>
                                <span
                                  className="px-2 py-0.5 rounded text-xs"
                                  style={{
                                    backgroundColor: "#E8F0F8",
                                    color: "#5A7A9A",
                                  }}
                                >
                                  {theme.frequency}회
                                </span>
                              </div>
                              {theme.example && (
                                <p
                                  className="text-xs mb-2"
                                  style={{ color: COLORS.text.secondary }}
                                >
                                  예시: {theme.example}
                                </p>
                              )}
                              {theme.insight && (
                                <p
                                  className="text-xs"
                                  style={{ color: COLORS.text.secondary }}
                                >
                                  {theme.insight}
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

          {/* Vision Action Alignment */}
          {visionReport.vision_action_alignment && (
            <Card
              className="p-5 sm:p-6 relative overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, rgba(163, 191, 217, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #C5D5E5",
                borderRadius: "16px",
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background:
                      "linear-gradient(135deg, #A3BFD9 0%, #8FA8C7 100%)",
                  }}
                >
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    비전-행동 정렬
                  </p>
                  {visionReport.vision_action_alignment.summary && (
                    <p
                      className="text-sm leading-relaxed mb-4"
                      style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
                    >
                      {visionReport.vision_action_alignment.summary}
                    </p>
                  )}
                  {visionReport.vision_action_alignment.alignment_score && (
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
                            style={{ color: "#5A7A9A" }}
                          >
                            {(() => {
                              const score =
                                visionReport.vision_action_alignment
                                  .alignment_score.value;
                              // 비전-행동 정렬 점수는 0-100 사이의 값
                              const percentage = Math.round(score);
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
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    visionReport.vision_action_alignment
                                      .alignment_score.value
                                  )
                                )}%`,
                                background: `linear-gradient(90deg, #A3BFD9 0%, #8FA8C7 100%)`,
                                boxShadow: `0 2px 4px rgba(163, 191, 217, 0.4)`,
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
                          visionReport.vision_action_alignment.alignment_score
                            .description
                        }
                      </p>
                    </div>
                  )}
                  {visionReport.vision_action_alignment.strengths &&
                    visionReport.vision_action_alignment.strengths.length >
                      0 && (
                      <div className="mb-3">
                        <p
                          className="text-xs font-medium mb-2"
                          style={{ color: COLORS.text.secondary }}
                        >
                          강점
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {visionReport.vision_action_alignment.strengths.map(
                            (strength, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1.5 rounded-lg text-xs"
                                style={{
                                  backgroundColor: "#E8F0F8",
                                  color: "#5A7A9A",
                                  border: "1px solid #C5D5E5",
                                }}
                              >
                                {strength}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  {visionReport.vision_action_alignment.gaps &&
                    visionReport.vision_action_alignment.gaps.length > 0 && (
                      <div>
                        <p
                          className="text-xs font-medium mb-2"
                          style={{ color: COLORS.text.secondary }}
                        >
                          개선 영역
                        </p>
                        <ul className="space-y-1.5 ml-4">
                          {visionReport.vision_action_alignment.gaps.map(
                            (gap, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-xs"
                                style={{ color: COLORS.text.secondary }}
                              >
                                <span
                                  className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                                  style={{
                                    backgroundColor: "#A3BFD9",
                                  }}
                                />
                                <span style={{ lineHeight: "1.6" }}>{gap}</span>
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

          {/* Next Week Vision Focus */}
          {visionReport.next_week_vision_focus && (
            <Card
              className="p-5 sm:p-6 relative overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, rgba(163, 191, 217, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #C5D5E5",
                borderRadius: "16px",
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background:
                      "linear-gradient(135deg, #A3BFD9 0%, #8FA8C7 100%)",
                  }}
                >
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    다음 주 비전 포커스
                  </p>
                  {visionReport.next_week_vision_focus.focus_areas &&
                    visionReport.next_week_vision_focus.focus_areas.length >
                      0 && (
                      <div className="space-y-3 mb-4">
                        {visionReport.next_week_vision_focus.focus_areas.map(
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
                              {area.suggested_action && (
                                <div className="flex items-start gap-2 mt-2">
                                  <span
                                    className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                                    style={{
                                      backgroundColor: "#A3BFD9",
                                    }}
                                  />
                                  <p
                                    className="text-xs"
                                    style={{ color: COLORS.text.secondary }}
                                  >
                                    {area.suggested_action}
                                  </p>
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  {visionReport.next_week_vision_focus.maintain_momentum &&
                    visionReport.next_week_vision_focus.maintain_momentum
                      .length > 0 && (
                      <div>
                        <p
                          className="text-xs font-medium mb-2"
                          style={{ color: COLORS.text.secondary }}
                        >
                          유지할 모멘텀
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {visionReport.next_week_vision_focus.maintain_momentum.map(
                            (momentum, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1.5 rounded-lg text-xs"
                                style={{
                                  backgroundColor: "#E8F0F8",
                                  color: "#5A7A9A",
                                  border: "1px solid #C5D5E5",
                                }}
                              >
                                {momentum}
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
      )}
    </div>
  );
}
