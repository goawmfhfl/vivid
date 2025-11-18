import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import type { WeeklyReportData } from "./report/types";
import { ReportHeader } from "./report/ReportHeader";
import { ByDayTimelineSection } from "./report/ByDayTimelineSection";
import { WeeklyOverviewSection } from "./report/WeeklyOverviewSection";
import { GrowthTrendsSection } from "./report/GrowthTrendsSection";
import { InsightReplaySection } from "./report/InsightReplaySection";
import { VisionVisualizationSection } from "./report/VisionVisualizationSection";
import { ExecutionReflectionSection } from "./report/ExecutionReflectionSection";
import { ClosingSection } from "./report/ClosingSection";

// 타입 재export
export type { WeeklyReportData } from "./report/types";

type WeeklyFeedbackReportProps = {
  data: WeeklyReportData;
  onBack: () => void;
};

export function WeeklyFeedbackReport({
  data,
  onBack,
}: WeeklyFeedbackReportProps) {
  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 sm:mb-6 -ml-2 text-sm sm:text-base"
          style={{ color: "#6B7A6F" }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>

        <ReportHeader
          weekRange={data.week_range}
          integrity={data.integrity}
          nextWeekFocus={data.next_week_focus}
          narrative={data.weekly_overview.narrative}
        />

        <ByDayTimelineSection
          byDay={data.by_day}
          emotionTrend={data.weekly_overview.emotion_trend}
        />

        <WeeklyOverviewSection weeklyOverview={data.weekly_overview} />

        <GrowthTrendsSection
          byDay={data.by_day}
          integrity={data.integrity}
          growthPoints={data.growth_points_top3}
          adjustmentPoints={data.adjustment_points_top3}
        />

        <InsightReplaySection
          coreInsights={data.core_insights}
          metaQuestionsHighlight={data.meta_questions_highlight}
        />

        <VisionVisualizationSection
          visionSummary={data.vision_summary}
          visionKeywordsTrend={data.vision_keywords_trend}
          alignmentComment={data.alignment_comment}
          reminderSentencesFeatured={data.reminder_sentences_featured}
        />

        <ExecutionReflectionSection
          positives={data.positives_top3}
          improvements={data.improvements_top3}
          aiFeedbackSummary={data.ai_feedback_summary}
        />

        <ClosingSection
          weeklyOneLiner={data.weekly_one_liner}
          nextWeekObjective={data.next_week_objective}
          callToAction={data.call_to_action}
        />

        {/* Bottom Action */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={onBack}
            className="rounded-full px-6 py-5 sm:px-8 sm:py-6 text-sm sm:text-base"
            style={{
              backgroundColor: "#6B7A6F",
              color: "white",
            }}
          >
            새로운 주간 시작하기
          </Button>
        </div>
      </div>
    </div>
  );
}
