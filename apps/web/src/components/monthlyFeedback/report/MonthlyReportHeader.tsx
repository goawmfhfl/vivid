"use client";

import {
  CalendarDays,
  TrendingUp,
  Sparkles,
  Lock,
  Crown,
  Info,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { COLORS } from "@/lib/design-system";
import type { SummaryReport } from "@/types/monthly-feedback-new";
import { useCountUp } from "@/hooks/useCountUp";

// 흰색 배경용 원형 프로그래스 컴포넌트
function WhiteCircularProgress({
  percentage,
  size = 80,
  strokeWidth = 8,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) {
  const [displayPercentage, containerRef] = useCountUp({
    targetValue: percentage,
    duration: 1500,
    delay: 200,
    triggerOnVisible: true,
    threshold: 0.2,
    rootMargin: "0px 0px -50px 0px",
  });

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (displayPercentage / 100) * circumference;

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
        style={{ width: size, height: size }}
      >
        {/* 배경 원 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={strokeWidth}
        />
        {/* 진행 원 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
          style={{
            transition: "stroke-dashoffset 0.7s ease-out",
          }}
        />
      </svg>
    </div>
  );
}

type MonthlyReportHeaderProps = {
  monthLabel: string;
  dateRange: {
    start_date: string;
    end_date: string;
  };
  summaryReport: SummaryReport;
  isPro?: boolean;
};

// 프로그래스 바 컴포넌트
function ScoreProgressBar({
  label,
  value,
  max = 10,
  showValue = true,
  delay = 0,
}: {
  label: string;
  value: number;
  max?: number;
  showValue?: boolean;
  delay?: number;
}) {
  // 10점 만점을 100점 만점으로 변환
  const targetValue = (value / max) * 100;
  const [displayValue, containerRef] = useCountUp({
    targetValue: targetValue,
    duration: 1200,
    delay: delay,
    triggerOnVisible: true,
    threshold: 0.2,
    rootMargin: "0px 0px -50px 0px",
  });

  const percentage = Math.min(Math.max(displayValue, 0), 100);

  return (
    <div ref={containerRef} className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ opacity: 0.85 }}>
          {label}
        </span>
        {showValue && (
          <span className="text-xs font-semibold" style={{ opacity: 0.95 }}>
            {Math.round(displayValue)}
          </span>
        )}
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.2)",
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            background:
              "linear-gradient(90deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)",
            boxShadow: "0 2px 8px rgba(255, 255, 255, 0.3)",
          }}
        />
      </div>
    </div>
  );
}

export function MonthlyReportHeader({
  monthLabel,
  dateRange,
  summaryReport,
  isPro = false,
}: MonthlyReportHeaderProps) {
  const router = useRouter();

  // 날짜 포맷팅 (YYYY-MM-DD -> YYYY.MM.DD)
  const formatDate = (dateStr: string) => {
    return dateStr.replace(/-/g, ".");
  };

  // 종합 점수 애니메이션 적용 (이미 100점 만점)
  const monthlyScore = summaryReport?.monthly_score || 0;
  const [displayMonthlyScore, monthlyScoreRef] = useCountUp({
    targetValue: monthlyScore,
    duration: 1500,
    delay: 200,
    triggerOnVisible: true,
    threshold: 0.2,
    rootMargin: "0px 0px -50px 0px",
  });

  console.log("[MonthlyReportHeader] summaryReport:", summaryReport);

  return (
    <div className="mb-8 sm:mb-10">
      {/* Main Header Card */}
      <div
        className="p-6 sm:p-8 rounded-3xl relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #A8BBA8 0%, #6B7A6F 100%)",
          color: "white",
        }}
      >
        {/* 배경 장식 요소 */}
        <div
          className="absolute top-0 right-0 w-64 h-64 opacity-10"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, transparent 70%)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 opacity-10"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)",
            transform: "translate(-30%, 30%)",
          }}
        />

        <div className="relative z-10">
          {/* Month Range & Title */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="w-5 h-5" style={{ opacity: 0.9 }} />
              <p className="text-xs" style={{ opacity: 0.9 }}>
                월간 리포트
              </p>
            </div>
            <h1 className="text-2xl sm:text-3xl mb-2 font-semibold">
              {summaryReport?.summary_title || monthLabel}
            </h1>
            <p className="text-sm" style={{ opacity: 0.85 }}>
              {formatDate(dateRange.start_date)} –{" "}
              {formatDate(dateRange.end_date)}
            </p>
          </div>

          {/* Monthly Summary Description */}
          {summaryReport?.summary_description && (
            <div
              className="py-5 px-6 rounded-2xl mb-5 backdrop-blur-sm"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <div className="flex items-start gap-3">
                <TrendingUp
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  style={{ opacity: 0.9 }}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs mb-2"
                    style={{ opacity: 0.85, fontWeight: 500 }}
                  >
                    이번 달을 돌아보니
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ opacity: 0.95 }}
                  >
                    {summaryReport.summary_description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Themes - 태그 형태로 시각화 */}
          {Array.isArray(summaryReport?.main_themes) &&
            summaryReport.main_themes.length > 0 && (
              <div className="mb-5">
                <p
                  className="text-xs mb-3"
                  style={{ opacity: 0.85, fontWeight: 500 }}
                >
                  핵심 테마
                </p>
                <div className="flex flex-wrap gap-2">
                  {summaryReport.main_themes
                    .slice(0, isPro ? 10 : 5)
                    .map((theme, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.25)",
                          border: "1px solid rgba(255, 255, 255, 0.3)",
                          color: "rgba(255, 255, 255, 0.95)",
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        {theme}
                      </span>
                    ))}
                </div>
                {!isPro && summaryReport.main_themes.length > 5 && (
                  <div
                    className="mt-3 flex items-center gap-2 text-xs px-3 py-2 rounded-lg cursor-pointer transition-all hover:bg-white/10"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      opacity: 0.9,
                    }}
                    onClick={() => router.push("/subscription")}
                  >
                    <Lock className="w-3 h-3" />
                    <span>
                      {summaryReport.main_themes.length - 5}개의 테마 더 보기
                    </span>
                  </div>
                )}
              </div>
            )}

          {/* Monthly Scores - 시각화 강화 */}
          {summaryReport && (
            <div
              className="py-5 px-6 rounded-2xl relative overflow-hidden backdrop-blur-sm"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              <div className="flex items-start gap-4 relative z-10">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                  }}
                >
                  <Sparkles className="w-6 h-6" style={{ opacity: 0.95 }} />
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-semibold mb-4"
                    style={{ opacity: 0.95 }}
                  >
                    월간 점수
                  </p>

                  {/* 종합 점수 - 원형 프로그래스 */}
                  <div className="mb-4 flex items-center gap-4">
                    <WhiteCircularProgress
                      percentage={monthlyScore}
                      size={80}
                      strokeWidth={8}
                    />
                    <div ref={monthlyScoreRef} className="flex-1">
                      <p className="text-xs mb-1" style={{ opacity: 0.85 }}>
                        종합 점수
                      </p>
                      <p className="text-2xl font-bold">
                        {Math.round(displayMonthlyScore)}
                      </p>
                      <p className="text-xs mt-1" style={{ opacity: 0.7 }}>
                        이번 달의 전반적인 평가입니다
                      </p>
                    </div>
                  </div>

                  {/* Pro 전용 점수들 */}
                  {isPro ? (
                    <div className="space-y-3 mt-4 pt-4 border-t border-white/20">
                      <ScoreProgressBar
                        label="생활 밸런스"
                        value={summaryReport.life_balance_score}
                        max={10}
                        delay={400}
                      />
                      <ScoreProgressBar
                        label="실행력"
                        value={summaryReport.execution_score}
                        max={10}
                        delay={500}
                      />
                      <ScoreProgressBar
                        label="휴식/회복"
                        value={summaryReport.rest_score}
                        max={10}
                        delay={600}
                      />
                      <ScoreProgressBar
                        label="관계/소통"
                        value={summaryReport.relationship_score}
                        max={10}
                        delay={700}
                      />
                    </div>
                  ) : (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      {/* Free 모드: Pro 전용 점수들을 블러 처리된 카드로 표시 */}
                      <div className="space-y-3 relative">
                        {/* 블러 처리된 점수 카드들 */}
                        <div className="space-y-3 opacity-30 blur-sm pointer-events-none">
                          <ScoreProgressBar
                            label="생활 밸런스"
                            value={summaryReport.life_balance_score}
                            max={10}
                          />
                          <ScoreProgressBar
                            label="실행력"
                            value={summaryReport.execution_score}
                            max={10}
                          />
                          <ScoreProgressBar
                            label="휴식/회복"
                            value={summaryReport.rest_score}
                            max={10}
                          />
                          <ScoreProgressBar
                            label="관계/소통"
                            value={summaryReport.relationship_score}
                            max={10}
                          />
                        </div>

                        {/* Pro 업그레이드 카드 */}
                        <div
                          className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                          onClick={() => router.push("/subscription")}
                        >
                          <div
                            className="w-full p-5 rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 100%)",
                              border: "2px solid rgba(255, 255, 255, 0.4)",
                              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                            }}
                          >
                            {/* 배경 장식 */}
                            <div
                              className="absolute top-0 right-0 w-24 h-24 opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                              style={{
                                background:
                                  "radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%)",
                                transform: "translate(20%, -20%)",
                              }}
                            />

                            <div className="relative z-10 flex items-start gap-4">
                              <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                                style={{
                                  background:
                                    "linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%)",
                                  border: "1px solid rgba(255, 255, 255, 0.4)",
                                }}
                              >
                                <Crown
                                  className="w-6 h-6"
                                  style={{ opacity: 0.95 }}
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <p
                                    className="text-xs font-semibold"
                                    style={{ opacity: 0.95 }}
                                  >
                                    더 깊은 분석이 필요하신가요?
                                  </p>
                                  <span
                                    className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                    style={{
                                      backgroundColor:
                                        "rgba(255, 255, 255, 0.3)",
                                      opacity: 0.95,
                                      letterSpacing: "0.5px",
                                    }}
                                  >
                                    PRO
                                  </span>
                                </div>
                                <p
                                  className="text-xs leading-relaxed mb-3"
                                  style={{ opacity: 0.85, lineHeight: "1.6" }}
                                >
                                  Pro 멤버십에서는 생활 밸런스, 실행력,
                                  휴식/회복, 관계/소통 점수를 포함한 상세 분석을
                                  확인할 수 있습니다. 기록을 성장으로 바꾸는
                                  당신만의 인사이트를 함께 만들어보세요.
                                </p>
                                <div className="flex items-center gap-2 text-xs font-semibold">
                                  <span style={{ opacity: 0.95 }}>
                                    Pro 멤버십으로 업그레이드
                                  </span>
                                  <ArrowRight
                                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                                    style={{ opacity: 0.95 }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* UI 안내문 */}
          {!isPro && (
            <div
              className="mt-5 py-3 px-4 rounded-xl flex items-start gap-3"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            >
              <Info
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={{ opacity: 0.8 }}
              />
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs leading-relaxed"
                  style={{ opacity: 0.9, lineHeight: "1.5" }}
                >
                  이 리포트는 AI가 당신의 기록을 분석하여 생성했습니다. Pro
                  멤버십으로 업그레이드하면 더 많은 인사이트와 상세 분석을
                  확인할 수 있습니다.
                </p>
              </div>
            </div>
          )}

          {/* AI Comment */}
          {summaryReport?.summary_ai_comment && (
            <div
              className="mt-5 py-4 px-6 rounded-2xl backdrop-blur-sm"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            >
              <p className="text-sm leading-relaxed" style={{ opacity: 0.95 }}>
                {summaryReport.summary_ai_comment}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
