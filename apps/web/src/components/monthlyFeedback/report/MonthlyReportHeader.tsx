import { useState, useEffect, useRef } from "react";
import { Calendar, HelpCircle, X } from "lucide-react";
import { Card } from "../../ui/card";
import { COMMON_COLORS, TYPOGRAPHY } from "./design-system";
import { useCountUp } from "../../../hooks/useCountUp";

type MonthlyReportHeaderProps = {
  month_label: string;
  date_range: {
    start_date: string; // "2025.11.01"
    end_date: string; // "2025.11.30"
  };
  summary_overview: {
    monthly_score: number;
    summary_title: string;
    summary_description: string;
    integrity_trend: "상승" | "하락" | "유지" | "불규칙" | null;
    integrity_average: number;
    record_coverage_rate: number;
  };
};

export function MonthlyReportHeader({
  month_label,
  date_range,
  summary_overview,
}: MonthlyReportHeaderProps) {
  // 숫자로 변환 (복호화 과정에서 문자열로 변환될 수 있음)
  const integrity_average =
    typeof summary_overview.integrity_average === "number"
      ? summary_overview.integrity_average
      : Number(summary_overview.integrity_average) || 0;
  const record_coverage_rate =
    typeof summary_overview.record_coverage_rate === "number"
      ? summary_overview.record_coverage_rate
      : Number(summary_overview.record_coverage_rate) || 0;
  const [showIntegrityTooltip, setShowIntegrityTooltip] = useState(false);
  const [showCoverageTooltip, setShowCoverageTooltip] = useState(false);
  const integrityTooltipRef = useRef<HTMLDivElement>(null);
  const coverageTooltipRef = useRef<HTMLDivElement>(null);

  // useCountUp 훅을 사용한 애니메이션
  const [monthlyScoreCount, monthlyScoreRef] = useCountUp({
    targetValue: summary_overview.monthly_score,
    duration: 1500,
    delay: 200,
    triggerOnVisible: true,
  });

  const [integrityAverageCount, integrityAverageRef] = useCountUp({
    targetValue: Math.round(integrity_average * 10),
    duration: 1200,
    delay: 400,
    triggerOnVisible: true,
  });

  const [coverageRateCount, coverageRateRef] = useCountUp({
    targetValue: Math.round(record_coverage_rate * 100),
    duration: 1200,
    delay: 600,
    triggerOnVisible: true,
  });

  // 외부 클릭 시 툴팁 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        showIntegrityTooltip &&
        integrityTooltipRef.current &&
        !integrityTooltipRef.current.contains(target)
      ) {
        setShowIntegrityTooltip(false);
      }

      if (
        showCoverageTooltip &&
        coverageTooltipRef.current &&
        !coverageTooltipRef.current.contains(target)
      ) {
        setShowCoverageTooltip(false);
      }
    };

    if (showIntegrityTooltip || showCoverageTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showIntegrityTooltip, showCoverageTooltip]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#A8BBA8";
    if (score >= 60) return "#E5B96B";
    if (score >= 40) return "#B89A7A";
    return "#6B7A6F";
  };

  return (
    <div className="mb-10 sm:mb-12">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 hover:scale-105 group"
          style={{
            background:
              "linear-gradient(135deg, #D08C60 0%, #E5B96B 50%, #A8BBA8 100%)",
            boxShadow:
              "0 8px 24px rgba(208, 140, 96, 0.25), 0 2px 8px rgba(208, 140, 96, 0.15)",
          }}
        >
          {/* 글로우 효과 */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(circle at center, rgba(255, 255, 255, 0.3) 0%, transparent 70%)",
            }}
          />
          <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-white relative z-10" />
        </div>
        <div className="flex-1">
          <h1
            className={`${TYPOGRAPHY.h1.fontSize} ${TYPOGRAPHY.h1.fontWeight} mb-1.5`}
            style={{
              color: COMMON_COLORS.text.primary,
              background: `linear-gradient(135deg, ${COMMON_COLORS.text.primary} 0%, ${COMMON_COLORS.text.tertiary} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {month_label}
          </h1>
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "#A8BBA8" }}
            />
            <p
              className={`${TYPOGRAPHY.body.fontSize} font-medium`}
              style={{ color: COMMON_COLORS.text.tertiary }}
            >
              {date_range.start_date} ~ {date_range.end_date}
            </p>
          </div>
        </div>
      </div>

      {/* 월간 점수 카드 */}
      <Card
        className="group relative p-6 sm:p-8 mb-6 transition-all duration-300 hover:shadow-xl"
        style={{
          background: `linear-gradient(135deg, ${getScoreColor(
            summary_overview.monthly_score
          )}12 0%, ${getScoreColor(
            summary_overview.monthly_score
          )}08 50%, ${getScoreColor(summary_overview.monthly_score)}05 100%)`,
          border: `1.5px solid ${getScoreColor(
            summary_overview.monthly_score
          )}30`,
          borderRadius: "20px",
          boxShadow:
            "0 4px 16px rgba(107, 122, 111, 0.08), 0 1px 4px rgba(107, 122, 111, 0.04)",
          overflow: "visible",
        }}
      >
        {/* 배경 글로우 효과 */}
        <div
          className="absolute top-0 right-0 w-64 h-64 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-[20px]"
          style={{
            background: `radial-gradient(circle, ${getScoreColor(
              summary_overview.monthly_score
            )}20 0%, transparent 70%)`,
            transform: "translate(30%, -30%)",
          }}
        />

        {/* 상단 장식 라인 */}
        <div
          className="absolute top-0 left-0 right-0 h-1 overflow-hidden rounded-t-[20px]"
          style={{
            background: `linear-gradient(90deg, ${getScoreColor(
              summary_overview.monthly_score
            )} 0%, ${getScoreColor(
              summary_overview.monthly_score
            )}80 50%, ${getScoreColor(summary_overview.monthly_score)} 100%)`,
          }}
        />

        <div className="relative mb-6" ref={monthlyScoreRef}>
          <div>
            <p
              className={`${TYPOGRAPHY.label.fontSize} ${TYPOGRAPHY.label.fontWeight} mb-2 ${TYPOGRAPHY.label.textTransform}`}
              style={{
                color: COMMON_COLORS.text.tertiary,
                letterSpacing: "0.05em",
              }}
            >
              이번 달 점수
            </p>
            <div className="flex items-baseline gap-2">
              <span
                className="text-5xl sm:text-6xl font-bold transition-transform duration-300 group-hover:scale-105"
                style={{
                  color: getScoreColor(summary_overview.monthly_score),
                  textShadow: `0 2px 8px ${getScoreColor(
                    summary_overview.monthly_score
                  )}30`,
                }}
              >
                {monthlyScoreCount}
              </span>
              <span
                className={`${TYPOGRAPHY.h3.fontSize} font-semibold`}
                style={{ color: COMMON_COLORS.text.tertiary, opacity: 0.7 }}
              >
                / 100
              </span>
            </div>
          </div>
        </div>

        <div
          className="relative grid grid-cols-2 gap-4"
          style={{ overflow: "visible" }}
        >
          {/* 평균 정합도 */}
          <div
            className="relative p-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            ref={(node) => {
              integrityTooltipRef.current = node;
              if (integrityAverageRef && typeof integrityAverageRef === "object" && "current" in integrityAverageRef) {
                (integrityAverageRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
              }
            }}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.6)",
              border: "1px solid rgba(168, 187, 168, 0.2)",
              overflow: "visible",
            }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <p
                className={`${TYPOGRAPHY.bodySmall.fontSize} font-medium`}
                style={{
                  color: COMMON_COLORS.text.tertiary,
                  letterSpacing: "0.02em",
                }}
              >
                평균 정합도
              </p>
              <button
                onClick={() => setShowIntegrityTooltip(!showIntegrityTooltip)}
                className="cursor-pointer transition-all duration-200 hover:scale-110"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <HelpCircle
                  className={`w-3.5 h-3.5 transition-colors duration-200 ${
                    showIntegrityTooltip ? "text-#A8BBA8" : ""
                  }`}
                  style={{
                    color: showIntegrityTooltip ? "#A8BBA8" : "#6B7A6F",
                  }}
                />
              </button>
            </div>
            <p
              className={`${TYPOGRAPHY.number.medium.fontSize} ${TYPOGRAPHY.number.medium.fontWeight}`}
              style={{ color: "#A8BBA8", lineHeight: "1.2" }}
            >
              {(integrityAverageCount / 10).toFixed(1)}
            </p>
            {showIntegrityTooltip && (
              <div
                className="absolute animate-in fade-in slide-in-from-bottom-2 duration-200"
                style={{
                  bottom: "100%",
                  left: "0",
                  marginBottom: "10px",
                  width: "280px",
                  padding: "16px",
                  backgroundColor: "#FAFAF8",
                  color: "#333333",
                  borderRadius: "12px",
                  fontSize: "0.8125rem",
                  lineHeight: "1.6",
                  zIndex: 1000,
                  boxShadow:
                    "0 8px 24px rgba(107, 122, 111, 0.15), 0 2px 8px rgba(107, 122, 111, 0.1)",
                  border: "1.5px solid #A8BBA8",
                  overflow: "visible",
                }}
              >
                {/* 상단 장식 라인 */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-[12px]"
                  style={{
                    background:
                      "linear-gradient(90deg, #A8BBA8 0%, #E5B96B 50%, #A8BBA8 100%)",
                  }}
                />
                <div className="flex items-start justify-between gap-3 mb-3 mt-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: "#A8BBA8" }}
                    />
                    <p
                      className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.fontWeight}`}
                      style={{ color: COMMON_COLORS.text.primary }}
                    >
                      평균 정합도
                    </p>
                  </div>
                  <button
                    onClick={() => setShowIntegrityTooltip(false)}
                    className="transition-colors duration-200 hover:bg-gray-100 rounded-full p-1"
                    style={{
                      background: "none",
                      border: "none",
                      padding: "4px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X
                      className="w-3.5 h-3.5"
                      style={{ color: COMMON_COLORS.text.tertiary }}
                    />
                  </button>
                </div>
                <p
                  className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight}`}
                  style={{ color: COMMON_COLORS.text.secondary }}
                >
                  AI가 하루 기록을 분석해 평가한 점수의 평균입니다. 기록의
                  깊이와 진실성을 <strong>0~10점</strong>으로 나타냅니다.
                  높을수록 더 솔직하고 깊이 있는 기록을 했다는 의미입니다.
                </p>
              </div>
            )}
          </div>

          {/* 기록 커버리지 */}
          <div
            className="relative p-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            ref={(node) => {
              coverageTooltipRef.current = node;
              if (coverageRateRef && typeof coverageRateRef === "object" && "current" in coverageRateRef) {
                (coverageRateRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
              }
            }}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.6)",
              border: "1px solid rgba(229, 185, 107, 0.2)",
              overflow: "visible",
            }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <p
                className={`${TYPOGRAPHY.bodySmall.fontSize} font-medium`}
                style={{
                  color: COMMON_COLORS.text.tertiary,
                  letterSpacing: "0.02em",
                }}
              >
                기록 커버리지
              </p>
              <button
                onClick={() => setShowCoverageTooltip(!showCoverageTooltip)}
                className="cursor-pointer transition-all duration-200 hover:scale-110"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <HelpCircle
                  className={`w-3.5 h-3.5 transition-colors duration-200 ${
                    showCoverageTooltip ? "text-#E5B96B" : ""
                  }`}
                  style={{
                    color: showCoverageTooltip ? "#E5B96B" : "#6B7A6F",
                  }}
                />
              </button>
            </div>
            <p
              className={`${TYPOGRAPHY.number.medium.fontSize} ${TYPOGRAPHY.number.medium.fontWeight}`}
              style={{ color: "#E5B96B", lineHeight: "1.2" }}
            >
              {coverageRateCount}%
            </p>
            {showCoverageTooltip && (
              <div
                className="absolute animate-in fade-in slide-in-from-bottom-2 duration-200"
                style={{
                  bottom: "100%",
                  right: "0",
                  marginBottom: "10px",
                  width: "280px",
                  padding: "16px",
                  backgroundColor: "#FAFAF8",
                  color: "#333333",
                  borderRadius: "12px",
                  fontSize: "0.8125rem",
                  lineHeight: "1.6",
                  zIndex: 1000,
                  boxShadow:
                    "0 8px 24px rgba(107, 122, 111, 0.15), 0 2px 8px rgba(107, 122, 111, 0.1)",
                  border: "1.5px solid #E5B96B",
                  overflow: "visible",
                }}
              >
                {/* 상단 장식 라인 */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-[12px]"
                  style={{
                    background:
                      "linear-gradient(90deg, #E5B96B 0%, #A8BBA8 50%, #E5B96B 100%)",
                  }}
                />
                <div className="flex items-start justify-between gap-3 mb-3 mt-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: "#E5B96B" }}
                    />
                    <p
                      className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.fontWeight}`}
                      style={{ color: COMMON_COLORS.text.primary }}
                    >
                      기록 커버리지
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCoverageTooltip(false)}
                    className="transition-colors duration-200 hover:bg-gray-100 rounded-full p-1"
                    style={{
                      background: "none",
                      border: "none",
                      padding: "4px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X
                      className="w-3.5 h-3.5"
                      style={{ color: COMMON_COLORS.text.tertiary }}
                    />
                  </button>
                </div>
                <p
                  className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight}`}
                  style={{ color: COMMON_COLORS.text.secondary }}
                >
                  해당 기간에 기록한 날짜의 비율입니다. 예를 들어{" "}
                  <strong>11월이 30일</strong>인데 <strong>24일</strong>{" "}
                  기록했다면 <strong>80%</strong>입니다. 높을수록 더 꾸준히
                  기록했다는 의미입니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 월간 제목 및 설명 */}
      <Card
        className="group relative p-6 sm:p-8 mb-4 transition-all duration-300 hover:shadow-lg overflow-hidden"
        style={{
          backgroundColor: "white",
          border: "1.5px solid #EFE9E3",
          borderRadius: "20px",
          boxShadow:
            "0 4px 16px rgba(107, 122, 111, 0.06), 0 1px 4px rgba(107, 122, 111, 0.04)",
        }}
      >
        {/* 좌측 장식 라인 */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[20px]"
          style={{
            background:
              "linear-gradient(180deg, #A8BBA8 0%, #E5B96B 50%, #A8BBA8 100%)",
          }}
        />
        <div className="pl-4">
          <h2
            className={`${TYPOGRAPHY.h2.fontSize} ${TYPOGRAPHY.h2.fontWeight} mb-4 transition-colors duration-300 group-hover:text-[#A8BBA8]`}
            style={{ color: COMMON_COLORS.text.primary, lineHeight: "1.4" }}
          >
            {summary_overview.summary_title}
          </h2>
          <p
            className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.lineHeight}`}
            style={{ color: COMMON_COLORS.text.secondary }}
          >
            {summary_overview.summary_description}
          </p>
        </div>
      </Card>
    </div>
  );
}
