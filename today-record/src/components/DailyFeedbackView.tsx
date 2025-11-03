import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { useDailyFeedback } from "@/hooks/useDailyFeedback";
import { HeaderSection } from "./DailyFeedback/Header";
import { SummarySection } from "./DailyFeedback/Summary";
import { VisionSection } from "./DailyFeedback/Vision";
import { InsightSection } from "./DailyFeedback/Insight";
import { FeedbackSection } from "./DailyFeedback/Feedback";
import { FinalSection } from "./DailyFeedback/Final";
import { LoadingState, ErrorState, EmptyState } from "./DailyFeedback/States";
import { mapDailyFeedbackRowToReport } from "./DailyFeedback/mappers";

type DailyFeedbackViewProps = {
  date: string;
  onBack: () => void;
};

export function DailyFeedbackView({ date, onBack }: DailyFeedbackViewProps) {
  const { data, isLoading, error } = useDailyFeedback(date);

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
        <HeaderSection view={view} />
        <SummarySection view={view} />
        <VisionSection view={view} />
        <InsightSection view={view} />
        <FeedbackSection view={view} />
        <FinalSection view={view} />
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
