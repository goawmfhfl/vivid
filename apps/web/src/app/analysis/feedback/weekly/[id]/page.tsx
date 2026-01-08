"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { useWeeklyFeedbackDetail } from "@/hooks/useWeeklyFeedback";
import { useSubscription } from "@/hooks/useSubscription";
import { WeeklyFeedbackReport } from "@/components/weeklyFeedback/WeeklyFeedbackReport";
import { WeeklyFeedbackLoadingState } from "@/components/weeklyFeedback/LoadingState";
import { WeeklyFeedbackErrorState } from "@/components/weeklyFeedback/ErrorState";
import { WeeklyFeedbackEmptyState } from "@/components/weeklyFeedback/EmptyState";
import { mapWeeklyFeedbackToReportData } from "@/components/weeklyFeedback/weekly-feedback-mapper";

export default function WeeklyViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);

  // useWeeklyFeedbackDetail 훅을 사용하여 서버에서 데이터 가져오기
  const {
    data: weeklyFeedback,
    isLoading,
    error,
    refetch,
  } = useWeeklyFeedbackDetail(resolvedParams.id);

  const { isPro: subscriptionIsPro } = useSubscription();
  const [testIsPro, setTestIsPro] = useState<boolean | null>(null);

  // 테스트 모드가 활성화되어 있으면 테스트 값을 사용, 아니면 실제 구독 상태 사용
  const isPro = testIsPro !== null ? testIsPro : subscriptionIsPro;

  const handleBack = () => {
    router.push("/reports/weekly");
  };

  // 로딩 상태
  if (isLoading) {
    return <WeeklyFeedbackLoadingState />;
  }

  // 에러 상태
  if (error) {
    return (
      <WeeklyFeedbackErrorState
        error={
          error instanceof Error
            ? error.message
            : "주간 vivid를 불러오는 중 오류가 발생했습니다."
        }
        onRetry={() => refetch()}
        onBack={handleBack}
      />
    );
  }

  // 데이터가 없는 경우
  if (!weeklyFeedback) {
    return <WeeklyFeedbackEmptyState onBack={handleBack} />;
  }

  // WeeklyFeedback을 WeeklyReportData로 변환
  const reportData = mapWeeklyFeedbackToReportData(weeklyFeedback);

  return (
    <WeeklyFeedbackReport
      data={reportData}
      onBack={handleBack}
      isPro={isPro}
      onTogglePro={setTestIsPro}
    />
  );
}
