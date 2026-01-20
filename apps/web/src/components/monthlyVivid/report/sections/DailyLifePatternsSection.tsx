"use client";

import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Minus,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { MonthlyReport } from "@/types/monthly-vivid";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import {
  GradientCard,
} from "@/components/common/feedback";
import { ScrollAnimation } from "@/components/ui/ScrollAnimation";

/**
 * 날짜 목록 드롭다운 컴포넌트
 * 기본적으로 접혀있고, 클릭하면 펼쳐지는 형태
 */
function DateListDropdown({
  dates,
  color,
}: {
  dates: string[];
  color: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (dates.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between mb-2 transition-all duration-200 hover:opacity-80"
      >
        <p
          className={cn(
            TYPOGRAPHY.caption.fontSize,
            TYPOGRAPHY.caption.fontWeight
          )}
          style={{ color: COLORS.text.tertiary }}
        >
          기록 일자 보기 ({dates.length}개)
        </p>
        <div className="flex items-center gap-1">
          {isOpen ? (
            <ChevronUp className="w-4 h-4" style={{ color: color }} />
          ) : (
            <ChevronDown className="w-4 h-4" style={{ color: color }} />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="mt-2 space-y-2">
          <div className="flex flex-col gap-1.5">
            {dates.map((date, idx) => (
              <p
                key={idx}
                className={cn(TYPOGRAPHY.bodySmall.fontSize)}
                style={{ color: COLORS.text.tertiary }}
              >
                {date}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type DailyLifePatternsSectionProps = {
  dailyLifePatterns: MonthlyReport["daily_life_patterns"];
  vividColor: string;
  improvedColor: string;
  declinedColor: string;
};

export function DailyLifePatternsSection({
  dailyLifePatterns,
  vividColor,
  improvedColor,
  declinedColor,
}: DailyLifePatternsSectionProps) {
  if (!dailyLifePatterns) return null;

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
                  3
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
                하루 패턴 인사이트
              </h2>
              <p
                className={cn(
                  TYPOGRAPHY.body.fontSize,
                  "leading-relaxed"
                )}
                style={{ color: COLORS.text.secondary }}
              >
                일상에서 반복되는 패턴과 변화를 분석합니다
              </p>
            </div>
          </div>
        </div>

        {/* 반복되는 패턴 */}
        {dailyLifePatterns.recurring_patterns &&
          dailyLifePatterns.recurring_patterns.length > 0 && (
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
                    3-1
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
                  반복되는 패턴
                </h3>
              </div>
              <div className="space-y-3">
                {dailyLifePatterns.recurring_patterns.map((pattern, idx) => (
                  <div
                    key={idx}
                    className="relative p-4 rounded-lg overflow-visible"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.6)",
                      border: "1px solid rgba(163, 191, 217, 0.3)",
                    }}
                  >
                    {/* 번호 표시 - 포스트잇 스타일 (왼쪽 위, 작게) */}
                    <div
                      className="absolute -left-2 -top-2 w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: `${vividColor}`,
                        border: `2px solid white`,
                        boxShadow: `0 2px 6px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.1)`,
                        transform: `rotate(-3deg)`,
                      }}
                    >
                      <span
                        className={cn(
                          TYPOGRAPHY.caption.fontSize,
                          TYPOGRAPHY.caption.fontWeight
                        )}
                        style={{ color: "white" }}
                      >
                        {idx + 1}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p
                        className={cn(
                          TYPOGRAPHY.body.fontSize,
                          "font-semibold flex-1"
                        )}
                        style={{ color: COLORS.text.primary }}
                      >
                        {pattern.pattern}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {pattern.impact === "positive" ? (
                          <CheckCircle2
                            className="w-4 h-4"
                            style={{ color: "#4CAF50" }}
                          />
                        ) : pattern.impact === "negative" ? (
                          <XCircle
                            className="w-4 h-4"
                            style={{ color: "#FF9800" }}
                          />
                        ) : (
                          <Minus
                            className="w-4 h-4"
                            style={{ color: COLORS.text.tertiary }}
                          />
                        )}
                        <span
                          className={cn(
                            TYPOGRAPHY.bodySmall.fontSize,
                            "px-2 py-0.5 rounded"
                          )}
                          style={{
                            backgroundColor: "#E8F0F8",
                            color: "#5A7A9A",
                          }}
                        >
                          {pattern.frequency}회
                        </span>
                      </div>
                    </div>
                    <p
                      className={cn(
                        TYPOGRAPHY.body.fontSize,
                        TYPOGRAPHY.body.lineHeight,
                        "mb-2"
                      )}
                      style={{ color: COLORS.text.secondary }}
                    >
                      {pattern.why_it_matters}
                    </p>
                    {pattern.days && pattern.days.length > 0 && (
                      <DateListDropdown
                        dates={pattern.days}
                        color={vividColor}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* 주차별 진화 */}
        {dailyLifePatterns.weekly_evolution &&
          dailyLifePatterns.weekly_evolution.length > 0 && (
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
                    3-2
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
                  주차별 진화
                </h3>
              </div>
              <div className="space-y-4">
                {dailyLifePatterns.weekly_evolution.map((week, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.6)",
                      border: "1px solid rgba(163, 191, 217, 0.3)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar
                        className="w-4 h-4"
                        style={{ color: vividColor }}
                      />
                      <p
                        className={cn(
                          TYPOGRAPHY.body.fontSize,
                          "font-semibold"
                        )}
                        style={{ color: COLORS.text.primary }}
                      >
                        {week.week}주차
                      </p>
                    </div>
                    {week.dominant_activities &&
                      week.dominant_activities.length > 0 && (
                        <div className="mb-2">
                          <p
                            className={cn(
                              TYPOGRAPHY.bodySmall.fontSize,
                              "mb-1"
                            )}
                            style={{ color: COLORS.text.tertiary }}
                          >
                            주요 활동:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {week.dominant_activities.map((activity, aIdx) => (
                              <span
                                key={aIdx}
                                className={cn(
                                  TYPOGRAPHY.bodySmall.fontSize,
                                  "px-2 py-0.5 rounded"
                                )}
                                style={{
                                  backgroundColor: "#E8F0F8",
                                  color: "#5A7A9A",
                                }}
                              >
                                {activity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    {week.dominant_keywords &&
                      week.dominant_keywords.length > 0 && (
                        <div className="mb-2">
                          <p
                            className={cn(
                              TYPOGRAPHY.bodySmall.fontSize,
                              "mb-1"
                            )}
                            style={{ color: COLORS.text.tertiary }}
                          >
                            주요 키워드:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {week.dominant_keywords.map((keyword, kIdx) => (
                              <span
                                key={kIdx}
                                className={cn(
                                  TYPOGRAPHY.bodySmall.fontSize,
                                  "px-2 py-0.5 rounded"
                                )}
                                style={{
                                  backgroundColor: "#E8F0F8",
                                  color: "#5A7A9A",
                                }}
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    <p
                      className={cn(
                        TYPOGRAPHY.body.fontSize,
                        TYPOGRAPHY.body.lineHeight,
                        "mt-2"
                      )}
                      style={{ color: COLORS.text.secondary }}
                    >
                      {week.narrative}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* 평가 테마 */}
        {dailyLifePatterns.evaluation_themes && (
          <ScrollAnimation>
            <div className="mb-8">
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
                      3-3
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
                    평가 테마
                  </h3>
                </div>
                <p
                  className={cn(
                    TYPOGRAPHY.caption.fontSize,
                    TYPOGRAPHY.body.lineHeight,
                    "ml-8"
                  )}
                  style={{ color: COLORS.text.tertiary }}
                >
                  한 달간의 기록에서 반복적으로 나타난 강점과 개선이 필요한 영역을 분석합니다
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 강점 */}
                {dailyLifePatterns.evaluation_themes.strengths &&
                  dailyLifePatterns.evaluation_themes.strengths.length >
                    0 && (
                    <div
                      className="rounded-xl transition-all duration-300"
                      style={{
                        background: `linear-gradient(135deg, rgba(127, 143, 122, 0.12), rgba(127, 143, 122, 0.06))`,
                        border: `1.5px solid rgba(127, 143, 122, 0.3)`,
                        boxShadow: `0 2px 8px rgba(127, 143, 122, 0.1)`,
                      }}
                    >
                      {/* 헤더 */}
                      <div
                        className="p-4 pb-3 border-b"
                        style={{ borderColor: `rgba(127, 143, 122, 0.2)` }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, ${improvedColor}dd, ${improvedColor}bb)`,
                              boxShadow: `0 2px 8px ${improvedColor}25, inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
                            }}
                          >
                            <CheckCircle2
                              className="w-4 h-4 relative z-10"
                              style={{ color: "white" }}
                            />
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
                            강점
                          </h3>
                        </div>
                      </div>

                      {/* 내용 */}
                      <div className="p-4 space-y-3">
                        {dailyLifePatterns.evaluation_themes.strengths.map(
                          (strength, idx) => (
                            <div
                              key={idx}
                              className="relative p-4 rounded-lg transition-all duration-200 hover:shadow-md overflow-visible"
                              style={{
                                backgroundColor: "rgba(255, 255, 255, 0.7)",
                                border: `1px solid rgba(127, 143, 122, 0.25)`,
                              }}
                            >
                              {/* 번호 표시 - 포스트잇 스타일 (왼쪽 위, 작게) */}
                              <div
                                className="absolute -left-2 -top-2 w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                                style={{
                                  backgroundColor: improvedColor,
                                  border: `2px solid white`,
                                  boxShadow: `0 2px 6px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.1)`,
                                  transform: `rotate(-3deg)`,
                                }}
                              >
                                <span
                                  className={cn(
                                    TYPOGRAPHY.caption.fontSize,
                                    TYPOGRAPHY.caption.fontWeight
                                  )}
                                  style={{ color: "white" }}
                                >
                                  {idx + 1}
                                </span>
                              </div>
                              {/* 영역 제목 */}
                              <div className="flex items-start gap-3 mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <p
                                      className={cn(
                                        TYPOGRAPHY.body.fontSize,
                                        TYPOGRAPHY.body.fontWeight
                                      )}
                                      style={{ color: COLORS.text.primary }}
                                    >
                                      {strength.theme}
                                    </p>
                                    <span
                                      className={cn(
                                        TYPOGRAPHY.bodySmall.fontSize,
                                        "px-2.5 py-1 rounded-md font-semibold whitespace-nowrap"
                                      )}
                                      style={{
                                        backgroundColor: "rgba(127, 143, 122, 0.2)",
                                        color: improvedColor,
                                        border: `1.5px solid rgba(127, 143, 122, 0.4)`,
                                      }}
                                    >
                                      {strength.frequency}회
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* 예시 */}
                              {strength.examples &&
                                strength.examples.length > 0 && (
                                  <div className="mb-3">
                                    <p
                                      className={cn(
                                        TYPOGRAPHY.caption.fontSize,
                                        TYPOGRAPHY.caption.fontWeight,
                                        "mb-2"
                                      )}
                                      style={{ color: COLORS.text.tertiary }}
                                    >
                                      예시
                                    </p>
                                    <div className="space-y-2">
                                      {strength.examples
                                        .slice(0, 2)
                                        .map((example, eIdx) => (
                                          <div
                                            key={eIdx}
                                            className="p-3 rounded-md"
                                            style={{
                                              backgroundColor: `rgba(127, 143, 122, 0.1)`,
                                            }}
                                          >
                                            <p
                                              className={cn(
                                                TYPOGRAPHY.bodySmall.fontSize,
                                                TYPOGRAPHY.body.lineHeight
                                              )}
                                              style={{
                                                color: COLORS.text.secondary,
                                              }}
                                            >
                                              {example}
                                            </p>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}

                              {/* 유지 방법 */}
                              {strength.how_to_maintain && (
                                <div className="mb-3">
                                  <p
                                    className={cn(
                                      TYPOGRAPHY.caption.fontSize,
                                      TYPOGRAPHY.caption.fontWeight,
                                      "mb-2"
                                    )}
                                    style={{ color: COLORS.text.tertiary }}
                                  >
                                    유지 방법
                                  </p>
                                  <div
                                    className="p-3 rounded-md"
                                    style={{
                                      backgroundColor: `rgba(127, 143, 122, 0.1)`,
                                    }}
                                  >
                                    <p
                                      className={cn(
                                        TYPOGRAPHY.bodySmall.fontSize,
                                        TYPOGRAPHY.body.lineHeight
                                      )}
                                      style={{ color: COLORS.text.secondary }}
                                    >
                                      {strength.how_to_maintain}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* 개선점 */}
                {dailyLifePatterns.evaluation_themes.improvements &&
                  dailyLifePatterns.evaluation_themes.improvements.length >
                    0 && (
                    <div
                      className="rounded-xl transition-all duration-300"
                      style={{
                        background: `linear-gradient(135deg, rgba(181, 103, 74, 0.12), rgba(181, 103, 74, 0.06))`,
                        border: `1.5px solid rgba(181, 103, 74, 0.3)`,
                        boxShadow: `0 2px 8px rgba(181, 103, 74, 0.1)`,
                      }}
                    >
                      {/* 헤더 */}
                      <div
                        className="p-4 pb-3 border-b"
                        style={{ borderColor: `rgba(181, 103, 74, 0.2)` }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, ${declinedColor}dd, ${declinedColor}bb)`,
                              boxShadow: `0 2px 8px ${declinedColor}25, inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
                            }}
                          >
                            <TrendingUp
                              className="w-4 h-4 relative z-10"
                              style={{ color: "white" }}
                            />
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
                            개선점
                          </h3>
                        </div>
                      </div>

                      {/* 내용 */}
                      <div className="p-4 space-y-3">
                        {dailyLifePatterns.evaluation_themes.improvements.map(
                          (improvement, idx) => (
                            <div
                              key={idx}
                              className="relative p-4 rounded-lg transition-all duration-200 hover:shadow-md overflow-visible"
                              style={{
                                backgroundColor: "rgba(255, 255, 255, 0.7)",
                                border: `1px solid rgba(181, 103, 74, 0.25)`,
                              }}
                            >
                              {/* 번호 표시 - 포스트잇 스타일 (왼쪽 위, 작게) */}
                              <div
                                className="absolute -left-2 -top-2 w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                                style={{
                                  backgroundColor: declinedColor,
                                  border: `2px solid white`,
                                  boxShadow: `0 2px 6px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.1)`,
                                  transform: `rotate(-3deg)`,
                                }}
                              >
                                <span
                                  className={cn(
                                    TYPOGRAPHY.caption.fontSize,
                                    TYPOGRAPHY.caption.fontWeight
                                  )}
                                  style={{ color: "white" }}
                                >
                                  {idx + 1}
                                </span>
                              </div>
                              {/* 영역 제목 */}
                              <div className="flex items-start gap-3 mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <p
                                      className={cn(
                                        TYPOGRAPHY.body.fontSize,
                                        TYPOGRAPHY.body.fontWeight
                                      )}
                                      style={{ color: COLORS.text.primary }}
                                    >
                                      {improvement.theme}
                                    </p>
                                    <span
                                      className={cn(
                                        TYPOGRAPHY.bodySmall.fontSize,
                                        "px-2.5 py-1 rounded-md font-semibold whitespace-nowrap"
                                      )}
                                      style={{
                                        backgroundColor: "rgba(181, 103, 74, 0.2)",
                                        color: declinedColor,
                                        border: `1.5px solid rgba(181, 103, 74, 0.4)`,
                                      }}
                                    >
                                      {improvement.frequency}회
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* 예시 */}
                              {improvement.examples &&
                                improvement.examples.length > 0 && (
                                  <div className="mb-3">
                                    <p
                                      className={cn(
                                        TYPOGRAPHY.caption.fontSize,
                                        TYPOGRAPHY.caption.fontWeight,
                                        "mb-2"
                                      )}
                                      style={{ color: COLORS.text.tertiary }}
                                    >
                                      예시
                                    </p>
                                    <div className="space-y-2">
                                      {improvement.examples
                                        .slice(0, 2)
                                        .map((example, eIdx) => (
                                          <div
                                            key={eIdx}
                                            className="p-3 rounded-md"
                                            style={{
                                              backgroundColor: `rgba(181, 103, 74, 0.1)`,
                                            }}
                                          >
                                            <p
                                              className={cn(
                                                TYPOGRAPHY.bodySmall.fontSize,
                                                TYPOGRAPHY.body.lineHeight
                                              )}
                                              style={{
                                                color: COLORS.text.secondary,
                                              }}
                                            >
                                              {example}
                                            </p>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}

                              {/* 실행 단계 */}
                              {improvement.actionable_steps &&
                                improvement.actionable_steps.length > 0 && (
                                  <div className="mb-3">
                                    <p
                                      className={cn(
                                        TYPOGRAPHY.caption.fontSize,
                                        TYPOGRAPHY.caption.fontWeight,
                                        "mb-2"
                                      )}
                                      style={{ color: COLORS.text.tertiary }}
                                    >
                                      실행 단계
                                    </p>
                                    <div
                                      className="p-3 rounded-md space-y-2"
                                      style={{
                                        backgroundColor: `rgba(181, 103, 74, 0.1)`,
                                      }}
                                    >
                                      {improvement.actionable_steps
                                        .slice(0, 2)
                                        .map((step, sIdx) => (
                                          <div
                                            key={sIdx}
                                            className="flex items-start gap-2"
                                          >
                                            <div
                                              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                                              style={{
                                                backgroundColor: declinedColor,
                                              }}
                                            />
                                            <p
                                              className={cn(
                                                TYPOGRAPHY.bodySmall.fontSize,
                                                TYPOGRAPHY.body.lineHeight
                                              )}
                                              style={{
                                                color: COLORS.text.secondary,
                                              }}
                                            >
                                              {step}
                                            </p>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </ScrollAnimation>
        )}
      </GradientCard>
    </div>
  );
}
