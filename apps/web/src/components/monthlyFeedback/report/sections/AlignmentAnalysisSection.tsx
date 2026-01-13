"use client";

import {
  BarChart3,
  Rocket,
  TrendingUp,
  TrendingDown,
  Minus,
  HelpCircle,
} from "lucide-react";
import type { VividReport } from "@/types/monthly-feedback-new";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import {
  GradientCard,
} from "@/components/common/feedback";
import { ScrollAnimation } from "@/components/ui/ScrollAnimation";
import { useCountUp } from "@/hooks/useCountUp";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

type AlignmentAnalysisSectionProps = {
  alignmentAnalysis: VividReport["alignment_analysis"];
  vividColor: string;
  improvedColor: string;
  declinedColor: string;
};

// 주차별 점수 아이템 컴포넌트
function WeekScoreItem({
  item,
  improvedColor,
  declinedColor,
  getScoreColor,
  getScoreGradient,
}: {
  item: VividReport["alignment_analysis"]["score_timeline"][number];
  improvedColor: string;
  declinedColor: string;
  getScoreColor: (score: number) => string;
  getScoreGradient: (score: number) => string;
}) {
  const weekScore = Math.round(item.average_score);
  const weekScoreColor = getScoreColor(weekScore);
  const weekScoreGradient = getScoreGradient(weekScore);
  const animatedWeekScore = useCountUp(weekScore, 1200);
  const animatedWeekWidth = useCountUp(weekScore, 1200);

  return (
    <div
      className="p-3 rounded-lg space-y-2 transition-all duration-200 hover:shadow-sm"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        border: `1px solid rgba(226, 232, 240, 0.5)`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: `${weekScoreColor}15`,
              border: `1px solid ${weekScoreColor}30`,
            }}
          >
            <span
              className={cn(
                TYPOGRAPHY.bodySmall.fontSize,
                TYPOGRAPHY.bodySmall.fontWeight
              )}
              style={{ color: weekScoreColor }}
            >
              {item.week}
            </span>
          </div>
          <span
            className={cn(
              TYPOGRAPHY.bodySmall.fontSize,
              TYPOGRAPHY.bodySmall.fontWeight
            )}
            style={{ color: COLORS.text.primary }}
          >
            주차
          </span>
          {item.trend && (
            <div className="flex items-center ml-1">
              {item.trend === "상승" ? (
                <TrendingUp className="w-3 h-3" style={{ color: improvedColor }} />
              ) : item.trend === "하락" ? (
                <TrendingDown className="w-3 h-3" style={{ color: declinedColor }} />
              ) : (
                <Minus className="w-3 h-3" style={{ color: COLORS.text.tertiary }} />
              )}
            </div>
          )}
        </div>
        <span
          className={cn(
            TYPOGRAPHY.body.fontSize,
            TYPOGRAPHY.body.fontWeight
          )}
          style={{ color: weekScoreColor }}
        >
          {animatedWeekScore}점
        </span>
      </div>
      <div
        className="w-full h-2.5 rounded-full overflow-hidden"
        style={{
          backgroundColor: `rgba(226, 232, 240, 0.4)`,
          boxShadow: `inset 0 1px 2px rgba(0, 0, 0, 0.06)`,
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${animatedWeekWidth}%`,
            background: weekScoreGradient,
            boxShadow: `0 1px 3px ${weekScoreColor}40`,
          }}
        />
      </div>
    </div>
  );
}

// 점수 요약 컴포넌트
function ScoreSummaryContent({
  scoreTimeline,
  improvedColor,
  declinedColor,
  vividColor,
}: {
  scoreTimeline: VividReport["alignment_analysis"]["score_timeline"];
  improvedColor: string;
  declinedColor: string;
  vividColor: string;
}) {
  const averageScore = Math.round(
    scoreTimeline.reduce((sum, item) => sum + item.average_score, 0) /
      scoreTimeline.length
  );
  const firstScore = scoreTimeline[0].average_score;
  const lastScore = scoreTimeline[scoreTimeline.length - 1].average_score;
  const diff = lastScore - firstScore;
  const isImproving = diff > 0;
  const isDeclining = diff < 0;

  // 점수에 따른 색상 결정 - 프로젝트 세이지 그린 계열 그라데이션
  const getScoreColor = (score: number) => {
    if (score >= 80) return "#7f8f7a"; // 메인 세이지 그린
    if (score >= 60) return "#9da688"; // 밝은 세이지 그린
    return "#b9c0a3"; // 더 밝은 세이지 그린
  };

  // 점수에 따른 그라데이션 색상
  const getScoreGradient = (score: number) => {
    if (score >= 80) return "linear-gradient(135deg, #7f8f7a 0%, #5f6b3a 100%)"; // 메인 -> 올리브 그린
    if (score >= 60) return "linear-gradient(135deg, #9da688 0%, #7f8f7a 100%)"; // 밝은 -> 메인
    return "linear-gradient(135deg, #b9c0a3 0%, #9da688 100%)"; // 더 밝은 -> 밝은
  };

  const scoreColor = getScoreColor(averageScore);
  const scoreGradient = getScoreGradient(averageScore);
  const animatedAverageScore = useCountUp(averageScore, 1200);
  const animatedAverageWidth = useCountUp(averageScore, 1200);

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: `rgba(163, 191, 217, 0.15)` }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${vividColor}dd, ${vividColor}bb)`,
            boxShadow: `0 2px 8px ${vividColor}25, inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
          }}
        >
          <span
            className={cn(
              TYPOGRAPHY.bodySmall.fontSize,
              TYPOGRAPHY.bodySmall.fontWeight,
              "relative z-10"
            )}
            style={{ color: "white" }}
          >
            2-1
          </span>
          <div
            className="absolute inset-0 opacity-25"
            style={{
              background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), transparent 70%)`,
            }}
          />
        </div>
        <h3
          className={cn(
            TYPOGRAPHY.h3.fontSize,
            TYPOGRAPHY.h3.fontWeight
          )}
          style={{ color: COLORS.text.primary }}
        >
          일치도 점수 요약
        </h3>
      </div>
      <div
        className="p-5 rounded-xl transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.6) 50%, rgba(255, 255, 255, 1) 100%)`,
          border: `1.5px solid rgba(226, 232, 240, 0.6)`,
          boxShadow: `0 2px 12px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)`,
        }}
      >
        {/* 평균 점수 - 원형 게이지 스타일 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
              <p
                className={cn(
                  TYPOGRAPHY.bodySmall.fontSize,
                  TYPOGRAPHY.bodySmall.fontWeight
                )}
                style={{ color: COLORS.text.secondary }}
              >
                한 달 평균 일치도
              </p>
              <AlignmentScoreInfoDialog vividColor={vividColor} />
            </div>
            <div className="flex items-baseline gap-3">
              <div className="relative">
                {/* 원형 프로그레스 - SVG 사용 */}
                <div className="w-20 h-20 rounded-full flex items-center justify-center relative">
                  <svg
                    className="absolute inset-0 transform -rotate-90"
                    width="80"
                    height="80"
                    viewBox="0 0 80 80"
                  >
                    {/* 배경 원 */}
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      fill="none"
                      stroke="rgba(226, 232, 240, 0.5)"
                      strokeWidth="6"
                    />
                    {/* 진행 원 - 그라데이션 적용을 위한 정의 */}
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        {averageScore >= 80 ? (
                          <>
                            <stop offset="0%" stopColor="#7f8f7a" />
                            <stop offset="100%" stopColor="#5f6b3a" />
                          </>
                        ) : averageScore >= 60 ? (
                          <>
                            <stop offset="0%" stopColor="#9da688" />
                            <stop offset="100%" stopColor="#7f8f7a" />
                          </>
                        ) : (
                          <>
                            <stop offset="0%" stopColor="#b9c0a3" />
                            <stop offset="100%" stopColor="#9da688" />
                          </>
                        )}
                      </linearGradient>
                    </defs>
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      fill="none"
                      stroke="url(#scoreGradient)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      strokeDashoffset={`${2 * Math.PI * 36 * (1 - animatedAverageWidth / 100)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center relative z-10"
                    style={{
                      background: `linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(248, 250, 252, 0.98))`,
                      boxShadow: `inset 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)`,
                    }}
                  >
                    <span
                      className={cn(
                        TYPOGRAPHY.h3.fontSize,
                        TYPOGRAPHY.h3.fontWeight
                      )}
                      style={{ color: scoreColor }}
                    >
                      {animatedAverageScore}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <p
                  className={cn(
                    TYPOGRAPHY.bodySmall.fontSize,
                    "mb-1"
                  )}
                  style={{ color: COLORS.text.tertiary }}
                >
                  점수
                </p>
                {/* 프로그레스 바 */}
                <div
                  className="w-full h-3 rounded-full overflow-hidden"
                  style={{
                    backgroundColor: `rgba(226, 232, 240, 0.4)`,
                    boxShadow: `inset 0 1px 2px rgba(0, 0, 0, 0.06)`,
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${animatedAverageWidth}%`,
                      background: scoreGradient,
                      boxShadow: `0 1px 3px ${scoreColor}50`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* 변화량 */}
          {scoreTimeline.length > 1 && (
            <div className="flex flex-col items-end gap-2 ml-4">
              <div
                className="px-3 py-2 rounded-lg transition-all duration-200"
                style={{
                  background: isImproving
                    ? `linear-gradient(135deg, rgba(127, 143, 122, 0.12), rgba(127, 143, 122, 0.08))`
                    : isDeclining
                    ? `linear-gradient(135deg, rgba(181, 103, 74, 0.12), rgba(181, 103, 74, 0.08))`
                    : `linear-gradient(135deg, rgba(148, 163, 184, 0.1), rgba(148, 163, 184, 0.06))`,
                  border: `1.5px solid ${
                    isImproving
                      ? `rgba(127, 143, 122, 0.3)`
                      : isDeclining
                      ? `rgba(181, 103, 74, 0.3)`
                      : `rgba(148, 163, 184, 0.25)`
                  }`,
                  boxShadow: `0 1px 3px ${
                    isImproving
                      ? `rgba(127, 143, 122, 0.15)`
                      : isDeclining
                      ? `rgba(181, 103, 74, 0.15)`
                      : `rgba(148, 163, 184, 0.12)`
                  }`,
                }}
              >
                <div className="flex items-center gap-1.5">
                  {isImproving ? (
                    <TrendingUp className="w-4 h-4" style={{ color: improvedColor }} />
                  ) : isDeclining ? (
                    <TrendingDown className="w-4 h-4" style={{ color: declinedColor }} />
                  ) : (
                    <Minus className="w-4 h-4" style={{ color: COLORS.text.tertiary }} />
                  )}
                  <span
                    className={cn(
                      TYPOGRAPHY.body.fontSize,
                      TYPOGRAPHY.body.fontWeight
                    )}
                    style={{
                      color: isImproving
                        ? improvedColor
                        : isDeclining
                        ? declinedColor
                        : COLORS.text.tertiary,
                    }}
                  >
                    {isImproving ? "+" : ""}
                    {Math.round(diff)}점
                  </span>
                </div>
                <p
                  className={cn(
                    TYPOGRAPHY.caption.fontSize,
                    "mt-1 text-center"
                  )}
                  style={{ color: COLORS.text.tertiary }}
                >
                  변화
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* 주차별 점수 - 막대 그래프 스타일 */}
        <div className="space-y-3">
          <p
            className={cn(
              TYPOGRAPHY.bodySmall.fontSize,
              TYPOGRAPHY.bodySmall.fontWeight,
              "mb-3"
            )}
            style={{ color: COLORS.text.secondary }}
          >
            주차별 일치도
          </p>
          {scoreTimeline.map((item, idx) => (
            <WeekScoreItem
              key={idx}
              item={item}
              improvedColor={improvedColor}
              declinedColor={declinedColor}
              getScoreColor={getScoreColor}
              getScoreGradient={getScoreGradient}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// 일치도 점수 설명 팝업 컴포넌트
function AlignmentScoreInfoDialog({ vividColor }: { vividColor: string }) {
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

export function AlignmentAnalysisSection({
  alignmentAnalysis,
  vividColor,
  improvedColor,
  declinedColor,
}: AlignmentAnalysisSectionProps) {
  if (!alignmentAnalysis) return null;

  return (
    <div className="space-y-5">
      <GradientCard gradientColor="163, 191, 217">
        <div className="relative mb-8 pb-6 border-b" style={{ borderColor: `rgba(163, 191, 217, 0.2)` }}>
          <div className="flex items-start gap-4">
            {/* 번호 배지 - 더 세련된 스타일 */}
            <div className="relative flex-shrink-0">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${vividColor}, ${vividColor}cc)`,
                  boxShadow: `0 4px 12px ${vividColor}30, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
                }}
              >
                <span
                  className={cn(
                    TYPOGRAPHY.h3.fontSize,
                    TYPOGRAPHY.h3.fontWeight,
                    "relative z-10"
                  )}
                  style={{ color: "white" }}
                >
                  2
                </span>
                {/* 미묘한 그라데이션 오버레이 */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), transparent 70%)`,
                  }}
                />
              </div>
            </div>
            
            {/* 텍스트 영역 */}
            <div className="flex-1 pt-1">
              <h2
                className={cn(
                  TYPOGRAPHY.h2.fontSize,
                  TYPOGRAPHY.h2.fontWeight,
                  "mb-2"
                )}
                style={{ color: COLORS.text.primary }}
              >
                현재-미래 일치도 분석
              </h2>
              <p
                className={cn(
                  TYPOGRAPHY.body.fontSize,
                  "leading-relaxed"
                )}
                style={{ color: COLORS.text.secondary }}
              >
                현재 상태와 미래 목표 간의 일치도를 분석합니다
              </p>
            </div>
          </div>
        </div>

        {/* 일치도 점수 요약 */}
        {alignmentAnalysis.score_timeline &&
          alignmentAnalysis.score_timeline.length > 0 && (
            <ScoreSummaryContent
              scoreTimeline={alignmentAnalysis.score_timeline}
              improvedColor={improvedColor}
              declinedColor={declinedColor}
              vividColor={vividColor}
            />
          )}

        {/* 격차 분석 */}
        {alignmentAnalysis.gap_analysis?.biggest_gaps &&
          alignmentAnalysis.gap_analysis.biggest_gaps.length > 0 && (
            <div>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3 pb-3 border-b" style={{ borderColor: `rgba(163, 191, 217, 0.15)` }}>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${vividColor}dd, ${vividColor}bb)`,
                      boxShadow: `0 2px 8px ${vividColor}25, inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
                    }}
                  >
                    <span
                      className={cn(
                        TYPOGRAPHY.bodySmall.fontSize,
                        TYPOGRAPHY.bodySmall.fontWeight,
                        "relative z-10"
                      )}
                      style={{ color: "white" }}
                    >
                      2-2
                    </span>
                    <div
                      className="absolute inset-0 opacity-25"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), transparent 70%)`,
                      }}
                    />
                  </div>
                  <h3
                    className={cn(
                      TYPOGRAPHY.h3.fontSize,
                      TYPOGRAPHY.h3.fontWeight
                    )}
                    style={{ color: COLORS.text.primary }}
                  >
                    주요 격차
                  </h3>
                </div>
                <p
                  className={cn(
                    TYPOGRAPHY.caption.fontSize,
                    TYPOGRAPHY.body.lineHeight,
                    "ml-11"
                  )}
                  style={{ color: COLORS.text.tertiary }}
                >
                  현재 상태와 원하는 상태 사이의 가장 큰 차이점을 분석합니다
                </p>
              </div>
              <div className="space-y-4">
                {alignmentAnalysis.gap_analysis.biggest_gaps.map((gap, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl transition-all duration-300"
                    style={{
                      background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))`,
                      border: `1.5px solid rgba(163, 191, 217, 0.3)`,
                      boxShadow: `0 2px 8px rgba(163, 191, 217, 0.1)`,
                    }}
                  >
                    {/* 격차 제목/인사이트 */}
                    <div className="mb-4">
                      <div className="flex items-start gap-3 mb-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{
                            backgroundColor: `${vividColor}25`,
                            border: `1px solid ${vividColor}45`,
                          }}
                        >
                          <span
                            className={cn(
                              TYPOGRAPHY.bodySmall.fontSize,
                              TYPOGRAPHY.bodySmall.fontWeight
                            )}
                            style={{ color: vividColor }}
                          >
                            {idx + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p
                            className={cn(
                              TYPOGRAPHY.bodySmall.fontSize,
                              TYPOGRAPHY.bodySmall.fontWeight,
                              "mb-1"
                            )}
                            style={{ color: COLORS.text.primary }}
                          >
                            핵심 인사이트
                          </p>
                          <p
                            className={cn(
                              TYPOGRAPHY.body.fontSize,
                              TYPOGRAPHY.body.lineHeight
                            )}
                            style={{ color: COLORS.text.secondary }}
                          >
                            {gap.gap_description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 현재 vs 원하는 상태 비교 */}
                    <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: `rgba(163, 191, 217, 0.12)` }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: `${vividColor}80` }}
                            />
                            <p
                              className={cn(
                                TYPOGRAPHY.caption.fontSize,
                                TYPOGRAPHY.caption.fontWeight,
                                "uppercase"
                              )}
                              style={{ color: COLORS.text.tertiary }}
                            >
                              현재 상태
                            </p>
                          </div>
                          <p
                            className={cn(
                              TYPOGRAPHY.bodySmall.fontSize,
                              TYPOGRAPHY.body.lineHeight,
                              "pl-4"
                            )}
                            style={{ color: COLORS.text.primary }}
                          >
                            {gap.current_state}
                          </p>
                        </div>
                        <div className="relative">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: vividColor }}
                            />
                            <p
                              className={cn(
                                TYPOGRAPHY.caption.fontSize,
                                TYPOGRAPHY.caption.fontWeight,
                                "uppercase"
                              )}
                              style={{ color: COLORS.text.tertiary }}
                            >
                              원하는 상태
                            </p>
                          </div>
                          <p
                            className={cn(
                              TYPOGRAPHY.bodySmall.fontSize,
                              TYPOGRAPHY.body.lineHeight,
                              "pl-4"
                            )}
                            style={{ color: COLORS.text.primary }}
                          >
                            {gap.desired_state}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 실행 가능한 단계 */}
                    {gap.actionable_steps && gap.actionable_steps.length > 0 && (
                      <div className="pt-4 border-t" style={{ borderColor: `rgba(163, 191, 217, 0.25)` }}>
                        <div className="flex items-center gap-2 mb-3">
                          <Rocket className="w-4 h-4" style={{ color: vividColor }} />
                          <p
                            className={cn(
                              TYPOGRAPHY.bodySmall.fontSize,
                              TYPOGRAPHY.bodySmall.fontWeight
                            )}
                            style={{ color: COLORS.text.primary }}
                          >
                            다음 단계
                          </p>
                        </div>
                        <ul className="space-y-2.5">
                          {gap.actionable_steps.map((step, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-3">
                              <div
                                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{
                                  backgroundColor: `rgba(163, 191, 217, 0.12)`,
                                  border: `1px solid rgba(163, 191, 217, 0.25)`,
                                }}
                              >
                                <span
                                  className={cn(
                                    TYPOGRAPHY.caption.fontSize,
                                    TYPOGRAPHY.caption.fontWeight
                                  )}
                                  style={{ color: vividColor }}
                                >
                                  {sIdx + 1}
                                </span>
                              </div>
                              <p
                                className={cn(
                                  TYPOGRAPHY.bodySmall.fontSize,
                                  TYPOGRAPHY.body.lineHeight,
                                  "flex-1 pt-0.5"
                                )}
                                style={{ color: COLORS.text.primary }}
                              >
                                {step}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
      </GradientCard>
    </div>
  );
}
