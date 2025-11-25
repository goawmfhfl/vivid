"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { ScrollAnimation } from "../ui/ScrollAnimation";
import type { MonthlyReportData } from "./report/types";
import { MonthlyReportHeader } from "./report/MonthlyReportHeader";
import { SummaryOverviewSection } from "./report/SummaryOverviewSection";
import { WeeklyOverviewSection } from "./report/WeeklyOverviewSection";
import { EmotionOverviewSection } from "./report/EmotionOverviewSection";
import { InsightOverviewSection } from "./report/InsightOverviewSection";
import { FeedbackOverviewSection } from "./report/FeedbackOverviewSection";
import { VisionOverviewSection } from "./report/VisionOverviewSection";
import { ConclusionSection } from "./report/ConclusionSection";

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
  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 sm:mb-6 -ml-2 text-sm sm:text-base"
          style={{ color: "#6B7A6F" }}
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
            <WeeklyOverviewSection weekly_overview={data.weekly_overview} />
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
      </div>
    </div>
  );
}
