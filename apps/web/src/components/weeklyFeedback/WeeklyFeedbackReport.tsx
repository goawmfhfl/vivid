import { ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "../ui/button";
import { ScrollAnimation } from "../ui/ScrollAnimation";
import { useRouter } from "next/navigation";
import type { WeeklyReportData } from "./report/types";
import { ReportHeader } from "./report/ReportHeader";
import { EmotionSection } from "./report/emotionSection/index";
import { WeeklyOverviewSection } from "./report/WeeklyOverviewSection";
import { GrowthTrendsSection } from "./report/GrowthTrendsSection";
import { InsightReplaySection } from "./report/InsightReplaySection";
import { VisionVisualizationSection } from "./report/VisionVisualizationSection";
import { ExecutionReflectionSection } from "./report/ExecutionReflectionSection";
import { ClosingSection } from "./report/ClosingSection";
import { COLORS, SPACING } from "@/lib/design-system";

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
  const router = useRouter();

  const handleGoToAnalysis = () => {
    router.push("/analysis");
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
            <ReportHeader
              weekRange={data.week_range}
              integrity={data.integrity}
              nextWeekFocus={data.next_week_focus}
              narrative={data.weekly_overview.narrative}
              title={data.weekly_overview.title}
            />
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={200}>
          <div className="mb-64">
            <EmotionSection emotionOverview={data.emotion_overview} />
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={200}>
          <div className="mb-64">
            <WeeklyOverviewSection weeklyOverview={data.weekly_overview} />
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={200}>
          <div className="mb-64">
            <GrowthTrendsSection
              integrity={data.integrity}
              growthPoints={data.growth_points_top3}
              adjustmentPoints={data.adjustment_points_top3}
            />
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={200}>
          <div className="mb-64">
            <InsightReplaySection
              coreInsights={data.core_insights}
              metaQuestionsHighlight={data.meta_questions_highlight}
            />
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={200}>
          <div className="mb-64">
            <VisionVisualizationSection
              visionSummary={data.vision_summary}
              visionKeywordsTrend={data.vision_keywords_trend}
              alignmentComment={data.alignment_comment}
              reminderSentencesFeatured={data.reminder_sentences_featured}
            />
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={200}>
          <div className="mb-64">
            <ExecutionReflectionSection
              positives={data.positives_top3}
              improvements={data.improvements_top3}
              aiFeedbackSummary={data.ai_feedback_summary}
            />
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={200}>
          <div className="mb-12">
            <ClosingSection
              weeklyOneLiner={data.weekly_one_liner}
              nextWeekObjective={data.next_week_objective}
              callToAction={data.call_to_action}
            />
          </div>
        </ScrollAnimation>

        {/* Bottom Action */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleGoToAnalysis}
            className="rounded-full px-6 py-5 sm:px-8 sm:py-6 text-sm sm:text-base flex items-center gap-2"
            style={{
              backgroundColor: "#6B7A6F",
              color: "white",
            }}
          >
            <BarChart3 className="w-4 h-4" />
            분석 페이지로 이동
          </Button>
        </div>
      </div>
    </div>
  );
}
