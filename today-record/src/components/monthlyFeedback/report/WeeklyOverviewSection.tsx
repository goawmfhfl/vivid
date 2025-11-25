"use client";

import { Calendar, TrendingUp } from "lucide-react";
import { Card } from "../../ui/card";
import { useCountUp } from "@/hooks/useCountUp";
import type { MonthlyReportData } from "./types";

type WeeklyOverviewSectionProps = {
  weekly_overview: MonthlyReportData["weekly_overview"];
};

function WeeklyItem({
  week,
  index,
}: {
  week: MonthlyReportData["weekly_overview"]["weeks"][0];
  index: number;
}) {
  const [integrity, integrityRef] = useCountUp({
    targetValue: week.integrity_average,
    duration: 800,
    delay: index * 100,
    triggerOnVisible: true,
  });

  const getQuadrantColor = (quadrant: string | null) => {
    switch (quadrant) {
      case "몰입·설렘":
        return "#A8BBA8";
      case "안도·평온":
        return "#E5B96B";
      case "불안·초조":
        return "#B89A7A";
      case "슬픔·무기력":
        return "#6B7A6F";
      default:
        return "#6B7A6F";
    }
  };

  return (
    <Card
      ref={integrityRef}
      className="p-4 transition-all duration-300 hover:shadow-lg"
      style={{
        backgroundColor: "white",
        border: `1.5px solid ${getQuadrantColor(week.emotion_quadrant)}30`,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${getQuadrantColor(week.emotion_quadrant)}20`,
                color: getQuadrantColor(week.emotion_quadrant),
              }}
            >
              {week.week_index}주차
            </span>
            {week.weekly_keyword && (
              <span className="text-xs" style={{ color: "#6B7A6F" }}>
                {week.weekly_keyword}
              </span>
            )}
          </div>
          <p className="text-xs mb-2" style={{ color: "#6B7A6F" }}>
            {week.start_date} ~ {week.end_date}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs mb-1" style={{ color: "#6B7A6F" }}>
            정합도
          </p>
          <p className="text-lg font-bold" style={{ color: "#333333" }}>
            {integrity.toFixed(1)}
          </p>
        </div>
      </div>

      {week.dominant_emotion && (
        <div className="mb-2">
          <p className="text-xs mb-1" style={{ color: "#6B7A6F" }}>
            대표 감정
          </p>
          <p className="text-sm font-medium" style={{ color: "#333333" }}>
            {week.dominant_emotion}
          </p>
        </div>
      )}

      {week.weekly_comment && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: "#EFE9E3" }}>
          <p className="text-xs leading-relaxed" style={{ color: "#4E4B46", lineHeight: "1.6" }}>
            {week.weekly_comment}
          </p>
        </div>
      )}
    </Card>
  );
}

export function WeeklyOverviewSection({
  weekly_overview,
}: WeeklyOverviewSectionProps) {
  if (!weekly_overview.weeks || weekly_overview.weeks.length === 0) {
    return null;
  }

  return (
    <div className="mb-10 sm:mb-12" style={{ marginTop: "32px" }}>
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#A8BBA8" }}
        >
          <Calendar className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold" style={{ color: "#333333" }}>
          주차별 요약
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {weekly_overview.weeks.map((week, index) => (
          <WeeklyItem key={week.week_index} week={week} index={index} />
        ))}
      </div>
    </div>
  );
}

