import {
  Target,
  User,
  BarChart3,
  Sparkles,
  Eye,
  TrendingUp,
  Heart,
  Zap,
} from "lucide-react";
import { Card } from "../ui/card";
import { ScrollingKeywords } from "../ui/ScrollingKeywords";
import { SectionProps } from "./types";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  CARD_STYLES,
  SHADOWS,
  TRANSITIONS,
} from "@/lib/design-system";
import { cn } from "@/lib/utils";

export function VisionSection({ view, isPro = false }: SectionProps) {
  const hasCurrentData = !!(
    view.current_summary?.trim() ||
    view.current_evaluation?.trim() ||
    (view.current_keywords && view.current_keywords.length > 0)
  );
  const hasFutureData = !!(
    view.future_summary?.trim() ||
    view.future_evaluation?.trim() ||
    (view.future_keywords && view.future_keywords.length > 0)
  );
  const hasAlignmentScore =
    view.alignment_score !== null && view.alignment_score !== undefined;
  const hasUserCharacteristics =
    view.user_characteristics && view.user_characteristics.length > 0;
  const hasAspiredTraits = view.aspired_traits && view.aspired_traits.length > 0;

  // 색상 팔레트
  const currentColor = "#E5B96B"; // 머스터드 옐로우
  const futureColor = "#A3BFD9"; // 파스텔 블루
  const alignmentColor = COLORS.brand.primary; // 세이지 그린

  return (
    <div className="mb-16">
      {/* 메인 헤더 */}
      <div className="flex items-center gap-4 mb-10">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden group"
          style={{
            background: "linear-gradient(135deg, #E5B96B 0%, #D4A85A 100%)",
            boxShadow: SHADOWS.elevation3,
          }}
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, transparent 70%)",
            }}
          />
          <Target className="w-6 h-6 text-white relative z-10" />
        </div>
        <div>
          <h2
            className={cn(TYPOGRAPHY.h1.fontSize, TYPOGRAPHY.h1.fontWeight, "mb-2")}
            style={{ color: COLORS.text.primary }}
          >
            오늘의 VIVID
          </h2>
          <p
            className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
            style={{ color: COLORS.text.secondary }}
          >
            기륵올 통해, 나다운 삶을 선명하게
          </p>
        </div>
      </div>

      {/* 📝 오늘의 VIVID (현재 모습) */}
      {hasCurrentData && (
        <div className="mb-12">

          <div className="space-y-4">
            {/* 오늘의 비비드 요약 */}
            {view.current_summary && (
              <Card
                className={cn(
                  "p-6 sm:p-8 relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                )}
                style={{
                  background: `linear-gradient(135deg, ${currentColor}12 0%, ${COLORS.background.card} 100%)`,
                  border: `1.5px solid ${currentColor}30`,
                  borderRadius: "20px",
                  boxShadow: SHADOWS.elevation2,
                }}
              >
                {/* 배경 장식 */}
                <div
                  className="absolute top-0 right-0 w-48 h-48 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, ${currentColor} 0%, transparent 70%)`,
                  }}
                />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: `${currentColor}20`,
                        border: `1.5px solid ${currentColor}40`,
                      }}
                    >
                      <Sparkles className="w-4 h-4" style={{ color: currentColor }} />
                    </div>
                    <p
                      className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight, TYPOGRAPHY.label.letterSpacing, "uppercase")}
                      style={{ color: COLORS.text.secondary }}
                    >
                      오늘의 비비드 요약
                    </p>
                  </div>
                  <p
                    className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
                    style={{ color: COLORS.text.primary }}
                  >
                    {view.current_summary}
                  </p>
                </div>
              </Card>
            )}

            {/* 오늘의 비비드 평가 */}
            {view.current_evaluation && (
              <Card
                className={cn(
                  "p-6 sm:p-8 relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                )}
                style={{
                  background: `linear-gradient(135deg, ${currentColor}12 0%, ${COLORS.background.card} 100%)`,
                  border: `1.5px solid ${currentColor}30`,
                  borderRadius: "20px",
                  boxShadow: SHADOWS.elevation2,
                }}
              >
                {/* 배경 장식 */}
                <div
                  className="absolute top-0 right-0 w-48 h-48 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, ${currentColor} 0%, transparent 70%)`,
                  }}
                />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: `${currentColor}20`,
                        border: `1.5px solid ${currentColor}40`,
                      }}
                    >
                      <TrendingUp className="w-4 h-4" style={{ color: currentColor }} />
                    </div>
                    <p
                      className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight, TYPOGRAPHY.label.letterSpacing, "uppercase")}
                      style={{ color: COLORS.text.secondary }}
                    >
                      오늘의 비비드 평가
                    </p>
                  </div>
                  <p
                    className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
                    style={{ color: COLORS.text.primary }}
                  >
                    {view.current_evaluation}
                  </p>
                </div>
              </Card>
            )}

            {/* 오늘의 비비드 키워드 */}
            {view.current_keywords && view.current_keywords.length > 0 && (
              <Card
                className={cn(
                  "p-6 sm:p-8 relative overflow-hidden group transition-all duration-300"
                )}
                style={{
                  background: `linear-gradient(135deg, ${currentColor}08 0%, ${COLORS.background.card} 100%)`,
                  border: `1.5px solid ${currentColor}25`,
                  borderRadius: "20px",
                  boxShadow: SHADOWS.elevation1,
                }}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: `${currentColor}20`,
                        border: `1.5px solid ${currentColor}40`,
                      }}
                    >
                      <Zap className="w-4 h-4" style={{ color: currentColor }} />
                    </div>
                    <p
                      className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight, TYPOGRAPHY.label.letterSpacing, "uppercase")}
                      style={{ color: COLORS.text.secondary }}
                    >
                      오늘의 비비드 키워드
                    </p>
                  </div>
                  <div className="-mx-2">
                    <ScrollingKeywords keywords={view.current_keywords} />
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* 🎯 앞으로의 나의 모습 (미래 비전) */}
      {hasFutureData && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${futureColor} 0%, ${futureColor}DD 100%)`,
                boxShadow: `0 4px 12px ${futureColor}40`,
              }}
            >
              <Target className="w-5 h-5 text-white" />
            </div>
            <h3
              className={cn(TYPOGRAPHY.h2.fontSize, TYPOGRAPHY.h2.fontWeight)}
              style={{ color: COLORS.text.primary }}
            >
              앞으로의 나의 모습 (미래 비전)
            </h3>
          </div>

          <div className="space-y-4">
            {/* 기대하는 모습 요약 */}
            {view.future_summary && (
              <Card
                className={cn(
                  "p-6 sm:p-8 relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                )}
                style={{
                  background: `linear-gradient(135deg, ${futureColor}12 0%, ${COLORS.background.card} 100%)`,
                  border: `1.5px solid ${futureColor}30`,
                  borderRadius: "20px",
                  boxShadow: SHADOWS.elevation2,
                }}
              >
                {/* 배경 장식 */}
                <div
                  className="absolute top-0 right-0 w-48 h-48 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, ${futureColor} 0%, transparent 70%)`,
                  }}
                />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: `${futureColor}20`,
                        border: `1.5px solid ${futureColor}40`,
                      }}
                    >
                      <Sparkles className="w-4 h-4" style={{ color: futureColor }} />
                    </div>
                    <p
                      className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight, TYPOGRAPHY.label.letterSpacing, "uppercase")}
                      style={{ color: COLORS.text.secondary }}
                    >
                      기대하는 모습 요약
                    </p>
                  </div>
                  <p
                    className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
                    style={{ color: COLORS.text.primary }}
                  >
                    {view.future_summary}
                  </p>
                </div>
              </Card>
            )}

            {/* 기대하는 모습 평가 */}
            {view.future_evaluation && (
              <Card
                className={cn(
                  "p-6 sm:p-8 relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                )}
                style={{
                  background: `linear-gradient(135deg, ${futureColor}12 0%, ${COLORS.background.card} 100%)`,
                  border: `1.5px solid ${futureColor}30`,
                  borderRadius: "20px",
                  boxShadow: SHADOWS.elevation2,
                }}
              >
                {/* 배경 장식 */}
                <div
                  className="absolute top-0 right-0 w-48 h-48 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, ${futureColor} 0%, transparent 70%)`,
                  }}
                />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: `${futureColor}20`,
                        border: `1.5px solid ${futureColor}40`,
                      }}
                    >
                      <TrendingUp className="w-4 h-4" style={{ color: futureColor }} />
                    </div>
                    <p
                      className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight, TYPOGRAPHY.label.letterSpacing, "uppercase")}
                      style={{ color: COLORS.text.secondary }}
                    >
                      기대하는 모습 평가
                    </p>
                  </div>
                  <p
                    className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
                    style={{ color: COLORS.text.primary }}
                  >
                    {view.future_evaluation}
                  </p>
                </div>
              </Card>
            )}

            {/* 기대하는 모습 키워드 */}
            {view.future_keywords && view.future_keywords.length > 0 && (
              <Card
                className={cn(
                  "p-6 sm:p-8 relative overflow-hidden group transition-all duration-300"
                )}
                style={{
                  background: `linear-gradient(135deg, ${futureColor}08 0%, ${COLORS.background.card} 100%)`,
                  border: `1.5px solid ${futureColor}25`,
                  borderRadius: "20px",
                  boxShadow: SHADOWS.elevation1,
                }}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: `${futureColor}20`,
                        border: `1.5px solid ${futureColor}40`,
                      }}
                    >
                      <Zap className="w-4 h-4" style={{ color: futureColor }} />
                    </div>
                    <p
                      className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight, TYPOGRAPHY.label.letterSpacing, "uppercase")}
                      style={{ color: COLORS.text.secondary }}
                    >
                      기대하는 모습 키워드
                    </p>
                  </div>
                  <div className="-mx-2">
                    <ScrollingKeywords keywords={view.future_keywords} />
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* 📊 일치도 분석 */}
      {hasAlignmentScore && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${alignmentColor} 0%, ${alignmentColor}DD 100%)`,
                boxShadow: `0 4px 12px ${alignmentColor}40`,
              }}
            >
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h3
              className={cn(TYPOGRAPHY.h2.fontSize, TYPOGRAPHY.h2.fontWeight)}
              style={{ color: COLORS.text.primary }}
            >
              일치도 분석
            </h3>
          </div>
          <Card
            className={cn(
              "p-8 sm:p-10 relative overflow-hidden group transition-all duration-300 hover:shadow-xl"
            )}
            style={{
              background: `linear-gradient(135deg, ${alignmentColor}12 0%, ${COLORS.background.card} 100%)`,
              border: `1.5px solid ${alignmentColor}30`,
              borderRadius: "20px",
              boxShadow: SHADOWS.elevation2,
            }}
          >
            {/* 배경 장식 */}
            <div
              className="absolute top-0 right-0 w-64 h-64 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${alignmentColor} 0%, transparent 70%)`,
              }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: `${alignmentColor}20`,
                    border: `1.5px solid ${alignmentColor}40`,
                  }}
                >
                  <BarChart3 className="w-4 h-4" style={{ color: alignmentColor }} />
                </div>
                <p
                  className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight, TYPOGRAPHY.label.letterSpacing, "uppercase")}
                  style={{ color: COLORS.text.secondary }}
                >
                  일치도 점수
                </p>
              </div>
              <div className="flex items-center gap-6 mb-4">
                <div
                  className={cn(TYPOGRAPHY.number.large.fontSize, TYPOGRAPHY.number.large.fontWeight)}
                  style={{
                    color: alignmentColor,
                    textShadow: `0 2px 8px ${alignmentColor}20`,
                  }}
                >
                  {view.alignment_score}
                </div>
                <div className="flex-1">
                  <div
                    className="h-8 rounded-full overflow-hidden relative"
                    style={{
                      backgroundColor: COLORS.background.hover,
                      boxShadow: "inset 0 2px 6px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-3 relative"
                      style={{
                        width: `${view.alignment_score}%`,
                        background: `linear-gradient(90deg, ${alignmentColor} 0%, ${alignmentColor}CC 100%)`,
                        boxShadow: `0 2px 8px ${alignmentColor}40`,
                      }}
                    >
                      {view.alignment_score && view.alignment_score >= 15 && (
                        <span
                          className="text-xs font-bold"
                          style={{ color: COLORS.text.white }}
                        >
                          {view.alignment_score}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div
                  className={cn(TYPOGRAPHY.h4.fontSize, "font-medium")}
                  style={{ color: COLORS.text.tertiary, minWidth: "50px" }}
                >
                  / 100
                </div>
              </div>
              <p
                className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight, "mt-6")}
                style={{ color: COLORS.text.muted }}
              >
                오늘의 모습과 앞으로 되고 싶은 모습의 일치도를 측정한 점수입니다.
                높을수록 현재와 목표가 일치한다는 의미입니다.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* 🔍 사용자 특성 분석 */}
      {(hasUserCharacteristics || hasAspiredTraits) && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${alignmentColor} 0%, ${alignmentColor}DD 100%)`,
                boxShadow: `0 4px 12px ${alignmentColor}40`,
              }}
            >
              <User className="w-5 h-5 text-white" />
            </div>
            <h3
              className={cn(TYPOGRAPHY.h2.fontSize, TYPOGRAPHY.h2.fontWeight)}
              style={{ color: COLORS.text.primary }}
            >
              사용자 특성 분석
            </h3>
          </div>

          <div className="space-y-4">
            {/* 기록을 쓰는 사람의 특징 */}
            {hasUserCharacteristics && (
              <Card
                className={cn(
                  "p-6 sm:p-8 relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                )}
                style={{
                  background: `linear-gradient(135deg, ${alignmentColor}12 0%, ${COLORS.background.card} 100%)`,
                  border: `1.5px solid ${alignmentColor}30`,
                  borderRadius: "20px",
                  boxShadow: SHADOWS.elevation2,
                }}
              >
                {/* 배경 장식 */}
                <div
                  className="absolute top-0 right-0 w-48 h-48 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, ${alignmentColor} 0%, transparent 70%)`,
                  }}
                />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: `${alignmentColor}20`,
                        border: `1.5px solid ${alignmentColor}40`,
                      }}
                    >
                      <Heart className="w-4 h-4" style={{ color: alignmentColor }} />
                    </div>
                    <p
                      className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight, TYPOGRAPHY.label.letterSpacing, "uppercase")}
                      style={{ color: COLORS.text.secondary }}
                    >
                      기록을 쓰는 사람의 특징
                    </p>
                  </div>
                  <ul className="space-y-3">
                    {view.user_characteristics.map((trait, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div
                          className="w-2 h-2 rounded-full mt-2.5 flex-shrink-0 transition-transform duration-300 group-hover:scale-125"
                          style={{ backgroundColor: alignmentColor }}
                        />
                        <p
                          className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight, "flex-1")}
                          style={{ color: COLORS.text.primary }}
                        >
                          {trait}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            )}

            {/* 지향하는 모습 */}
            {hasAspiredTraits && (
              <Card
                className={cn(
                  "p-6 sm:p-8 relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                )}
                style={{
                  background: `linear-gradient(135deg, ${futureColor}12 0%, ${COLORS.background.card} 100%)`,
                  border: `1.5px solid ${futureColor}30`,
                  borderRadius: "20px",
                  boxShadow: SHADOWS.elevation2,
                }}
              >
                {/* 배경 장식 */}
                <div
                  className="absolute top-0 right-0 w-48 h-48 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, ${futureColor} 0%, transparent 70%)`,
                  }}
                />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: `${futureColor}20`,
                        border: `1.5px solid ${futureColor}40`,
                      }}
                    >
                      <Target className="w-4 h-4" style={{ color: futureColor }} />
                    </div>
                    <p
                      className={cn(TYPOGRAPHY.label.fontSize, TYPOGRAPHY.label.fontWeight, TYPOGRAPHY.label.letterSpacing, "uppercase")}
                      style={{ color: COLORS.text.secondary }}
                    >
                      지향하는 모습
                    </p>
                  </div>
                  <ul className="space-y-3">
                    {view.aspired_traits.map((trait, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div
                          className="w-2 h-2 rounded-full mt-2.5 flex-shrink-0 transition-transform duration-300 group-hover:scale-125"
                          style={{ backgroundColor: futureColor }}
                        />
                        <p
                          className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight, "flex-1")}
                          style={{ color: COLORS.text.primary }}
                        >
                          {trait}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
