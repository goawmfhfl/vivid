"use client";

import { ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "../ui/button";
import { ScrollAnimation } from "../ui/ScrollAnimation";
import { useRouter } from "next/navigation";
import type { MonthlyFeedback } from "@/types/monthly-feedback";
import type { InsightReport } from "@/types/monthly-feedback-new";
import { MonthlyReportHeader } from "./report/MonthlyReportHeader";
import { DailyLifeSection } from "./report/DailyLifeSection";
import { EmotionSection } from "./report/EmotionSection";
import { VisionSection } from "./report/VisionSection";
import { InsightSection } from "./report/InsightSection";
import { ExecutionSection } from "./report/ExecutionSection";
import { ClosingSection } from "./report/ClosingSection";
import { COLORS, SPACING } from "@/lib/design-system";
import { TestPanel } from "./TestPanel";

type MonthlyFeedbackReportProps = {
  data: MonthlyFeedback;
  onBack: () => void;
  isPro?: boolean;
  onTogglePro?: (isPro: boolean) => void;
};

export function MonthlyFeedbackReport({
  data,
  onBack,
  isPro = false,
  onTogglePro = () => {},
}: MonthlyFeedbackReportProps) {
  const router = useRouter();

  // 각 영역별 데이터 존재 여부 체크

  const handleGoToAnalysis = () => {
    router.push("/reports/monthly");
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

        {/* Header Section - 명확히 분리된 헤더 영역 */}
        <section className="mb-16 sm:mb-20">
          <ScrollAnimation>
            <MonthlyReportHeader
              monthLabel={data.month_label}
              dateRange={data.date_range}
              summaryReport={data.summary_report}
              isPro={isPro}
            />
          </ScrollAnimation>
        </section>

        {/* Body Section - 명확히 분리된 바디 영역 */}
        <section className="max-w-3xl mx-auto px-4 py-6">
          {/* Daily Life Report */}
          {data?.daily_life_report && (
            <ScrollAnimation delay={200}>
              <div className="mb-64">
                <DailyLifeSection
                  dailyLifeReport={data.daily_life_report}
                  isPro={isPro}
                />
              </div>
            </ScrollAnimation>
          )}

          {/* Emotion Report */}
          {data?.emotion_report && (
            <ScrollAnimation delay={200}>
              <div className="mb-64">
                <EmotionSection
                  emotionReport={data.emotion_report}
                  isPro={isPro}
                />
              </div>
            </ScrollAnimation>
          )}

          {/* Vision Report */}
          {data?.vision_report && (
            <ScrollAnimation delay={200}>
              <div className="mb-64">
                <VisionSection
                  visionReport={data.vision_report}
                  isPro={isPro}
                />
              </div>
            </ScrollAnimation>
          )}

          {/* Insight Report */}
          {data?.insight_report && (
            <ScrollAnimation delay={200}>
              <div className="mb-64">
                <InsightSection
                  insightReport={
                    data.insight_report as unknown as InsightReport
                  }
                  isPro={isPro}
                />
              </div>
            </ScrollAnimation>
          )}

          {/* Execution Report */}
          {data?.execution_report && (
            <ScrollAnimation delay={200}>
              <div className="mb-64">
                <ExecutionSection
                  executionReport={data.execution_report}
                  isPro={isPro}
                />
              </div>
            </ScrollAnimation>
          )}

          {/* Closing Report */}
          {data?.closing_report && (
            <ScrollAnimation delay={200}>
              <div className="mb-12">
                <ClosingSection
                  closingReport={data.closing_report}
                  isPro={isPro}
                />
              </div>
            </ScrollAnimation>
          )}

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
        </section>
      </div>

      {/* TestPanel 추가 */}
      <TestPanel view={data} isPro={isPro} onTogglePro={onTogglePro} />
    </div>
  );
}
