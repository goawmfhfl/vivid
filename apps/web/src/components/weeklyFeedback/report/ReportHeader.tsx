import {
  CalendarDays,
  TrendingUp,
  Sparkles,
  Lock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { SummaryReport } from "@/types/weekly-feedback";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ReportHeaderProps = {
  weekRange: {
    start: string; // "2025.10.28"
    end: string; // "2025.11.03"
  };
  summaryReport: SummaryReport;
  isPro?: boolean;
};

export function ReportHeader({
  weekRange,
  summaryReport,
  isPro = false,
}: ReportHeaderProps) {
  const router = useRouter();
  const [isPatternsOpen, setIsPatternsOpen] = useState(false);
  const [isMindsetOpen, setIsMindsetOpen] = useState(false);
  return (
    <div className="mb-8 sm:mb-10">
      {/* Main Header Card */}
      <div
        className="p-6 sm:p-8 rounded-3xl"
        style={{
          background: "linear-gradient(135deg, #A8BBA8 0%, #6B7A6F 100%)",
          color: "white",
        }}
      >
        {/* Week Range & Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-5 h-5" style={{ opacity: 0.9 }} />
            <p className="text-xs" style={{ opacity: 0.9 }}>
              주간 리포트
            </p>
          </div>
          <h1 className="text-2xl sm:text-3xl mb-2 font-semibold">
            {weekRange.start} – {weekRange.end}
          </h1>
        </div>

        {/* Summary */}
        {summaryReport?.summary && (
          <div
            className="py-5 px-6 rounded-2xl mb-5"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
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
                  이번 주를 돌아보니
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ opacity: 0.95 }}
                >
                  {summaryReport.summary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Key Points */}
        {Array.isArray(summaryReport?.key_points) &&
          summaryReport.key_points.length > 0 && (
            <div className="mb-5">
              <p
                className="text-xs mb-3"
                style={{ opacity: 0.85, fontWeight: 500 }}
              >
                핵심 포인트
              </p>
              <ul className="space-y-2">
                {summaryReport.key_points.map((point, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm"
                    style={{ color: "rgba(255, 255, 255, 0.95)" }}
                  >
                    <span
                      className="flex-shrink-0 mt-1"
                      style={{
                        color: "rgba(255, 255, 255, 0.8)",
                        fontWeight: 600,
                      }}
                    >
                      •
                    </span>
                    <span style={{ lineHeight: "1.6" }}>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        {/* Pro 전용: 배열 구조로 재구성된 트렌드 분석 */}
        {isPro &&
          (summaryReport?.trend_analysis ||
            summaryReport?.patterns_and_strengths ||
            summaryReport?.mindset_and_tips) && (
            <div className="space-y-4">
              {/* Trend Analysis (간결화된 버전) */}
              {summaryReport?.trend_analysis && (
                <div
                  className="py-5 px-6 rounded-2xl relative overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    boxShadow:
                      "0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
                  }}
                >
                  <div className="flex items-start gap-4 relative z-10">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                      }}
                    >
                      <Sparkles className="w-5 h-5" style={{ opacity: 0.95 }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <p
                          className="text-xs font-semibold"
                          style={{
                            opacity: 0.95,
                            fontWeight: 600,
                            letterSpacing: "0.5px",
                            textTransform: "uppercase",
                          }}
                        >
                          트렌드 분석
                        </p>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.3)",
                            color: "rgba(255, 255, 255, 0.95)",
                            letterSpacing: "0.5px",
                          }}
                        >
                          PRO
                        </span>
                      </div>
                      <p
                        className="text-sm leading-relaxed whitespace-pre-line"
                        style={{
                          opacity: 0.98,
                          fontWeight: 400,
                          lineHeight: "1.7",
                        }}
                      >
                        {summaryReport.trend_analysis}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 배열 구조 데이터 - 드롭다운 형식 */}
              {summaryReport?.patterns_and_strengths &&
                summaryReport.patterns_and_strengths.length > 0 && (
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                      background: "rgba(255, 255, 255, 0.15)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    <button
                      onClick={() => setIsPatternsOpen(!isPatternsOpen)}
                      className="w-full py-4 px-6 flex items-center justify-between transition-all hover:bg-white/10"
                      style={{ opacity: 0.9 }}
                    >
                      <p
                        className="text-xs font-semibold"
                        style={{ opacity: 0.9 }}
                      >
                        패턴과 강점
                      </p>
                      {isPatternsOpen ? (
                        <ChevronUp className="w-4 h-4 transition-transform duration-300" />
                      ) : (
                        <ChevronDown className="w-4 h-4 transition-transform duration-300" />
                      )}
                    </button>
                    <div
                      className="overflow-hidden transition-all duration-300 ease-in-out"
                      style={{
                        maxHeight: isPatternsOpen ? "1000px" : "0",
                        opacity: isPatternsOpen ? 1 : 0,
                      }}
                    >
                      <ul className="space-y-2 px-6 pb-4 pt-2">
                        {summaryReport.patterns_and_strengths.map(
                          (item, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm"
                            >
                              <span style={{ opacity: 0.8 }}>•</span>
                              <span style={{ lineHeight: "1.6" }}>{item}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                )}

              {summaryReport?.mindset_and_tips &&
                summaryReport.mindset_and_tips.length > 0 && (
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                      background: "rgba(255, 255, 255, 0.15)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    <button
                      onClick={() => setIsMindsetOpen(!isMindsetOpen)}
                      className="w-full py-4 px-6 flex items-center justify-between transition-all hover:bg-white/10"
                      style={{ opacity: 0.9 }}
                    >
                      <p
                        className="text-xs font-semibold"
                        style={{ opacity: 0.9 }}
                      >
                        마인드셋과 실천 팁
                      </p>
                      {isMindsetOpen ? (
                        <ChevronUp className="w-4 h-4 transition-transform duration-300" />
                      ) : (
                        <ChevronDown className="w-4 h-4 transition-transform duration-300" />
                      )}
                    </button>
                    <div
                      className="overflow-hidden transition-all duration-300 ease-in-out"
                      style={{
                        maxHeight: isMindsetOpen ? "1000px" : "0",
                        opacity: isMindsetOpen ? 1 : 0,
                      }}
                    >
                      <ul className="space-y-2 px-6 pb-4 pt-2">
                        {summaryReport.mindset_and_tips.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span style={{ opacity: 0.8 }}>•</span>
                            <span style={{ lineHeight: "1.6" }}>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
            </div>
          )}
        {!isPro ? (
          <div
            className="py-5 px-6 rounded-2xl relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02]"
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              boxShadow:
                "0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
            }}
            onClick={() => router.push("/subscription")}
          >
            {/* 장식 요소 */}
            <div
              className="absolute top-0 right-0 w-40 h-40 opacity-5"
              style={{
                background:
                  "radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%)",
              }}
            />

            <div className="flex items-start gap-4 relative z-10">
              {/* 아이콘 */}
              <div
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                }}
              >
                <Lock className="w-5 h-5" style={{ opacity: 0.9 }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <p
                    className="text-xs font-semibold"
                    style={{
                      opacity: 0.95,
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                    }}
                  >
                    트렌드 분석
                  </p>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.25)",
                      color: "rgba(255, 255, 255, 0.95)",
                      letterSpacing: "0.5px",
                    }}
                  >
                    PRO
                  </span>
                </div>
                <p
                  className="text-sm leading-relaxed mb-3"
                  style={{
                    opacity: 0.9,
                    fontWeight: 400,
                    lineHeight: "1.6",
                  }}
                >
                  이번 주의 감정과 행동 패턴을 깊이 분석하고, 기록을 성장으로
                  바꿔보세요.
                </p>
                <div
                  className="flex items-center gap-2 text-xs font-semibold"
                  style={{ opacity: 0.95 }}
                >
                  <span>Pro 멤버십으로 업그레이드</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
