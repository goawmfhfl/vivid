import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  useGetDailyFeedback,
  useGetDailyFeedbackById,
} from "@/hooks/useGetDailyFeedback";
import { HeaderSection } from "./dailyFeedback/Header";
import { DailyReportSection } from "./dailyFeedback/DailyReportSection";
import { VisionSection } from "./dailyFeedback/Vision";
import { InsightSection } from "./dailyFeedback/Insight";
import { FeedbackSection } from "./dailyFeedback/Feedback";
import { FinalSection } from "./dailyFeedback/Final";
import { EmptyState } from "./dailyFeedback/States";
import { EmotionSection } from "./dailyFeedback/Emotion";
import { mapDailyFeedbackRowToReport } from "./dailyFeedback/mappers";
import { ScrollAnimation } from "./ui/ScrollAnimation";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { ErrorDisplay } from "./ui/ErrorDisplay";
import { COLORS, SPACING } from "@/lib/design-system";
import { useSubscription } from "@/hooks/useSubscription";
import { TestPanel } from "./dailyFeedback/TestPanel";

type DailyFeedbackViewProps = {
  date?: string;
  id?: string;
  onBack: () => void;
};

export function DailyFeedbackView({
  date,
  id,
  onBack,
}: DailyFeedbackViewProps) {
  const router = useRouter();

  // id 유효성 검사: undefined, "undefined", 빈 문자열 등 제외
  const isValidId =
    id &&
    id !== "undefined" &&
    id !== "null" &&
    id.trim() !== "" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const {
    data: dataByDate,
    isLoading: isLoadingByDate,
    error: errorByDate,
    refetch: refetchByDate,
  } = useGetDailyFeedback(date || "");
  const {
    data: dataById,
    isLoading: isLoadingById,
    error: errorById,
    refetch: refetchById,
  } = useGetDailyFeedbackById(isValidId ? id : null);

  // id가 유효하면 id로 조회, 없으면 date로 조회
  const data = isValidId ? dataById : dataByDate;
  const isLoading = isValidId ? isLoadingById : isLoadingByDate;
  const error = isValidId ? errorById : errorByDate;
  const refetch = isValidId ? refetchById : refetchByDate;

  const view = data ? mapDailyFeedbackRowToReport(data) : null;
  const { isPro: subscriptionIsPro } = useSubscription();
  const [testIsPro, setTestIsPro] = useState<boolean | null>(null);

  // 테스트 모드가 활성화되어 있으면 테스트 값을 사용, 아니면 실제 구독 상태 사용
  const isPro = testIsPro !== null ? testIsPro : subscriptionIsPro;

  if (isLoading) {
    return (
      <div
        className="min-h-screen pb-24"
        style={{ backgroundColor: "#FAFAF8" }}
      >
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

          <div className="py-16">
            <LoadingSpinner
              message="데일리 피드백을 불러오는 중..."
              size="md"
            />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen pb-24"
        style={{ backgroundColor: "#FAFAF8" }}
      >
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

          <div className="py-16">
            <ErrorDisplay
              size="md"
              showMessage={true}
              onRetry={() => refetch()}
              message="데일리 피드백을 불러오는 중 오류가 발생했습니다."
            />
          </div>
        </div>
      </div>
    );
  }

  if (!view) return <EmptyState onBack={onBack} />;

  // 섹션 노출 가드: 리포트 데이터가 null이면 렌더링 제외
  const hasDailySection = !!(view.daily_summary && view.daily_summary.trim());
  const hasEmotionSection = !!(
    view.emotion_curve && view.emotion_curve.length > 0
  );
  const hasDreamSection = !!(view.vision_summary && view.vision_summary.trim());
  const hasInsightSection = !!(
    view.core_insights && view.core_insights.length > 0
  );
  const hasFeedbackSection = !!(
    view.core_feedback && view.core_feedback.trim()
  );
  const hasFinalSection = !!(
    view.closing_message && view.closing_message.trim()
  );

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
          className="mb-6 -ml-2"
          style={{ color: COLORS.brand.primary }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>

        <ScrollAnimation>
          <div className="mb-64">
            <HeaderSection view={view} isPro={isPro} />
          </div>
        </ScrollAnimation>

        {hasDailySection && (
          <ScrollAnimation delay={300}>
            <div className="mb-64">
              <DailyReportSection view={view} isPro={isPro} />
            </div>
          </ScrollAnimation>
        )}

        {hasEmotionSection && (
          <ScrollAnimation delay={300}>
            <div className="mb-64">
              <EmotionSection view={view} isPro={isPro} />
            </div>
          </ScrollAnimation>
        )}

        {hasDreamSection && (
          <ScrollAnimation delay={300}>
            <div className="mb-64">
              <VisionSection view={view} isPro={isPro} />
            </div>
          </ScrollAnimation>
        )}

        {hasInsightSection && (
          <ScrollAnimation delay={300}>
            <div className="mb-64">
              <InsightSection view={view} isPro={isPro} />
            </div>
          </ScrollAnimation>
        )}

        {hasFeedbackSection && (
          <ScrollAnimation delay={300}>
            <div className="mb-64">
              <FeedbackSection view={view} isPro={isPro} />
            </div>
          </ScrollAnimation>
        )}

        {hasFinalSection && (
          <ScrollAnimation delay={300}>
            <div className="mb-12">
              <FinalSection view={view} isPro={isPro} />
            </div>
          </ScrollAnimation>
        )}
        <div className="flex justify-center pt-4">
          <Button
            onClick={() => router.push("/")}
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

      {/* 개발 환경 테스트 패널 */}
      {view && (
        <TestPanel
          view={view}
          isPro={isPro}
          onTogglePro={(newIsPro) => setTestIsPro(newIsPro)}
        />
      )}
    </div>
  );
}
