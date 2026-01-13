import {
  Target,
  User,
  BarChart3,
  Sparkles,
  TrendingUp,
  Heart,
  Zap,
  HelpCircle,
} from "lucide-react";
import { Card } from "../ui/card";
import { SectionProps } from "./types";
import {
  COLORS,
  TYPOGRAPHY,
} from "@/lib/design-system";
import { cn } from "@/lib/utils";
import {
  SectionHeader,
  ContentCard,
  KeywordCard,
} from "../common/feedback";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useState } from "react";

// 일치도 점수 설명 팝업 컴포넌트
function AlignmentScoreInfoDialog({ alignmentColor }: { alignmentColor: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center justify-center w-5 h-5 rounded-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ 
            color: COLORS.text.tertiary,
          }}
          aria-label="일치도 점수 평가 기준 보기"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle
            className={cn(
              TYPOGRAPHY.h3.fontSize,
              TYPOGRAPHY.h3.fontWeight
            )}
            style={{ color: COLORS.text.primary }}
          >
            일치도 점수란?
          </DialogTitle>
          <DialogDescription
            className={cn(
              TYPOGRAPHY.body.fontSize,
              TYPOGRAPHY.body.lineHeight,
              "mt-4"
            )}
            style={{ color: COLORS.text.secondary }}
          >
            일치도 점수는 오늘의 계획이 미래 목표와 얼마나 잘 정렬되어 있는지를 평가한 점수입니다 (0-100점).
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div>
            <p
              className={cn(
                TYPOGRAPHY.bodySmall.fontSize,
                TYPOGRAPHY.bodySmall.fontWeight,
                "mb-2"
              )}
              style={{ color: COLORS.text.primary }}
            >
              평가 기준
            </p>
            <ul className="space-y-2 ml-4 list-disc">
              <li
                className={cn(
                  TYPOGRAPHY.bodySmall.fontSize,
                  TYPOGRAPHY.body.lineHeight
                )}
                style={{ color: COLORS.text.secondary }}
              >
                오늘 계획한 활동/방향이 미래 목표 달성에 도움이 되는가?
              </li>
              <li
                className={cn(
                  TYPOGRAPHY.bodySmall.fontSize,
                  TYPOGRAPHY.body.lineHeight
                )}
                style={{ color: COLORS.text.secondary }}
              >
                오늘의 우선순위가 미래 비전과 정렬되어 있는가?
              </li>
              <li
                className={cn(
                  TYPOGRAPHY.bodySmall.fontSize,
                  TYPOGRAPHY.body.lineHeight
                )}
                style={{ color: COLORS.text.secondary }}
              >
                구체적인 행동 계획이 미래 목표로 이어지는가?
              </li>
            </ul>
          </div>
          <div className="pt-4 border-t" style={{ borderColor: COLORS.border.light }}>
            <p
              className={cn(
                TYPOGRAPHY.bodySmall.fontSize,
                TYPOGRAPHY.bodySmall.fontWeight,
                "mb-2"
              )}
              style={{ color: COLORS.text.primary }}
            >
              점수 구간
            </p>
            <div className="space-y-2">
              <div>
                <span
                  className={cn(
                    TYPOGRAPHY.bodySmall.fontSize,
                    TYPOGRAPHY.bodySmall.fontWeight
                  )}
                  style={{ color: COLORS.text.primary }}
                >
                  높은 점수 (80점 이상):
                </span>
                <span
                  className={cn(
                    TYPOGRAPHY.bodySmall.fontSize,
                    "ml-2"
                  )}
                  style={{ color: COLORS.text.secondary }}
                >
                  오늘의 계획이 미래 목표와 잘 정렬되어 있음
                </span>
              </div>
              <div>
                <span
                  className={cn(
                    TYPOGRAPHY.bodySmall.fontSize,
                    TYPOGRAPHY.bodySmall.fontWeight
                  )}
                  style={{ color: COLORS.text.primary }}
                >
                  중간 점수 (50-79점):
                </span>
                <span
                  className={cn(
                    TYPOGRAPHY.bodySmall.fontSize,
                    "ml-2"
                  )}
                  style={{ color: COLORS.text.secondary }}
                >
                  부분적으로 정렬되어 있으나 개선 여지 있음
                </span>
              </div>
              <div>
                <span
                  className={cn(
                    TYPOGRAPHY.bodySmall.fontSize,
                    TYPOGRAPHY.bodySmall.fontWeight
                  )}
                  style={{ color: COLORS.text.primary }}
                >
                  낮은 점수 (50점 미만):
                </span>
                <span
                  className={cn(
                    TYPOGRAPHY.bodySmall.fontSize,
                    "ml-2"
                  )}
                  style={{ color: COLORS.text.secondary }}
                >
                  오늘의 계획과 미래 목표 사이에 큰 격차가 있음
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function VisionSection({ view, isPro: _isPro = false }: SectionProps) {
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
      <SectionHeader
        icon={Target}
        iconGradient="#E5B96B"
        title="오늘의 VIVID"
        description="기륵올 통해, 나다운 삶을 선명하게"
      />

      {/* 📝 오늘의 VIVID (현재 모습) */}
      {hasCurrentData && (
        <div className="mb-12">

          <div className="space-y-5">
            {/* 오늘의 비비드 요약 */}
            {view.current_summary && (
              <ContentCard
                icon={Sparkles}
                iconColor={currentColor}
                label="오늘의 비비드 요약"
                content={view.current_summary}
                gradientColor="229, 185, 107"
              />
            )}

            {/* 오늘의 비비드 평가 */}
            {view.current_evaluation && (
              <ContentCard
                icon={TrendingUp}
                iconColor={currentColor}
                label="비비드 AI 평가"
                content={view.current_evaluation}
                gradientColor="229, 185, 107"
              />
            )}

            {/* 오늘의 비비드 키워드 */}
            {view.current_keywords && view.current_keywords.length > 0 && (
              <KeywordCard
                icon={Zap}
                iconColor={currentColor}
                label="오늘의 비비드 키워드"
                keywords={view.current_keywords}
                gradientColor="229, 185, 107"
                badgeColor="rgba(229, 185, 107, 0.15)"
                badgeTextColor="#B8860B"
                duration={15}
              />
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

          <div className="space-y-5">
            {/* 기대하는 모습 요약 */}
            {view.future_summary && (
              <ContentCard
                icon={Sparkles}
                iconColor={futureColor}
                label="기대하는 모습 요약"
                content={view.future_summary}
                gradientColor="163, 191, 217"
              />
            )}

            {/* 기대하는 모습 평가 */}
            {view.future_evaluation && (
              <ContentCard
                icon={TrendingUp}
                iconColor={futureColor}
                label="비비드 AI 평가"
                content={view.future_evaluation}
                gradientColor="163, 191, 217"
              />
            )}

            {/* 기대하는 모습 키워드 */}
            {view.future_keywords && view.future_keywords.length > 0 && (
              <KeywordCard
                icon={Zap}
                iconColor={futureColor}
                label="기대하는 모습 키워드"
                keywords={view.future_keywords}
                gradientColor="163, 191, 217"
                badgeColor="rgba(163, 191, 217, 0.15)"
                badgeTextColor="#5A7A9A"
                duration={15}
              />
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
              "p-6 sm:p-7 relative overflow-hidden group transition-all duration-300 hover:shadow-xl"
            )}
            style={{
              background: `linear-gradient(135deg, rgba(127, 143, 122, 0.12) 0%, rgba(127, 143, 122, 0.06) 50%, rgb(255, 255, 255) 100%)`,
              border: `1.5px solid rgba(127, 143, 122, 0.25)`,
              borderRadius: "20px",
              boxShadow: `0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(127, 143, 122, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)`,
            }}
          >
            {/* 배경 장식 */}
            <div
              className="absolute top-0 right-0 w-64 h-64 opacity-4 group-hover:opacity-6 transition-opacity duration-300 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 80% 20%, rgba(127, 143, 122, 0.15) 0%, transparent 60%)`,
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-48 h-48 opacity-3 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 20% 80%, rgba(127, 143, 122, 0.1) 0%, transparent 50%)`,
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
                <AlignmentScoreInfoDialog alignmentColor={alignmentColor} />
              </div>
              <div className="mb-4">
                <div className="flex items-center gap-4 mb-3">
                  <div
                    className={cn(TYPOGRAPHY.number.large.fontSize, TYPOGRAPHY.number.large.fontWeight)}
                    style={{
                      color: alignmentColor,
                      textShadow: `0 2px 8px ${alignmentColor}20`,
                    }}
                  >
                    {view.alignment_score}
                  </div>
                  <div
                    className={cn(TYPOGRAPHY.h4.fontSize, "font-medium")}
                    style={{ color: COLORS.text.tertiary }}
                  >
                    / 100
                  </div>
                </div>
                <div
                  className="h-10 rounded-full overflow-hidden relative"
                  style={{
                    backgroundColor: COLORS.background.hover,
                    boxShadow: "inset 0 2px 6px rgba(0,0,0,0.08)",
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out relative"
                    style={{
                      width: `${view.alignment_score}%`,
                      background: `linear-gradient(90deg, ${alignmentColor} 0%, ${alignmentColor}CC 100%)`,
                      boxShadow: `0 2px 8px ${alignmentColor}40`,
                    }}
                  />
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

          <div className="space-y-5">
            {/* 기록을 쓰는 사람의 특징 */}
            {hasUserCharacteristics && (
              <Card
                className={cn(
                  "p-5 sm:p-6 relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                )}
                style={{
                  background: `linear-gradient(135deg, rgba(127, 143, 122, 0.12) 0%, rgba(127, 143, 122, 0.06) 50%, rgb(255, 255, 255) 100%)`,
                  border: `1.5px solid rgba(127, 143, 122, 0.25)`,
                  borderRadius: "20px",
                  boxShadow: `0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(127, 143, 122, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)`,
                }}
              >
                {/* 배경 장식 */}
                <div
                  className="absolute top-0 right-0 w-64 h-64 opacity-4 group-hover:opacity-6 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 80% 20%, rgba(127, 143, 122, 0.15) 0%, transparent 60%)`,
                  }}
                />
                <div
                  className="absolute bottom-0 left-0 w-48 h-48 opacity-3 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 20% 80%, rgba(127, 143, 122, 0.1) 0%, transparent 50%)`,
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
                          style={{ color: "#1a1a1a" }}
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
                  "p-5 sm:p-6 relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                )}
                style={{
                  background: `linear-gradient(135deg, rgba(163, 191, 217, 0.12) 0%, rgba(163, 191, 217, 0.06) 50%, rgb(255, 255, 255) 100%)`,
                  border: `1.5px solid rgba(163, 191, 217, 0.25)`,
                  borderRadius: "20px",
                  boxShadow: `0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(163, 191, 217, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
                }}
              >
                {/* 배경 장식 */}
                <div
                  className="absolute top-0 right-0 w-64 h-64 opacity-8 group-hover:opacity-12 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 80% 20%, rgba(163, 191, 217, 0.25) 0%, transparent 60%)`,
                  }}
                />
                <div
                  className="absolute bottom-0 left-0 w-48 h-48 opacity-5 group-hover:opacity-8 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 20% 80%, rgba(163, 191, 217, 0.15) 0%, transparent 50%)`,
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
