import { ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "../ui/button";
import { ScrollAnimation } from "../ui/ScrollAnimation";
import { useRouter } from "next/navigation";
import type { WeeklyReportData } from "./report/types";
import { ReportHeader } from "./report/ReportHeader";
// import { EmotionSection } from "./report/emotionSection/index"; // 주석 처리: 나중에 사용할 수 있도록
// import { DailyLifeSection } from "./report/DailyLifeSection"; // 제거: 사용하지 않음
import { VividSection } from "./report/VividSection";
// import { InsightSection } from "./report/InsightSection"; // 제거: 사용하지 않음
// import { ExecutionSection } from "./report/ExecutionSection"; // 제거: 사용하지 않음
import { ClosingSection } from "./report/ClosingSection";
import { COLORS, SPACING } from "@/lib/design-system";
import { TestPanel } from "./TestPanel";

// 타입 재export
export type { WeeklyReportData } from "./report/types";

type WeeklyFeedbackReportProps = {
  data: WeeklyReportData;
  onBack: () => void;
  isPro?: boolean;
  onTogglePro?: (isPro: boolean) => void;
};

export function WeeklyFeedbackReport({
  data,
  onBack,
  isPro = false,
  onTogglePro = () => {},
}: WeeklyFeedbackReportProps) {
  const router = useRouter();

  const handleGoToAnalysis = () => {
    router.push("/reports/weekly");
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

        {/* Header (Summary Report) */}
        <ScrollAnimation>
          <div className="mb-64">
            <ReportHeader
              weekRange={data.week_range}
              summaryReport={data.summary_report}
              isPro={isPro}
            />
          </div>
        </ScrollAnimation>

        {/* 이번 주의 일상 - 제거됨 */}
        {/* {data.daily_life_report && (
          <ScrollAnimation delay={200}>
            <div className="mb-64">
              <DailyLifeSection
                dailyLifeReport={data.daily_life_report}
                isPro={isPro}
              />
            </div>
          </ScrollAnimation>
        )} */}

        {/* 이번 주 감정 - 주석 처리: 나중에 사용할 수 있도록 */}
        {/* {data.emotion_report && (
          <ScrollAnimation delay={200}>
            <div className="mb-64">
              <EmotionSection
                emotionReport={data.emotion_report}
                isPro={isPro}
              />
            </div>
          </ScrollAnimation>
        )} */}

        {data.vivid_report && (
          <ScrollAnimation delay={200}>
            <div className="mb-64">
              <VividSection vividReport={data.vivid_report} isPro={isPro} />
            </div>
          </ScrollAnimation>
        )}

        {/* 이번 주의 인사이트 - 제거됨 */}
        {/* {data.insight_report && (
          <ScrollAnimation delay={200}>
            <div className="mb-64">
              <InsightSection
                insightReport={data.insight_report}
                isPro={isPro}
              />
            </div>
          </ScrollAnimation>
        )} */}

        {/* 이번 주의 피드백 - 제거됨 */}
        {/* {data.execution_report && (
          <ScrollAnimation delay={200}>
            <div className="mb-64">
              <ExecutionSection
                executionReport={data.execution_report}
                isPro={isPro}
              />
            </div>
          </ScrollAnimation>
        )} */}

        {data.closing_report && (
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
      </div>

      {/* TestPanel 추가 */}
      <TestPanel view={data} isPro={isPro} onTogglePro={onTogglePro} />
    </div>
  );
}
