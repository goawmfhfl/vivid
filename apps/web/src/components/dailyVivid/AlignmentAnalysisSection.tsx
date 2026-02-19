import { useRouter } from "next/navigation";
import { BarChart3, CheckCircle2, HelpCircle, Lock } from "lucide-react";
import { ScrollAnimation } from "../ui/ScrollAnimation";
import { COLORS, TYPOGRAPHY, hexToRgba } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { SectionProps } from "./types";
import { useCountUp } from "@/hooks/useCountUp";
import { useState } from "react";
import type { CSSProperties } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ChartGlassCard, useInViewOnce } from "./analysisShared";
import { hexToRgbTriplet } from "./colorUtils";

function AlignmentScoreInfoDialog({
  alignmentBasedOnPersona,
}: {
  alignmentBasedOnPersona?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const buttonStyle = {
    color: COLORS.text.tertiary,
    "--hover-bg": COLORS.background.hoverLight,
    "--focus-ring": COLORS.brand.primary,
  } as CSSProperties;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center justify-center w-5 h-5 rounded-full transition-colors hover:bg-[var(--hover-bg)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--focus-ring)]"
          style={buttonStyle}
          aria-label="일치도 점수 평가 기준 보기"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-64px)] max-w-sm rounded-xl">
        <DialogHeader>
          <DialogTitle
            className={cn(TYPOGRAPHY.h3.fontSize, TYPOGRAPHY.h3.fontWeight)}
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
            일치도 점수는 오늘의 계획이 미래 목표와 얼마나 잘 정렬되어 있는지를
            평가한 점수입니다 (0-100점).
            <span
              className={cn(TYPOGRAPHY.bodySmall.fontSize, "mt-2 block")}
              style={{ color: COLORS.text.tertiary }}
            >
              * AI 평가에 따라 5~10점 정도의 차이가 있을 수 있습니다.
            </span>
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
                  className={cn(TYPOGRAPHY.bodySmall.fontSize, "ml-2")}
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
                  className={cn(TYPOGRAPHY.bodySmall.fontSize, "ml-2")}
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
                  className={cn(TYPOGRAPHY.bodySmall.fontSize, "ml-2")}
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

export function AlignmentAnalysisSection({ view, isPro = false }: SectionProps) {
  const router = useRouter();
  const hasAlignmentScore =
    view.alignment_score !== null && view.alignment_score !== undefined;
  const alignmentBasedOnPersona = view.alignment_based_on_persona === true;
  const alignmentScore =
    typeof view.alignment_score === "number" && Number.isFinite(view.alignment_score)
      ? view.alignment_score
      : 0;
  const alignmentColor = COLORS.brand.primary;
  const alignmentGradientColor = hexToRgbTriplet(alignmentColor);
  const alignmentGlow = COLORS.chart.glow;
  const { ref, isInView } = useInViewOnce<HTMLDivElement>(0.25, "0px 0px -15% 0px");
  const target = isInView ? Math.min(alignmentScore, 100) : 0;
  const score = useCountUp(target, 1200, true);
  const progress = Math.min(score, 100);

  if (!hasAlignmentScore) return null;

  return (
    <ScrollAnimation delay={240}>
      <div className="mb-60" ref={ref}>
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
        <ChartGlassCard gradientColor={alignmentGradientColor}>
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
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className={cn(
                  TYPOGRAPHY.label.fontSize,
                  TYPOGRAPHY.label.fontWeight,
                  TYPOGRAPHY.label.letterSpacing,
                  "uppercase"
                )}
                style={{ color: COLORS.text.secondary }}
              >
                일치도 점수
              </p>
              <span
                className={cn(TYPOGRAPHY.bodySmall.fontSize, "normal-case")}
                style={{ color: COLORS.text.tertiary }}
              >
                {alignmentBasedOnPersona ? "(지향하는 모습 기반)" : "(오늘의 꿈 기반)"}
              </span>
              <AlignmentScoreInfoDialog alignmentBasedOnPersona={alignmentBasedOnPersona} />
            </div>
          </div>
          <div className="mb-4">
            <div className="flex items-center gap-4 mb-3">
              <div
                className={cn(
                  TYPOGRAPHY.number.large.fontSize,
                  TYPOGRAPHY.number.large.fontWeight
                )}
                style={{
                  color: alignmentColor,
                  textShadow: `0 6px 18px ${alignmentGlow}`,
                }}
              >
                {score}
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
                backgroundColor: COLORS.glass.surfaceStrong,
                border: `1px solid ${COLORS.glass.border}`,
                boxShadow: `inset 0 4px 12px ${COLORS.glass.shadow}`,
              }}
            >
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out relative"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${alignmentColor} 0%, ${COLORS.chart.waveStrong} 50%, ${COLORS.chart.waveLight} 100%)`,
                  boxShadow: `0 8px 20px ${alignmentGlow}`,
                }}
              />
              <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                  background: `linear-gradient(180deg, ${hexToRgba(
                    COLORS.text.white,
                    0.45
                  )} 0%, transparent 55%)`,
                }}
              />
            </div>
          </div>
          <p
            className={cn(
              TYPOGRAPHY.body.fontSize,
              TYPOGRAPHY.body.lineHeight,
              "mt-6"
            )}
            style={{ color: COLORS.text.muted }}
          >
            {alignmentBasedOnPersona
              ? "오늘의 계획이 내가 지향하는 모습과 얼마나 잘 정렬되어 있는지 측정한 점수입니다. 높을수록 현재와 목표가 일치한다는 의미입니다."
              : "오늘의 모습과 앞으로 되고 싶은 모습의 일치도를 측정한 점수입니다. 높을수록 현재와 목표가 일치한다는 의미입니다."}
          </p>
          {view.alignment_analysis_points &&
            view.alignment_analysis_points.length > 0 && (
              <div
                className="mt-6 pt-5 border-t relative"
                style={{ borderColor: `${alignmentColor}20` }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2
                    className="w-4 h-4"
                    style={{ color: alignmentColor }}
                  />
                  <p
                    className={cn(
                      TYPOGRAPHY.label.fontSize,
                      TYPOGRAPHY.label.fontWeight,
                      TYPOGRAPHY.label.letterSpacing,
                      "uppercase"
                    )}
                    style={{ color: COLORS.text.secondary }}
                  >
                    일치도 분석 포인트
                  </p>
                </div>
                {isPro ? (
                  <div className="flex flex-wrap gap-2">
                    {view.alignment_analysis_points.map((reason, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-[1.02]"
                        style={{
                          backgroundColor: `${alignmentColor}12`,
                          border: `1px solid ${alignmentColor}25`,
                        }}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: alignmentColor }}
                        />
                        <span
                          className={cn(TYPOGRAPHY.bodySmall.fontSize)}
                          style={{ color: COLORS.text.primary }}
                        >
                          {reason}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push("/membership")}
                    className="w-full py-4 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:opacity-90"
                    style={{
                      backgroundColor: `${alignmentColor}10`,
                      border: `1px dashed ${alignmentColor}40`,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${COLORS.brand.primary} 0%, ${COLORS.brand.dark} 100%)`,
                        boxShadow: `0 2px 8px ${COLORS.brand.primary}40`,
                      }}
                    >
                      <Lock
                        className="w-5 h-5"
                        style={{ color: COLORS.text.white }}
                      />
                    </div>
                    <span
                      className={cn(TYPOGRAPHY.bodySmall.fontSize)}
                      style={{ color: COLORS.text.secondary }}
                    >
                      Pro 업그레이드 시 상세 분석 포인트 확인
                    </span>
                  </button>
                )}
              </div>
            )}
        </ChartGlassCard>
      </div>
    </ScrollAnimation>
  );
}
