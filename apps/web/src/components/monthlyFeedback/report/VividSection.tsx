"use client";

import type { VividReport } from "@/types/monthly-feedback-new";
import { VisionEvolutionSection } from "./sections/VisionEvolutionSection";
import { AlignmentAnalysisSection } from "./sections/AlignmentAnalysisSection";
import { DailyLifePatternsSection } from "./sections/DailyLifePatternsSection";
import { IdentityAlignmentSection } from "./sections/IdentityAlignmentSection";
import { NextMonthPlanSection } from "./sections/NextMonthPlanSection";

type VividSectionProps = {
  vividReport: VividReport;
  isPro?: boolean;
};

/**
 * 월간 비비드 리포트 섹션
 * 5개 주요 섹션을 포함: 비전 진화, 일치도 분석, 패턴 인사이트, 나의 모습과 목표 연결, 다음 달 플랜
 */
export function VividSection({
  vividReport,
  isPro: _isPro = false,
}: VividSectionProps) {
  const vividColor = "#A3BFD9"; // 파스텔 블루
  const improvedColor = "#7f8f7a"; // 세이지 그린 (개선된 영역)
  const declinedColor = "#b5674a"; // 테리코타 (개선 영역)

  return (
    <div className="space-y-8">
      {/* 1. 한 달간의 목표 변화 (30%) */}
      <VisionEvolutionSection
        visionEvolution={vividReport.vision_evolution}
        vividColor={vividColor}
      />

      {/* 2. 현재-미래 일치도 분석 (25%) */}
      <AlignmentAnalysisSection
        alignmentAnalysis={vividReport.alignment_analysis}
        vividColor={vividColor}
      />

      {/* 3. 하루 패턴 인사이트 (20%) */}
      <DailyLifePatternsSection
        dailyLifePatterns={vividReport.daily_life_patterns}
        vividColor={vividColor}
        improvedColor={improvedColor}
        declinedColor={declinedColor}
      />

      {/* 4. 나의 모습과 목표 연결 (15%) */}
      <IdentityAlignmentSection
        identityAlignment={vividReport.identity_alignment}
        vividColor={vividColor}
      />

      {/* 5. 실행 가능한 다음 달 플랜 (10%) */}
      <NextMonthPlanSection
        nextMonthPlan={vividReport.next_month_plan}
        vividColor={vividColor}
      />
    </div>
  );
}
