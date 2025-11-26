"use client";

import { ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "../ui/button";
import { ScrollAnimation } from "../ui/ScrollAnimation";
import { useRouter } from "next/navigation";
import type { MonthlyReportData } from "./report/types";
import { MonthlyReportHeader } from "./report/MonthlyReportHeader";
import { SummaryOverviewSection } from "./report/SummaryOverviewSection";
import { EmotionOverviewSection } from "./report/EmotionOverviewSection";
import { InsightOverviewSection } from "./report/InsightOverviewSection";
import { FeedbackOverviewSection } from "./report/FeedbackOverviewSection";
import { VisionOverviewSection } from "./report/VisionOverviewSection";
import { ConclusionSection } from "./report/ConclusionSection";
import {
  SECTION_COLORS,
  COMMON_COLORS,
  TYPOGRAPHY,
  SPACING,
  COLORS,
} from "@/lib/design-system";

// 타입 재export
export type { MonthlyReportData } from "./report/types";

type MonthlyFeedbackReportProps = {
  data: MonthlyReportData;
  onBack: () => void;
};

export function MonthlyFeedbackReport({
  data,
  onBack,
}: MonthlyFeedbackReportProps) {
  const router = useRouter();
  const colors = SECTION_COLORS.conclusion;

  const handleGoToAnalysis = () => {
    router.push("/analysis?tab=monthly");
  };

  return (
    <div
      className="min-h-screen pb-24"
      style={{ backgroundColor: COLORS.background.base }}
    >
      <div
        className={`${SPACING.page.maxWidth} mx-auto ${SPACING.page.padding}`}
      >
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 sm:mb-6 -ml-2 text-sm sm:text-base"
          style={{ color: COLORS.brand.primary }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>

        <ScrollAnimation>
          <div className="mb-64">
            <MonthlyReportHeader
              month_label={data.month_label}
              date_range={data.date_range}
              summary_overview={data.summary_overview}
              integrity_average={data.integrity_average}
              record_coverage_rate={data.record_coverage_rate}
            />
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={200}>
          <div className="mb-64">
            <SummaryOverviewSection summary_overview={data.summary_overview} />
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={200}>
          <div className="mb-64">
            <EmotionOverviewSection emotion_overview={data.emotion_overview} />
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={200}>
          <div className="mb-64">
            <InsightOverviewSection insight_overview={data.insight_overview} />
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={200}>
          <div className="mb-64">
            <FeedbackOverviewSection
              feedback_overview={data.feedback_overview}
            />
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={200}>
          <div className="mb-64">
            <VisionOverviewSection vision_overview={data.vision_overview} />
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={200}>
          <div className="mb-64">
            <ConclusionSection conclusion_overview={data.conclusion_overview} />
          </div>
        </ScrollAnimation>

        {/* 월간 분석으로 돌아가기 버튼 */}
        <ScrollAnimation delay={200}>
          <div className="mt-16 mb-8 flex justify-center">
            <Button
              onClick={handleGoToAnalysis}
              className="px-8 py-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
              style={{
                background: colors.gradient,
                color: "white",
                boxShadow: `0 4px 16px ${colors.primary}30`,
                border: "none",
              }}
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5" />
                <span
                  className={`${TYPOGRAPHY.body.fontSize} ${TYPOGRAPHY.body.fontWeight}`}
                >
                  월간 분석으로 돌아가기
                </span>
              </div>
            </Button>
          </div>
        </ScrollAnimation>
      </div>
    </div>
  );
}
