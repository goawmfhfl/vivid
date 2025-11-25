import { Calendar, TrendingUp } from "lucide-react";
import { Card } from "../../ui/card";

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
  };
  integrity_average: number;
  record_coverage_rate: number;
};

export function MonthlyReportHeader({
  month_label,
  date_range,
  summary_overview,
  integrity_average,
  record_coverage_rate,
}: MonthlyReportHeaderProps) {
  const getTrendColor = (trend: string | null) => {
    switch (trend) {
      case "상승":
        return "#A8BBA8";
      case "하락":
        return "#B89A7A";
      case "유지":
        return "#E5B96B";
      case "불규칙":
        return "#6B7A6F";
      default:
        return "#6B7A6F";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#A8BBA8";
    if (score >= 60) return "#E5B96B";
    if (score >= 40) return "#B89A7A";
    return "#6B7A6F";
  };

  return (
    <div className="mb-10 sm:mb-12">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, #D08C60 0%, #E5B96B 50%, #A8BBA8 100%)",
            boxShadow: "0 4px 12px rgba(208, 140, 96, 0.3)",
          }}
        >
          <Calendar className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1
            className="text-2xl sm:text-3xl font-semibold"
            style={{ color: "#333333" }}
          >
            {month_label}
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6B7A6F" }}>
            {date_range.start_date} ~ {date_range.end_date}
          </p>
        </div>
      </div>

      {/* 월간 점수 카드 */}
      <Card
        className="p-6 mb-6"
        style={{
          background: `linear-gradient(135deg, ${getScoreColor(
            summary_overview.monthly_score
          )}15 0%, ${getScoreColor(summary_overview.monthly_score)}05 100%)`,
          border: `2px solid ${getScoreColor(
            summary_overview.monthly_score
          )}40`,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs mb-1" style={{ color: "#6B7A6F" }}>
              이번 달 점수
            </p>
            <div className="flex items-baseline gap-2">
              <span
                className="text-4xl font-bold"
                style={{ color: getScoreColor(summary_overview.monthly_score) }}
              >
                {summary_overview.monthly_score}
              </span>
              <span className="text-lg" style={{ color: "#6B7A6F" }}>
                / 100
              </span>
            </div>
          </div>
          {summary_overview.integrity_trend && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{
                backgroundColor: `${getTrendColor(
                  summary_overview.integrity_trend
                )}20`,
                border: `1px solid ${getTrendColor(
                  summary_overview.integrity_trend
                )}40`,
              }}
            >
              <TrendingUp
                className="w-4 h-4"
                style={{
                  color: getTrendColor(summary_overview.integrity_trend),
                }}
              />
              <span
                className="text-xs font-medium"
                style={{
                  color: getTrendColor(summary_overview.integrity_trend),
                }}
              >
                {summary_overview.integrity_trend}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-xs mb-1" style={{ color: "#6B7A6F" }}>
              평균 정합도
            </p>
            <p className="text-lg font-semibold" style={{ color: "#333333" }}>
              {integrity_average.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: "#6B7A6F" }}>
              기록 커버리지
            </p>
            <p className="text-lg font-semibold" style={{ color: "#333333" }}>
              {Math.round(record_coverage_rate * 100)}%
            </p>
          </div>
        </div>
      </Card>

      {/* 월간 제목 및 설명 */}
      <Card
        className="p-5 mb-4"
        style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
      >
        <h2
          className="text-xl sm:text-2xl font-semibold mb-3"
          style={{ color: "#333333" }}
        >
          {summary_overview.summary_title}
        </h2>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "#4E4B46", lineHeight: "1.7" }}
        >
          {summary_overview.summary_description}
        </p>
      </Card>
    </div>
  );
}
