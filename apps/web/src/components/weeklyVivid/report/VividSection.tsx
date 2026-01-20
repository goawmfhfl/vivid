"use client";

import { Target } from "lucide-react";
import type { WeeklyReport } from "@/types/weekly-vivid";
import { SectionHeader } from "@/components/common/feedback";
import { WeeklyVividSummarySection } from "./sections/WeeklyVividSummarySection";
import { WeeklyKeywordsAnalysisSection } from "./sections/WeeklyKeywordsAnalysisSection";
import { FutureVisionAnalysisSection } from "./sections/FutureVisionAnalysisSection";
import { AlignmentTrendAnalysisSection } from "./sections/AlignmentTrendAnalysisSection";
import { UserCharacteristicsAnalysisSection } from "./sections/UserCharacteristicsAnalysisSection";
import { AspiredTraitsAnalysisSection } from "./sections/AspiredTraitsAnalysisSection";
import { WeeklyInsightsSection } from "./sections/WeeklyInsightsSection";

type VividSectionProps = {
  vividReport: WeeklyReport;
  isPro?: boolean;
  userName?: string;
};

/**
 * 주간 비비드 리포트 섹션
 * 7개 주요 섹션을 포함: 주간 비비드 요약, 주간 키워드 분석,
 * 앞으로의 모습 종합 분석, 일치도 트렌드 분석, 사용자 특징 심화 분석,
 * 지향하는 모습 심화 분석, 주간 인사이트
 */
export function VividSection({
  vividReport,
  isPro: _isPro = false,
  userName,
}: VividSectionProps) {
  // 색상 팔레트
  const vividColor = "#A3BFD9"; // 파스텔 블루

  return (
    <div className="mb-16">
      <SectionHeader
        icon={Target}
        iconGradient="#A3BFD9"
        title="이번 주의 비비드"
        description="7일간의 비비드 기록을 종합한 주간 분석"
      />

      <div className="space-y-8">
        {/* 1. 주간 비비드 요약 */}
        <WeeklyVividSummarySection
          weeklyVividSummary={vividReport.weekly_vivid_summary}
          vividColor={vividColor}
        />

        {/* 2. 주간 키워드 분석 */}
        <WeeklyKeywordsAnalysisSection
          weeklyKeywordsAnalysis={vividReport.weekly_keywords_analysis}
          vividColor={vividColor}
        />

        {/* 3. 앞으로의 모습 종합 분석 */}
        <FutureVisionAnalysisSection
          futureVisionAnalysis={vividReport.future_vision_analysis}
        />

        {/* 4. 일치도 트렌드 분석 */}
        <AlignmentTrendAnalysisSection
          alignmentTrendAnalysis={vividReport.alignment_trend_analysis}
          vividColor={vividColor}
        />

        {/* 5. 사용자 특징 심화 분석 */}
        <UserCharacteristicsAnalysisSection
          userCharacteristicsAnalysis={
            vividReport.user_characteristics_analysis
          }
          vividColor={vividColor}
          userName={userName}
        />

        {/* 6. 지향하는 모습 심화 분석 */}
        <AspiredTraitsAnalysisSection
          aspiredTraitsAnalysis={vividReport.aspired_traits_analysis}
          vividColor={vividColor}
        />

        {/* 7. 주간 인사이트 */}
        <WeeklyInsightsSection
          weeklyInsights={vividReport.weekly_insights}
          vividColor={vividColor}
        />
      </div>
    </div>
  );
}
