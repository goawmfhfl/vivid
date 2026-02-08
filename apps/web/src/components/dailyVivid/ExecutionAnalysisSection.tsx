import { Zap, CheckCircle2, HelpCircle } from "lucide-react";
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
import type { DailyReportData } from "./types";

const normalizeScore = (value: DailyReportData["execution_score"] | string) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed.toLowerCase() === "null") return null;
    const numberValue = Number(trimmed);
    return Number.isFinite(numberValue) ? numberValue : null;
  }
  return null;
};

const normalizePoints = (
  value: DailyReportData["execution_analysis_points"] | string | null | undefined
) => {
  if (Array.isArray(value)) {
    return value
      .map((point) => (typeof point === "string" ? point.trim() : ""))
      .filter((point) => point && point.toLowerCase() !== "null");
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed.toLowerCase() === "null") return [];
    try {
      const parsed = JSON.parse(trimmed);
      return normalizePoints(parsed);
    } catch {
      return [trimmed];
    }
  }

  return [];
};

export const hasExecutionAnalysisData = (view: DailyReportData) => {
  const score = normalizeScore(view.execution_score);
  const points = normalizePoints(view.execution_analysis_points);
  return score !== null && score > 0 && points.length > 0;
};

function ExecutionScoreInfoDialog() {
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
          aria-label="실행력 점수 평가 기준 보기"
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
            실행력 점수란?
          </DialogTitle>
          <DialogDescription
            className={cn(
              TYPOGRAPHY.body.fontSize,
              TYPOGRAPHY.body.lineHeight,
              "mt-4"
            )}
            style={{ color: COLORS.text.secondary }}
          >
            실행력 점수는 오늘의 계획(Q1)이 실제 하루(Q3)와 얼마나 잘
            이어졌는지를 평가한 점수입니다 (0-100점).
            <br />
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
                오늘의 계획이 실제 행동으로 이어졌는가?
              </li>
              <li
                className={cn(
                  TYPOGRAPHY.bodySmall.fontSize,
                  TYPOGRAPHY.body.lineHeight
                )}
                style={{ color: COLORS.text.secondary }}
              >
                계획과 실행의 핵심 키워드가 일치하는가?
              </li>
              <li
                className={cn(
                  TYPOGRAPHY.bodySmall.fontSize,
                  TYPOGRAPHY.body.lineHeight
                )}
                style={{ color: COLORS.text.secondary }}
              >
                실행의 흐름이 계획의 방향성을 잘 반영하는가?
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ExecutionAnalysisSection({ view }: SectionProps) {
  const normalizedScore = normalizeScore(view.execution_score);
  const analysisPoints = normalizePoints(view.execution_analysis_points);
  const shouldRender =
    normalizedScore !== null && normalizedScore > 0 && analysisPoints.length > 0;
  const safeScore = typeof normalizedScore === "number" ? normalizedScore : 0;
  const executionColor = COLORS.chart.execution;
  const executionGradientColor = hexToRgbTriplet(executionColor);
  const executionGlow = `rgba(${executionGradientColor}, 0.45)`;
  const { ref, isInView } = useInViewOnce<HTMLDivElement>(0.25, "0px 0px -15% 0px");
  const target = isInView ? Math.min(safeScore, 100) : 0;
  const score = useCountUp(target, 1200, true);
  const progress = Math.min(score, 100);

  if (!shouldRender) return null;

  return (
    <ScrollAnimation delay={280}>
      <div className="mb-60" ref={ref}>
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${executionColor} 0%, ${executionColor}DD 100%)`,
              boxShadow: `0 4px 12px ${executionGlow}`,
            }}
          >
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h3
            className={cn(TYPOGRAPHY.h2.fontSize, TYPOGRAPHY.h2.fontWeight)}
            style={{ color: COLORS.text.primary }}
          >
            실행력 분석
          </h3>
        </div>
        <ChartGlassCard gradientColor={executionGradientColor}>
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: `${executionColor}20`,
                border: `1.5px solid ${executionColor}40`,
              }}
            >
              <Zap className="w-4 h-4" style={{ color: executionColor }} />
            </div>
            <p
              className={cn(
                TYPOGRAPHY.label.fontSize,
                TYPOGRAPHY.label.fontWeight,
                TYPOGRAPHY.label.letterSpacing,
                "uppercase"
              )}
              style={{ color: COLORS.text.secondary }}
            >
              실행력 점수
            </p>
            <ExecutionScoreInfoDialog />
          </div>
          <div className="mb-4">
            <div className="flex items-center gap-4 mb-3">
              <div
                className={cn(
                  TYPOGRAPHY.number.large.fontSize,
                  TYPOGRAPHY.number.large.fontWeight
                )}
                style={{
                  color: executionColor,
                  textShadow: `0 6px 18px ${executionGlow}`,
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
                  background: `linear-gradient(90deg, ${executionColor} 0%, rgba(${executionGradientColor}, 0.85) 45%, rgba(${executionGradientColor}, 0.55) 100%)`,
                  boxShadow: `0 8px 20px ${executionGlow}`,
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
            오늘의 계획이 실제 하루와 얼마나 잘 맞았는지를 보여주는 점수입니다.
          </p>
          {analysisPoints.length > 0 && (
            <div
              className="mt-6 pt-5 border-t"
              style={{ borderColor: `${executionColor}20` }}
            >
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2
                  className="w-4 h-4"
                  style={{ color: executionColor }}
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
                  실행력 분석 포인트
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysisPoints.map((reason, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      backgroundColor: `${executionColor}12`,
                      border: `1px solid ${executionColor}25`,
                    }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: executionColor }}
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
            </div>
          )}
        </ChartGlassCard>
      </div>
    </ScrollAnimation>
  );
}
