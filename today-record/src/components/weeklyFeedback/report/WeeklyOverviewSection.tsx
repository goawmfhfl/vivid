"use client";

import { Lightbulb, Sparkles } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Card } from "../../ui/card";
import { useCountUp } from "@/hooks/useCountUp";
import type { WeeklyReportData } from "./types";

type WeeklyOverviewSectionProps = {
  weeklyOverview: WeeklyReportData["weekly_overview"];
};

// 개별 테마 항목 컴포넌트 (애니메이션을 위해 분리)
function ThemeItem({
  theme,
  index,
  maxCount = 7,
}: {
  theme: { theme: string; count: number };
  index: number;
  maxCount?: number;
}) {
  const [displayCount, countRef] = useCountUp({
    targetValue: theme.count,
    duration: 1200,
    delay: index * 150, // 각 항목마다 순차적으로 애니메이션 시작
    triggerOnVisible: true,
    threshold: 0.2,
    rootMargin: "0px 0px -50px 0px",
  });

  const percentage = (displayCount / maxCount) * 100;

  return (
    <div ref={countRef}>
      <div className="flex items-center justify-betweeㅔn mb-1.5">
        <p className="text-sm sm:text-base" style={{ color: "#333333" }}>
          {theme.theme}
        </p>
        <p className="text-xs sm:text-sm" style={{ color: "#6B7A6F" }}>
          {displayCount}회
        </p>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: "#F0F5F0" }}
      >
        <div
          className="h-2 rounded-full transition-all duration-1000 ease-out"
          style={{
            backgroundColor: "#A8BBA8",
            width: `${Math.min(percentage, 100)}%`,
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
    </div>
  );
}

export function WeeklyOverviewSection({
  weeklyOverview,
}: WeeklyOverviewSectionProps) {
  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#A8BBA8" }}
        >
          <Lightbulb className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl" style={{ color: "#333333" }}>
          이번 주 요약
        </h2>
      </div>

      {/* Top Keywords */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {weeklyOverview.top_keywords.map((keyword, index) => (
            <Badge
              key={index}
              className="text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2.5"
              style={{
                backgroundColor: "#E8EFE8",
                color: "#6B7A6F",
                border: "none",
              }}
            >
              {keyword}
            </Badge>
          ))}
        </div>
      </div>

      {/* Repeated Themes */}
      <Card
        className="p-4 sm:p-5 mb-4"
        style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
      >
        <p
          className="text-xs sm:text-sm mb-2.5 sm:mb-3"
          style={{ color: "#6B7A6F" }}
        >
          반복되는 주제들
        </p>
        <div className="space-y-3">
          {weeklyOverview.repeated_themes.map((theme, index) => (
            <ThemeItem key={index} theme={theme} index={index} />
          ))}
        </div>
      </Card>

      {/* AI Overall Comment */}
      <div
        className="p-4 sm:p-5 rounded-xl flex gap-3"
        style={{ backgroundColor: "#F5F7F5", border: "1px solid #E0E5E0" }}
      >
        <Sparkles
          className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5"
          style={{ color: "#A8BBA8" }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs mb-1.5 sm:mb-2" style={{ color: "#6B7A6F" }}>
            AI 총평
          </p>
          <p
            className="text-sm sm:text-base leading-relaxed"
            style={{ color: "#4E4B46" }}
          >
            {weeklyOverview.ai_overall_comment}
          </p>
        </div>
      </div>
    </div>
  );
}
