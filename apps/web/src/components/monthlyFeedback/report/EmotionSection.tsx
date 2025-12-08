"use client";

import React, { useEffect, useRef } from "react";
import {
  Heart,
  Lock,
  ArrowRight,
  Zap,
  Sparkles,
  AlertTriangle,
  Cloud,
  Smile,
  AlertCircle,
} from "lucide-react";
import { Card } from "../../ui/card";
import type { EmotionReport } from "@/types/monthly-feedback-new";
import { COLORS } from "@/lib/design-system";
import { useRouter } from "next/navigation";
import { EmotionChart } from "../../weeklyFeedback/report/emotionSection/EmotionChart";
import {
  TooltipProvider,
  useTooltip,
} from "../../weeklyFeedback/report/emotionSection/TooltipContext";

type EmotionSectionProps = {
  emotionReport: EmotionReport;
  isPro?: boolean;
};

const EMOTION_COLOR = "#B89A7A";

// 감정 사분면 아이콘 매핑 (주간 리포트와 동일)
const QUADRANT_ICONS: Record<
  "몰입·설렘" | "불안·초조" | "슬픔·무기력" | "안도·평온",
  React.ReactNode
> = {
  "불안·초조": <AlertTriangle className="w-4 h-4" />,
  "몰입·설렘": <Zap className="w-4 h-4" />,
  "슬픔·무기력": <Cloud className="w-4 h-4" />,
  "안도·평온": <Sparkles className="w-4 h-4" />,
};

// 감정 사분면 제목 매핑
const QUADRANT_TITLES: Record<
  "몰입·설렘" | "불안·초조" | "슬픔·무기력" | "안도·평온",
  string
> = {
  "불안·초조": "불안·초조를 느끼는 상황",
  "몰입·설렘": "몰입·설렘을 느끼는 상황",
  "슬픔·무기력": "슬픔·무기력을 느끼는 상황",
  "안도·평온": "안도·평온을 느끼는 상황",
};

export function EmotionSection({
  emotionReport,
  isPro = false,
}: EmotionSectionProps) {
  return (
    <TooltipProvider>
      <EmotionSectionContent emotionReport={emotionReport} isPro={isPro} />
    </TooltipProvider>
  );
}

function EmotionSectionContent({
  emotionReport,
  isPro = false,
}: EmotionSectionProps) {
  const router = useRouter();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { setSelectedDayIndex } = useTooltip();

  console.log("[EmotionSection] emotionReport:", emotionReport);

  // 외부 클릭/터치 감지하여 선택 해제
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        chartContainerRef.current &&
        !chartContainerRef.current.contains(event.target as Node)
      ) {
        setSelectedDayIndex(null);
      }
    };

    // 클릭과 터치 이벤트 모두 처리
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [setSelectedDayIndex]);

  if (!emotionReport) {
    return null;
  }

  // 사분면 데이터 준비 및 정렬 (주간 리포트와 동일한 순서)
  const quadrantOrder: Array<
    "불안·초조" | "몰입·설렘" | "슬픔·무기력" | "안도·평온"
  > = ["불안·초조", "몰입·설렘", "슬픔·무기력", "안도·평온"];

  const quadrantData =
    emotionReport.emotion_quadrant_distribution?.map((item) => ({
      ...item,
      ratio: item.ratio * 100,
      icon: QUADRANT_ICONS[item.quadrant],
      title: QUADRANT_TITLES[item.quadrant],
    })) || [];

  // 순서대로 정렬 - 4개 사분면 모두 포함 (데이터가 없어도 0%로 표시)
  const sortedQuadrantData = quadrantOrder.map((quadrant) => {
    const existingData = quadrantData.find(
      (item) => item.quadrant === quadrant
    );
    if (existingData) {
      return existingData;
    }
    // 데이터가 없으면 기본값 반환
    return {
      quadrant,
      count: 0,
      ratio: 0,
      explanation: "해당 데이터에 대한 정보는 없었습니다.",
      icon: QUADRANT_ICONS[quadrant],
      title: QUADRANT_TITLES[quadrant],
    };
  });

  // 월간 평균 감정 데이터
  const monthlyAverage =
    emotionReport &&
    emotionReport.monthly_ai_mood_valence_avg !== null &&
    emotionReport.monthly_ai_mood_arousal_avg !== null
      ? {
          valence: emotionReport.monthly_ai_mood_valence_avg,
          arousal: emotionReport.monthly_ai_mood_arousal_avg,
        }
      : null;

  const valence = monthlyAverage?.valence ?? 0;
  const arousal = monthlyAverage?.arousal ?? 0;

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

      {/* 감정 분석 통합 카드 */}
      {(emotionReport.emotion_quadrant_analysis_summary ||
        emotionReport.emotion_quadrant_dominant ||
        emotionReport.emotion_stability_score !== undefined ||
        emotionReport.emotion_pattern_summary) && (
        <Card
          className="mb-4 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
            border: "1px solid #E6D5C3",
            borderRadius: "16px",
          }}
        >
          {/* 헤더 */}
          <div
            className="p-5 sm:p-6 pb-4 border-b"
            style={{ borderColor: "rgba(184, 154, 122, 0.2)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#F5E6D3" }}
              >
                <Heart className="w-4 h-4" style={{ color: EMOTION_COLOR }} />
              </div>
              <p
                className="text-sm font-semibold uppercase tracking-wide"
                style={{ color: COLORS.text.secondary }}
              >
                감정 분석 요약
              </p>
            </div>
          </div>
          {/* 바디 */}
          <div className="p-5 sm:p-6 pt-4 space-y-6">
            {/* 감정 분석 요약 */}
            {emotionReport.emotion_quadrant_analysis_summary && (
              <div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
                >
                  {emotionReport.emotion_quadrant_analysis_summary}
                </p>
              </div>
            )}

            {/* 주요 감정 영역 */}
            {emotionReport.emotion_quadrant_dominant && (
              <div>
                <p
                  className="text-xs mb-2 font-semibold uppercase tracking-wide"
                  style={{ color: COLORS.text.secondary }}
                >
                  주요 감정 영역
                </p>
                <p
                  className="text-lg sm:text-xl font-bold mb-1"
                  style={{ color: COLORS.text.primary }}
                >
                  {emotionReport.emotion_quadrant_dominant}
                </p>
              </div>
            )}

            {/* 감정 패턴 요약 */}
            {emotionReport.emotion_pattern_summary && (
              <div>
                <p
                  className="text-xs mb-3 font-semibold uppercase tracking-wide"
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
            )}
          </div>
        </Card>
      )}

      {/* 감정 사분면 분포 - 카드 */}
      {sortedQuadrantData.length > 0 && (
        <div className="mb-10 sm:mb-12">
          {/* 감정 차트 */}
          {monthlyAverage && (
            <Card
              className="mb-6 overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #E6D5C3",
                borderRadius: "16px",
              }}
            >
              {/* 헤더 */}
              <div
                className="p-5 sm:p-6 pb-4 border-b"
                style={{ borderColor: "rgba(184, 154, 122, 0.2)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#F5E6D3" }}
                  >
                    <Heart
                      className="w-4 h-4"
                      style={{ color: EMOTION_COLOR }}
                    />
                  </div>
                  <p
                    className="text-sm font-semibold uppercase tracking-wide"
                    style={{ color: COLORS.text.secondary }}
                  >
                    월간 평균 감정 좌표
                  </p>
                </div>
              </div>
              {/* 바디 */}
              <div className="p-5 sm:p-6 pt-4">
                <EmotionChart
                  dailyEmotions={[]}
                  valence={valence}
                  arousal={arousal}
                  chartContainerRef={chartContainerRef}
                  hideCard={true}
                />
              </div>
            </Card>
          )}

          {/* 감정 사분면 분포 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-4">
            {sortedQuadrantData.map((item, idx) => (
              <Card
                key={idx}
                className="p-4 sm:p-5 transition-all duration-300 hover:shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                  border: "1px solid rgba(184, 154, 122, 0.2)",
                  borderRadius: "12px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* 헤더 */}
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-transform duration-300 hover:scale-110 flex-shrink-0"
                    style={{
                      backgroundColor: "rgba(139, 111, 71, 0.15)",
                      color: "#8B6F47",
                    }}
                  >
                    {item.icon}
                  </div>
                  <h4
                    className="text-xs sm:text-sm font-semibold flex-1 leading-tight"
                    style={{ color: COLORS.text.primary }}
                  >
                    {item.title}
                  </h4>
                </div>

                {/* 비율 및 설명 */}
                <div className="space-y-2 sm:space-y-3">
                  {/* 비율 표시 */}
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-base sm:text-lg font-semibold"
                      style={{ color: "#8B6F47" }}
                    >
                      {item.ratio.toFixed(1)}%
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: COLORS.text.muted }}
                    >
                      ({item.count}회)
                    </span>
                  </div>

                  {/* 설명 */}
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"
                      style={{ backgroundColor: "#8B6F47" }}
                    />
                    <p
                      className="text-xs sm:text-sm leading-relaxed flex-1"
                      style={{
                        color:
                          item.count === 0
                            ? COLORS.text.muted
                            : COLORS.text.primary,
                      }}
                    >
                      {item.explanation}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 감정 트리거 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* 긍정 트리거 */}
        {emotionReport.positive_triggers &&
          emotionReport.positive_triggers.length > 0 && (
            <Card
              className="overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #E6D5C3",
                borderRadius: "16px",
              }}
            >
              {/* 헤더 */}
              <div
                className="p-5 sm:p-6 pb-4 border-b"
                style={{ borderColor: "rgba(184, 154, 122, 0.2)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#F5E6D3" }}
                  >
                    <Smile
                      className="w-4 h-4"
                      style={{ color: EMOTION_COLOR }}
                    />
                  </div>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    긍정 감정 트리거
                  </p>
                </div>
              </div>
              {/* 바디 */}
              <div className="p-5 sm:p-6 pt-4">
                <div className="flex-1">
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
              className="overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #E6D5C3",
                borderRadius: "16px",
              }}
            >
              {/* 헤더 */}
              <div
                className="p-5 sm:p-6 pb-4 border-b"
                style={{ borderColor: "rgba(184, 154, 122, 0.2)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#F5E6D3" }}
                  >
                    <AlertCircle
                      className="w-4 h-4"
                      style={{ color: EMOTION_COLOR }}
                    />
                  </div>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    부정 감정 트리거
                  </p>
                </div>
              </div>
              {/* 바디 */}
              <div className="p-5 sm:p-6 pt-4">
                <div className="flex-1">
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
      {isPro &&
        (emotionReport.emotion_stability_score !== undefined ||
          (emotionReport.emotion_stability_guidelines &&
            emotionReport.emotion_stability_guidelines.length > 0)) && (
          <Card
            className="mb-4 overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
              border: "1px solid #E6D5C3",
              borderRadius: "16px",
            }}
          >
            {/* 헤더 */}
            <div
              className="p-5 sm:p-6 pb-4 border-b"
              style={{ borderColor: "rgba(184, 154, 122, 0.2)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#F5E6D3" }}
                >
                  <Sparkles
                    className="w-4 h-4"
                    style={{ color: EMOTION_COLOR }}
                  />
                </div>
                <p
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: COLORS.text.secondary }}
                >
                  감정 안정성 분석
                </p>
              </div>
            </div>
            {/* 바디 */}
            <div className="p-5 sm:p-6 pt-4 space-y-6">
              {/* 감정 안정성 점수 */}
              {emotionReport.emotion_stability_score !== undefined && (
                <div>
                  <p
                    className="text-sm mb-2 font-semibold uppercase tracking-wide"
                    style={{ color: COLORS.text.secondary }}
                  >
                    감정 안정성 점수
                  </p>
                  <p
                    className="text-3xl sm:text-4xl font-bold mb-2"
                    style={{ color: EMOTION_COLOR }}
                  >
                    {emotionReport.emotion_stability_score}/10
                  </p>
                  {emotionReport.emotion_stability_explanation && (
                    <p
                      className="text-sm mt-2 leading-relaxed"
                      style={{
                        color: COLORS.text.secondary,
                        lineHeight: "1.6",
                      }}
                    >
                      {emotionReport.emotion_stability_explanation}
                    </p>
                  )}
                </div>
              )}

              {/* 가이드라인 */}
              {emotionReport.emotion_stability_guidelines &&
                emotionReport.emotion_stability_guidelines.length > 0 && (
                  <div>
                    <p
                      className="text-sm mb-3 font-semibold uppercase tracking-wide"
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
                )}
            </div>
          </Card>
        )}

      {/* 행동 제안 */}
      {isPro &&
        emotionReport.emotion_stability_actions &&
        emotionReport.emotion_stability_actions.length > 0 && (
          <Card
            className="mb-4 overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
              border: "1px solid #E6D5C3",
              borderRadius: "16px",
            }}
          >
            {/* 헤더 */}
            <div
              className="p-5 sm:p-6 pb-4 border-b"
              style={{ borderColor: "rgba(184, 154, 122, 0.2)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#F5E6D3" }}
                >
                  <Heart className="w-4 h-4" style={{ color: EMOTION_COLOR }} />
                </div>
                <p
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: COLORS.text.secondary }}
                >
                  실천 가능한 행동 제안
                </p>
              </div>
            </div>
            {/* 바디 */}
            <div className="p-5 sm:p-6 pt-4">
              <div className="flex-1">
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

      {/* AI 코멘트 */}
      {emotionReport.emotion_ai_comment && (
        <Card
          className="mb-4 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
            border: "1px solid #E6D5C3",
            borderRadius: "16px",
          }}
        >
          {/* 헤더 */}
          <div
            className="p-5 sm:p-6 pb-4 border-b"
            style={{ borderColor: "rgba(184, 154, 122, 0.2)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#F5E6D3" }}
              >
                <Sparkles
                  className="w-4 h-4"
                  style={{ color: EMOTION_COLOR }}
                />
              </div>
              <p
                className="text-xs font-semibold"
                style={{ color: COLORS.text.secondary }}
              >
                AI 코멘트
              </p>
            </div>
          </div>
          {/* 바디 */}
          <div className="p-5 sm:p-6 pt-4">
            <p
              className="text-sm leading-relaxed"
              style={{ color: COLORS.text.primary, lineHeight: "1.7" }}
            >
              {emotionReport.emotion_ai_comment}
            </p>
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
