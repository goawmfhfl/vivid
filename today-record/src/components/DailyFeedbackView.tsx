import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { useGetDailyFeedback } from "@/hooks/useGetDailyFeedback";
import { HeaderSection } from "./DailyFeedback/Header";
import { SummarySection } from "./DailyFeedback/Summary";
import { VisionSection } from "./DailyFeedback/Vision";
import { InsightSection } from "./DailyFeedback/Insight";
import { FeedbackSection } from "./DailyFeedback/Feedback";
import { FinalSection } from "./DailyFeedback/Final";
import { LoadingState, ErrorState, EmptyState } from "./DailyFeedback/States";
import { mapDailyFeedbackRowToReport } from "./DailyFeedback/mappers";
import { ScrollAnimation } from "./DailyFeedback/ScrollAnimation";

type DailyFeedbackViewProps = {
  date: string;
  onBack: () => void;
};

export function DailyFeedbackView({ date, onBack }: DailyFeedbackViewProps) {
  const { data, isLoading, error } = useGetDailyFeedback(date);

  const view = data ? mapDailyFeedbackRowToReport(data) : null;
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState onBack={onBack} />;
  if (!view) return <EmptyState onBack={onBack} />;

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 -ml-2"
          style={{ color: "#6B7A6F" }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>

        <ScrollAnimation>
          <div className="mb-64">
            <HeaderSection view={view} />
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={300}>
          <div className="mb-64">
            <SummarySection view={view} />
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={300}>
          <div className="mb-64">
            <VisionSection view={view} />
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={300}>
          <div className="mb-64">
            <InsightSection view={view} />
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={300}>
          <div className="mb-64">
            <FeedbackSection view={view} />
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={300}>
          <div className="mb-12">
            <FinalSection view={view} />
          </div>
        </ScrollAnimation>
        <div className="flex justify-center pt-4">
          <Button
            onClick={onBack}
            className="rounded-full px-8 py-6"
            style={{
              backgroundColor: "#6B7A6F",
              color: "white",
            }}
          >
            새로운 기록 시작하기
          </Button>
        </div>
      </div>
    </div>
  );
}
